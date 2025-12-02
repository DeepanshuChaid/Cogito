import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "74911273408-u367bp0vheh2rgorttvt ov0jk1ajc53r.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://www.example.com/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    },
  ),
);
