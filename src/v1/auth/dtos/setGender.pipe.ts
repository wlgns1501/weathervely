import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { SetGenderDto } from './setGender.dto';

@Injectable()
export class SetGenderPipe implements PipeTransform<SetGenderDto> {
  transform(value: SetGenderDto) {
    const validationSchema = Joi.object({
      gender: SCHEMA.REQUIRED_STRING('성별'),
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
