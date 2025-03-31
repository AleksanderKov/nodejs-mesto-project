/// <reference path="./global.d.ts" />
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import userRoutes from './routes/users';
import cardRoutes from './routes/cards';
import { login, createUser } from './controllers/users';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import NotFound from './errors/not-found';
import {
  validateLogin,
  validateRegistration,
} from './validators/validators';
import config from './config';

const app = express();

mongoose.connect(config.MONGO_URL)
  .then(() => console.log('🟢 Успешное подключение к MongoDB'))
  .catch((err) => {
    console.error('🔴 Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.post('/signin', validateLogin, login);
app.post('/signup', validateRegistration, createUser);

app.use('/users', auth, userRoutes);
app.use('/cards', auth, cardRoutes);

app.use('*', () => {
  throw new NotFound('Ресурс не найден');
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${config.PORT}`);
});

export default app;
