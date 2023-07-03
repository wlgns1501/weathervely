import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateNickNamePipe } from './dtos/signUp.pipe';
import { CreateNickNameDto } from './dtos/signUp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('/nickName')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  signUp(@Body(new CreateNickNamePipe()) createNickNameDto: CreateNickNameDto) {
    return this.service.signUp(createNickNameDto);
  }
}
