import mongoose, { Schema, Document, Types } from 'mongoose';
import { URL_REGEX } from '../validators/validators';

export interface ICard extends Document {
  name: string;
  link: string;
  owner: Types.ObjectId;
  likes: Types.ObjectId[];
  createdAt: Date;
}

const cardSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Поле "name" обязательно для заполнения'],
    minlength: [2, 'Минимальная длина названия - 2 символа'],
    maxlength: [30, 'Максимальная длина названия - 30 символов'],
    validate: {
      validator: (v: string) => /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(v),
      message: 'Название может содержать только буквы, пробелы и дефисы',
    },
  },
  link: {
    type: String,
    required: [true, 'Поле "link" обязательно для заполнения'],
    validate: {
      validator: (v: string) => URL_REGEX.test(v),
      message: 'Некорректный URL изображения. Пример: https://example.com/image.jpg',
    },
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Поле "owner" обязательно для заполнения'],
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cardSchema.set('toJSON', {
  transform: (doc, ret) => {
    const transformedRet = { ...ret };
    transformedRet._id = ret._id.toString();
    return transformedRet;
  },
});

export default mongoose.model<ICard>('card', cardSchema);
