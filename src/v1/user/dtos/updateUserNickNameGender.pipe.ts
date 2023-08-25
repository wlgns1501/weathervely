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
import { NICKNAME_REGEX } from 'src/lib/constant/regex';

@Injectable()
export class UpdateUserNickNameGenderPipe
  implements PipeTransform<UpdateUserNickNameGenderDto>
{
  transform(value: UpdateUserNickNameGenderDto) {
    const validationSchema = Joi.object({
      nickname: SCHEMA.REQUIRED_STRING_WITH_REGEX('닉네임', NICKNAME_REGEX),
    });

    const { error, value: validatedValue } = validationSchema.validate(value);

    if (error) {
      if (
        error._original.nickname.includes(' ') &&
        error._original.nickname.includes(',')
      ) {
        throw new HttpException(
          {
            message: HTTP_ERROR.VALIDATED_ERROR,
            detail: '공백과 쉼표는 사용할 수 없습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else if (error._original.nickname.includes(' ')) {
        throw new HttpException(
          {
            message: HTTP_ERROR.VALIDATED_ERROR,
            detail: '공백을 사용할 수 없습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else if (error._original.nickname.includes(',')) {
        throw new HttpException(
          {
            message: HTTP_ERROR.VALIDATED_ERROR,
            detail: '쉼표를 사용할 수 없습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error._original.nickname.length >= 10)
        throw new HttpException(
          {
            message: HTTP_ERROR.VALIDATED_ERROR,
            detail: '닉네임은 10글자 이상이 될 수 없습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
    }

    return validatedValue;
  }
}
