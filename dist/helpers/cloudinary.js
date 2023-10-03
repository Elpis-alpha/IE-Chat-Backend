"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploader = exports.cloudinaryConfig = void 0;
const cloudinary_1 = require("cloudinary");
// Configuration 
const cloudinaryConfig = (req, res, next) => {
    const cloud = cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
    next();
};
exports.cloudinaryConfig = cloudinaryConfig;
exports.uploader = cloudinary_1.v2.uploader;
