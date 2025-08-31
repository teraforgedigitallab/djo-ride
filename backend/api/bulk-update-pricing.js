import { initializeAdmin } from "../utils/admin";
import { allowCors } from "../utils/cors";

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pricingData, adminToken } = req.body;

    if (!pricingData || !adminToken || !Array.isArray(pricingData)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Initialize Firebase Admin
    const { admin, db } = initializeAdmin();

    // Verify admin token
    try {
      await admin.auth().verifyIdToken(adminToken);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Prepare updates object
    const updates = {};

    // For each pricing data entry
    for (const item of pricingData) {
      const { country, city, cabModel, fourHrRate, eightHrRate, airportRate } = item;
      
      // Validate required fields
      if (!country || !city || !cabModel) {
        continue; // Skip invalid entries
      }
      
      // Update the pricing
      updates[`pricing/${country}/${city}/${cabModel}/4hr40km`] = fourHrRate || 0;
      updates[`pricing/${country}/${city}/${cabModel}/8hr80km`] = eightHrRate || 0;
      updates[`pricing/${country}/${city}/${cabModel}/airport`] = airportRate || 0;
    }

    // Perform the batch update if we have updates
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
    }

    return res.status(200).json({ 
      message: 'Pricing updated successfully',
      updatedEntries: Object.keys(updates).length / 3
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return res.status(500).json({ error: 'Failed to update pricing: ' + error.message });
  }
};

export default allowCors(handler);