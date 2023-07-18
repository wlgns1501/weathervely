import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { LoginDto } from './login.dto';

@Injectable()
export class LoginPipe implements PipeTransform<LoginDto> {
  transform(value: LoginDto) {
    const validationSchema = Joi.object({
      nickname: SCHEMA.REQUIRED_STRING('닉네임'),
    });

    const { error, value: validatedValue } = validationSchema.validate(value);

    if (error) {
      throw new HttpException(
        {
          message: HTTP_ERROR.VALIDATED_ERROR,
          detail: error.details[0].context.label,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return validatedValue;
  }
}
