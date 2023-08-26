import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { SetNickNameDto } from './setNickName.dto';
import * as Joi from 'joi';
import { SCHEMA } from 'src/lib/constant/schema';
import { EMOJI_REGEX, NICKNAME_REGEX } from 'src/lib/constant/regex';
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
      if (EMOJI_REGEX.test(error._original.nickname)) {
        throw new HttpException(
          {
            message: HTTP_ERROR.VALIDATED_ERROR,
            detail: '사용 불가 문자가 포함됐어요 (쉼표, 이모지 불가)',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error._original.phone_id.length == '') {
        throw new HttpException(
          {
            message: HTTP_ERROR.VALIDATED_ERROR,
            detail: '기기 고유번호를 입력하지 않았습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
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

      if (error._original.nickname.length > 10)
        throw new HttpException(
          {
            message: HTTP_ERROR.VALIDATED_ERROR,
            detail:
              '닉네임은 최대 10글자에요 (한글/영어 소문자/대문자/숫자 무관)',
          },
          HttpStatus.BAD_REQUEST,
        );
    }

    return validatedValue;
  }
}
