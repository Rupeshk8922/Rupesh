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
      return res.status(405).send({ error: "Method not allowed" });
    }

    try {
      const { name, email } = req.body;

      // Validate name
      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).send({ error: "Invalid or missing name" });
      }

      // Validate email
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).send({ error: "Invalid or missing email" });
      }

      // Check if user already exists
      const existingUser = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        return res.status(409).send({ error: "User with this email already exists" });
      }

      // Add new user
      const userRef = await db.collection("users").add({
        name,
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).send({ message: "User created", id: userRef.id });

    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  });
});
