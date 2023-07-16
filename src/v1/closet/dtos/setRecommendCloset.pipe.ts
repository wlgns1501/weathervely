import {
  Injectable,
  PipeTransform,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { SetRecommendClosetDto } from './setRecommendCloset.dto';

@Injectable()
export class SetRecommendClosetPipe implements PipeTransform<any> {
  transform(value: SetRecommendClosetDto) {
    const validationSchema = Joi.object({
      //   user_id: SCHEMA.REQUIRED_NUMBER('user_id'),
      //   address_id: SCHEMA.REQUIRED_NUMBER('address_id'),
      closet_id: SCHEMA.REQUIRED_NUMBER('closet_id'),
      temp_id: SCHEMA.REQUIRED_NUMBER('temp_id'),
      created_at: SCHEMA.REQUIRED_STRING('created_at'),
      temperature: SCHEMA.REQUIRED_STRING('temperature'),
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
