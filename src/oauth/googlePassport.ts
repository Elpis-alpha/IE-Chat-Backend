import passport from 'passport';
import User from '../models/User';
import passportTwitter from 'passport-google-oauth20';
import { randomAmong, simplifyName } from '../helpers/SpecialCtrl';
import { addMinutes } from 'date-fns';
import { userDefaultImage } from '../_env';

passport.use(
	new passportTwitter.Strategy(
		{
			clientID: process.env.GOOGLE_AUTH_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET ?? "",
			callbackURL: `${process.env.HOST}/api/oauth/google/callback`,
			passReqToCallback: true,
		},
		async function (req: any, accessToken: any, refreshToken: any, profile: any, done: any) {
			try {
				const state = JSON.parse(req.query.state)
				if (typeof state.token !== "string") return done(new Error("Invalid state - Google Auth String"))

				let user = await User.findOneAndUpdate({ "google.id": profile.id }, {
					$set: {
						"google.token": state.token,
						"google.tokenExpiryDate": addMinutes(new Date(), 5)
					}
				});
				if (!user) {
					let username = simplifyName(profile?.displayName ?? "")

					while (true) {
						let userExists = await User.findOne({ username })
						if (!userExists) break
						username = simplifyName(profile?.displayName ?? "") + randomAmong(0, 10000)
					}

					user = await User.create({
						name: profile.displayName, username,
						sendWithEnter: true,
						onlineStatus: {
							isOnline: false,
							lastOnline: new Date()
						},
						authType: "google",
						google: {
							id: profile.id,
							token: state.token,
							tokenExpiryDate: addMinutes(new Date(), 1)
						},
						password: "google",
						avatar: profile?._json?.picture ?? userDefaultImage,
						tokens: []
					})
				}

				if (user.authType !== "google") return done(new Error("Invalid Authentication Method"))

				return done(null, { profile, user });
			} catch (e) { return done(e as any) }
		}
	)
);

passport.serializeUser(function (user, done) {
	done(null, user as any);
});
passport.deserializeUser(function (user, done) {
	done(null, user as any);
});

module.exports = passport;