import Cors from 'cors';

// Initialize the cors middleware with appropriate settings
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: ['http://localhost:5173', 'https://djoride.com', 'https://djo-ride.vercel.app'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

// Helper method to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export { cors, runMiddleware };
