import * as Joi from 'joi';

export const SCHEMA = {
  REQUIRED_STRING_WITH_REGEX: (label: string, regex: RegExp) =>
    Joi.string().required().regex(regex).label(label),
};
