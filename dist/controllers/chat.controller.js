"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGroupMember = exports.kickFromGroup = exports.editGroup = exports.toggleBlockDialogue = exports.toggleMuteGroup = exports.togglePinGroup = exports.getRooms = exports.getMessages = exports.deleteGroup = exports.setBlockGroup = exports.getGroup = exports.createGroup = exports.findOrCreateDialogue = void 0;
const Group_1 = __importDefault(require("../models/Group"));
const errors_1 = require("../middleware/errors");
const uuid_1 = require("uuid");
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const _env_1 = require("../_env");
const SpecialCtrl_1 = require("../helpers/SpecialCtrl");
const multer_1 = require("../helpers/multer");
const cloudinary_1 = require("../helpers/cloudinary");
// function that saves user image
const saveGroupImageFunction = (req, group) => __awaiter(void 0, void 0, void 0, function* () {
    if (!group)
        throw new Error('Invalid Room');
    const image = (0, multer_1.dataUri)(req, "djhsdf");
    if (!image)
        throw new Error('Invalid Image - datauri');
    try {
        const cloudImage = yield cloudinary_1.uploader.upload(image, {
            folder: 'ie-chat/group-image',
            public_id: group._id.toString(),
            invalidate: true,
        });
        if (cloudImage === null || cloudImage === void 0 ? void 0 : cloudImage.secure_url) {
            return cloudImage.secure_url;
        }
        else
            throw new Error("Image issues");
    }
    catch (error) {
        console.log('cloud error', error);
        throw new Error("Image issues");
    }
});
// Sends post request to find or create new group
const findOrCreateDialogue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { friendID, onlyExist } = req.body;
        if (typeof friendID !== "string")
            throw new Error("Invalid friendID");
        if (friendID === req.user._id.toString())
            throw new Error("Cannot create a group with yourself");
        const friend = yield User_1.default.findById(friendID);
        if (!friend)
            throw new Error("Invalid friendID");
        let groupExists = yield Group_1.default.findOne({ "members.memberID": { $all: [req.user._id, friend._id] }, groupType: "dialogue" });
        if (groupExists)
            return res.send({ message: "success", data: groupExists, friend: friend.toPublicJSON() });
        else if (onlyExist === true) {
            return res.send({ message: "does-not-exist", data: friend.toPublicJSON() });
        }
        const group = new Group_1.default({
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
            roomKey: (0, uuid_1.v4)(),
            groupType: "dialogue",
            blocked: {
                status: false,
                by: req.user._id
            }
        });
        const { error, message } = yield Message_1.default.sendAdminMessage(group, `<id-${req.user._id}> started a dialogue with <id-${friend._id}>`, "text");
        if (error || !message)
            throw new Error("Admin message failed to send");
        group.recent.message = message._id;
        group.recent.date = message.createdAt;
        yield group.save();
        return res.send({ message: "success", data: group });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.findOrCreateDialogue = findOrCreateDialogue;
// Sends get request to create new group
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { name, description } = req.body;
        if (typeof name !== "string")
            throw new Error("Invalid name");
        if (typeof description !== "string")
            throw new Error("Invalid description");
        const group = new Group_1.default({
            members: [
                {
                    memberID: req.user._id,
                    joinedOn: new Date(),
                    unread: 0, muted: false,
                    isAdmin: true, pinned: false
                }
            ],
            groupImage: _env_1.groupDefaultImage,
            groupName: name,
            groupDescription: description,
            roomKey: (0, uuid_1.v4)(),
            groupType: "group",
            blocked: {
                status: false,
                by: req.user._id
            },
        });
        const { error, message } = yield Message_1.default.sendAdminMessage(group, `<id-${req.user._id}> created this group`, "text");
        if (error || !message)
            throw new Error("Admin message failed to send");
        group.recent.message = message._id;
        group.recent.date = message.createdAt;
        yield group.validate();
        if (req.file)
            group.groupImage = yield saveGroupImageFunction(req, group);
        yield group.save();
        return res.send({ message: "success", data: group, roomKey: group.roomKey });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.createGroup = createGroup;
