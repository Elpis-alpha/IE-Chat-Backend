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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const User_1 = __importDefault(require("../models/User"));
const passport_google_oauth20_1 = __importDefault(require("passport-google-oauth20"));
const SpecialCtrl_1 = require("../helpers/SpecialCtrl");
const date_fns_1 = require("date-fns");
const _env_1 = require("../_env");
passport_1.default.use(new passport_google_oauth20_1.default.Strategy({
    clientID: (_a = process.env.GOOGLE_AUTH_CLIENT_ID) !== null && _a !== void 0 ? _a : "",
    clientSecret: (_b = process.env.GOOGLE_AUTH_CLIENT_SECRET) !== null && _b !== void 0 ? _b : "",
    callbackURL: `${process.env.HOST}/api/oauth/google/callback`,
    passReqToCallback: true,
}, function (req, accessToken, refreshToken, profile, done) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const state = JSON.parse(req.query.state);
            if (typeof state.token !== "string")
                return done(new Error("Invalid state - Google Auth String"));
            let user = yield User_1.default.findOneAndUpdate({ "google.id": profile.id }, {
                $set: {
                    "google.token": state.token,
                    "google.tokenExpiryDate": (0, date_fns_1.addMinutes)(new Date(), 5)
                }
            });
            if (!user) {
                let username = (0, SpecialCtrl_1.simplifyName)((_a = profile === null || profile === void 0 ? void 0 : profile.displayName) !== null && _a !== void 0 ? _a : "");
                while (true) {
                    let userExists = yield User_1.default.findOne({ username });
                    if (!userExists)
                        break;
                    username = (0, SpecialCtrl_1.simplifyName)((_b = profile === null || profile === void 0 ? void 0 : profile.displayName) !== null && _b !== void 0 ? _b : "") + (0, SpecialCtrl_1.randomAmong)(0, 10000);
                }
                user = yield User_1.default.create({
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
                        tokenExpiryDate: (0, date_fns_1.addMinutes)(new Date(), 1)
                    },
                    password: "google",
                    avatar: (_d = (_c = profile === null || profile === void 0 ? void 0 : profile._json) === null || _c === void 0 ? void 0 : _c.picture) !== null && _d !== void 0 ? _d : _env_1.userDefaultImage,
                    tokens: []
                });
            }
            if (user.authType !== "google")
                return done(new Error("Invalid Authentication Method"));
            return done(null, { profile, user });
        }
        catch (e) {
            return done(e);
        }
    });
}));
passport_1.default.serializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user);
});
module.exports = passport_1.default;
