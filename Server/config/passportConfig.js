const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          if (!user.googleId) {
            // Associate Google ID if not already registered
            user.googleId = profile.id;
            await user.save();
          }
          console.log("Google user logged in:", user);
          return done(null, user);
        }

        // Create a new user if not found
        const newUser = new User({
          googleId: profile.id,
          name: profile.name.givenName || profile.displayName,
          lastname: profile.name.familyName || "",
          email: profile.emails[0].value,
          image: profile.photos[0].value,
          verified: true,
          role: "Client",
        });

        user = await newUser.save();
        console.log("New Google user registered:", user);
        return done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3001/facebook/callback",
      profileFields: ["id", "emails", "name", "photos"], // Request email, name, and profile picture
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          if (!user.facebookId) {
            // Associate Facebook ID if not already registered
            user.facebookId = profile.id;
            await user.save();
          }
          console.log("Facebook user logged in:", user);
          return done(null, user);
        }

        // Create a new user if not found
        const newUser = new User({
          facebookId: profile.id,
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
          verified: true,
          role: "Client",
        });

        user = await newUser.save();
        console.log("New Facebook user registered:", user);
        return done(null, user);
      } catch (err) {
        console.error("Facebook OAuth error:", err);
        return done(err);
      }
    }
  )
);