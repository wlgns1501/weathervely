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
  phone_id: string;
};

@Injectable()
export class OnboardingGuard implements CanActivate {
  constructor(private authRepository: AuthRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const accessToken = req.cookies['access_token'];

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

      const { phone_id } = verifiedToken as JwtPayload;

      const user = await this.authRepository.getUserByNickname(nickname);

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
