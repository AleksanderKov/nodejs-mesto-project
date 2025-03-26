import { Request, Response, NextFunction, RequestHandler } from 'express';
import Card from '../models/card';
import { Error as MongooseError } from 'mongoose';
import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  CREATED
} from '../constants';

export const getCards: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const cards = await Card.find({});
    res.json(cards);
  } catch (err) {
    next(err);
  }
};

export const createCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user?._id;
    const card = new Card({ name, link, owner: ownerId });
    const savedCard = await card.save();
    res.status(CREATED).json(savedCard);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные при создании карточки' });
      return;
    }
    next(err);
  }
};

export const deleteCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);

    if (!card) {
      res.status(NOT_FOUND).json({ message: 'Карточка с указанным _id не найдена' });
      return;
    }

    if (card.owner.toString() !== req.user?._id) {
      res.status(FORBIDDEN).json({ message: 'Недостаточно прав для удаления карточки' });
      return;
    }

    await Card.findByIdAndDelete(cardId);
    res.json({ message: 'Карточка удалена' });
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      res.status(BAD_REQUEST).json({ message: 'Передан некорректный _id карточки' });
      return;
    }
    next(err);
  }
};

export const likeCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { cardId } = req.params;
    const ownerId = req.user?._id;

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: ownerId } },
      { new: true }
    );

    if (!updatedCard) {
      res.status(NOT_FOUND).json({ message: 'Передан несуществующий _id карточки' });
      return;
    }

    res.json(updatedCard);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные для постановки лайка' });
      return;
    }
    next(err);
  }
};

export const dislikeCard: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { cardId } = req.params;
    const ownerId = req.user?._id;

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: ownerId } },
      { new: true }
    );

    if (!updatedCard) {
      res.status(NOT_FOUND).json({ message: 'Передан несуществующий _id карточки' });
      return;
    }

    res.json(updatedCard);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные для снятия лайка' });
      return;
    }
    next(err);
  }
};