import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';

export type JwtPayload = {
  nickname: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authRepository: AuthRepository,
    private userAddressRepository: UserAddressRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const accessToken = req.get('cookie')?.split('=')[1];

    if (!accessToken) {
      throw new HttpException(
        {
          message: HTTP_ERROR.NEED_SET_NICKNAME,
          detail: '닉네임을 설정하지 않았습니다.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const verifiedToken = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

      const { nickname } = verifiedToken as JwtPayload;

      const user = await this.authRepository.getUserByNickname(nickname);

      const address = await this.userAddressRepository.getUserAddress(user);

      if (!address) {
        throw new HttpException(
          {
            message: HTTP_ERROR.NEED_SET_ADDRESS,
            detail: '주소를 설정하지 않았습니다.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      /**
       * 1. 설정한 address 없을 때 -> address 설정 하라고 에러
       * 2. 설정한 gender 없을 때 -> address 설정 하라고 에러
       * ...
       */

      req['user'] = user;

      return true;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      return false;
    }
  }
}

/**
 * 1. 온보딩
 * 2. 토큰 발행
 * 3. 각 기기 마다 토큰이 있어
 * 4.
 *
 *
 */
