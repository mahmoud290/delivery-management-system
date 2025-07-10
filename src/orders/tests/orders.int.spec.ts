import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { UserRole } from 'src/users/user-role.enum';

describe('Orders Integration Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let clientToken: string;
  let adminToken: string;
  let createdOrderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    await dataSource.createQueryBuilder().delete().from('delivery_assignment').execute();
    await dataSource.createQueryBuilder().delete().from('delivery_driver').execute();
    await dataSource.createQueryBuilder().delete().from('orders').execute();
    await dataSource.createQueryBuilder().delete().from('user').execute();

    // ✅ Signup as CLIENT
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'ClientUser',
        email: 'client@dms.com',
        password: '123456',
        role: UserRole.CLIENT,
      });

    // ✅ Signup as ADMIN
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'AdminUser',
        email: 'admin@dms.com',
        password: '123456',
        role: UserRole.ADMIN,
      });

    // ✅ Signin as CLIENT
    const clientLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'client@dms.com',
        password: '123456',
      });
    clientToken = clientLogin.body.access_token;

    // ✅ Signin as ADMIN
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'admin@dms.com',
        password: '123456',
      });
    adminToken = adminLogin.body.access_token;

    if (!clientToken || !adminToken) {
      throw new Error('❌ Failed to retrieve access tokens');
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create a new order', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        pickupLocation: 'Cairo',
        dropoffLocation: 'Giza',
        packageSize: 'medium',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');

    createdOrderId = res.body.id;

    expect(createdOrderId).toBeDefined();
    expect(typeof createdOrderId).toBe('number');
    expect(isNaN(createdOrderId)).toBe(false);
  });

  it('should get all orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get order by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdOrderId);
  });

  it('should delete order', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: `Order with id ${createdOrderId} has been deleted`,
    });
  });
});
