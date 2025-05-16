const admin = require("firebase-admin");

// Middleware to verify Firebase ID Token
const verifyFirebaseToken = async (req, res, next) => {
  // Handle preflight requests for CORS
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).send("");
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Authorization header is missing or malformed.");
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    // Verify token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info to request
    next(); // Continue to next handler
  } catch (error) {
    console.error("Token verification failed:", error.code || error.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = verifyFirebaseToken;
