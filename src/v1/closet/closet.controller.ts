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
import { SetTemperatureDto } from './dtos/setTemperature.dto';
import { SetTemperaturePipe } from './dtos/setTemperature.pipe';
import { GetClosetByTemperatureDto } from './dtos/getClosetByTemperature.dto';
import { GetClosetByTemperaturePipe } from './dtos/getClosetByTemperature.pipe';
import { Response } from 'express';

@ApiTags('Closet')
@Controller('closet')
export class ClosetController {
  constructor(private service: ClosetService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '스타일 리스트' })
  @UseGuards(AuthGuard)
  async getClosetList(@Res() res: Response) {
    const data = await this.service.getClosetList();

    return res.send({ status: 200, data: { list: data } });
  }

  @Post('/pick')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '스타일 선택' })
  @UseGuards(AuthGuard)
  pickCloset(
    @Body(new PickClosetPipe()) pickClosetDto: PickClosetDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    this.service.pickCloset(pickClosetDto, req.user);
    return res.send({ status: 200 });
  }

  @Get('getClosetByTemperature')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '체감온도 설정시 LIST' })
  async getClosetByTemperature(
    @Query(new GetClosetByTemperaturePipe())
    getClosetByTemperatureDto: GetClosetByTemperatureDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const data = await this.service.getClosetByTemperature(
      getClosetByTemperatureDto,
      req.user,
      req.address,
    );
    return res.send({
      status: 200,
      data: { list: data.closets, fcstValue: data.fcstValue },
    });
  }

  @Post('setTemperature')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '체감온도 설정' })
  @UseGuards(AuthGuard)
  async setTemperature(
    @Body(new SetTemperaturePipe())
    setTemperatureDto: SetTemperatureDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    await this.service.setTemperature(setTemperatureDto, req.user, req.address);
    return res.send({ status: 200 });
  }

  @Get('getRecommendCloset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '메인 화면 진입시' })
  async getRecommendCloset(
    @Query(new GetRecommendClosetPipe())
    getRecommendClosetDto: GetRecommendClosetDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const data = await this.service.getRecommendCloset(
      getRecommendClosetDto,
      req.user,
      req.address,
    );
    return res.send({ status: 200, data: { list: data } });
  }
}
