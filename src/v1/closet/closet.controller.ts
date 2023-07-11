import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClosetService } from './closet.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { PickClosetDto } from './dtos/pickCloset.dto';
import { PickClosetPipe } from './dtos/pickCloset.pipe';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Closet')
@Controller('closet')
export class ClosetController {
  constructor(
    private service: ClosetService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  @Get('getRecommendCloset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '온보딩 - 체감온도 설정 Get' })
  @ApiQuery({
    name: 'dateTime',
    required: true,
    description: 'dateTime',
  })
  async getRecommendCloset(
    @Query('dateTime') dateTime: string,
    @Req() req: any,
  ) {
    return this.service.getRecommendCloset(dateTime, req.address.address);
  }

  @Get('getCloset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '온보딩 - 체감온도 설정 - 스와이프 Get' })
  @ApiQuery({
    name: 'temperature',
    required: true,
    description: 'temperature입니다.',
  })
  async getCloset(@Query('temperature') temperature: number, @Req() req?: any) {
    return this.service.getCloset(temperature, req.user);
  }

  //   // 온보딩 - 체감온도 설정 찐
  //   @Post('setTemperature')
  //   @HttpCode(HttpStatus.OK)
  //   @ApiOperation({ summary: '체감온도 설정' })
  //   async setTemperature() {
  //     const data = await this.closetService.getRecommendCloset();
  //     return data;
  //   }
}
