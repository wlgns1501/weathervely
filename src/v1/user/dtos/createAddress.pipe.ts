import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { CreateAddressDto } from './createAddress.dto';
import { HTTP_ERROR } from 'src/lib/constant/httpError';

@Injectable()
export class CreateAddressPipe implements PipeTransform<CreateAddressDto> {
  transform(value: CreateAddressDto) {
    const validationSchema = Joi.object({
      address_name: SCHEMA.REQUIRED_STRING('address_name'),
      country: SCHEMA.REQUIRED_STRING('country'),
      city: SCHEMA.REQUIRED_STRING('city'),
      gu: SCHEMA.REQUIRED_STRING('gu'),
      dong: SCHEMA.REQUIRED_STRING('dong'),
      postal_code: SCHEMA.REQUIRED_STRING('postal_code'),
      x_code: SCHEMA.REQUIRED_NUMBER('x_code'),
      y_code: SCHEMA.REQUIRED_NUMBER('y_code'),
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
