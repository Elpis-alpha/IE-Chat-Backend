"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const express_1 = __importDefault(require("express"));
const errors_1 = require("../middleware/errors");
const _env_1 = require("../_env");
const router = express_1.default.Router();
router.get('/google/callback', function (req, res, next) {
    passport_1.default.authenticate('google', function (err, user, info) {
        if (err) {
            return res.send(`
      <html>
        <head>
          <title>iE Chat - Google Authentication</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
        </head>
        <body style="
          background-color: #eff6fc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          font-family: 'Poppins';
          color: #000;
        ">
          <h1 style="margin: 0; color: #ff9b9b;">${(err === null || err === void 0 ? void 0 : err.message) ? err.message : "An Error Occured"}</h1>
          <p>This window will close in three seconds</p>
          <script>setTimeout(() => {window.close()}, 3000)</script>
        </body>
      </html>
    `);
        }
        else if (user === null || user === void 0 ? void 0 : user.profile) {
            return res.send(`
        <html>
          <head>
            <title>iE Chat - Google Authentication</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
          </head>
          <body style="
            background-color: #eff6fc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: 'Poppins';
            color: #000;
          ">
            <h1 style="margin: 0; color: #88eac1;">Connection Successful</h1>
            <p>This window will close in three seconds</p>
            <script>setTimeout(() => {window.close()}, 3000)</script>
          </body>
        </html>
      `);
        }
        return res.send(`
      <html>
        <head>
          <title>iE Chat - Google Authentication</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
        </head>
        <body style="
          background-color: #eff6fc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          font-family: 'Poppins';
          color: #000;
        ">
          <h1 style="margin: 0; color: #9d9dff;">${(info === null || info === void 0 ? void 0 : info.message) ? info.message : "Something Happened"}</h1>
          <p>This window will close in three seconds</p>
          <script>setTimeout(() => {window.close()}, 3000)</script>
        </body>
      </html>
    `);
    })(req, res, next);
});
// protected route that authenticate user and configures google
router.get('/google', (req, res, next) => {
    const token = req.query.token;
    if (!token)
        return (0, errors_1.errorHtml)(res, 400);
    // @ts-ignore
    passport_1.default.authenticate('google', {
        scope: ['profile'],
        state: JSON.stringify({ token }),
        callbackURL: `${_env_1.host}/api/oauth/google/callback`
    })(req, res, next);
});
exports.default = router;
