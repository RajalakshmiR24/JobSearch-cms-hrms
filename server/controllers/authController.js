const crypto = require("crypto");
const Hr = require("../models/Hr");
const Candidate = require("../models/Candidate");
const SuperAdmin = require("../models/SuperAdmin");
const Token = require("../models/Token");

exports.loginSuccess = async (req, res) => {
  try {
    if (req.user) {
      const tokenData = await Token.findOne({ hash: req.user.hash });

      if (tokenData) {
        res.status(200).json({
          code: 200,
          message: "Successfully Logged In",
          cmshrmstoken: tokenData.accessToken, 
          role: req.user.role,
        });
      } else {
        res.status(200).json({ code: 403, error: true, message: "Token Not Found" });
      }
    } else {
      res.status(200).json({ code: 403, error: true, message: "Not Authorized" });
    }
  } catch (error) {
    res.status(200).json({ code: 500, error: true, message: "Internal Server Error" });
  }
};


exports.loginFailed = (req, res) => {
  res.status(200).json({
    code: 401,
    error: true,
    message: "Log in failure",
  });
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(200)
        .json({ code: 500, error: true, message: "Logout failed" });
    }
    res.redirect(process.env.CLIENT_URL);
  });
};

exports.saveGoogleUser = async (profile, accessToken) => {
  try {
    const email = profile.emails?.[0]?.value || "";
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    const baseData = {
      googleId: profile.id,
      name: profile.displayName,
      email,
      hash: emailHash,
      photo: profile.photos?.[0]?.value,
      verified: profile.emails?.[0]?.verified || false,
      provider: profile.provider,
    };

    let user = await Hr.findOne({ email });
    let userModel = Hr;

    if (!user) {
      user = await Candidate.findOne({ email });
      userModel = Candidate;
    }

    if (!user) {
      user = await SuperAdmin.findOne({ email }); 
      userModel = SuperAdmin;
    }

    if (user) {
      
      Object.assign(user, baseData);
      await user.save();
    } else {
      
      userModel = Candidate;
      user = new userModel({ ...baseData, role: "candidate" });
      await user.save();
    }

    
    await Token.findOneAndUpdate(
      { hash: emailHash, role: user.role || "candidate" },
      { $set: { accessToken } },
      { upsert: true, new: true }
    );

    return user;
  } catch (err) {
    console.error("Error saving Google user:", err.message);
    throw err;
  }
};