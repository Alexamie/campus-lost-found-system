import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  users: any[] = [];
  private idCounter = 0;

  create(data: any) {
    const user = { id: ++this.idCounter, ...data };
    this.users.push(user);
    return user;
  }

  findAll() {
    return this.users;
  }

  findById(id: number) {
    return this.users.find(u => u.id === id);
  }
}
