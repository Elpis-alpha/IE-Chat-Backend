import Group from "../models/Group"
import { errorJson } from "../middleware/errors";
import { Response, banFromGroupRequest, createDialogueRequest, createGroupRequest, editGroupRequest, getGroupRequest, getMessagesRequest, muteGroupRequest, pinGroupRequest, toggleBlockDialogueRequest } from "../types/request";
import { v4 } from "uuid";
import Message from "../models/Message";
import User from "../models/User";
import { groupDefaultImage } from "../_env";
import { IMessageInstanceX } from "../types/models";
import { getLimitSkipSort } from "../helpers/SpecialCtrl";


// Sends post request to find or create new group
export const findOrCreateDialogue = async (req: createDialogueRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { friendID, onlyExist } = req.body
		if (typeof friendID !== "string") throw new Error("Invalid friendID")
		if (friendID === req.user._id.toString()) throw new Error("Cannot create a group with yourself")

		const friend = await User.findById(friendID)
		if (!friend) throw new Error("Invalid friendID")

		let groupExists = await Group.findOne({ "members.memberID": { $all: [req.user._id, friend._id] }, groupType: "dialogue" })
		if (groupExists) return res.send({ message: "success", data: groupExists })
		else if (onlyExist === true) {
			return res.send({ message: "does-not-exist", data: friend.toPublicJSON() })
		}


		const group = new Group({
			members: [
				{
					memberID: req.user._id,
					joinedOn: new Date(),
					unread: 0, muted: false,
					isAdmin: true, pinned: false
				},
				{
					memberID: friendID,
					joinedOn: new Date(),
					unread: 0, muted: false,
					isAdmin: true, pinned: false
				},
			],
			roomKey: v4(),
			groupType: "dialogue",
			blocked: {
				status: false,
				by: req.user._id
			}
		})

		const { error, message } = await Message.sendAdminMessage(group, `<id-${req.user._id}> started a dialogue with <id-${friend._id}>`, "text")
		if (error || !message) throw new Error("Admin message failed to send");

		group.recent.message = message._id
		group.recent.date = message.createdAt
		await group.save()

		return res.send({ message: "success", data: group })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends get request to create new group
export const createGroup = async (req: createGroupRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { name, description } = req.body
		if (typeof name !== "string") throw new Error("Invalid name")
		if (typeof description !== "string") throw new Error("Invalid description")

		const group = new Group({
			members: [
				{
					memberID: req.user._id,
					joinedOn: new Date(),
					unread: 0, muted: false,
					isAdmin: true, pinned: false
				}
			],
			groupImage: groupDefaultImage,
			groupName: name,
			groupDescription: description,
			roomKey: v4(),
			groupType: "group",
			blocked: {
				status: false,
				by: req.user._id
			},
		})

		const { error, message } = await Message.sendAdminMessage(group, `<id-${req.user._id}> created this group`, "text")
		if (error || !message) throw new Error("Admin message failed to send");

		group.recent.message = message._id
		group.recent.date = message.createdAt
		await group.save()

		return res.send({ message: "success", data: group, roomKey: group.roomKey })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends get request to get group
export const getGroup = async (req: getGroupRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { groupID } = req.query
		if (typeof groupID !== "string") throw new Error("Invalid req query: groupID")

		const group = await Group.findOne({ _id: groupID, "members.memberID": req.user._id })
		if (!group) throw new Error("Invalid groupID, group not found")

		const admin = group.members.find(x => (x.memberID === req.user?._id) && (x.isAdmin === true)) ? group.roomKey : undefined

		return res.send({ message: "success", data: group, roomKey: admin })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends get request to get messages
export const getMessages = async (req: getMessagesRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { groupID } = req.query
		const { limit, skip } = getLimitSkipSort(req.query?.limit, req.query?.skip, req.query?.sortBy)

		if (typeof groupID !== "string") throw new Error("Invalid req query: groupID")
		const group = await Group.findOne({ _id: groupID, "members.memberID": req.user._id })
		if (!group) throw new Error("Invalid groupID, group not found")

		const messages = await Message.find({ room: group._id }).limit(limit + 1).skip(skip).sort({ createdAt: 1 })

		return res.send({ message: "success", data: messages.slice(0, limit), hasMore: messages.length > limit })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends get request to get group
export const getRooms = async (req: getGroupRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const user = req.user
		let friend

		const groups = await Group.find({ "members.memberID": req.user._id }).select(["groupType", "groupImage", "groupName", "recent", "blocked", "members"]).sort({ "recent.date": -1 }).lean()
		if (!groups) throw new Error("Invalid groupID, groups not found")

		const data: roomListItemDataType[] = []
		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];
			let { groupName: name, groupImage: image } = group

			const message = await Message.findById(group.recent.message)
			if (!message) throw new Error("Invalid Last Message")

			if (group.groupType === "dialogue") {
				const friendX = await User.findById(group.members.find(x => x.memberID.toString() !== user._id.toString())?.memberID).select(["onlineStatus", "name", "avatar", "username"])
				if (!friendX) throw new Error("Invalid Dialogue")

				name = friendX.name
				image = friendX.avatar
				friend = { _id: friendX._id.toString(), username: friendX.username }
			}

			data.push({
				profile: group.members.find(x => x.memberID.toString() === user._id.toString()),
				groupID: group._id.toString(), name, image, groupType: group.groupType, friend,
				recent: group.recent,
				blocked: group.blocked,
				members: group.members.map(x => x.memberID.toString()),
				message: message
			})
		}

		return res.send({ message: "success", data })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to toggle pin group
export const togglePinGroup = async (req: pinGroupRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { groupID } = req.body
		if (typeof groupID !== "string") throw new Error("Invalid req body: groupID")

		const group = await Group.findOne({ _id: groupID, "members.memberID": req.user._id })
		if (!group) throw new Error("Invalid groupID, group not found")
		group.members = group.members.map(m => m.memberID === req.user?._id ? { ...m, pinned: !m.pinned } : m)
		await group.save()

		return res.send({ message: "success", data: group })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to toggle mute group
export const toggleMuteGroup = async (req: muteGroupRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { groupID } = req.body
		if (typeof groupID !== "string") throw new Error("Invalid req body: groupID")

		const group = await Group.findOne({ _id: groupID, "members.memberID": req.user._id })
		if (!group) throw new Error("Invalid groupID, group not found")
		group.members = group.members.map(m => m.memberID === req.user?._id ? { ...m, muted: !m.muted } : m)
		await group.save()

		return res.send({ message: "success", data: group })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to toggle block on dialogue
export const toggleBlockDialogue = async (req: toggleBlockDialogueRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { groupID, block } = req.body
		if (typeof block !== "boolean") throw new Error("Invalid req body: block")
		if (typeof groupID !== "string") throw new Error("Invalid req body: groupID")

		const group = await Group.findOne({ _id: groupID, groupType: "dialogue", "members.memberID": req.user._id })
		if (!group) throw new Error("Invalid groupID, group not found")

		if (block === true) {
			if (group.blocked.status === true) throw new Error("Dialogue is already blocked");

			group.blocked = {
				status: true,
				by: req.user._id
			}
		} else {
			if (group.blocked.status === false) throw new Error("Dialogue is not blocked");
			if (group.blocked.by !== req.user._id) throw new Error("Dialogue was not blocked by you");

			group.blocked = {
				status: false,
				by: req.user._id
			}
		}

		await group.save()
		return res.send({ message: "success", data: group })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to create new group
export const editGroup = async (req: editGroupRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { name, description, groupID } = req.body
		if (typeof name !== "string") throw new Error("Invalid name")
		if (typeof groupID !== "string") throw new Error("Invalid req body: groupID")
		if (typeof description !== "string") throw new Error("Invalid description")

		const group = await Group.findOne({ _id: groupID, groupType: "group", "members.memberID": req.user._id })
		if (!group) throw new Error("Invalid groupID, group not found")

		group.groupName = name
		group.groupDescription = description

		const { error, message } = await Message.sendAdminMessage(group, `<id-${req.user._id}> edited the group`, "text")
		if (error || !message) throw new Error("Admin message failed to send");
		await group.save()

		return res.send({ message: "success", data: group })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to kick out a group member
export const kickFromGroup = async (req: banFromGroupRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { groupID, bannedUserID } = req.body
		if (typeof groupID !== "string") throw new Error("Invalid req body: groupID")
		if (typeof bannedUserID !== "string") throw new Error("Invalid bannedUserID")

		const group = await Group.findOne({ _id: groupID, groupType: "group", "members.memberID": req.user._id })
		if (!group) throw new Error("Invalid groupID, group not found")

		const admin = group.members.find(x => (x.memberID === req.user?._id) && (x.isAdmin === true))
		if (!admin) throw new Error("User is not an admin");

		const bannedUser = group.members.find(x => x.memberID.toString() === bannedUserID)
		if (!bannedUser) throw new Error("bannedUserID is not in the group");

		const bannedUserUser = await User.findById(bannedUserID)
		if (!bannedUserUser) throw new Error("bannedUser is not a user");

		group.members = group.members.filter(x => x.memberID.toString() !== bannedUserID)
		await group.save()

		const { error, message } = await Message.sendAdminMessage(group, `<id-${req.user._id}> kicked <id-${bannedUserUser._id}> out`, "text")
		if (error || !message) throw new Error("Admin message failed to send");
		await group.save()

		return res.send({ message: "success", data: group })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}
