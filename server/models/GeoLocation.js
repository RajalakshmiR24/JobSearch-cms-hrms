// GeoLocation.js
const { Schema } = require('mongoose');

const GeoLocationSchema = new Schema({
    hash: {type: String,}, 
    ip_address: { type: String },
    loc: {
        city: { type: String },
        city_code: { type: String },
        country: { type: String },
        region: { type: String },
    },
    action_details: [{
        action: { type: String },
        action_time: { type: Date },
    },{_id:false}]
});
module.exports = GeoLocationSchema;
