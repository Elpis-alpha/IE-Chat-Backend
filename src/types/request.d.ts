import { Query } from 'express-serve-static-core';
import { Request, Response, } from 'express';
import User from '../models/User';
import { IUser } from './models';

type Request = Request

type Response = Response

declare global {
	namespace Express {
		interface Request {
			user: IUser
		}
	}
}

type messageObjectType = {
	sender?: Types.ObjectId
	adminMessage: boolean
	seenBy: { id: Types.ObjectId }[]
	deleted: boolean
	room: Types.ObjectId
	messageType: "text" | "image"

	reference?: Types.ObjectId
	text?: string
	image?: string
}

type createUserRequest = Request<never, never, { username?: string, name?: string, password?: string }, never>

type loginUserRequest = Request<never, never, { username?: string, password?: any }, never>

type checkGoogleTokenRequest = Request<never, never, { token?: string }, never>

interface authUserRequest extends Request<never, never, never, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface oauthUserRequest extends Request<never, never, never, { token?: string }> {
}

interface deleteUserRequest extends Request<never, never, { userID?: string }, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface editUserRequest extends Request<never, never, {
	username?: string
	name?: string
	bio?: string,
	sendWithEnter?: boolean,
}, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface logoutUserRequest extends Request<never, never, never, {}> {
	user?: InstanceType<typeof User>
	token?: string
}

type findUserRequest = Request<never, never, never, { _id?: string, username?: string }>

type filterUserRequest = Request<never, never, never, { username?: string, limit?: string, skip?: string, sortBy?: string }>

interface saveUserImageRequest extends Request<never, never, { image: any }, {}> {
	user?: InstanceType<typeof User>
	token?: string
}

interface deleteUserImageRequest extends Request<never, never, never, {}> {
	user?: InstanceType<typeof User>
	token?: string
}




interface createDialogueRequest extends Request<never, never, { friendID?: string, onlyExist?: boolean }, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface createGroupRequest extends Request<never, never, { name?: string, description?: string }, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface getGroupRequest extends Request<never, never, never, { groupID?: string }> {
	user?: InstanceType<typeof User>
	token?: string
}

interface getMessagesRequest extends Request<never, never, never, { groupID?: string, limit?: string, skip?: string, sortBy?: string }> {
	user?: InstanceType<typeof User>
	token?: string
}

interface pinGroupRequest extends Request<never, never, { groupID?: string }, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface muteGroupRequest extends Request<never, never, { groupID?: string }, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface toggleBlockDialogueRequest extends Request<never, never, { groupID?: string, block?: boolean }, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface editGroupRequest extends Request<never, never, { groupID?: string, name?: string, description?: string }, never> {
	user?: InstanceType<typeof User>
	token?: string
}

interface banFromGroupRequest extends Request<never, never, { groupID?: string, bannedUserID?: string }, never> {
	user?: InstanceType<typeof User>
	token?: string
}