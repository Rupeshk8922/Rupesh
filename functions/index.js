// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const corsHandler = cors({ origin: true });

admin.initializeApp();

exports.createcompanyV2 = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Only POST requests are accepted" });
    }

    const { email, password, companyName, companyAddress, companyPhone, subscriptionStatus } = req.body;    if (!email || !password || !companyName) {
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

      const companyRef = admin.firestore().collection("companies").doc(userRecord.uid);
      await companyRef.set(companyData);

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
});