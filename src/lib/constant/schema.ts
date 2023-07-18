import * as Joi from 'joi';

export const SCHEMA = {
  REQUIRED_STRING: (label: string) => Joi.string().required().label(label),

  REQUIRED_STRING_WITH_REGEX: (label: string, regex: RegExp) =>
    Joi.string().required().regex(regex).label(label),

  REQUIRED_NUMBER: (label: string) => Joi.number().required().label(label),

  REQUIRED_NUMBER_ARRAY: (label: string) =>
    Joi.array().items(Joi.number().label(label)).min(1).label(label),

  UPDATE_NOTNULL_NUMBER: (label: string) =>
    Joi.number().optional().label(label),
  UPDATE_NULLABLE_NUMBER: (label: string) =>
    Joi.number().optional().allow('').label(label),

  UPDATE_NOTNULL_STRING: (label: string) =>
    Joi.string().optional().label(label),
};
