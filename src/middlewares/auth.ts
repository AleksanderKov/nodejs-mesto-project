import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized';
import config from '../config';

interface JwtPayload {
  _id: string;
}

const auth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.user = { _id: payload._id };
    return next(); // ✅ добавлено
  } catch (err) {
    return next(new UnauthorizedError('Недействительный токен авторизации')); // ✅ добавлено
  }
};

export default auth;
