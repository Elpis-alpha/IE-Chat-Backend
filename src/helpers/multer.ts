import multer from "multer";
import DatauriParser from "datauri/parser";
import { errorJson } from "../middleware/errors";

const parser = new DatauriParser();
const dataUri = (req: any, name: string) => parser.format(name, req.file.buffer).content;
const dataUriMulti = (req: any, name: string, i: string) => parser.format(name, req.files?.[i]?.[0]?.buffer).content;

const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: 10000000 } }).single('image');
const uploadDual = multer({ storage, limits: { fileSize: 10000000 } }).fields([{ name: 'desktop', maxCount: 1 }, { name: 'mobile', maxCount: 1 }]);

/* 1048576 = 10mb */
const multerUploads = (req: any, res: any, next: any) => {
	upload(req, res, err => {
		if (err) return errorJson(res, 401, "Invalid Image")
		// Everything went fine.
		next();
	});
};
const multerDualUploads = (req: any, res: any, next: any) => {
	uploadDual(req, res, err => {
		if (err) return errorJson(res, 401, "Invalid Image")
		// Everything went fine.
		next();
	});
};


export { multerUploads, dataUri, multerDualUploads, dataUriMulti };