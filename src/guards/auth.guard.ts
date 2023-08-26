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
import { AddressRepository } from 'src/repositories/address.repository';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { UserSetTemperatureRepository } from 'src/repositories/user_set_temperature.repository';

export type JwtPayload = {
  phone_id: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authRepository: AuthRepository,
    private userAddressRepository: UserAddressRepository,
    private userSetTemperatureRepository: UserSetTemperatureRepository,
    private userRepository: UserRepository,
    private addressRepository: AddressRepository,
  ) {}

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

      const user = await this.authRepository.getUserByPhoneId(phone_id);

      if (!user)
        throw new HttpException(
          {
            message: HTTP_ERROR.NOT_FOUND,
            detail: '유저가 존재하지 않습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );

      const addresses = await this.userRepository.getUserAddresses(user.id);

      if (addresses.length === 0) {
        throw new HttpException(
          {
            message: HTTP_ERROR.NEED_SET_ADDRESS,
            detail: '주소를 설정하지 않았습니다.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user.gender === undefined)
        throw new HttpException(
          {
            message: HTTP_ERROR.NEED_SET_GENDER,
            detail: '성별을 설정하지 않았습니다.',
          },
          HttpStatus.UNAUTHORIZED,
        );

      const { closet_id } = req.query;

      const setTemperature =
        await this.userSetTemperatureRepository.getSensoryTemperature(user);

      if (setTemperature.length == 0 && closet_id)
        throw new HttpException(
          {
            message: HTTP_ERROR.NEED_SET_SENSORY_TEMP,
            detail: '체감온도를 설정하지 않았습니다.',
          },
          HttpStatus.UNAUTHORIZED,
        );

      const mainAddressId = addresses[0].id;

      const [address] = await this.addressRepository.getAddressById(
        mainAddressId,
      );

      req['user'] = user;
      req['address'] = address;

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
