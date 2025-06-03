const {
    createOAuth2Client,
    getAuthUrl,
    handleOAuthCallback,
    scheduleMeeting,
  } = require('./calendarService');
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = require('./config');
  
  // Redirect user to Google Auth URL
  const initiateAuth = (req, res) => {
    const oauth2Client = createOAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    const url = getAuthUrl(oauth2Client);
    res.redirect(url);
  };
  
  // Handle OAuth2 callback
  const handleCallback = async (req, res) => {
    const code = req.query.code;
    const userId = req.query.state || "someUserId"; // Optional: get from session or state
    const oauth2Client = createOAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
    try {
      const updatedUser = await handleOAuthCallback(userRepository, userId, code, oauth2Client);
      res.send("Authorization successful! You can close this tab.");
    } catch (err) {
      res.status(500).send("OAuth Callback Failed: " + err.message);
    }
  };
  
  // Schedule a meeting
  const createMeeting = async (req, res) => {
    try {
      const link = await scheduleMeeting(userRepository, req.body, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
      res.status(200).json({ eventLink: link });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    initiateAuth,
    handleCallback,
    createMeeting,
  };
  