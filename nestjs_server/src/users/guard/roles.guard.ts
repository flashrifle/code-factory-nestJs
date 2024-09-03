import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /*
      Roles annotation 에 대한 metadata 를 가져와야 한다.

      Reflector
      - getAllAndOverride()
       */
    const requireRole = this.reflector.getAllAndOverride(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // Roles Annotation 등록 안됨
    if (!requireRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException(`토큰을 제공해주세요.`);
    }

    if (user.role !== requireRole) {
      throw new ForbiddenException(`이 작업을 수행할 권한이 없습니다 ${requireRole} 권한이 필요합니다.`);
    }

    return true;
  }
}
