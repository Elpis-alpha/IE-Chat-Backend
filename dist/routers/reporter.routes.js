"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const reporter_controller_1 = require("../controllers/reporter.controller");
const multer_1 = require("../helpers/multer");
const rolesAuth_1 = require("../middleware/rolesAuth");
const router = express_1.default.Router();
// Sends post request to create new reporter
// router.post('/create', createReporter)
router.post('/create', auth_1.default, rolesAuth_1.adminAuth, reporter_controller_1.createReporter);
// sends get request to edit auth reporter
router.patch('/edit', auth_1.default, rolesAuth_1.adminAuth, reporter_controller_1.editReporter);
// Sends post request to log reporter in
router.post('/login', reporter_controller_1.loginReporter);
// Sends post request to log reporter out
router.post('/logout', auth_1.default, reporter_controller_1.logoutReporter);
// sends get request to fetch auth reporter
router.get('/get', auth_1.default, reporter_controller_1.getReporter);
// sends get request to fetch auth reporter dashboard
router.get('/get-dashboard', auth_1.default, reporter_controller_1.getReporterDashboardData);
// sends get request to fetch auth admin dashboard
router.get('/get-admin-dashboard', auth_1.default, rolesAuth_1.adminAuth, reporter_controller_1.getAdminDashboardData);
// sends post request to pay a reporter
router.post('/pay-reporter', auth_1.default, rolesAuth_1.adminAuth, reporter_controller_1.payReporter);
// sends get request to fetch manage reporters dashboard
router.get('/get-manage-reporters-dashboard', auth_1.default, rolesAuth_1.adminAuth, reporter_controller_1.getManageReportersDashboardData);
// sends get request to find a reporter
router.get('/find', reporter_controller_1.findReporter);
// sends get request to filter reporters
router.get('/filter', reporter_controller_1.filterReporter);
// sends get request to filter reporters
router.get('/reporters', reporter_controller_1.getReporters);
// sends get request to filter reporters
router.get('/juniors', reporter_controller_1.getJuniorsForPayoutAll);
// Sends delete request to delete reporter
router.delete('/delete', auth_1.default, rolesAuth_1.adminAuth, reporter_controller_1.deleteReporter);
// sends delete request to remove reporter discord/twitter data
router.delete('/reset-socials', auth_1.default, reporter_controller_1.resetReporterSocials);
// sends get request to check reporter existence
router.get('/exists', reporter_controller_1.checkReporterExistence);
// Sends post request to edit reporter username 
router.patch('/change-username', auth_1.default, reporter_controller_1.editUsernameReporter);
// Sends post request to create and upload the reporters profile avatar
router.post('/avatar/upload', auth_1.default, multer_1.multerUploads, reporter_controller_1.saveReporterImage);
// Sends delete request to delete the reporters profile avatar
router.delete('/avatar/remove', auth_1.default, reporter_controller_1.removeReporterImage);
exports.default = router;
