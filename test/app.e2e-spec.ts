import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Campus Lost and Found API (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should authenticate user and get JWT token', async () => {
    // First, register a user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      .expect(201);

    // Then login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(loginResponse.body).toHaveProperty('token');
    token = loginResponse.body.token;
  });

  it('should get all items (GET /items)', () => {
    return request(app.getHttpServer())
      .get('/items')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('should create a claim (POST /claims) with authentication', async () => {
    // Assuming we have an item to claim, or create one first
    const itemResponse = await request(app.getHttpServer())
      .post('/items')
      .send({
        name: 'Lost Wallet',
        description: 'Black wallet with cards',
        category: 'lost',
        date: '2023-10-01',
        location: 'Library',
        contact: 'test@example.com',
      })
      .expect(201);

    const itemId = itemResponse.body.id;

    return request(app.getHttpServer())
      .post('/claims')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: itemId,
        claimerName: 'Test User',
        contact: 'test@example.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe('pending');
        expect(res.body.itemId).toBe(itemId);
      });
  });
});
