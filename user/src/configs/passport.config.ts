import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

type Strategy {
  clientId: string, clientSecret: string, callbackUrl: string
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret : process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    }: Strategy,
    async function (accessToken, refreshToken, profile, done) {
      
    }
  ),
);
