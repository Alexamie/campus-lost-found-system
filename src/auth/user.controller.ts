import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @Get('dashboard')
  getDashboard(@Request() req) {
    const user = req.user;
    return {
      message: `Welcome to your dashboard, ${user.email}`,
      role: user.role,
      // Add more user-specific data
    };
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getUserById(req.user.id);
  }
}
