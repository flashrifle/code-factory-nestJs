import {
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorator/roles.decorator';
import { RolesEnum } from './const/roles.const';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entity/users.entity';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from '../common/decorator/query-runner.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // postUser(@Body('nickname') nickname: string, @Body('email') email: string, @Body('password') password: string) {
  //   return this.usersService.createUser({ nickname, email, password });
  // }

  @Get()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  /*
  serialization -> 직렬화 -> 현재 시스템에서 사용되는 데이터의 구조를 다른 시스템에서도
                            쉽게 사용할 수 있는 포맷으로 변환
                            -> class object에서 JSON으로 변환
  deserialization -> 역직렬화
   */
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe) includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(user.id, includeNotConfirmed);
  }

  @Post('follow/:id')
  async postFlow(@User() user: UsersModel, @Param('id', ParseIntPipe) followeeId: number) {
    await this.usersService.followUser(user.id, followeeId);

    return true;
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followerId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.confirmFollow(followerId, user.id, qr);

    await this.usersService.incrementFollowerCount(user.id, qr);

    return true;
  }

  @Delete('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(@User() user: UsersModel, @Param('id', ParseIntPipe) followeeId: number, @QueryRunner() qr: QR) {
    await this.usersService.deleteFollow(user.id, followeeId, qr);

    await this.usersService.decrementFollowerCount(user.id, qr);

    return true;
  }
}
