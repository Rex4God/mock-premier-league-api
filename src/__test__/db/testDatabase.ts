
import mongoose from 'mongoose';

export const connectDB = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error('MONGODB_URL environment variable is not defined');
  }
  mongoose.set('strictQuery', false);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URL);
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};
