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
const messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    reference: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: false,
    },
    room: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
            }
        }]
}, { timestamps: true });
// send a new text message
messageSchema.statics.sendMessage = function (sender, room, value, messageType, reference) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const messageObject = {
                room: room._id, messageType, seenBy: [], deleted: false,
                sender: sender._id, adminMessage: false,
            };
            if (value.length > 0) {
                if (messageType === "image")
                    messageObject.image = value;
                if (messageType === "text")
                    messageObject.text = value;
                if (reference) {
                    const ref = yield Message.findOne({ room: room._id, _id: reference });
                    if (!ref)
                        throw new Error("Invalid reference");
                    messageObject.reference = ref._id;
                }
                const message = yield Message.create(messageObject);
                room.members = room.members.map(m => m.memberID === sender._id ? m : Object.assign(Object.assign({}, m), { unread: m.unread + 1 }));
                room.recent.message = message._id;
                room.recent.date = message.createdAt;
                yield room.save();
                return { message, room };
            }
            else {
                return { error: "too-short" };
            }
        }
        catch (error) {
            return { error: String(error) };
        }
    });
};
// send an admin message
messageSchema.statics.sendAdminMessage = function (room, value, messageType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const messageObject = {
                room: room._id, messageType, seenBy: [], deleted: false,
                adminMessage: true,
            };
            if (value.length > 0) {
                if (messageType === "image")
                    messageObject.image = value;
                if (messageType === "text")
                    messageObject.text = value;
                const message = yield Message.create(messageObject);
                return { message };
            }
            else {
                return { error: "too-short" };
            }
        }
        catch (error) {
            return { error: String(error) };
        }
    });
};
// delete message
messageSchema.statics.deleteMessage = function (messageID, sender) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const message = Message.findOneAndUpdate({ _id: messageID, sender: sender._id }, {
                $unset: { image: "", text: "", reference: "" },
                $set: { deleted: true }
            });
            if (!message)
                throw new Error("Message not Found");
            return { message };
        }
        catch (error) {
            return { error: String(error) };
        }
    });
};
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
