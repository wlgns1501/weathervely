import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { ClosetRepository } from 'src/repositories/closet.repository';
import { Transactional } from 'typeorm-transactional';
import { PickClosetDto } from './dtos/pickCloset.dto';
import { UserSetStyleRepository } from 'src/repositories/user_set_style.repository';
import { MYSQL_ERROR_CODE } from 'src/lib/constant/mysqlError';
import { HTTP_ERROR } from 'src/lib/constant/httpError';

@Injectable()
export class ClosetService {
  constructor(
    private readonly closetRepository: ClosetRepository,
    private readonly userSetStyleRepository: UserSetStyleRepository,
  ) {}

  async getClosetList() {
    const closets = await this.closetRepository.getClosetList();

    return closets;
  }

  @Transactional()
  async pickCloset(pickClosetDto: PickClosetDto, user: User) {
    const { closet_ids } = pickClosetDto;

    if (closet_ids.length !== 0)
      try {
        for (const closet_id of closet_ids) {
          const closet = await this.closetRepository.getClosetById(closet_id);

          await this.userSetStyleRepository.setUserStyle(closet, user);
        }
      } catch (err) {
        switch (err.errno) {
          case MYSQL_ERROR_CODE.DUPLICATED_KEY:
            throw new HttpException(
              {
                message: HTTP_ERROR.DUPLICATED_KEY_ERROR,
                detail: '이미 선택한 style 입니다.',
              },
              HttpStatus.BAD_REQUEST,
            );
        }
      }
  }
}
