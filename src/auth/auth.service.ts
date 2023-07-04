import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SetNickNameDto } from './dtos/setNickName.dto';
import { AuthRepository } from 'src/repositories/auth.repository';
import { MYSQL_ERROR_CODE } from 'src/lib/constant/mysqlError';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { Transactional } from 'typeorm-transactional';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entities/user.entity';
import { SetAddressDto } from './dtos/setAddress.dto';
import { AddressRepository } from 'src/repositories/address.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { Address } from 'src/entities/address.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly addressRepository: AddressRepository,
    private readonly userAddressRepository: UserAddressRepository,
  ) {}

  private createAccessToken(nickname: string) {
    return jwt.sign({ nickname }, process.env.JWT_SECRET_KEY);
  }

  @Transactional()
  async setNickName(setNickNameDto: SetNickNameDto) {
    const { nickname } = setNickNameDto;
    const accessToken = this.createAccessToken(nickname);

    try {
      await this.authRepository.createNickName(nickname, accessToken);
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

    return { accessToken };
  }

  @Transactional()
  async setAddress(setAddressDto: SetAddressDto, user: User) {
    let address: Address | null;

    address = await this.addressRepository.getAddress(setAddressDto);

    if (!address) {
      try {
        address = await this.addressRepository.createAddress(setAddressDto);
      } catch (err) {
        switch (err.errno) {
          case MYSQL_ERROR_CODE.DUPLICATED_KEY:
            throw new HttpException(
              {
                message: HTTP_ERROR.DUPLICATED_KEY_ERROR,
                detail: '중복된 주소 입니다.',
              },
              HttpStatus.BAD_REQUEST,
            );
        }
      }
    }

    try {
      await this.userAddressRepository.createUserWithAddress(user, address);
    } catch (err) {
      switch (err.errno) {
        case MYSQL_ERROR_CODE.DUPLICATED_KEY:
          throw new HttpException(
            {
              message: HTTP_ERROR.DUPLICATED_KEY_ERROR,
              detail: '중복된 주소를 등록 했습니다.',
            },
            HttpStatus.BAD_REQUEST,
          );
      }
    }
    return { success: true };
  }
}
