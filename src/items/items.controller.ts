import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body, @Request() req) {
    return this.itemsService.create(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('report')
  createFromLegacyRoute(@Body() body, @Request() req) {
    return this.itemsService.create(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine/reports')
  findMyReports(@Request() req) {
    return this.itemsService.findByReporter(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/details')
  findOneForActor(@Param('id') id: string, @Request() req) {
    return this.itemsService.findOneForActor(+id, req.user);
  }

}
