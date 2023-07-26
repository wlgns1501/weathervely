import {
  Injectable,
  PipeTransform,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import * as Joi from 'joi';

@Injectable()
export class GetClosetByTemperaturePipe implements PipeTransform<any> {
  transform(value: any) {
    const validationSchema = Joi.object({
      dateTime: Joi.string().required(),
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
