const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

exports.createUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed. Use POST." });
    }

    try {
      const { name, email } = req.body;

      // Validate name
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Invalid or missing 'name'" });
      }

      // Validate email
      if (
        !email ||
        typeof email !== "string" ||
        !email.includes("@") ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return res.status(400).json({ error: "Invalid or missing 'email'" });
      }

      // Check for existing user
      const userSnapshot = await db
        .collection("users")
        .where("email", "==", email.toLowerCase())
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        return res.status(409).json({ error: "User with this email already exists." });
      }

      // Add new user to Firestore
      const userRef = await db.collection("users").add({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        message: "User successfully created.",
        id: userRef.id,
      });
    } catch (error) {
      console.error("🔥 Error in createUser function:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});
