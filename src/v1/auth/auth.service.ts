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
import { SetGenderDto } from './dtos/setGender.dto';
import { LoginDto } from './dtos/login.dto';
import { UserSetTemperatureRepository } from 'src/repositories/user_set_temperature.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly addressRepository: AddressRepository,
    private readonly userAddressRepository: UserAddressRepository,
    private readonly userSetTemperatureRepository: UserSetTemperatureRepository,
  ) {}

  private createAccessToken(phone_id: string) {
    return jwt.sign({ phone_id }, process.env.JWT_SECRET_KEY);
  }

  async login(loginDto: LoginDto) {
    const { nickname } = loginDto;

    let user;
    let setTemperature: boolean;
    let address: Address | null;

    const findUser = await this.authRepository.getUserByNickname(nickname);

    if (!findUser) {
      throw new HttpException(
        {
          message: HTTP_ERROR.NOT_FOUND,
          detail: '유저가 존재하지 않습니다.',
        },
        HttpStatus.NOT_FOUND,
      );
    } else {
      user = {
        id: findUser.id,
        nickname: findUser.nickname,
      };
    }

    const access_token = findUser.token;

    const [setAddress] = await this.addressRepository.getUserMainAddresses(
      user.id,
    );

    if (!setAddress) {
      address = null;
    } else {
      address = setAddress;
    }

    const temperature =
      await this.userSetTemperatureRepository.getUserSetTemperature(user.id);

    if (temperature.length == 0) {
      setTemperature = false;
    } else {
      setTemperature = true;
    }

    return { access_token, user, address, setTemperature };
  }

  async getUser() {
    const users = await this.authRepository.getUsers();

    return users;
  }

  @Transactional()
  async setNickName(setNickNameDto: SetNickNameDto) {
    const { nickname, phone_id } = setNickNameDto;
    const accessToken = this.createAccessToken(phone_id);

    try {
      await this.authRepository.createNickName(nickname, phone_id, accessToken);
    } catch (err) {
      switch (err.errno) {
        case MYSQL_ERROR_CODE.DUPLICATED_KEY:
          throw new HttpException(
            {
              message: HTTP_ERROR.DUPLICATED_KEY_ERROR,
              detail: '같은 닉네임이 이미 존재해요. 다른 닉네임을 설정해주세요',
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

    const settedAddress = await this.userAddressRepository.getUserAddress(user);

    if (settedAddress)
      throw new HttpException(
        {
          message: HTTP_ERROR.ALREADY_SET_ADDRESS,
          detail: '이미 동네 설정을 한 상태 입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );

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

  @Transactional()
  async setGender(setGenderDto: SetGenderDto, user: User) {
    const userId = user.id;

    await this.authRepository.setGender(setGenderDto, userId);

    return { success: true };
  }
}
