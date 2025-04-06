module.exports = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3001/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'photos', 'email']
}; 