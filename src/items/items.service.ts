import { Injectable } from '@nestjs/common';

@Injectable()
export class ItemsService {

  items: any[] = [];

  create(data: any) {
    const item = { id: Date.now(), ...data };
    this.items.push(item);
    return item;
  }

  findAll() {
    return this.items;
  }

  findOne(id: number) {
    return this.items.find(item => item.id == id);
  }

  update(id: number, data: any) {
    const item = this.findOne(id);
    if (item) {
      Object.assign(item, data);
    }
    return item;
  }

  remove(id: number) {
    this.items = this.items.filter(item => item.id != id);
    return { deleted: true };
  }
}