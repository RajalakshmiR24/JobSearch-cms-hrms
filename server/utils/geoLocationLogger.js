const geoip = require('geoip-lite');
const { getName } = require('country-list');

const geoLocationHistory = {}; 


const getGeoLocation = (ip, action, saveLocation = true) => {
    if (!ip) return null; 

    if (!geoLocationHistory[ip]) {
        geoLocationHistory[ip] = {
            ip_address: ip,
            action_details: []
        };

        
        if (saveLocation) {
            const locationDetails = getLocationDetails(ip);
            if (locationDetails) {
                geoLocationHistory[ip].loc = locationDetails;
            }
        }
    }

    const actionDetail = {
        action,
        action_time: new Date()
    };

    geoLocationHistory[ip].action_details.push(actionDetail);

    return geoLocationHistory[ip];
};


const getLocationDetails = (ip) => {
    const location = geoip.lookup(ip);
    if (!location) {
        // console.warn(`GeoIP lookup failed for IP: ${ip}`);
        return null; 
    }
    
    
    return {
        city: location.city || "Unknown",
        country: getName(location.country) || "Unknown",
        region: location.region || "Unknown"
    };
};


const logGeoLocationOnCreate = (ip) => getGeoLocation(ip, "Created", true);


const logGeoLocationOnLogin = (ip) => {
    const locationHistory = geoLocationHistory[ip];
    if (locationHistory && !locationHistory.loc) {
        const locationDetails = getLocationDetails(ip);
        if (locationDetails) {
            locationHistory.loc = locationDetails;
        }
    }
    return getGeoLocation(ip, "Login", false);
};

const logGeoLocationOnLogout = (ip) =>{ 
    const locationHistory = geoLocationHistory[ip];
    if (locationHistory && !locationHistory.loc) {
        const locationDetails = getLocationDetails(ip);
        if (locationDetails) {
            locationHistory.loc = locationDetails;
        }
    }
    return getGeoLocation(ip, "Logout", false)};

module.exports = {
    logGeoLocationOnCreate,
    logGeoLocationOnLogin,
    logGeoLocationOnLogout
};