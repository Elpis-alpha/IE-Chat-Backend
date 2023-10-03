import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import { IUserDocument, IUserModel } from '../types/models'
import { jwtSecret } from '../_env';

// Sets up user schema
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	username: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		dropDups: true,
		validate(value: string) {
			if (/[^a-z\-\_0-9]/g.test(value)) {
				throw new Error('Invalid username')
			}
		}
	},
	biography: {
		type: String,
		required: false
	},
	sendWithEnter: {
		type: Boolean,
		required: true,
		default: false
	},
	onlineStatus: {
		// On websocket connection { isOnline: true, lastOnline: current }
		// On websocket disconnection { isOnline: false, lastOnline: current }
		isOnline: {
			type: Boolean,
			required: true
		},
		lastOnline: {
			type: Date,
			required: true
		},
	},
	authType: {
		type: String,
		required: true,
		enum: {
			values: ["password", "google"],
			message: `{VALUE} is not supported`
		},
	},
	google: {
		id: {
			type: String,
			required: false,
		},
		token: {
			type: String,
			required: false,
		},
		tokenExpiryDate: {
			type: Date,
			required: false,
		},
	},
	password: {
		type: String,
		trim: true,
		required: true,
	},
	tokens: [
		{
			token: {
				type: String,
				required: true
			}
		}
	],
	avatar: {
		type: String,
		trim: true,
		required: true,
	},
}, { timestamps: true });

userSchema.index({
	name: "text",
	username: "text"
}, {
	weights: { name: 7, username: 3 },
	name: "name_username"
});

// Create Virtual relationship with a User's Sent Messages
userSchema.virtual('sent_messages', {
	ref: 'Message',
	localField: '_id',
	foreignField: 'sender',
})

// Generate Authentication Token
userSchema.methods.generateAuthToken = async function (): Promise<string> {
	const user = this
	const token = jsonwebtoken.sign({ _id: user.id.toString() }, jwtSecret, {})
	user.tokens.push({ token })
	await user.save()
	return token
}

// Private profile
userSchema.methods.toJSON = function (): JSON {
	const user = this
	const returnUser = user.toObject()
	delete returnUser.tokens
	delete returnUser.password
	return returnUser
}

// Public profile
userSchema.methods.toPublicJSON = function (): JSON {
	const user = this
	const returnUser = user.toObject()
	delete returnUser.tokens
	delete returnUser.sendWithEnter
	delete returnUser.authType
	delete returnUser.google
	delete returnUser.password
	return returnUser
}

// For login
userSchema.statics.findbyCredentials = async (username, password) => {
	const user = await User.findOne({ username, authType: "password" })
	if (!user) throw new Error('Unable to login')
	const isMatch = await bcryptjs.compare(password, user.password)
	if (!isMatch) throw new Error('Unable to login')
	return user
}

// Hash password
userSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password')) user.password = await bcryptjs.hash(user.password, 8)
	next()
})

// Create User Model
const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema)

export default User