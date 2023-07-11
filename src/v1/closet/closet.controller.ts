import {
  Inject,
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpCode,
  Post,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ClosetService } from './closet.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { GetRecommendClosetDto } from './dtos/getRecommendCloset.dto';
import { GetRecommendClosetPipe } from './dtos/getRecommendCloset.pipe';

@ApiTags('Closet')
@Controller('closet')
export class ClosetController {
  constructor(
    private readonly closetService: ClosetService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('getRecommendCloset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '온보딩 - 체감온도 설정 화면 진입시 - Get' })
  async getRecommendCloset(
    @Query(new GetRecommendClosetPipe())
    getRecommendClosetDto: GetRecommendClosetDto,
    @Req() req: any,
  ) {
    const { dateTime } = getRecommendClosetDto;
    const data = await this.closetService.getRecommendCloset(
      dateTime,
      req.address.address,
      req.user,
    );
    return data;
  }

  @Get('getCloset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '온보딩 - 체감온도 설정 - 스와이프 - Get' })
  @ApiQuery({
    name: 'temperature',
    required: true,
    description: 'temperature입니다.',
  })
  async getCloset(@Query('temperature') temperature: number, @Req() req?: any) {
    return this.closetService.getCloset(temperature, req.user);
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
