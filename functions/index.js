// functions/index.js or functions/createcompanyV2.js

const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Optional: Set global options for all functions
setGlobalOptions({
  region: 'us-central1', // or your preferred region
  memory: '512MiB',
  cpu: 1,
  timeoutSeconds: 60,
});

// Pre-configure CORS
const corsHandler = cors({ origin: true });

// Export the function
exports.createcompanyV2 = onRequest({ memory: '512MiB', cpu: 1 }, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { companyName, officialEmail, password, pocName, pocMobile } = req.body;

    if (!companyName || !officialEmail || !pocName || !pocMobile || !password) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(officialEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: officialEmail,
        password,
      });

      const userId = userRecord.uid;

      const companyData = {
        companyName,
        officialEmail,
        userId,
        poc: {
          name: pocName,
          mobile: pocMobile,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const companyRef = await admin.firestore().collection('companies').add(companyData);
      const companyId = companyRef.id;

      await admin.auth().setCustomUserClaims(userId, { role: 'admin', companyId });

      return res.status(200).json({
        message: 'Company created successfully!',
        userId,
        companyId,
      });
    } catch (error) {
      console.error('Error creating company:', error);

      const errorMessages = {
        'auth/email-already-exists': 'The email address is already in use by another user.',
      };

      return res.status(500).json({ error: errorMessages[error.code] || 'Internal server error.' });
    }
  });
});
