import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { id?: number; email?: string; role?: 'user' }
      | undefined;

    this.logger.debug(`request.user: ${JSON.stringify(user ?? null)}`);

    if (!user) {
      this.logger.warn('request.user is undefined in RolesGuard');
      return false;
    }

    return requiredRoles.includes(user.role ?? '');
  }
}
