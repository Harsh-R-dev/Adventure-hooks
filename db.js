import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const DB = process.env.DATABASE.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    );
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
