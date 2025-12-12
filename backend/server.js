import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, 'config.env'),
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('Server running on port', port);
});
