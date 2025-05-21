const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const verifyFirebaseToken = require('./verifyFirebaseToken');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json()); // To parse JSON bodies

// ✅ Route 1: Create Company (moved to Express)
app.post('/createcompanyV2', async (req, res) => {
  const { email, password, companyName, companyAddress, companyPhone, subscriptionStatus } = req.body;

  if (!email || !password || !companyName) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: companyName,
    });

    const companyData = {
      email,
      companyName,
      companyAddress: companyAddress || "",
      companyPhone: companyPhone || "",
      subscriptionStatus: subscriptionStatus || "free",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("companies").doc(userRecord.uid).set(companyData);

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "company",
      companyId: userRecord.uid,
    });

    return res.status(201).send({ message: "Company created successfully", uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating company:", error);
    return res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ Route 2: Verify Company Login
app.post('/verifyCompanyLoginV2', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.replace('Bearer ', '');

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken || decodedToken.role !== 'company' || !decodedToken.companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json({ message: 'Company verified', uid: decodedToken.uid });
  } catch (err) {
    console.error('Error in /verifyCompanyLoginV2:', err);
    return res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

// ✅ Example Protected Route
app.get('/api/protected-route', verifyFirebaseToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

// ✅ Deploy the Express app as a single HTTPS function
exports.api = functions.https.onRequest(app);
