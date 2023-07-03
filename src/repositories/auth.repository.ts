import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNickNameDto } from 'src/auth/dtos/signUp.dto';
import { User } from 'src/entities/user.entity';
import { DataSource, EntityManager, Repository, Transaction } from 'typeorm';

@Injectable()
export class AuthRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  //   constructor(
  //     @InjectRepository(User) private authRepository: Repository<User>,
  //   ) {
  //     super(
  //       authRepository.target,
  //       authRepository.manager,
  //       authRepository.queryRunner,
  //     );
  //   }

  async createNickName(nickname: string, accessToken: string) {
    return await this.create({ nickname, token: accessToken }).save();
  }
}
