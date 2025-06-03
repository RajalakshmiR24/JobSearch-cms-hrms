const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const kycSchema = new Schema(
  {
    kyc_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    candidate_hash: { type: String, required: true },
    candidate_id:{type: String,required: true},
    kycStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    
    verificationTimestamp: {
      type: Date,
      default: Date.now,
    },
    state: {
      type: String,
      required: true,
    },
    codeChallenge: {
      type: String,
      required: true,
    },
    verifier: {
      type: String,
      required: true,
    },
    access_token: {
      type: String,
    },
    expires_in: {
      type: Number,
    },
    token_type: {
      type: String,
    },
    scope: {
      type: String,
    },
    pan:{
      type: String,
    },
    name: { type: String },
    panCredential: { type: String },
    drivingLicenseCredential : { type: String },

    consent_valid_till: {
      type: Number,
    },
    id_token: {
      type: String,
    },
    eaadhar_tkn: {
      type: String,
    },
    eaadhar_uid: {
      type: String,
    },
    fileResponse:{
      type: String,
    },
    eaadharFile:{
      type: String,
    },
    poi: [
      {
        dob: String,
        gender: String,
        name: String,
      },
    ],
    poa: [
      {
        co: String,
        country: String,
        dist: String,
        house: String,
        lm: String,
        pc: String,
        po: String,
        state: String,
        street: String,
        subdist: String,
        vtc: String,
      },
    ],
    
    pht: [
      {
        imageData: String 
      }
    ]
  },
  {
    timestamps: true,
  }
);

const KYC = mongoose.models.KYC || mongoose.model('KYC', kycSchema);

module.exports = KYC;