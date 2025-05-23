// Force rebuild
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const verifyFirebaseToken = require("./verifyFirebaseToken");

if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ Route 1: Create Company
app.post("/createcompanyV2", async (req, res) => {
  const {
    email,
    password,
    companyName,
    companyAddress,
    companyPhone,
    subscriptionStatus,
  } = req.body;

  if (!email || !password || !companyName) {
    return res.status(400).json({ error: "Missing required fields" });
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

    return res.status(201).json({
      message: "Company created successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error("❌ Error creating company:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// ✅ Route 2: Verify Company Login
app.post("/verifyCompanyLoginV2", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.replace("Bearer ", "");

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (
      !decodedToken ||
      decodedToken.role !== "company" ||
      !decodedToken.companyId
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({
      message: "Company verified",
      uid: decodedToken.uid,
    });
  } catch (err) {
    console.error("❌ Error in /verifyCompanyLoginV2:", err);
    return res.status(500).json({
      error: "Verification failed",
      details: err.message,
    });
  }
});

// ✅ Example Protected Route (requires valid Firebase token)
app.get("/api/protected-route", verifyFirebaseToken, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user,
  });
});

// ✅ Export Express App as Cloud Function
exports.api = functions.https.onRequest(app);
