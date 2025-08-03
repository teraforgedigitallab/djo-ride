import { cors, runMiddleware } from '../utils/cors';

export default async function handler(req, res) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);
  
  // Send a simple response
  res.status(200).json({ message: 'API is working!' });
}