import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, _context: ExecutionContext) {
    if (user) {
      return user;
    }

    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Invalid session token. Please log in again.');
    }

    if (err) {
      throw err;
    }

    throw new UnauthorizedException('Authentication required.');
  }
}
