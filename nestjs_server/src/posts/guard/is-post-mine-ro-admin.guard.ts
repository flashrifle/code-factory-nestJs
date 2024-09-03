import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RolesEnum } from '../../users/const/roles.const';
import { PostsService } from '../posts.service';
import { Request } from 'express';
import { UsersModel } from '../../users/entity/users.entity';

@Injectable()
export class IsPostMineRoAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & { user: UsersModel };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException(`사용자 정보를 가져올 수 없습니다.`);
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException(`Post ID 가 파라미터로 제공되어야 합니다.`);
    }
    return this.postsService.isPostMine(user.id, parseInt(postId));
  }
}
