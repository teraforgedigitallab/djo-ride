import { getAuth } from 'firebase-admin/auth';
import admin from '../utils/admin.js'; // Assuming admin.js is also an ES module

export default async (req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');

  // Handle the browser's preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, newEmail, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updateData = {};

    if (newEmail) {
      updateData.email = newEmail;
    }

    if (newPassword) {
      // Add password strength check for security
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      updateData.password = newPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Either a new email or a new password must be provided' });
    }

    // Use the Firebase Admin SDK to update the user
    // Note: The original code used userId, but Firebase Auth updates by auth UID.
    // Ensure the 'userId' passed from the frontend is the user's auth UID.
    await getAuth().updateUser(userId, updateData);

    // Also update the email in Firestore if it's being changed
    if (newEmail) {
        const userDocRef = admin.firestore().collection('users').doc(userId);
        await userDocRef.update({ email: newEmail });
    }

    return res.status(200).json({ success: true, message: 'User credentials updated successfully' });

  } catch (error) {
    console.error('Error updating user credentials:', error);

    // Provide more specific error messages
    let statusCode = 500;
    let errorMessage = 'An internal server error occurred.';

    if (error.code === 'auth/user-not-found') {
      statusCode = 404;
      errorMessage = 'User not found.';
    } else if (error.code === 'auth/email-already-exists') {
      statusCode = 409;
      errorMessage = 'This email is already in use by another account.';
    }

    return res.status(statusCode).json({ error: errorMessage, details: error.message });
  }
};
