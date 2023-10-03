"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataUriMulti = exports.multerDualUploads = exports.dataUri = exports.multerUploads = void 0;
const multer_1 = __importDefault(require("multer"));
const parser_1 = __importDefault(require("datauri/parser"));
const errors_1 = require("../middleware/errors");
const parser = new parser_1.default();
const dataUri = (req, name) => parser.format(name, req.file.buffer).content;
exports.dataUri = dataUri;
const dataUriMulti = (req, name, i) => { var _a, _b, _c; return parser.format(name, (_c = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a[i]) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.buffer).content; };
exports.dataUriMulti = dataUriMulti;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 10000000 } }).single('image');
const uploadDual = (0, multer_1.default)({ storage, limits: { fileSize: 10000000 } }).fields([{ name: 'desktop', maxCount: 1 }, { name: 'mobile', maxCount: 1 }]);
/* 1048576 = 10mb */
const multerUploads = (req, res, next) => {
    upload(req, res, err => {
        if (err)
            return (0, errors_1.errorJson)(res, 401, "Invalid Image");
        // Everything went fine.
        next();
    });
};
exports.multerUploads = multerUploads;
const multerDualUploads = (req, res, next) => {
    uploadDual(req, res, err => {
        if (err)
            return (0, errors_1.errorJson)(res, 401, "Invalid Image");
        // Everything went fine.
        next();
    });
};
exports.multerDualUploads = multerDualUploads;
