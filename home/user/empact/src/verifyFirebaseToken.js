const admin = require("firebase-admin");

// Firebase Auth Middleware for API Protection
const verifyFirebaseToken = async (req, res, next) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    res.set({
      "Access-Control-Allow-Origin": "*", // TODO: replace "*" with your domain in production
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.status(204).end();
  }

  // Set CORS headers for all requests
  res.set("Access-Control-Allow-Origin", "*"); // TODO: restrict origin in production

  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Authorization header missing or malformed.");
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info to request
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message || error.code);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = verifyFirebaseToken;
