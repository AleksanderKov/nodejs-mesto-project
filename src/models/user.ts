import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import { URL_REGEX, PASSWORD_REGEX } from '../validators/validators';

export interface IUser extends Document {
  name: string,
  about: string,
  avatar: string,
  email: string,
  password: string,
  createdAt: Date,
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Минимальная длина имени - 2 символа'],
    maxlength: [30, 'Максимальная длина имени - 30 символов'],
    validate: {
      validator: (v: string) => /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(v),
      message: 'Имя может содержать только буквы, пробелы и дефисы',
    },
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Минимальная длина поля "about" - 2 символа'],
    maxlength: [200, 'Максимальная длина поля "about" - 200 символов'],
    validate: {
      validator: (v: string) => /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(v),
      message: 'Поле "about" может содержать только буквы, пробелы и дефисы',
    },
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v: string) => URL_REGEX.test(v),
      message: 'Некорректный URL аватара',
    },
  },
  email: {
    type: String,
    required: [true, 'Поле "email" обязательно для заполнения'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Некорректный формат email',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле "password" обязательно для заполнения'],
    select: false,
    minlength: [8, 'Пароль должен содержать минимум 8 символов'],
    validate: {
      validator: (v: string) => PASSWORD_REGEX.test(v),
      message: 'Пароль должен содержать цифры, строчные и заглавные буквы',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const user = { ...ret };
    delete user.password;
    user._id = ret._id.toString();
    return user;
  },
});

export default mongoose.model<IUser>('user', userSchema);
