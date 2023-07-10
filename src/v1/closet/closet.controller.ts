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
} from '@nestjs/common';
import { ClosetService } from './closet.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Closet')
@Controller('closet')
export class ClosetController {
  constructor(
    private readonly closetService: ClosetService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 온보딩 - 어제 및 그저께 추천 옷차림
  @Get('getRecommendedCloset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '추천 옷차림 가져오기' })
  @ApiQuery({
    name: 'temperature',
    required: false,
    description: 'temperature입니다.',
  })
  async getRecommendCloset(
    @Query('temperature') temperature?: number,
    @Req() req?: any,
  ) {
    if (temperature) {
      // 1. type order 조회
      // 2. type, temperature로 룩 테이블 조회 - minTemp , maxTemp , closet table , user_pick_style table , closet_type table
      return this.closetService.getRecommendCloset(temperature, req.user);
    }
    // address_id로 address 테이블 조회 후 city 가져오기
    const city = req.address.address.city;
    console.log(city);
    // city를 stnIds로 매핑
    // 기상청 api call -> response 데이터로 minTmp , maxTmp 가져오기 ( 어제 , 그저께 )
    // 각tmp로 룩 테이블 조회

    // const data = await this.closetService.getWthrDataList();
    return [
      {
        temperature: 12,
        closet_id: 1,
        site_name: '육육걸즈',
        site_url: 'abc.com',
        image_url: 'abcc.com',
      },
      {
        temperature: 12,
        closet_id: 1,
        site_name: '육육걸즈',
        site_url: 'abc.com',
        image_url: 'abcc.com',
      },
    ];
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
