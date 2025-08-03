import admin from '../utils/admin';
import { cors, runMiddleware } from '../utils/cors';

export default async function handler(req, res) {
   // Run the CORS middleware
   await runMiddleware(req, res, cors);

   // Handle preflight OPTIONS request explicitly
   if (req.method === 'OPTIONS') {
      return res.status(204).end();
   }

   // Only allow POST requests
   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
   }

   try {
      const { email, password, userId } = req.body;

      // Validate required fields
      if (!email || !password || !userId) {
         return res.status(400).json({ error: 'Email, password, and userId are required' });
      }

      // Check if user already exists in Firebase Auth
      try {
         const userRecord = await admin.auth().getUserByEmail(email);
         // If we get here, user exists already
         return res.status(400).json({
            error: 'User already exists in Firebase Authentication',
            uid: userRecord.uid,
         });
      } catch (error) {
         // User doesn't exist, which is what we want
         if (error.code !== 'auth/user-not-found') {
            throw error;
         }
      }

      // Create the user in Firebase Auth
      const userRecord = await admin.auth().createUser({
         email,
         password,
         emailVerified: true, // Set to true since we're admin-approving them
      });

      // Link the Firestore user ID with the Auth UID if they're different
      if (userId !== userRecord.uid) {
         const db = admin.firestore();
         await db.collection('users').doc(userId).update({
            authUid: userRecord.uid,
            hasAuthAccount: true,
            status: 'approved',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
         });
      }

      // Success!
      return res.status(200).json({
         message: 'User created successfully',
         uid: userRecord.uid,
      });
   } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
         error: 'Failed to create user',
         message: error.message,
      });
   }
}
