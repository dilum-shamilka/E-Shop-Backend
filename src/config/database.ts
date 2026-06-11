import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is not set. Add a MongoDB connection string to .env before starting the server.');
  process.exit(1);
}

// Added connection options to force IPv4 resolution
const connectionOptions = {
  family: 4 
};

mongoose.connect(mongoUri, connectionOptions)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => {
    console.error('❌ MongoDB connection error. Check the Atlas IP access list, credentials, and connection string.');
    console.error(err);
    process.exit(1);
  });