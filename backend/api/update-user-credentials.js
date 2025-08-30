import { getAuth } from 'firebase-admin/auth';
import admin from '../utils/admin.js';

export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, newEmail, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User Auth UID is required' });
    }

    const updateData = {};
    if (newEmail) {
      updateData.email = newEmail;
    }
    if (newPassword) {
      if (newPassword.length < 6) {
           return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      updateData.password = newPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Either new email or new password must be provided' });
    }

    await getAuth().updateUser(userId, updateData);

    // If the email was changed in Auth, we should also update it in Firestore
    if (newEmail) {
        const usersRef = admin.firestore().collection('users');
        const q = usersRef.where('authUid', '==', userId);
        const querySnapshot = await q.get();

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await userDoc.ref.update({ email: newEmail });
        }
    }

    return res.status(200).json({ success: true, message: 'User credentials updated successfully' });
  } catch (error) {
    console.error('Error updating user credentials:', error);

    let statusCode = 500;
    let errorMessage = 'An internal server error occurred.';

    if (error.code === 'auth/user-not-found') {
      statusCode = 404;
      errorMessage = 'User not found in Firebase Authentication.';
    } else if (error.code === 'auth/email-already-exists') {
        statusCode = 409;
        errorMessage = 'This email address is already in use.';
    }

    return res.status(statusCode).json({ error: errorMessage, details: error.message });
  }
};
