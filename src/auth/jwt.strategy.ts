import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // Use environment variable in production
    });
  }

  async validate(payload: {
    id?: number;
    sub?: number;
    email?: string;
    role?: 'user';
  }): Promise<{ id: number | undefined; email: string | undefined; role: 'user' | undefined }> {
    return {
      id: payload.id ?? payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
