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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = __importDefault(require("../middleware/auth"));
const errors_1 = require("../middleware/errors");
const uuid_1 = require("uuid");
const SpecialCtrl_1 = require("../helpers/SpecialCtrl");
const PreUser_1 = __importDefault(require("../models/PreUser"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    limits: { fileSize: 20000000 },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            cb(new Error('Please upload an image'));
        cb(null, true);
    }
});
// Sends post request to create test user
router.post('/api/pre-user/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        let preUser = yield PreUser_1.default.findOne({ email: req.body.email });
        if (!preUser) {
            preUser = new PreUser_1.default({ email: req.body.email });
            yield preUser.save();
        }
        const mailInfo = yield preUser.sendVerificationEmail();
        res.status(201).send({ email: preUser.email, mailInfo });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends post request to get test user
router.get('/api/pre-user/retreive', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const preUser = yield PreUser_1.default.findOne({ email: req.body.email });
        if (!preUser)
            return (0, errors_1.errorJson)(res, 404, "not a pre-user");
        res.status(201).send({ email: preUser === null || preUser === void 0 ? void 0 : preUser.email, verified: preUser === null || preUser === void 0 ? void 0 : preUser.verified });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends post request to test the test user verification status
router.post('/api/pre-user/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const preUser = yield PreUser_1.default.findOne({ email: req.body.email });
        if (!preUser)
            return (0, errors_1.errorJson)(res, 404, "not a pre-user");
        if (!preUser.verified) {
            if (preUser.emailCode.map(co => co.verifyCode).includes(req.body.emailCode)) {
                preUser.verified = true;
                yield preUser.save();
            }
        }
        res.status(201).send({ email: preUser === null || preUser === void 0 ? void 0 : preUser.email, verified: preUser === null || preUser === void 0 ? void 0 : preUser.verified });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends post request to create new user
router.post('/api/users/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const preUser = yield PreUser_1.default.findOne({ email: req.body.email });
        if (!preUser)
            return (0, errors_1.errorJson)(res, 404, "not a pre-user");
        if (!preUser.verified || !preUser.emailCode.map(co => co.verifyCode).includes(req.body.emailCode))
            return (0, errors_1.errorJson)(res, 404, "not a valid pre-user");
        const user = new User_1.default(Object.assign(Object.assign({}, req.body), { lastOnline: JSON.stringify(new Date()), fontSize: "Normal", biography: "Just another amazing user of Nyux Whispers", phoneNumber: "", sendWithEnter: false, verify: (0, uuid_1.v4)() }));
        yield user.save();
        const token = yield user.generateAuthToken();
        const verifyUser = yield user.sendVerificationEmail();
        res.status(201).send({ user, token, verifyUser });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends post request to log user in
router.post('/api/users/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, uniqueName, password } = req.body;
    try {
        // @ts-ignore
        const user = yield User_1.default.findbyCredentials({ email, uniqueName }, password);
        const token = yield user.generateAuthToken();
        res.status(200).send({ user, token });
    }
    catch (error) {
        console.log(error);
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends post request to log user out
router.post('/api/users/logout', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    // @ts-ignore
    const token = req.token;
    const all = req.query.all;
    try {
        if (all === "true") {
            user.tokens = [];
        }
        else {
            user.tokens = user.tokens.filter(item => item.token !== token);
        }
        yield user.save();
        res.status(200).send({ message: 'Logout Successful' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends get request to fetch auth user
router.get('/api/users/user', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    res.send(user);
}));
// sends get request to find a user
router.get('/api/users/find', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    const email = req.query.email;
    const uniqueName = req.query.uniqueName;
    try {
        let user;
        if (typeof _id === "string") {
            user = yield User_1.default.findById(_id);
            if (!user)
                return (0, errors_1.errorJson)(res, 404, "User does not exist");
        }
        else if (typeof email === "string") {
            user = yield User_1.default.findOne({ email });
            if (!user)
                return (0, errors_1.errorJson)(res, 404, "User does not exist");
        }
        else if (typeof uniqueName === "string") {
            user = yield User_1.default.findOne({ uniqueName });
            if (!user)
                return (0, errors_1.errorJson)(res, 404, "User does not exist");
        }
        else {
            return (0, errors_1.errorJson)(res, 400, "Include any of the following as query params: '_id', 'email' or 'uniqueName'");
        }
        res.send(user.toPublicJSON());
    }
    catch (e) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends patch request to change user name
router.patch('/api/users/change-name', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        if (!req.body.name)
            return (0, errors_1.errorJson)(res, 400, "Include 'name' in the req.body for the new name");
        user.name = req.body.name;
        yield user.save();
        return res.send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends patch request to change user uniqueName
router.patch('/api/users/change-unique-name', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        if (!req.body.uniqueName)
            return (0, errors_1.errorJson)(res, 400, "Include 'uniqueName' in the req.body for the new unique name");
        const userr = yield user.changeUniqueName(req.body.uniqueName);
        // @ts-ignore
        if (userr.error)
            return (0, errors_1.errorJson)(res, 403, userr.error);
        return res.send(userr);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends patch request to change user email
router.patch('/api/users/change-email', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        if (!req.body.email)
            return (0, errors_1.errorJson)(res, 400, "Include 'email' in the req.body for the new email");
        const userr = yield user.changeEmail(req.body.email);
        // @ts-ignore
        if (userr.error)
            return (0, errors_1.errorJson)(res, 403, userr.error);
        return res.send(userr);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends patch request to change user font size
router.patch('/api/users/change-font-size', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        if (!req.body.fontSize)
            return (0, errors_1.errorJson)(res, 400, "Include 'fontSize' in the req.body for the new font size");
        if (!["Small", "Normal", "Large"].includes(req.body.fontSize))
            return (0, errors_1.errorJson)(res, 400, "Specified font size is invalid, use: 'Small', 'Normal' or 'Large'");
        user.fontSize = req.body.fontSize;
        yield user.save();
        return res.send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends patch request to change user biography
router.patch('/api/users/change-biography', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        if (typeof req.body.biography !== "string")
            return (0, errors_1.errorJson)(res, 400, "Include 'biography' in the req.body for the new biography");
        user.biography = req.body.biography;
        yield user.save();
        return res.send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends patch request to change user phone number
router.patch('/api/users/change-phone-number', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        if (typeof req.body.phoneNumber !== "string")
            return (0, errors_1.errorJson)(res, 400, "Include 'phoneNumber' in the req.body for the new phone number");
        user.phoneNumber = req.body.phoneNumber;
        yield user.save();
        return res.send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends patch request to change user send with enter
router.patch('/api/users/change-send-with-enter', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        if (typeof req.body.sendWithEnter !== "boolean")
            return (0, errors_1.errorJson)(res, 400, "Include 'sendWithEnter' in the req.body (as a boolean) for the new send with enter");
        user.sendWithEnter = req.body.sendWithEnter;
        yield user.save();
        return res.send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends patch request to change password
router.patch('/api/users/change-password', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const user = req.user;
        // @ts-ignore
        yield User_1.default.findbyCredentials({ email: user.email }, req.body.oldPassword);
        user.password = req.body.newPassword;
        yield user.save();
        res.status(201).send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends delete request to delete users
router.delete('/api/users/delete', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const user = req.user;
        yield user.sendExitEmail();
        yield User_1.default.deleteOne({ _id: user._id });
        res.send({ message: 'user deleted' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends post request to create and upload the users profile avatar
router.post('/api/users/avatar/upload', auth_1.default, upload.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userF = req.user;
        // @ts-ignore
        const user = yield User_1.default.findById(userF._id);
        if (!req.file)
            throw new Error('No File');
        const bufferSmall = yield (0, sharp_1.default)(req.file.buffer).resize({ width: 100 }).png({ quality: 20 }).toBuffer();
        const buffer = yield (0, sharp_1.default)(req.file.buffer).resize({ width: 900 }).png({ quality: 20 }).toBuffer();
        user.avatar.normal = buffer;
        user.avatar.small = bufferSmall;
        yield user.save();
        res.send({ message: 'Image Saved' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
    // @ts-ignore
}), (error, req, res, next) => (0, errors_1.errorJson)(res, 500));
// Sends delete request to delete the users profile avatar
router.delete('/api/users/avatar/remove', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const user = req.user;
        user.avatar.normal = undefined;
        user.avatar.small = undefined;
        yield user.save();
        res.send({ message: 'avatar removed' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends get request to render profile avatar
router.get('/api/users/avatar/view', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = req.query._id;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "Include '_id' as a query parameter");
        // @ts-ignore
        const user = yield User_1.default.findById(_id);
        if (!user)
            return (0, errors_1.errorJson)(res, 400, "Invalid '_id'");
        if (!((_a = user.avatar) === null || _a === void 0 ? void 0 : _a.normal))
            return (0, errors_1.errorJson)(res, 400, "User does not have an avatar");
        res.set('Content-Type', 'image/png');
        if (req.query.size === "small") {
            res.send(user.avatar.small);
        }
        else {
            res.send(user.avatar.normal);
        } // large
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends get request to check user existence
router.get('/api/users/exists', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.query.email;
    const uniqueName = req.query.uniqueName;
    try {
        if (typeof email === "string") {
            const user = yield User_1.default.findOne({ email });
            if (user === null) {
                return res.status(200).send({ message: 'user does not exist' });
            }
        }
        else if (typeof uniqueName === "string") {
            const user = yield User_1.default.findOne({ uniqueName });
            if (user === null) {
                return res.status(200).send({ message: 'user does not exist' });
            }
        }
        res.send({ message: 'user exists' });
    }
    catch (error) {
        res.status(200).send({ message: 'User does not exist' });
    }
}));
// sends get request to get available unique names
router.get('/api/users/look-for-available-unique-names', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let sample = req.query.sample;
    try {
        if (typeof sample !== "string")
            return (0, errors_1.errorJson)(res, 400, "Include a request query called 'sample' in the request");
        sample = sample.trim().replace(/[^a-zA-Z\ \-\_0-9]/g, '').toLowerCase();
        const sampleList = sample.split(" ").slice(0, 2);
        sample = sampleList.join('-');
        let listOfNames = [];
        if (sampleList.length === 1) {
            listOfNames.push(sample);
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
        }
        else {
            listOfNames.push(sample);
            listOfNames.push(sampleList[0]);
            listOfNames.push(sampleList[1]);
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sampleList[0] + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sampleList[1] + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sampleList[0] + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sampleList[1] + (0, SpecialCtrl_1.randomAmong)(10, 99));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[0] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[1] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[0] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[1] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[0] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[1] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[0] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[1] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sample + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[0] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
            listOfNames.push(sampleList[1] + (0, SpecialCtrl_1.randomAmong)(99, 9999));
        }
        const finalData = yield User_1.default.find({ uniqueName: { $in: listOfNames } }, { uniqueName: 1, _id: 0 });
        res.send({ sample, sampleList, listOfNames, finalData });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
exports.default = router;
