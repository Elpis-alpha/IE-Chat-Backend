import mongoose from 'mongoose'
import { IGroupInstanceX, IMessage, IMessageDocument, IMessageInstance, IMessageModel, IUserInstanceX } from '../types/models'
import { messageObjectType } from '../types/request'

const messageSchema = new mongoose.Schema({
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		required: false,
		ref: 'User'
	},
	reference: {
		type: mongoose.Schema.Types.ObjectId,
		required: false,
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	messageType: {
		type: String,
		required: true,
		trim: true,
		enum: {
			values: ["text", "image"],
			message: `{VALUE} is not supported`
		},
	},
	text: {
		type: String,
		trim: true,
		required: false,
	},
	image: {
		required: false,
		type: String,
		trim: true,
	},
	deleted: {
		required: true,
		type: Boolean,
	},
	adminMessage: {
		required: true,
		type: Boolean,
	},
	seenBy: [{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		}
	}]
}, { timestamps: true })

// send a new text message
messageSchema.statics.sendMessage = async function (sender: IUserInstanceX, room: IGroupInstanceX, value: string, messageType: "text" | "image", reference?: string) {

	try {
		const messageObject: messageObjectType = {
			room: room._id, messageType, seenBy: [], deleted: false,
			sender: sender._id, adminMessage: false,
		}

		if (value.length > 0) {
			if (messageType === "image") messageObject.image = value
			if (messageType === "text") messageObject.text = value

			if (reference) {
				const ref = await Message.findOne({ room: room._id, _id: reference })
				if (!ref) throw new Error("Invalid reference");

				messageObject.reference = ref._id
			}

			const message = await Message.create(messageObject)
			room.members = room.members.map(m => m.memberID === sender._id ? m : { ...m, unread: m.unread + 1 })
			room.recent.message = message._id
			room.recent.date = message.createdAt
			await room.save()

			return { message, room }
		} else {
			return { error: "too-short" }
		}
	} catch (error) {
		return { error: String(error) }
	}
}

// send an admin message
messageSchema.statics.sendAdminMessage = async function (room: IGroupInstanceX, value: string, messageType: "text" | "image") {

	try {
		const messageObject: messageObjectType = {
			room: room._id, messageType, seenBy: [], deleted: false,
			adminMessage: true,
		}

		if (value.length > 0) {
			if (messageType === "image") messageObject.image = value
			if (messageType === "text") messageObject.text = value

			const message = await Message.create(messageObject)
			return { message }
		} else {
			return { error: "too-short" }
		}
	} catch (error) {
		return { error: String(error) }
	}
}

// delete message
messageSchema.statics.deleteMessage = async function (messageID: string, sender: IUserInstanceX) {

	try {
		const message = Message.findOneAndUpdate({ _id: messageID, sender: sender._id }, {
			$unset: { image: "", text: "", reference: "" },
			$set: { deleted: true }
		})
		if (!message) throw new Error("Message not Found");
		return { message }
	} catch (error) {
		return { error: String(error) }
	}
}

const Message = mongoose.model<IMessageDocument, IMessageModel>('Message', messageSchema)
export default Message