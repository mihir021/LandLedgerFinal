import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dhameliyavivek04:sR2WvY3RDBj4yUq8@cluster0.v8q52.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const schema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', schema);
async function run() {
  const p = await Property.findOne();
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}
run();
