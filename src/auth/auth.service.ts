import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

  users: any[] = [];

  register(data){
    const user = { id: Date.now(), ...data };
    this.users.push(user);
    return user;
  }

  login(data){
    const user = this.users.find(
      u => u.email === data.email && u.password === data.password
    );

    if(!user){
      return { message: 'Invalid credentials' };
    }

    return {
      message: 'Login success',
      token: 'FAKE-JWT-TOKEN'
    };
  }

}