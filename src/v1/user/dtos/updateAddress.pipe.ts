import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { UpdateAddressDto } from './updateAddress.dto';

@Injectable()
export class UpdateAddressPipe implements PipeTransform<UpdateAddressDto> {
  transform(value: UpdateAddressDto) {
    const validationSchema = Joi.object({
      address_name: SCHEMA.UPDATE_NOTNULL_STRING('address_name'),
      country: SCHEMA.UPDATE_NOTNULL_STRING('country'),
      city: SCHEMA.UPDATE_NOTNULL_STRING('city'),
      gu: SCHEMA.UPDATE_NOTNULL_STRING('gu'),
      dong: SCHEMA.UPDATE_NOTNULL_STRING('dong'),
      x_code: SCHEMA.UPDATE_NOTNULL_NUMBER('x_code'),
      y_code: SCHEMA.UPDATE_NOTNULL_NUMBER('y_code'),
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
