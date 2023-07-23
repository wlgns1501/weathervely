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
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClosetService } from './closet.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { PickClosetDto } from './dtos/pickCloset.dto';
import { PickClosetPipe } from './dtos/pickCloset.pipe';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GetRecommendClosetDto } from './dtos/getRecommendCloset.dto';
import { GetRecommendClosetPipe } from './dtos/getRecommendCloset.pipe';
import { SetRecommendClosetDto } from './dtos/setRecommendCloset.dto';
import { SetRecommendClosetPipe } from './dtos/setRecommendCloset.pipe';
import { GetClosetByTemperatureDto } from './dtos/getClosetByTemperature.dto';
import { GetClosetByTemperaturePipe } from './dtos/getClosetByTemperature.pipe';

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

  @Get('getClosetByTemperature')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '온보딩 - 체감온도 설정 화면 진입시 - Get' })
  async getClosetByTemperature(
    @Query(new GetClosetByTemperaturePipe())
    getClosetByTemperatureDto: GetClosetByTemperatureDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    const data = await this.service.getClosetByTemperature(
      getClosetByTemperatureDto,
      req.user,
      req.address,
    );
    return res.status(200).json({ msg: 'success', data: data });
  }

  @Post('setTemperature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '체감온도 설정' })
  @UseGuards(AuthGuard)
  async setTemperature(
    @Body(new SetRecommendClosetPipe())
    setRecommendClosetDto: SetRecommendClosetDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    await this.service.setRecommendCloset(
      setRecommendClosetDto,
      req.user,
      req.address,
    );
    return res.status(200).json({ msg: 'ok' });
  }

  @Get('getRecommendCloset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '메인 화면 진입시 - Get' })
  async getRecommendCloset(
    @Query(new GetRecommendClosetPipe())
    getRecommendClosetDto: GetRecommendClosetDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    const data = await this.service.getRecommendCloset(
      getRecommendClosetDto,
      req.user,
      req.address,
    );
    return res.status(200).json({ msg: 'success', data: data });
  }

  //   @Get('getCloset')
  //   @HttpCode(HttpStatus.OK)
  //   @UseGuards(AuthGuard)
  //   @ApiOperation({ summary: '온보딩 - 체감온도 설정 - 스와이프 - Get' })
  //   @ApiQuery({
  //     name: 'temperature',
  //     required: true,
  //     description: 'temperature입니다.',
  //   })
  //   async getCloset(@Query('temperature') temperature: number, @Req() req?: any) {
  //     return this.service.getCloset(temperature, req.user);
  //   }
}
