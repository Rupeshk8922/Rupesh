const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// const admin = require("firebase-admin");
// admin.initializeApp();
// const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

app.post("/webhook", async (req, res) => {
  // Your webhook handling logic here
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received successfully");
});

// exports.webhook = functions.https.onRequest(app);