
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import prisma from "../prisma.js";
import { loginOrCreateUserService } from "../services/auth.service.js";

interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      passReqToCallback: true,
      scope: ["profile", "email"],
    },
    async (
      req,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        const { email, sub: googleId, picture } = profile._json as {
          email: string;
          sub: string;
          picture: string;
        };

        if (!googleId || !email) {
          return done(new Error("Google ID not Found!"), undefined);
        }

        const { user } = await loginOrCreateUserService({
          provider: "GOOGLE",
          displayName: profile.displayName,
          providerId: googleId,
          email,
          profilePicture: picture,
        });

        done(null, user);
      } catch (error) {
        console.log("GOOGLE ERROR OCCURED PLEASE FIX PASSPORT", error);
        done(error, undefined);
      }
    }
  )
);


// // Serialize user: Store user ID in session
// This detrmines what data gets stored in the session cookie
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})


// Deserialize user: Retrieve full user object from database using ID
// This runs on every request to populate req.use
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) return done(new Error("User not found"), null)
    
    done(null, user)
    console.log("DESERIALIZED USER", user)
  } catch (error) {
    console.log("DESERIALIZE ERROR", error)
    done(error, null)
  }
})

export default passport

