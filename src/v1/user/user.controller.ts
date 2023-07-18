import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateUserNickNameGenderDto } from './dtos/updateUserNickNameGender.dto';
import { UpdateUserNickNameGenderPipe } from './dtos/updateUserNickNameGender.pipe';
import { Response } from 'express';
import { ACCESS_TOKEN_EXPIRESIN } from '../auth/auth.controller';
import { CreateAddressPipe } from './dtos/createAddress.pipe';
import { CreateAddressDto } from './dtos/createAddress.dto';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

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

  @Get('')
  @ApiOperation({ summary: 'user nickname gender 가져오기' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  getUserNickNameGender(@Req() req: any) {
    return this.service.getUserNickNameGender(req.user);
  }

  @Patch('')
  @ApiOperation({ summary: '닉네임 및 성별 수정' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserNickNameGender(
    @Body(new UpdateUserNickNameGenderPipe())
    updateUserNickNameGenderDto: UpdateUserNickNameGenderDto,
    @Req() req: any,
    @Res() response: Response,
  ) {
    const { access_token } = await this.service.updateUserNickNameGender(
      updateUserNickNameGenderDto,
      req.user,
    );

    const settledResponse = this.setAccessToken(
      response,
      access_token,
      ACCESS_TOKEN_EXPIRESIN,
    );

    settledResponse.send({ success: true });
  }

  @Get('address/')
  @ApiOperation({ summary: '주소 리스트' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  getAddresses(@Req() req: any) {
    return this.service.getAddresses(req.user);
  }

  @Post('address/')
  @ApiOperation({ summary: '주소 추가' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  createAddress(
    @Body(new CreateAddressPipe()) createAddressDto: CreateAddressDto,
    @Req() req: any,
  ) {
    return this.service.createAddress(createAddressDto, req.user);
  }
}
