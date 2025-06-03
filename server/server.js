require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cmsRouter = require('./routes/cmsRoutes');
const cookieSession = require("cookie-session");
const passportStrategy = require("./config/passport");
const connectDB = require("./db/database");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// MongoDB Connection
connectDB();

app.use(
	cookieSession({
		name: "session",
		keys: ["cyberwolve"],
		maxAge: 24 * 60 * 60 * 100,
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
	cors({
		origin: "http://localhost:8002",
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

app.use('/api/cms', cmsRouter);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Listening on port ${port}...`));
