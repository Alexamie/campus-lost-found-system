import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Campus Lost and Found API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should authenticate user and get JWT token', async () => {
    const email = `test-${Date.now()}@example.com`;

    // First, register a user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email,
        password: 'password123',
        confirmPassword: 'password123',
      })
      .expect(201);

    // Then login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);

    expect(loginResponse.body).toHaveProperty('token');
    expect(loginResponse.body.token).toBeTruthy();
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
    const email = `claim-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Claim User',
        email,
        password: 'password123',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);

    const token = loginResponse.body.token;

    const itemResponse = await request(app.getHttpServer())
      .post('/items/report')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Lost Wallet',
        description: 'Black wallet with cards',
        status: 'lost',
        location: 'Library',
        contact: email,
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
