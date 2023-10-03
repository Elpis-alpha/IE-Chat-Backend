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
const Message_1 = __importDefault(require("./Message"));
const isURL_1 = __importDefault(require("validator/lib/isURL"));
const dialogueSchema = new mongoose_1.default.Schema({
    members: [
        {
            memberID: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
            },
            unread: {
                type: Number,
                required: true
            },
        }
    ],
    muted: {
        type: Boolean,
        required: true
    },
    lastMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'Message'
    }
}, { timestamps: true });
// Create Virtual relationship with a dialogue last message
dialogueSchema.virtual('last_message', {
    ref: 'Message',
    localField: 'lastMessage',
    foreignField: '_id',
});
// Private profile
dialogueSchema.methods.toJSON = function () {
    const dialogue = this;
    const returnDialogue = dialogue.toObject();
    // delete returnDialogue.roomKey
    return returnDialogue;
};
// send a new text message
dialogueSchema.methods.sendTextMessage = function (sender, text, reference) {
    return __awaiter(this, void 0, void 0, function* () {
        const dialogue = this;
        try {
            if (text.length > 0) {
                let message;
                if (reference) {
                    const ref = yield Message_1.default.findOne({ "room.id": dialogue._id, "room.type": "dialogue" });
                    if (!ref)
                        throw new Error("Invalid reference");
                    message = yield Message_1.default.create({
                        room: { id: dialogue._id, type: "dialogue" },
                        messageType: "text", seenBy: [], deleted: false,
                        sender: sender._id, text, reference: ref._id
                    });
                }
                message = yield Message_1.default.create({
                    room: { id: dialogue._id, type: "dialogue" },
                    messageType: "text", seenBy: [], deleted: false,
                    sender: sender._id, text
                });
                return { dialogue, message };
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
// send a new image message
dialogueSchema.methods.sendImageMessage = function (sender, image, reference) {
    return __awaiter(this, void 0, void 0, function* () {
        const dialogue = this;
        try {
            if (!(0, isURL_1.default)(image)) {
                let message;
                if (reference) {
                    const ref = yield Message_1.default.findOne({ "room.id": dialogue._id, "room.type": "dialogue" });
                    if (!ref)
                        throw new Error("Invalid reference");
                    message = yield Message_1.default.create({
                        room: { id: dialogue._id, type: "dialogue" },
                        messageType: "image", seenBy: [],
                        sender: sender._id, image, reference: ref._id
                    });
                }
                message = yield Message_1.default.create({
                    room: { id: dialogue._id, type: "dialogue" },
                    messageType: "image", seenBy: [],
                    sender: sender._id, image
                });
                return { dialogue, message };
            }
            else {
                return { error: "invalid-image" };
            }
        }
        catch (error) {
            return { error: String(error) };
        }
    });
};
// delete message
dialogueSchema.methods.deleteMessage = function (messageID, sender) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const dialogue = this;
        try {
            const message = Message_1.default.findOneAndUpdate({ "room.id": dialogue._id, "room.type": "dialogue", _id: messageID, sender: sender._id }, {
                $unset: { image: "", text: "", reference: "" },
                $set: { deleted: true }
            });
            if (!message)
                throw new Error("Message not Found");
            return { dialogue, message };
        }
        catch (error) {
            return { error: String(error) };
        }
    });
};
// Dialogue Model
const Dialogue = mongoose_1.default.model('Dialogue', dialogueSchema);
exports.default = Dialogue;
