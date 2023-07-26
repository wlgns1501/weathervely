import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { UserRepository } from 'src/repositories/user.repository';
import { UpdateUserNickNameGenderDto } from './dtos/updateUserNickNameGender.dto';
import { Transactional } from 'typeorm-transactional';
import { MYSQL_ERROR_CODE } from 'src/lib/constant/mysqlError';
import * as jwt from 'jsonwebtoken';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { AddressRepository } from 'src/repositories/address.repository';
import { CreateAddressDto } from './dtos/createAddress.dto';
import { Address } from 'src/entities/address.entity';
import { UpdateAddressDto } from './dtos/updateAddress.dto';

export type ADDRESS_TYPE = {
  address_name: string;
  country: string;
  city: string;
  gu: string;
  dong: string;
  postal_code: string;
  x_code: number;
  y_code: number;
};

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAddressRepository: UserAddressRepository,
    private readonly addressRepository: AddressRepository,
  ) {}

  private createAccessToken(nickname: string) {
    return jwt.sign({ nickname }, process.env.JWT_SECRET_KEY);
  }

  private async checkAddressAndCreateAddress(addressType: ADDRESS_TYPE) {
    let address: Address | null;

    address = await this.addressRepository.getAddress(addressType);

    if (!address) {
      try {
        address = await this.addressRepository.createAddress(addressType);
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

    return address;
  }

  private async createUserAddress(user: User, address: Address) {
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
  }

  async getUserNickNameGender(user: User) {
    const userId = user.id;

    const [userInfo] = await this.userRepository.getUserNickNameGender(userId);

    if (!userInfo) {
      throw new HttpException(
        {
          message: HTTP_ERROR.NOT_FOUND,
          detail: '존재하지 않는 유저 입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return userInfo;
  }

  @Transactional()
  async updateUserNickNameGender(
    updateUserNickNameGenderDto: UpdateUserNickNameGenderDto,
    user: User,
  ) {
    const { nickname, gender } = updateUserNickNameGenderDto;
    const userId = user.id;
    try {
      await this.userRepository.updateNickNameGender(nickname, gender, userId);
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

    const access_token = await this.createAccessToken(nickname);

    return { access_token };
  }

  async getAddresses(user: User) {
    const userId = user.id;
    const address = await this.addressRepository.getUserAddresses(userId);

    return address;
  }

  @Transactional()
  async createUserWithAddress(createAddressDto: CreateAddressDto, user: User) {
    const userId = user.id;
    const settedAddresses = await this.addressRepository.getUserAddresses(
      userId,
    );

    if (settedAddresses.length >= 3) {
      throw new HttpException(
        {
          message: HTTP_ERROR.MAXIMUM_SETTLED_ADDRESS,
          detail:
            '주소는 최대 3개까지 등록 할 수 있습니다. 등록된 주소를 삭제하고 다시 사용해주세요.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const address = await this.checkAddressAndCreateAddress(createAddressDto);

    await this.createUserAddress(user, address);

    return { success: true };
  }

  @Transactional()
  async updateUserWithAddress(
    addressId: number,
    user: User,
    updateAddressDto: UpdateAddressDto,
  ) {
    const userId = user.id;
    const { id: updateAddressId } = await this.checkAddressAndCreateAddress(
      updateAddressDto,
    );

    try {
      await this.userAddressRepository.updateUserWithAddress(
        userId,
        updateAddressId,
        addressId,
      );
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
  async deleteUserWithAddress(addressId: number, user: User) {
    const userId = user.id;

    const { affected } = await this.userAddressRepository.deleteUserAddress(
      addressId,
      userId,
    );

    if (affected === 0)
      throw new HttpException(
        {
          message: HTTP_ERROR.BAD_REQUEST,
          detail: '이미 삭제된 주소 입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );

    return { success: true };
  }
}