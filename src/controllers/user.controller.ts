import User from "../models/User"
import { errorJson } from "../middleware/errors";
import { Response, authUserRequest, checkGoogleTokenRequest, createUserRequest, deleteUserImageRequest, deleteUserRequest, editUserRequest, filterUserRequest, findUserRequest, loginUserRequest, logoutUserRequest, saveUserImageRequest } from "../types/request";
import { uploader } from "../helpers/cloudinary";
import { dataUri } from "../helpers/multer";
import { getLimitSkipSort, randomAmong } from "../helpers/SpecialCtrl";
import { IUserInstance } from "../types/models";
import { userDefaultImage } from "../_env";

// function that saves user image
const saveUserImageFunction = async (req: any, user: IUserInstance, save = false) => {
	if (!user) throw new Error('Invalid User')

	const image = dataUri(req, "djhsdf");
	if (!image) throw new Error('Invalid Image - datauri')

	try {
		const cloudImage = await uploader.upload(image, {
			folder: 'ie-chat/user-image',
			public_id: user._id.toString(),
			invalidate: true,
		})
		if (cloudImage?.secure_url) {
			return cloudImage.secure_url
		} else throw new Error("Image issues")
	} catch (error) {
		console.log('cloud error', error)
		throw new Error("Image issues")
	}
}

// Sends post request to create new user
export const createUser = async (req: createUserRequest, res: Response) => {
	try {

		const { name, username, password } = req.body
		if (typeof name !== "string") throw new Error("Invalid name")
		if (typeof username !== "string") throw new Error("Invalid username")
		if (typeof password !== "string") throw new Error("Invalid password")

		let userExists = await User.findOne({ username })
		if (userExists) throw new Error("Username exists")

		const user = await User.create({
			name, username, password,
			sendWithEnter: true,
			onlineStatus: {
				isOnline: false,
				lastOnline: new Date()
			},
			authType: "password",
			avatar: userDefaultImage,
			tokens: []
		})

		const token = await user.generateAuthToken()

		res.status(201).send({ ...user.toJSON(), token })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to log user in
export const loginUser = async (req: loginUserRequest, res: Response) => {

	try {
		const { username, password } = req.body
		if (typeof username !== "string") throw new Error("Invalid username")
		if (typeof password !== "string") throw new Error("Invalid password")

		let user = await User.findbyCredentials(username, password)
		if (!user) throw new Error("Invalid credentials")

		const token = await user.generateAuthToken()
		res.status(201).send({ ...user.toJSON(), token })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to check user google token
export const checkGoogleToken = async (req: checkGoogleTokenRequest, res: Response) => {

	try {
		const { token } = req.body
		if (typeof token !== "string") throw new Error("Invalid token")

		let user = await User.findOneAndUpdate({ authType: "google", "google.token": token, "google.tokenExpiryDate": { $gt: new Date() } }, { "google.tokenExpiryDate": new Date() })
		if (!user) throw new Error("Could not find user")

		const jwtToken = await user.generateAuthToken()
		res.status(201).send({ ...user.toJSON(), token: jwtToken })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// Sends post request to log user in
export const logoutUser = async (req: logoutUserRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	const user = req.user
	const token = req.token
	try {
		user.tokens = user.tokens.filter(item => item.token !== token)
		await user.save()
		res.status(200).send({ message: 'Logout Successful' })
	} catch (error) {
		return errorJson(res, 500, String(error))
	}
}

// sends get request to fetch auth user
export const getUser = async (req: authUserRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")
	res.send(req.user)
}

// sends get request to edit auth user
export const editUser = async (req: editUserRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const { username, name, bio, sendWithEnter } = req.body

		if (typeof username !== "undefined" && (typeof username !== "string")) throw new Error("Invalid username")
		if (typeof name !== "undefined" && (typeof name !== "string")) throw new Error("Invalid name")
		if (typeof bio !== "undefined" && (typeof bio !== "string")) throw new Error("Invalid bio")
		if (typeof sendWithEnter !== 'undefined' && typeof sendWithEnter !== "boolean") throw new Error("Invalid sendWithEnter")

		const user = req.user

		if (typeof name === "string") user.name = name
		if (typeof bio === "string") user.biography = bio
		if (typeof sendWithEnter === "boolean") user.sendWithEnter = sendWithEnter
		if (typeof username === "string") {
			let username2 = username

			while (true) {
				let userExists = await User.findOne({ username: username2 })
				if (!userExists) break
				username2 = username + randomAmong(0, 10000)
			}

			user.username = username
		}

		await user.save()
		res.status(201).send({ user })
	} catch (error) {
		return errorJson(res, 500, String(error))
	}
}

// sends get request to find a user
export const findUser = async (req: findUserRequest, res: Response) => {
	const _id = req.query._id
	const username = req.query.username
	try {
		let user: InstanceType<typeof User> | undefined | null

		if (_id) user = await User.findById(_id)
		else if (username) user = await User.findOne({ username })
		else return errorJson(res, 400, "Include any of the following as query params: '_id' or 'username'")

		if (!user) return errorJson(res, 404, "User does not exist")
		res.send(user.toPublicJSON())
	} catch (e) {
		return errorJson(res, 500, String(e))
	}
}

// sends get request to filter users
export const filterUser = async (req: filterUserRequest, res: Response) => {

	try {
		const { limit, skip } = getLimitSkipSort(req.query?.limit, req.query?.skip, req.query?.sortBy)
		const { username } = req.query
		if (typeof username !== "string") throw new Error("Invalid req query: username");

		const users = await User.find({ $text: { $search: username } }, {
			name: 1, biography: 1, onlineStatus: 1, username: 1, avatar: 1
		}).limit(limit).skip(skip).sort({ score: { $meta: 'textScore' } }).lean()

		res.send({
			message: "success", data: users
		})
	} catch (e) {
		return errorJson(res, 500, String(e))
	}
}

// sends post request to save user image
export const saveUserImage = async (req: saveUserImageRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")
	if (!req.file) return errorJson(res, 400, "No Image Sent")

	try {
		const user = req.user
		const image = await saveUserImageFunction(req, user, false)
		if (!image) throw new Error("Image saving error")

		user.avatar = image
		await user.save()
		res.send({ message: 'Image Saved', image })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}

// sends post request to remove user image
export const removeUserImage = async (req: deleteUserImageRequest, res: Response) => {
	if (!req.user || !req.token) return errorJson(res, 401, "Not Logged In")

	try {
		const user = req.user
		user.avatar = userDefaultImage
		await user.save()
		res.send({ message: 'Image Saved', image: userDefaultImage })
	} catch (error) {
		return errorJson(res, 400, String(error))
	}
}