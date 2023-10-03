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
const errors_1 = require("../middleware/errors");
const router = express_1.default.Router();
router.get('/api*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorJson)(res, 404); }));
router.get('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorHtml)(res, 404); }));
router.post('/api*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorJson)(res, 404); }));
router.post('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorHtml)(res, 404); }));
router.patch('/api*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorJson)(res, 404); }));
router.patch('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorHtml)(res, 404); }));
router.put('/api*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorJson)(res, 404); }));
router.put('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorHtml)(res, 404); }));
router.delete('/api*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorJson)(res, 404); }));
router.delete('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () { (0, errors_1.errorHtml)(res, 404); }));
exports.default = router;
