import { Request, Response, NextFunction, RequestHandler } from 'express';
import User from '../models/user';
import { Error as MongooseError } from 'mongoose';
import {
  BAD_REQUEST,
  NOT_FOUND,
  CREATED
} from '../constants';

export const getUsers: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      res.status(NOT_FOUND).json({ message: 'Пользователь по указанному _id не найден.' });
      return;
    }

    res.json(user);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      res.status(BAD_REQUEST).json({ message: 'Передан некорректный _id пользователя' });
      return;
    }
    next(err);
  }
};

export const createUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { name, about, avatar } = req.body;
    const newUser = new User({ name, about, avatar });
    const savedUser = await newUser.save();
    res.status(CREATED).json(savedUser);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при создании пользователя' });
      return;
    }
    next(err);
  }
};

export const updateProfile: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { name, about } = req.body;
    const userId = req.user?._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(NOT_FOUND).json({ message: 'Пользователь с указанным _id не найден' });
      return;
    }

    res.json(updatedUser);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при обновлении профиля' });
      return;
    }
    next(err);
  }
};

export const updateAvatar: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { avatar } = req.body;
    const userId = req.user?._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(NOT_FOUND).json({ message: 'Пользователь с указанным _id не найден' });
      return;
    }

    res.json(updatedUser);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при обновлении аватара' });
      return;
    }
    next(err);
  }
};