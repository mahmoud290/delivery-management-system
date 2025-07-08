import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const { user } = context.switchToHttp().getRequest();

  console.log('User from JWT:', user);
  console.log('Required Roles:', requiredRoles);

  if (!user || !requiredRoles.includes(user.role)) {
    throw new ForbiddenException('You do not have permission to access this resource');
  }

  return true;
}
}