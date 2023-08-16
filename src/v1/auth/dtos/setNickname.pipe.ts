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
      // phone_id: SCHEMA.REQUIRED_STRING('기기 고유 번호'),
      nickname: SCHEMA.REQUIRED_STRING_WITH_REGEX('닉네임', NICKNAME_REGEX),
    });

    const { error, value: validatedValue } = validationSchema.validate(value);

    if (error) {
      throw new HttpException(
        {
          message: HTTP_ERROR.VALIDATED_ERROR,
          detail: '닉네임에는 띄어쓰기, 쉼표를 사용할 수 없습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (validatedValue.nickname.length >= 10)
      throw new HttpException(
        {
          message: HTTP_ERROR.VALIDATED_ERROR,
          detail: '닉네임은 10글자 이상이 될 수 없습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    return validatedValue;
  }
}