// Sends get request to get group
const getGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID } = req.query;
        const user = req.user;
        if (typeof groupID !== "string")
            throw new Error("Invalid req query: groupID");
        const group = yield Group_1.default.findOne({ _id: groupID, "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        const admin = group.members.find(x => { var _a; return (x.memberID.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) && (x.isAdmin === true); }) ? group.roomKey : undefined;
        let members = [];
        const idOfOtherParticipants = group.members.map(x => x.memberID);
        const otherParticipants = yield User_1.default.find({ _id: { $in: idOfOtherParticipants } });
        for (let i = 0; i < otherParticipants.length; i++) {
            const cc = otherParticipants[i];
            members.push(cc.toPublicJSON());
        }
        return res.send({ message: "success", data: group, roomKey: admin, members });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.getGroup = getGroup;
// Sends get request to get group
const setBlockGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID, value } = req.body;
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        if (typeof value !== "boolean")
            throw new Error("Invalid req body: value");
        const group = yield Group_1.default.findOne({ _id: groupID, "members.memberID": req.user._id, groupType: "dialogue" });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        if (group.blocked.status === true) {
            if (group.blocked.by.toString() !== req.user._id.toString())
                throw new Error("Group was not blocked by you");
            group.blocked.status = value;
            group.blocked.by = req.user._id;
        }
        else {
            group.blocked.status = value;
            group.blocked.by = req.user._id;
        }
        yield group.save();
        return res.send({ message: "success", blocked: value });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.setBlockGroup = setBlockGroup;
// send delete request to delete group
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID } = req.body;
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        const group = yield Group_1.default.findOne({ _id: groupID, "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        if (group.groupType === "dialogue") {
            if (group.blocked.status === true)
                throw new Error("Dialogue is blocked");
            yield Message_1.default.deleteMany({ room: group._id });
            yield Group_1.default.deleteOne({ _id: groupID, "members.memberID": req.user._id, groupType: "dialogue", "blocked.status": false });
        }
        else {
            const me = group.members.find(x => { var _a; return x.memberID.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()); });
            if (!(me === null || me === void 0 ? void 0 : me.isAdmin))
                throw new Error("User is not an admin");
            yield Message_1.default.deleteMany({ room: group._id });
            yield Group_1.default.deleteOne({ _id: groupID, "members.memberID": req.user._id, groupType: "group" });
        }
        return res.send({ message: "success" });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.deleteGroup = deleteGroup;
