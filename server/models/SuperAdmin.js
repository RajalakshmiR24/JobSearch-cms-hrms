const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const GeoLocationSchema = require("./GeoLocation");

const superAdminSchema = new Schema(
  {
    superAdmin_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    googleId: { type: String, unique: true },
    name: String,
    email: { type: String, unique: true },
    hash: String,
    photo: String,
    provider: String,
    verified: Boolean,
    phone_number: {
      type: String,
      minlength: [10, "Phone number must be at least 10 digits"],
      maxlength: [15, "Phone number cannot exceed 10 digits"],
      match: [
        /^[6-9][0-9]{9}$/,
        "Phone number must start with 6, 7, 8, or 9 and contain only digits",
      ],
    },

    role: {
      type: String,
      enum: ["superAdmin"],
      default: "superAdmin",
    },
    geoLocation: GeoLocationSchema,
  },
  { timestamps: true }
);

const SuperAdmin = model("SuperAdmin", superAdminSchema);

module.exports = SuperAdmin;
