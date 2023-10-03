import passport from 'passport';
import express from 'express';
import { errorHtml, errorJson } from '../middleware/errors';
import { Response, oauthUserRequest } from '../types/request';
import { host } from '../_env';

const router = express.Router();

router.get('/google/callback', function (req, res, next) {
	passport.authenticate('google', function (err: any, user: any, info: any) {
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
          <h1 style="margin: 0; color: #ff9b9b;">${err?.message ? err.message : "An Error Occured"}</h1>
          <p>This window will close in three seconds</p>
          <script>setTimeout(() => {window.close()}, 3000)</script>
        </body>
      </html>
    `);

		} else if (user?.profile) {
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
          <h1 style="margin: 0; color: #9d9dff;">${info?.message ? info.message : "Something Happened"}</h1>
          <p>This window will close in three seconds</p>
          <script>setTimeout(() => {window.close()}, 3000)</script>
        </body>
      </html>
    `);
	})(req, res, next);
})


// protected route that authenticate user and configures google
router.get('/google', (req: oauthUserRequest, res: Response, next) => {
	const token = req.query.token
	if (!token) return errorHtml(res, 400)

	// @ts-ignore
	passport.authenticate('google', {
		scope: ['profile'],
		state: JSON.stringify({ token }),
		callbackURL: `${host}/api/oauth/google/callback`
	})(req, res, next);
});

export default router