import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { PickClosetDto } from './pickCloset.dto';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { HTTP_ERROR } from 'src/lib/constant/httpError';

@Injectable()
export class PickClosetPipe implements PipeTransform<PickClosetDto> {
  transform(value: PickClosetDto) {
    const validationSchema = Joi.object({
      closet_ids: SCHEMA.REQUIRED_NUMBER_ARRAY('closet_ids'),
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
