import admin from '../utils/admin.js';

export default async function handler(req, res) {
     res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
   
   // Handle OPTIONS method immediately
   if (req.method === 'OPTIONS') {
      return res.status(200).end();
   }

   // Only allow POST requests for the main functionality
   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
   }

   try {
      const { email, password, userId } = req.body;

      // Validate required fields
      if (!email || !password || !userId) {
         return res.status(400).json({
            error: 'Missing required fields',
            required: ['email', 'password', 'userId']
         });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
         return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate password strength
      if (password.length < 8) {
         return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      // Check if user already exists in Firebase Auth
      try {
         const existingUser = await admin.auth().getUserByEmail(email);
         // If we get here, user exists already
         return res.status(409).json({
            error: 'User already exists',
            message: 'A user with this email already exists in Firebase Authentication',
            uid: existingUser.uid,
         });
      } catch (error) {
         // User doesn't exist, which is what we want
         if (error.code !== 'auth/user-not-found') {
            console.error('Error checking existing user:', error);
            throw error;
         }
      }

      // Create the user in Firebase Auth
      const userRecord = await admin.auth().createUser({
         email,
         password,
         emailVerified: true,
      });

      console.log('User created in Firebase Auth:', userRecord.uid);

      // Update Firestore user document
      const db = admin.firestore();
      await db.collection('users').doc(userId).update({
         authUid: userRecord.uid,
         hasAuthAccount: true,
         status: 'approved',
         email: email,
         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Firestore document updated for user:', userId);

      // Success response
      return res.status(200).json({
         success: true,
         message: 'User created successfully',
         uid: userRecord.uid,
         userId: userId,
      });

   } catch (error) {
      console.error('Error creating user:', error);

      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-exists') {
         return res.status(409).json({
            error: 'Email already exists',
            message: 'A user with this email already exists'
         });
      }

      if (error.code === 'auth/invalid-email') {
         return res.status(400).json({
            error: 'Invalid email',
            message: 'The email address is not valid'
         });
      }

      if (error.code === 'auth/weak-password') {
         return res.status(400).json({
            error: 'Weak password',
            message: 'The password is too weak'
         });
      }

      if (error.code === 'not-found') {
         return res.status(404).json({
            error: 'User not found',
            message: 'The user document does not exist in Firestore'
         });
      }

      return res.status(500).json({
         error: 'Internal server error',
         message: error.message || 'Failed to create user',
         details: error.code || 'Unknown error'
      });
   }
}
