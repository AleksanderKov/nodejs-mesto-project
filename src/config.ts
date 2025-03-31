import dotenv from 'dotenv';

dotenv.config();

const {
  PORT = '3000',
  MONGO_URL = 'mongodb://localhost:27017/mestodb',
  JWT_SECRET = 'dev-secret',
  NODE_ENV = 'development',
} = process.env;

export default {
  PORT: Number(PORT),
  MONGO_URL,
  JWT_SECRET,
  NODE_ENV,
};
