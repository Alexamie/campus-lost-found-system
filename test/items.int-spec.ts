import request from 'supertest'; // ✅ FIXED
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Items Integration Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /items/report', () => {
    it('should create a new item', async () => {
      const response = await request(app.getHttpServer())
        .post('/items/report') // ⚠️ change to /api/items/report if you use global prefix
        .send({
          name: 'Wallet',
          description: 'Black wallet',
          type: 'lost',
        });

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
    });
  });
});