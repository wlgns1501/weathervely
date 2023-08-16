import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { UpdateAddressPipe } from './dtos/updateAddress.pipe';
import { UpdateAddressDto } from './dtos/updateAddress.dto';
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

  @Post('address/setMain/:addressId')
  @ApiOperation({ summary: '메인 주소 설정' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  setMainAddress(@Req() req: any, @Param('addressId') addressId: number) {
    return this.service.setMainAddress(req.user, addressId);
  }

  @Post('address/')
  @ApiOperation({ summary: '주소 설정 추가' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  addUserWithAddress(
    @Body(new CreateAddressPipe()) createAddressDto: CreateAddressDto,
    @Req() req: any,
  ) {
    return this.service.addUserWithAddress(createAddressDto, req.user);
  }

  @Patch('address/:addressId')
  @ApiOperation({ summary: '설정된 주소 변경' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  updateUserWithAddress(
    @Param('addressId') addressId: number,
    @Req() req: any,
    @Body(new UpdateAddressPipe()) updateAddressDto: UpdateAddressDto,
  ) {
    return this.service.updateUserWithAddress(
      addressId,
      req.user,
      updateAddressDto,
    );
  }

  @Post('address/:addressId')
  @ApiOperation({ summary: '설정된 주소 삭제' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  deleteUserWithAddress(
    @Param('addressId') addressId: number,
    @Req() req: any,
  ) {
    return this.service.deleteUserWithAddress(addressId, req.user);
  }
}
