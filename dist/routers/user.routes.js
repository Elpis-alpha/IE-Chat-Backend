"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const routes = __importStar(require("../controllers/user.controller"));
const multer_1 = require("../helpers/multer");
const router = express_1.default.Router();
// Sends post request to create new user
router.post('/create', routes.createUser);
// Sends post request to check user google token
router.post('/check-google', routes.checkGoogleToken);
// sends patch request to edit auth user
router.patch('/edit', auth_1.default, routes.editUser);
// Sends post request to log user in
router.post('/login', routes.loginUser);
// Sends post request to log user out
router.post('/logout', auth_1.default, routes.logoutUser);
// sends get request to fetch auth user
router.get('/get', auth_1.default, routes.getUser);
// sends get request to find a user
router.get('/find', routes.findUser);
// sends get request to filter users
router.get('/filter', routes.filterUser);
// Sends post request to create and upload the users profile avatar
router.post('/avatar/upload', auth_1.default, multer_1.multerUploads, routes.saveUserImage);
// Sends delete request to delete the users profile avatar
router.delete('/avatar/remove', auth_1.default, routes.removeUserImage);
exports.default = router;
