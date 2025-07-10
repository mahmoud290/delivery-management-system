import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { UserRole } from '../user-role.enum';

describe('Users E2E Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleRef.get(DataSource);

    const email = `admin${Date.now()}@dms.com`;

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Admin',
        email,
        password: '123456',
        role: UserRole.ADMIN,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email,
        password: '123456',
      });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: '123456',
        role: UserRole.CLIENT,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdUserId = res.body.id;
  });

  it('should get all users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get user by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
  });

  it('should update the user', async () => {
    const res = await request(app.getHttpServer())
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  it('should delete the user', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: `User with id ${createdUserId} has been deleted`,
    });
  });
});
