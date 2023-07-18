import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Get('')
  @ApiOperation({ summary: 'user nickname gender 가져오기' })
  @UseGuards(AuthGuard)
  getUserNickNameGender(@Req() req: any) {
    return this.service.getUserNickNameGender(req.user);
  }
}
