import {
  Injectable,
  PipeTransform,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { SetTemperatureDto } from './setTemperature.dto';

@Injectable()
export class SetTemperaturePipe implements PipeTransform<any> {
  transform(value: SetTemperatureDto) {
    const validationSchema = Joi.object({
      closet: SCHEMA.REQUIRED_NUMBER('closet'),
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
