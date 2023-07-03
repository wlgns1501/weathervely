import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNickNameDto } from './dtos/signUp.dto';
import { AuthRepository } from 'src/repositories/auth.repository';
import { MYSQL_ERROR_CODE } from 'src/lib/constant/mysqlError';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { Transactional } from 'typeorm-transactional';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  private createAccessToken(nickname: string) {
    return jwt.sign({ nickname }, process.env.JWT_SECRET_KEY, {
      expiresIn: '8h',
    });
  }

  @Transactional()
  async signUp(createNickNameDto: CreateNickNameDto) {
    const { nickname } = createNickNameDto;
    const accessToken = await this.createAccessToken(nickname);

    try {
      return await this.authRepository.createNickName(nickname, accessToken);
    } catch (err) {
      switch (err.errno) {
        case MYSQL_ERROR_CODE.DUPLICATED_KEY:
          throw new HttpException(
            {
              message: HTTP_ERROR.DUPLICATED_KEY_ERROR,
              detail: '중복된 닉네임 입니다.',
            },
            HttpStatus.BAD_REQUEST,
          );
      }
    }
  }
}
