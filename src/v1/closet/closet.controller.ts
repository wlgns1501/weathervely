import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClosetService } from './closet.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { PickClosetDto } from './dtos/pickCloset.dto';
import { PickClosetPipe } from './dtos/pickCloset.pipe';

@ApiTags('Closet')
@Controller('closet')
export class ClosetController {
  constructor(private service: ClosetService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '스타일 리스트' })
  @UseGuards(AuthGuard)
  getClosetList() {
    return this.service.getClosetList();
  }

  @Post('/pick')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '스타일 선택' })
  @UseGuards(AuthGuard)
  pickCloset(
    @Body(new PickClosetPipe()) pickClosetDto: PickClosetDto,
    @Req() req: any,
  ) {
    return this.service.pickCloset(pickClosetDto, req.user);
  }
}
