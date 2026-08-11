import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore in serverless env
}

import connectDB from '../backend/src/config/database.js';
import app from '../backend/src/app.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
