import mongoose from 'mongoose'
import { v4 } from 'uuid'
import { IGroup, IGroupInstanceX, IUserInstanceX } from '../types/models'

const groupSchema = new mongoose.Schema({
	members: [
		{
			memberID: {
				type: mongoose.Schema.Types.ObjectId,
				required: true,
			},
			isAdmin: {
				type: Boolean,
				required: true,
			},
			joinedOn: {
				type: Date,
				required: true,
				trim: true,
			},
			unread: {
				type: Number,
				required: true
			},
			muted: {
				type: Boolean,
				required: true
			},
			pinned: {
				type: Boolean,
				required: true
			},
		}
	],
	groupImage: {
		type: String,
		trim: true,
		required: false,
	},
	groupName: {
		type: String,
		required: false,
		trim: true,
	},
	groupDescription: {
		type: String,
		required: false,
		trim: true,
	},
	roomKey: {
		type: String,
		required: true,
		trim: true,
		default: v4()
	},
	groupType: {
		type: String,
		required: true,
		trim: true,
		enum: {
			values: ["dialogue", "group"],
			message: `{VALUE} is not supported`
		},
	},
	recent: {
		message: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Message'
		},
		date: {
			type: Date,
			required: true,
		},
	},
	blocked: {
		status: {
			type: Boolean,
			required: true
		},
		by: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		}
	}
}, { timestamps: true })

// Create Virtual relationship with a group last message
groupSchema.virtual('last_message', {
	ref: 'Message',
	localField: 'lastMessage',
	foreignField: '_id',
})

// Private profile
groupSchema.methods.toJSON = function () {
	const group = this
	const returnGroup = group.toObject()
	delete returnGroup.roomKey
	return returnGroup
}

// add group member
groupSchema.methods.addGroupMember = async function (user: IUserInstanceX) {
	const group = this as IGroupInstanceX
	try {
		// Remove the user if he already exists
		group.members = group.members.filter(member => member.memberID !== user._id)
		group.members.push({
			memberID: user._id,
			isAdmin: false,
			joinedOn: new Date(),
			unread: 0,
			muted: false,
			pinned: false,
		})
		await group.save()
		return { group, message: "added" }
	} catch (error) {
		return { error: String(error) }
	}
}

// remove group member
groupSchema.methods.removeGroupMember = async function (user: IUserInstanceX) {
	const group = this as IGroupInstanceX

	try {
		// Remove the user
		group.members = group.members.filter(member => member.memberID !== user._id)
		await group.save()
		return { group, message: "removed" }
	} catch (error) {
		return { error: String(error) }
	}
}

// Group Model
const Group = mongoose.model<IGroup>('Group', groupSchema)
export default Group