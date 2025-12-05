import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../prisma.js";
import { loginOrCreateUserService } from "../services/user.services.js";
import { Request } from "express";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile,
      done: (err: any, user?: any) => void
    ) => {
      try {
        // Extract data from passport profile object correctly
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const picture = profile.photos?.[0]?.value;
        const displayName = profile.displayName;

        if (! googleId || !email) {
          return done(new Error("Google ID or email not found"), null);
        }

        const { user } = await loginOrCreateUserService({
          provider: "GOOGLE",
          providerId: googleId,
          displayName,
          email,
          picture,
        });

        done(null, user);
      } catch (error) {
        console.error("Google Auth Error:", error);
        done(error, null);
      }
    }
  )
);

console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID)

passport.serializeUser((user: any, done) => {
  done(null, user. id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return done(new Error("User not found"), null);

    done(null, user);
  } catch (error) {
    console.error("Deserialize Error:", error);
    done(error, null);
  }
});

export default passport;


