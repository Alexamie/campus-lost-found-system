import { Injectable } from '@nestjs/common';

@Injectable()
export class ClaimsService {

  claims: any[] = [];
  private idCounter = 0;

  create(data: any) {
    const claim = { id: ++this.idCounter, status: 'pending', ...data };
    this.claims.push(claim);
    return claim;
  }

  findAll() {
    return this.claims;
  }

  approve(id: number) {
    const claim = this.claims.find(c => c.id == id);
    if (claim) {
      claim.status = 'approved';
    }
    return claim;
  }

  reject(id: number) {
    const claim = this.claims.find(c => c.id == id);
    if (claim) {
      claim.status = 'rejected';
    }
    return claim;
  }
}