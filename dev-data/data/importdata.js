import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';
import Tour from '../../models/tourmodel.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(
    __dirname,
    '..',
    '..',
    'config.env'
  ),
});
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
connectDB();
const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/tours-simple.json`,
    'utf-8'
  )
);
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data loaded successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit(1);
};
const deletedata = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted successsfully');
  } catch (err) {
    console.log(err);
  }
  process.exit(1);
};
if (process.argv[2] == '--import') importData();
else if (process.argv[2] == '--delete')
  deletedata();
