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
const uuid_1 = require("uuid");
const groupSchema = new mongoose_1.default.Schema({
    members: [
        {
            memberID: {
                type: mongoose_1.default.Schema.Types.ObjectId,
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
        default: (0, uuid_1.v4)()
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
            type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true,
        }
    }
}, { timestamps: true });
// Create Virtual relationship with a group last message
groupSchema.virtual('last_message', {
    ref: 'Message',
    localField: 'lastMessage',
    foreignField: '_id',
});
// Private profile
groupSchema.methods.toJSON = function () {
    const group = this;
    const returnGroup = group.toObject();
    delete returnGroup.roomKey;
    return returnGroup;
};
// add group member
groupSchema.methods.addGroupMember = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        const group = this;
        try {
            // Remove the user if he already exists
            group.members = group.members.filter(member => member.memberID !== user._id);
            group.members.push({
                memberID: user._id,
                isAdmin: false,
                joinedOn: new Date(),
                unread: 0,
                muted: false,
                pinned: false,
            });
            yield group.save();
            return { group, message: "added" };
        }
        catch (error) {
            return { error: String(error) };
        }
    });
};
// remove group member
groupSchema.methods.removeGroupMember = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        const group = this;
        try {
            // Remove the user
            group.members = group.members.filter(member => member.memberID !== user._id);
            yield group.save();
            return { group, message: "removed" };
        }
        catch (error) {
            return { error: String(error) };
        }
    });
};
// Group Model
const Group = mongoose_1.default.model('Group', groupSchema);
exports.default = Group;
