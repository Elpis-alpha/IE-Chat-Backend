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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const _env_1 = require("../_env");
// Sets up user schema
const userSchema = new mongoose_1.default.Schema({
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
        validate(value) {
            if (/[^a-z\-\_0-9]/g.test(value)) {
                throw new Error('Invalid username');
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
});
// Generate Authentication Token
userSchema.methods.generateAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = jsonwebtoken_1.default.sign({ _id: user.id.toString() }, _env_1.jwtSecret, {});
        user.tokens.push({ token });
        yield user.save();
        return token;
    });
};
// Private profile
userSchema.methods.toJSON = function () {
    const user = this;
    const returnUser = user.toObject();
    delete returnUser.tokens;
    delete returnUser.password;
    return returnUser;
};
// Public profile
userSchema.methods.toPublicJSON = function () {
    const user = this;
    const returnUser = user.toObject();
    delete returnUser.tokens;
    delete returnUser.sendWithEnter;
    delete returnUser.authType;
    delete returnUser.google;
    delete returnUser.password;
    return returnUser;
};
// For login
userSchema.statics.findbyCredentials = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ username, authType: "password" });
    if (!user)
        throw new Error('Unable to login');
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error('Unable to login');
    return user;
});
// Hash password
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified('password'))
            user.password = yield bcryptjs_1.default.hash(user.password, 8);
        next();
    });
});
// Create User Model
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
