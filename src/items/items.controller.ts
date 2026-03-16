import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {

  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() body) {
    return this.itemsService.create(body);
  }

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.itemsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() body) {
    return this.itemsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.itemsService.remove(id);
  }

}