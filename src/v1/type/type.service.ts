import { Injectable } from '@nestjs/common';
import { TypeRepository } from 'src/repositories/type.repository';

@Injectable()
export class TypeService {
  constructor(private readonly typeRepository: TypeRepository) {}

  async getTypeList() {
    const types = await this.typeRepository.getTypeList();

    return types;
  }
}
