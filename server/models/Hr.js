const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const urlRegex = /^(https?:\/\/)?([\w\d\-_]+\.)+[a-z]{2,6}(\/[\w\d\-_.]*)*\/?$/;
const position = ['HR', 'HR Administrator']
const GeoLocationSchema = require('./GeoLocation');

const hrSchema = new mongoose.Schema({
  hr_id: {
    type: String,
    default: uuidv4,
  },
  phone_number: {
    type: String,
    minlength: [10, 'Phone number must be at least 10 digits'],
    maxlength: [15, 'Phone number cannot exceed 10 digits'],
    match: [/^[6-9][0-9]{9}$/, 'Phone number must start with 6, 7, 8, or 9 and contain only digits'],
  },
  googleId: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  hash: String,
  photo: String,
  provider: String,
  verified: Boolean,
  role: {
    type: String,
    default: "hr",
    enum: ["hr"],
  },
  position: {
    type: String,
    required: true,
    enum: position,
  },
  organization_name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    minlength: [3, 'Organization name must be at least 3 characters'],
    maxlength: [255, 'Organization name cannot exceed 255 characters'],
    match: [/^[A-Za-z0-9\s&,-]+$/, 'Organization name must contain only letters, numbers, spaces, and special characters like &, -'],
  },
  organization_id: {
    type: String,
    default: uuidv4,
  },
  organization_address: {
    type: String,
    required: [true, 'Organization address is required'],
    trim: true,
    minlength: [5, 'Organization address must be at least 5 characters'],
    maxlength: [500, 'Organization address cannot exceed 500 characters'],
  },
  organization_contact: {
    email: {
      type: String,
    },
  },
  organization_website: {
    type: String,
    match: [urlRegex, 'Please enter a valid website URL'],
    trim: true,

  },
  organization_logo: {
    type: String,
    required: [true, 'Organization logo is required'],
    
  },  
  hr_status: {
    type: String,
    enum: ['active', 'inactive', 'report', 'suspended','deleted', 'pending'],
    default: 'active',
    required: true,
  },
  org_status: {
    type: String,
    enum: ['active', 'inactive', 'report', 'suspended','deleted', 'pending'],
    default: 'active',
    required: true,
  },
  join_date: {
    type: Date,
    default: Date.now,
  },
  invited_by: {
    type: String,
  },
  geoLocation: GeoLocationSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
},{ timestamps: true });

const Hr = mongoose.models.Hr || mongoose.model('Hr', hrSchema);

module.exports = Hr;