import { RequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import Card from '../models/card';
import { CREATED } from '../constants';

import BadRequest from '../errors/bad-request';
import Forbidden from '../errors/forbidden';
import NotFound from '../errors/not-found';

export const getCards: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const cards = await Card.find({});
    res.json(cards);
  } catch (err) {
    next(err);
  }
};

export const createCard: RequestHandler = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user?._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(CREATED).json(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

export const deleteCard: RequestHandler = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(() => new NotFound('Карточка с указанным _id не найдена'))
    .then((card) => {
      if (card.owner.toString() !== req.user!._id) {
        throw new Forbidden('Недостаточно прав для удаления карточки');
      }
      return Card.findByIdAndDelete(cardId);
    })
    .then(() => res.json({ message: 'Карточка удалена' }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Передан некорректный _id карточки'));
      }
      return next(err);
    });
};

export const likeCard: RequestHandler = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true, runValidators: true },
    ).orFail(() => new NotFound('Карточка с указанным _id не найдена'));

    res.json(updatedCard);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      next(new BadRequest('Переданы некорректные данные для постановки лайка'));
    } else {
      next(err);
    }
  }
};

export const dislikeCard: RequestHandler = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true, runValidators: true },
    ).orFail(() => new NotFound('Карточка с указанным _id не найдена'));

    res.json(updatedCard);
  } catch (err) {
    if (err instanceof MongooseError.CastError) {
      next(new BadRequest('Переданы некорректные данные для снятия лайка'));
    } else {
      next(err);
    }
  }
};
