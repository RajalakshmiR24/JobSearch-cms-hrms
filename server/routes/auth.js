// routes/authRoutes.js

const authroutes = require("express").Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const commoncontroller = require("../controllers/Common/commonController");

authroutes.get("/login/success", authController.loginSuccess);

authroutes.get("/login/failed", authController.loginFailed);

authroutes.get("/google", passport.authenticate("google", ["profile", "email"]));

authroutes.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: process.env.CLIENT_URL,
		failureRedirect: "/login/failed",
	})
);

authroutes.get("/logout", authController.logout);

authroutes.post('/jobs', commoncontroller.getAllJob);
authroutes.post('/create/org', commoncontroller.createOrg);


module.exports = authroutes;
