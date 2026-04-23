import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ItemsService } from '../items/items.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly itemsService: ItemsService,
  ) {}

  @Get('users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Post('users')
  async addUser(
    @Body()
    body: { name: string; email: string; password: string; role: 'admin' | 'user' },
  ) {
    return this.authService.createUser(body, body.role || 'user');
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(+id);
  }

  @Get('items')
  getAllItems() {
    return this.itemsService.findAllForAdmin();
  }

  @Patch('items/:id/approve')
  approveItem(@Param('id') id: string) {
    return this.itemsService.approve(+id);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.itemsService.remove(+id);
  }
}
