import * as Joi from 'joi';

export const SCHEMA = {
  REQUIRED_STRING: (label: string) => Joi.string().required().label(label),

  REQUIRED_STRING_WITH_REGEX: (label: string, regex: RegExp) =>
    Joi.string().required().regex(regex).label(label),

  REQUIRED_NUMBER: (label: string) => Joi.number().required().label(label),
};