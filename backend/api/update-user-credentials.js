const { getAuth } = require('firebase-admin/auth');
const admin = require('../utils/admin');
const corsHandler = require('../utils/cors');

module.exports = async (req, res) => {
  // First apply CORS handling
  return corsHandler(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { userId, newEmail, newPassword } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if we're updating email, password, or both
      const updateData = {};
      
      if (newEmail) {
        updateData.email = newEmail;
      }
      
      if (newPassword) {
        updateData.password = newPassword;
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Either new email or password must be provided' });
      }

      // Update the user using Firebase Admin SDK
      await getAuth().updateUser(userId, updateData);

      return res.status(200).json({ success: true, message: 'User credentials updated successfully' });
    } catch (error) {
      console.error('Error updating user credentials:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};