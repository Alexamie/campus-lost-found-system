import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { ClaimsService } from './claims.service';

@Controller('claims')
export class ClaimsController {

  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  create(@Body() body) {
    return this.claimsService.create(body);
  }

  @Get()
  findAll() {
    return this.claimsService.findAll();
  }

  @Put(':id/approve')
  approve(@Param('id') id:number){
    return this.claimsService.approve(id);
  }

  @Put(':id/reject')
  reject(@Param('id') id:number){
    return this.claimsService.reject(id);
  }

}