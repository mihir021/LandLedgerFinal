import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!dbUri) {
  throw new Error('MONGODB_URI or MONGO_URI must be set in environment');
}
mongoose.connect(dbUri);
const schema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', schema);
async function run() {
  const p = await Property.findOne();
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}
run();
