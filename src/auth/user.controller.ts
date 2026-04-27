import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItemsService } from '../items/items.service';
import { ClaimsService } from '../claims/claims.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly itemsService: ItemsService,
    private readonly claimsService: ClaimsService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const user = await this.authService.getUserById(req.user.id);
    const [reports, claims] = await Promise.all([
      this.itemsService.findByReporter(req.user.id),
      this.claimsService.findByUser(req.user.id),
    ]);

    return {
      user,
      stats: {
        reports: reports.length,
        claims: claims.length,
        approvedReports: reports.filter(
          (report) => report.approvalStatus === 'approved',
        ).length,
        pendingClaims: claims.filter((claim) => claim.status === 'pending').length,
      },
      reports,
      claims,
    };
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getUserById(req.user.id);
  }
}
