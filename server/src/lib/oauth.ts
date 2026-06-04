import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "./schema";
import { generateToken } from "./auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        
        if (!email) {
          return done(new Error("No email found from Google profile"));
        }

        // Check if user already exists by email
        let user = await User.findOne({ email });

        if (user) {
          // If user exists but doesn't have google provider linked, link it
          if (!user.oauthProvider) {
            user.oauthProvider = "google";
            user.oauthId = profile.id;
            await user.save();
          }
        } else {
          // Create new user
          user = await User.create({
            email,
            name: profile.displayName || "Google User",
            oauthProvider: "google",
            oauthId: profile.id,
            photo: profile.photos?.[0]?.value,
            // Google users might not have a password, so we could set a random one or leave it out if we make it optional. 
            // In schema, password is required, so we generate a random password for oauth users to satisfy the schema,
            // or we need to make password optional in the schema.
            // A quick fix for now is generating a random string for the password.
            password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
