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
exports.removeUserImage = exports.saveUserImage = exports.filterUser = exports.findUser = exports.editUser = exports.getUser = exports.logoutUser = exports.checkGoogleToken = exports.loginUser = exports.createUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const errors_1 = require("../middleware/errors");
const cloudinary_1 = require("../helpers/cloudinary");
const multer_1 = require("../helpers/multer");
const SpecialCtrl_1 = require("../helpers/SpecialCtrl");
const _env_1 = require("../_env");
// function that saves user image
const saveUserImageFunction = (req, user, save = false) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user)
        throw new Error('Invalid User');
    const image = (0, multer_1.dataUri)(req, "djhsdf");
    if (!image)
        throw new Error('Invalid Image - datauri');
    try {
        const cloudImage = yield cloudinary_1.uploader.upload(image, {
            folder: 'ie-chat/user-image',
            public_id: user._id.toString(),
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
// Sends post request to create new user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username, password } = req.body;
        if (typeof name !== "string")
            throw new Error("Invalid name");
        if (typeof username !== "string")
            throw new Error("Invalid username");
        if (typeof password !== "string")
            throw new Error("Invalid password");
        let userExists = yield User_1.default.findOne({ username });
        if (userExists)
            throw new Error("Username exists");
        const user = yield User_1.default.create({
            name, username, password,
            sendWithEnter: true,
            onlineStatus: {
                isOnline: false,
                lastOnline: new Date()
            },
            authType: "password",
            avatar: _env_1.userDefaultImage,
            tokens: []
        });
        const token = yield user.generateAuthToken();
        res.status(201).send(Object.assign(Object.assign({}, user.toJSON()), { token }));
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.createUser = createUser;
// Sends post request to log user in
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (typeof username !== "string")
            throw new Error("Invalid username");
        if (typeof password !== "string")
            throw new Error("Invalid password");
        let user = yield User_1.default.findbyCredentials(username, password);
        if (!user)
            throw new Error("Invalid credentials");
        const token = yield user.generateAuthToken();
        res.status(201).send(Object.assign(Object.assign({}, user.toJSON()), { token }));
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.loginUser = loginUser;
// Sends post request to check user google token
const checkGoogleToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (typeof token !== "string")
            throw new Error("Invalid token");
        let user = yield User_1.default.findOneAndUpdate({ authType: "google", "google.token": token, "google.tokenExpiryDate": { $gt: new Date() } }, { "google.tokenExpiryDate": new Date() });
        if (!user)
            throw new Error("Could not find user");
        const jwtToken = yield user.generateAuthToken();
        res.status(201).send(Object.assign(Object.assign({}, user.toJSON()), { token: jwtToken }));
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.checkGoogleToken = checkGoogleToken;
// Sends post request to log user in
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    const user = req.user;
    const token = req.token;
    try {
        user.tokens = user.tokens.filter(item => item.token !== token);
        yield user.save();
        res.status(200).send({ message: 'Logout Successful' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500, String(error));
    }
});
exports.logoutUser = logoutUser;
// sends get request to fetch auth user
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    res.send(req.user);
});
exports.getUser = getUser;
// sends get request to edit auth user
const editUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const { username, name, bio, sendWithEnter } = req.body;
        if (typeof username !== "undefined" && (typeof username !== "string"))
            throw new Error("Invalid username");
        if (typeof name !== "undefined" && (typeof name !== "string"))
            throw new Error("Invalid name");
        if (typeof bio !== "undefined" && (typeof bio !== "string"))
            throw new Error("Invalid bio");
        if (typeof sendWithEnter !== 'undefined' && typeof sendWithEnter !== "boolean")
            throw new Error("Invalid sendWithEnter");
        const user = req.user;
        if (typeof name === "string")
            user.name = name;
        if (typeof bio === "string")
            user.biography = bio;
        if (typeof sendWithEnter === "boolean")
            user.sendWithEnter = sendWithEnter;
        if (typeof username === "string") {
            let username2 = username;
            while (true) {
                let userExists = yield User_1.default.findOne({ username: username2 });
                if (!userExists)
                    break;
                username2 = username + (0, SpecialCtrl_1.randomAmong)(0, 10000);
            }
            user.username = username;
        }
        yield user.save();
        res.status(201).send({ user });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500, String(error));
    }
});
exports.editUser = editUser;
// sends get request to find a user
const findUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    const username = req.query.username;
    try {
        let user;
        if (_id)
            user = yield User_1.default.findById(_id);
        else if (username)
            user = yield User_1.default.findOne({ username });
        else
            return (0, errors_1.errorJson)(res, 400, "Include any of the following as query params: '_id' or 'username'");
        if (!user)
            return (0, errors_1.errorJson)(res, 404, "User does not exist");
        res.send(user.toPublicJSON());
    }
    catch (e) {
        return (0, errors_1.errorJson)(res, 500, String(e));
    }
});
exports.findUser = findUser;
// sends get request to filter users
const filterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { limit, skip } = (0, SpecialCtrl_1.getLimitSkipSort)((_a = req.query) === null || _a === void 0 ? void 0 : _a.limit, (_b = req.query) === null || _b === void 0 ? void 0 : _b.skip, (_c = req.query) === null || _c === void 0 ? void 0 : _c.sortBy);
        const { username } = req.query;
        if (typeof username !== "string")
            throw new Error("Invalid req query: username");
        const users = yield User_1.default.find({ $text: { $search: username } }, {
            name: 1, biography: 1, onlineStatus: 1, username: 1, avatar: 1
        }).limit(limit).skip(skip).sort({ score: { $meta: 'textScore' } }).lean();
        res.send({
            message: "success", data: users
        });
    }
    catch (e) {
        return (0, errors_1.errorJson)(res, 500, String(e));
    }
});
exports.filterUser = filterUser;
// sends post request to save user image
const saveUserImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    if (!req.file)
        return (0, errors_1.errorJson)(res, 400, "No Image Sent");
    try {
        const user = req.user;
        const image = yield saveUserImageFunction(req, user, false);
        if (!image)
            throw new Error("Image saving error");
        user.avatar = image;
        yield user.save();
        res.send({ message: 'Image Saved', image });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.saveUserImage = saveUserImage;
// sends post request to remove user image
const removeUserImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.token)
        return (0, errors_1.errorJson)(res, 401, "Not Logged In");
    try {
        const user = req.user;
        user.avatar = _env_1.userDefaultImage;
        yield user.save();
        res.send({ message: 'Image Saved', image: _env_1.userDefaultImage });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400, String(error));
    }
});
exports.removeUserImage = removeUserImage;
