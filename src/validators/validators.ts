import { Joi, celebrate } from 'celebrate';

export const URL_REGEX = /^(https?:\/\/)(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?(#)?$/;
export const NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;

const nameRule = Joi.string()
  .min(2)
  .max(30)
  .pattern(NAME_REGEX)
  .messages({
    'string.min': 'Минимальная длина - 2 символа',
    'string.max': 'Максимальная длина - 30 символов',
    'string.pattern.base': 'Допустимы только буквы, пробелы и дефисы',
    'string.empty': 'Поле обязательно для заполнения',
  });

const avatarRule = Joi.string()
  .pattern(URL_REGEX)
  .message('Некорректный URL. Пример: https://example.com/avatar.jpg')
  .messages({
    'string.empty': 'Поле обязательно для заполнения',
  });

const emailRule = Joi.string()
  .email()
  .message('Введите корректный email')
  .messages({
    'string.email': 'Введите корректный email',
    'string.empty': 'Email обязателен для заполнения',
    'any.required': 'Поле email обязательно для заполнения',
  });

const passwordRule = Joi.string()
  .min(8)
  .pattern(PASSWORD_REGEX)
  .messages({
    'string.min': 'Пароль должен содержать минимум 8 символов',
    'string.pattern.base': 'Пароль должен содержать цифры, строчные и заглавные буквы',
    'string.empty': 'Пароль обязателен для заполнения',
  });

export const validateObjId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Невалидный идентификатор',
        'string.length': 'Идентификатор должен содержать 24 символа',
      }),
  }),
});

export const validateCardBody = celebrate({
  body: Joi.object().keys({
    name: nameRule.required(),
    link: avatarRule.required(),
  }),
});

export const validateUserBody = celebrate({
  body: Joi.object().keys({
    name: nameRule,
    about: nameRule,
    email: emailRule.required(),
    password: passwordRule.required(),
    avatar: avatarRule,
  }),
});

export const validateAuthentication = celebrate({
  body: Joi.object().keys({
    email: emailRule.required(),
    password: passwordRule.required(),
  }),
});

export const validateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: avatarRule.required(),
  }),
});

export const validateProfile = celebrate({
  body: Joi.object().keys({
    name: nameRule.required(),
    about: nameRule.required(),
  }),
});

export const validateLogin = celebrate({
  body: Joi.object().keys({
    email: emailRule.required(),
    password: passwordRule.required(),
  }),
});

export const validateRegistration = celebrate({
  body: Joi.object().keys({
    name: nameRule,
    about: nameRule,
    avatar: avatarRule,
    email: emailRule.required(),
    password: passwordRule.required(),
  }),
});

export const validateCardId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Невалидный идентификатор карточки',
        'string.length': 'Идентификатор карточки должен содержать 24 символа',
        'any.required': 'Идентификатор карточки обязателен',
      }),
  }),
});

export default {
  URL_REGEX,
  NAME_REGEX,
  PASSWORD_REGEX,
  validateObjId,
  validateCardBody,
  validateUserBody,
  validateAuthentication,
  validateAvatar,
  validateProfile,
};
