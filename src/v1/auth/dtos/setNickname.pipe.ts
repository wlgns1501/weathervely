import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { SetNickNameDto } from './setNickName.dto';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { NICKNAME_REGEX } from 'src/lib/constant/regex';
import { HTTP_ERROR } from 'src/lib/constant/httpError';

@Injectable()
export class SetNickNamePipe implements PipeTransform<SetNickNameDto> {
  transform(value: SetNickNameDto) {
    const validationSchema = Joi.object({
      nickname: SCHEMA.REQUIRED_STRING_WITH_REGEX('닉네임', NICKNAME_REGEX),
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
