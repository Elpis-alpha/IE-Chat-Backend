import { Document, Model, Types } from "mongoose"
import User from "../models/User"
import Message from "../models/Message"
import Group from "../models/Group"
import Dialogue from "../models/Dialogue"

// User Model
export interface IUser {
	name: string
	username: string
	biography?: string
	sendWithEnter: boolean
	onlineStatus: {
		isOnline: boolean
		lastOnline: NativeDate
	}
	authType: "password" | "google"
	google: {
		id: String
		token: String
		tokenExpiryDate: NativeDate
	},
	password: string
	avatar: string
	tokens: { token: string; }[]
	createdAt: NativeDate
	updatedAt: NativeDate
	toPublicJSON: () => Object
	generateAuthToken: () => Promise<string>
}
export interface IUserDocument extends IUser, Document { }
export interface IUserModel extends Model<IUserDocument> {
	// buildUser(args: IUser): IUserDocument
	findbyCredentials: (username: string, password: string) => Promise<InstanceType<typeof User>>
}
export type IUserInstance = InstanceType<typeof User> | undefined | null
export type IUserInstanceX = InstanceType<typeof User>


// Message Model
export interface IMessage {
	sender?: Types.ObjectId
	reference?: Types.ObjectId
	room: Types.ObjectId
	messageType: "text" | "image"
	text?: string
	image?: string
	adminMessage: boolean
	seenBy: { id: Types.ObjectId }[]
	deleted: boolean
	createdAt: NativeDate
	updatedAt: NativeDate
	toPublicJSON: () => Object
}
export interface IMessageDocument extends IMessage, Document { }
export interface IMessageModel extends Model<IMessageDocument> {
	sendMessage: (sender: IUserInstanceX, room: IGroupInstanceX, value: string, messageType: "text" | "image", reference?: string) => Promise<{ message?: IMessageInstanceX, error?: string, room: IGroupInstanceX }>
	sendAdminMessage: (room: IGroupInstanceX, value: string, messageType: "text" | "image") => Promise<{ message?: IMessageInstanceX, error?: string }>
	deleteMessage: (messageID: string, sender: IUserInstanceX) => Promise<{ message?: IMessageInstanceX, error?: string }>
}
export type IMessageInstance = InstanceType<typeof Message> | undefined | null
export type IMessageInstanceX = InstanceType<typeof Message>


// Group Model
export interface IGroup {
	members: {
		memberID: Types.ObjectId
		isAdmin: boolean
		joinedOn: NativeDate
		unread: number
		muted: boolean
		pinned: boolean
	}[]
	groupImage?: string
	groupName?: string
	groupDescription?: string
	roomKey: string
	groupType: "dialogue" | "group"
	recent: {
		message: Types.ObjectId
		date: NativeDate
	}
	blocked: {
		status: boolean
		by: Types.ObjectId
	}
	createdAt: NativeDate
	updatedAt: NativeDate
	toPublicJSON: () => Object
}
export interface IGroupDocument extends IGroup, Document { }
export interface IGroupModel extends Model<IGroupDocument> {
}
export type IGroupInstance = InstanceType<typeof Group> | undefined | null
export type IGroupInstanceX = InstanceType<typeof Group> 