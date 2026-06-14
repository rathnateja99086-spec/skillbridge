const admin = require('firebase-admin');

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_CREDENTIALS) {
    // Production: credentials from environment variable (Railway)
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Local: credentials from file path
    credential = admin.credential.applicationDefault();
  } else {
    throw new Error('No Firebase credentials found. Set FIREBASE_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS.');
  }

  admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized — invalid token' });
  }
};

module.exports = { admin, db, verifyToken };
