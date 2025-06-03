const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { saveGoogleUser } = require("../controllers/authController");
const Hr = require("../models/Hr");
const Candidate = require("../models/Candidate");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      callbackURL: "/api/cms/auth/google/callback",
      scope: ["profile", "email"],
      accessType: "offline",         
      prompt: "consent",             
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Access Token:", accessToken);
        // console.log("Refresh Token:", refreshToken); 

        const user = await saveGoogleUser(profile, accessToken);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user._id);
});


passport.deserializeUser(async (id, done) => {
  try {
    let user = await Hr.findById(id);
    if (!user) user = await Candidate.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

