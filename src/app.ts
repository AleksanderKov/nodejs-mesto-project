import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/users';
import cardRoutes from './routes/cards';
import { Error as MongooseError } from 'mongoose';
import {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR
} from './constants';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = { _id: '67e1b0e26d97ef4246b938b8' };
  next();
});

app.use(userRoutes);
app.use(cardRoutes);

app.get('/', (req, res) => {
  res.send('Hello, world');
});

app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: 'Ресурс не найден' });
});

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof MongooseError.ValidationError) {
    if (req.path === '/users/me') {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при обновлении профиля' });
      return;
    }
    if (req.path === '/users/me/avatar') {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при обновлении аватара' });
      return;
    }
    if (req.path === '/users') {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при создании пользователя' });
      return;
    }
    if (req.path === '/cards') {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при создании карточки' });
      return;
    }
  }

  if (err instanceof MongooseError.CastError) {
    if (req.path.includes('/cards/')) {
      if (req.method === 'DELETE') {
        res.status(BAD_REQUEST).json({ message: 'Передан некорректный _id карточки' });
      } else {
        res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные для постановки/снятия лайка' });
      }
      return;
    }
    if (req.path.includes('/users/')) {
      res.status(BAD_REQUEST).json({ message: 'Передан некорректный _id пользователя' });
      return;
    }
  }

  console.error(err);
  res.status(INTERNAL_SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});