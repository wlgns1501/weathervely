import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UpdateUserNickNameGenderDto } from './updateUserNickNameGender.dto';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { HTTP_ERROR } from 'src/lib/constant/httpError';

@Injectable()
export class UpdateUserNickNameGenderPipe
  implements PipeTransform<UpdateUserNickNameGenderDto>
{
  transform(value: UpdateUserNickNameGenderDto) {
    const validationSchema = Joi.object({
      nickname: SCHEMA.REQUIRED_STRING('nickname'),
      gender: SCHEMA.REQUIRED_STRING('gender'),
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