// Sends get request to get messages
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID } = req.query;
        const { limit, skip } = (0, SpecialCtrl_1.getLimitSkipSort)((_a = req.query) === null || _a === void 0 ? void 0 : _a.limit, (_b = req.query) === null || _b === void 0 ? void 0 : _b.skip, (_c = req.query) === null || _c === void 0 ? void 0 : _c.sortBy);
        if (typeof groupID !== "string")
            throw new Error("Invalid req query: groupID");
        const group = yield Group_1.default.findOne({ _id: groupID, "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        const messages = yield Message_1.default.find({ room: group._id }).limit(limit + 1).skip(skip).sort({ createdAt: 1 });
        return res.send({ message: "success", data: messages.slice(0, limit), hasMore: messages.length > limit });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.getMessages = getMessages;
// Sends get request to get group
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const user = req.user;
        let friend, friends;
        const groups = yield Group_1.default.find({ "members.memberID": req.user._id, "blocked.status": false }).select(["groupType", "groupImage", "groupName", "recent", "blocked", "members"]).sort({ "recent.date": -1 }).lean();
        if (!groups)
            throw new Error("Invalid groupID, groups not found");
        const data = [];
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            let { groupName: name, groupImage: image } = group;
            const message = yield Message_1.default.findById(group.recent.message);
            if (!message)
                throw new Error("Invalid Last Message");
            if (group.groupType === "dialogue") {
                const friendX = yield User_1.default.findById((_d = group.members.find(x => x.memberID.toString() !== user._id.toString())) === null || _d === void 0 ? void 0 : _d.memberID).select(["onlineStatus", "name", "avatar", "username"]);
                if (!friendX)
                    throw new Error("Invalid Dialogue");
                name = friendX.name;
                image = friendX.avatar;
                friend = { _id: friendX._id.toString(), name: friendX.username };
            }
            else {
                const listOfMembers = group.members.map(x => x.memberID.toString());
                const friendX = yield User_1.default.find({ _id: { $in: listOfMembers } }).select(["name"]);
                friends = friendX.map(x => ({ _id: x._id.toString(), name: x.name }));
            }
            data.push({
                profile: group.members.find(x => x.memberID.toString() === user._id.toString()),
                groupID: group._id.toString(), name, image, groupType: group.groupType, friend, friends,
                recent: group.recent,
                blocked: group.blocked,
                members: group.members.map(x => x.memberID.toString()),
                message: message
            });
        }
        return res.send({ message: "success", data });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.getRooms = getRooms;
// Sends post request to toggle pin group
const togglePinGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID } = req.body;
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        const group = yield Group_1.default.findOne({ _id: groupID, "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        group.members = group.members.map(m => { var _a; return m.memberID.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()) ? Object.assign(Object.assign({}, m), { pinned: !m.pinned }) : m; });
        yield group.save();
        return res.send({ message: "success", data: group });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.togglePinGroup = togglePinGroup;
// Sends post request to toggle mute group
const toggleMuteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID } = req.body;
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        const group = yield Group_1.default.findOne({ _id: groupID, "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        group.members = group.members.map(m => { var _a; return m.memberID.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()) ? Object.assign(Object.assign({}, m), { muted: !m.muted }) : m; });
        yield group.save();
        return res.send({ message: "success", data: group });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.toggleMuteGroup = toggleMuteGroup;
// Sends post request to toggle block on dialogue
const toggleBlockDialogue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID, block } = req.body;
        if (typeof block !== "boolean")
            throw new Error("Invalid req body: block");
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        const group = yield Group_1.default.findOne({ _id: groupID, groupType: "dialogue", "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        if (block === true) {
            if (group.blocked.status === true)
                throw new Error("Dialogue is already blocked");
            group.blocked = {
                status: true,
                by: req.user._id
            };
        }
        else {
            if (group.blocked.status === false)
                throw new Error("Dialogue is not blocked");
            if (group.blocked.by !== req.user._id)
                throw new Error("Dialogue was not blocked by you");
            group.blocked = {
                status: false,
                by: req.user._id
            };
        }
        yield group.save();
        return res.send({ message: "success", data: group });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.toggleBlockDialogue = toggleBlockDialogue;
// Sends post request to create new group
const editGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { name, description, groupID } = req.body;
        if (typeof name !== "string")
            throw new Error("Invalid name");
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        if (typeof description !== "string")
            throw new Error("Invalid description");
        const group = yield Group_1.default.findOne({ _id: groupID, groupType: "group", "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        group.groupName = name;
        group.groupDescription = description;
        const { error, message } = yield Message_1.default.sendAdminMessage(group, `<id-${req.user._id}> edited the group`, "text");
        if (error || !message)
            throw new Error("Admin message failed to send");
        yield group.save();
        return res.send({ message: "success", data: group });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.editGroup = editGroup;
// Sends post request to kick out a group member
const kickFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID, bannedUserID } = req.body;
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        if (typeof bannedUserID !== "string")
            throw new Error("Invalid bannedUserID");
        const group = yield Group_1.default.findOne({ _id: groupID, groupType: "group", "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        const admin = group.members.find(x => { var _a; return (x.memberID.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) && (x.isAdmin === true); });
        if (!admin)
            throw new Error("User is not an admin");
        const bannedUser = group.members.find(x => x.memberID.toString() === bannedUserID);
        if (!bannedUser)
            throw new Error("bannedUserID is not in the group");
        const bannedUserUser = yield User_1.default.findById(bannedUserID);
        if (!bannedUserUser)
            throw new Error("bannedUser is not a user");
        group.members = group.members.filter(x => x.memberID.toString() !== bannedUserID);
        yield group.save();
        const { error, message } = yield Message_1.default.sendAdminMessage(group, `<id-${req.user._id}> kicked <id-${bannedUserUser._id}> out`, "text");
        if (error || !message)
            throw new Error("Admin message failed to send");
        yield group.save();
        return res.send({ message: "success", data: group });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.kickFromGroup = kickFromGroup;
// send post request to add a group member
const addGroupMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { groupID, memberID } = req.body;
        if (typeof groupID !== "string")
            throw new Error("Invalid req body: groupID");
        if (typeof memberID !== "string")
            throw new Error("Invalid memberID");
        const group = yield Group_1.default.findOne({ _id: groupID, groupType: "group", "members.memberID": req.user._id });
        if (!group)
            throw new Error("Invalid groupID, group not found");
        const admin = group.members.find(x => { var _a; return (x.memberID.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())); });
        if (!(admin === null || admin === void 0 ? void 0 : admin.isAdmin))
            throw new Error("User is not an admin");
        const memberExists = group.members.find(x => x.memberID.toString() === memberID);
        if (memberExists)
            throw new Error("Member is already in the group");
        const member = yield User_1.default.findById(memberID);
        if (!member)
            throw new Error("Invalid memberID");
        const { error, message } = yield Message_1.default.sendAdminMessage(group, `<id-${req.user._id}> added <id-${member._id}> to the group`, "text");
        if (error || !message)
            throw new Error("Admin message failed to send");
        const { error: errorX, message: messageX } = yield group.addGroupMember(member);
        if (errorX)
            throw new Error(String(errorX));
        yield group.save();
        return res.send({ message: "success", data: messageX });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.addGroupMember = addGroupMember;
