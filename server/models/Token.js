const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
 
  hash: String,
  role: {
    type: String,
    enum: ["hr", "candidate", "superAdmin"],
    required: true,
  },
  refreshToken: String,
  accessToken: String,
  accessTokenExpiresAt: Date,
  tokenType: String,
  scope: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Token", tokenSchema);
