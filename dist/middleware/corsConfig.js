"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const _env_1 = require("../_env");
// Obtain allow tools info
const allowTools = process.env.ALLOW_TOOLS === "true";
const corsConfig = (0, cors_1.default)({
    origin: (origin, callback) => {
        if (allowTools) {
            if (_env_1.frontEndLocations.split(",").indexOf(origin !== null && origin !== void 0 ? origin : "") !== -1 || !origin) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
        else {
            if (_env_1.frontEndLocations.split(",").indexOf(origin !== null && origin !== void 0 ? origin : "") !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
});
exports.default = corsConfig;
