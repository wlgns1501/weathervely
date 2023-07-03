import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreateNickNameDto } from './signUp.dto';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { NICKNAME_REGEX } from 'src/lib/constant/regex';

@Injectable()
export class CreateNickNamePipe implements PipeTransform<CreateNickNameDto> {
  transform(value: CreateNickNameDto) {
    const validationSchema = Joi.object({
      nickname: SCHEMA.REQUIRED_STRING_WITH_REGEX('닉네임', NICKNAME_REGEX),
    });

    const { error, value: validatedValue } = validationSchema.validate(value);

    if (error) {
      throw new HttpException(
        {
          message: 'nickname validation error',
          detail: error.details[0].context.label,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return validatedValue;
  }
}
