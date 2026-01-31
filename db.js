import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB);
    console.log(
      `MongoDb connected :${conn.connection.host}`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
export default connectDB;
