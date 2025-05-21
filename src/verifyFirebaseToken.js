/**
 * Middleware to verify Firebase ID token and attach user information to the request.
 */
 const admin = require('firebase-admin');

 // Initialize Firebase Admin if not already initialized
 if (!admin.apps.length) {
  admin.initializeApp();
 }

module.exports = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user', // Default role to 'user' if not present in claims
        companyId: decodedToken.companyId || null, // Default companyId to null if not present in claims
      };
      next();
    })
    .catch((error) => {
      res.status(403).send('Forbidden');
    });
};


