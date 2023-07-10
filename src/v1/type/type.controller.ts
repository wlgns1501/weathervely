import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TypeService } from './type.service';

@ApiTags('type')
@Controller('type')
export class TypeController {
  constructor(private service: TypeService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'type 리스트' })
  getTypeList() {
    return this.service.getTypeList();
  }
}
