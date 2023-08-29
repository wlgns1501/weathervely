import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SetNickNamePipe } from './dtos/setNickname.pipe';
import { SetNickNameDto } from './dtos/setNickName.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { SetAddressPipe } from './dtos/setAddress.pipe';
import { SetAddressDto } from './dtos/setAddress.dto';
import { OnboardingGuard } from 'src/guards/onboarding.guard';
import { SetGenderDto } from './dtos/setGender.dto';
import { SetGenderPipe } from './dtos/setGender.pipe';
import { LoginDto } from './dtos/login.dto';
import { LoginPipe } from './dtos/login.pipe';

export const ACCESS_TOKEN_EXPIRESIN = 1000 * 60 * 60 * 24;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  private setAccessToken(
    response: Response,
    accessToken: string,
    expiresIn: number,
  ) {
    response.cookie('access_token', accessToken, {
      expires: new Date(Date.now() + expiresIn),
    });

    return response;
  }

  @Post('/login')
  @ApiOperation({ summary: '토큰 발행' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new LoginPipe()) loginDto: LoginDto,
    @Res() response: Response,
  ) {
    const { access_token, user, address, setTemperature } =
      await this.service.login(loginDto);

    const settledResponse = this.setAccessToken(
      response,
      access_token,
      ACCESS_TOKEN_EXPIRESIN,
    );

    settledResponse.send({
      status: 200,
      data: { user, address, setTemperature },
    });
  }

  @Get('/getUser')
  @ApiOperation({ summary: '<test용> 유저 리스트 불러오기' })
  @HttpCode(HttpStatus.OK)
  async getUser() {
    return await this.service.getUser();
  }

  @Post('/nickName')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'nickname 설정' })
  async setNickName(
    @Body(new SetNickNamePipe()) setNickNameDto: SetNickNameDto,
    @Res() response: Response,
  ) {
    const { accessToken } = await this.service.setNickName(setNickNameDto);

    const settledResponse = this.setAccessToken(
      response,
      accessToken,
      ACCESS_TOKEN_EXPIRESIN,
    );

    settledResponse.send({ status: 200 });
  }

  @Post('/address')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OnboardingGuard)
  @ApiOperation({ summary: 'address 설정' })
  async setAddress(
    @Body(new SetAddressPipe()) setAddressDto: SetAddressDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const data = await this.service.setAddress(setAddressDto, req.user);
    return res.send({ status: 200, data: { data: data } });
  }

  @Post('/gender')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OnboardingGuard)
  @ApiOperation({ summary: 'gender 설정' })
  async setGender(
    @Body(new SetGenderPipe()) setGenderDto: SetGenderDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const data = await this.service.setGender(setGenderDto, req.user);
    return res.send({ status: 200, data: { data: data } });
  }
}
