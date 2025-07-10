import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { UserRole } from 'src/users/user-role.enum';

describe('Orders E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let clientToken: string;
  let adminToken: string;
  let driverToken: string;
  let driverId: number;
  let createdOrderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    await dataSource.query(`DELETE FROM delivery_assignment`);
    await dataSource.query(`DELETE FROM orders`);
    await dataSource.query(`DELETE FROM "user"`);

    // Create CLIENT
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'client',
        email: 'client@test.com',
        password: '123456',
        role: UserRole.CLIENT,
      });

    const clientRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'client@test.com',
        password: '123456',
      });
    clientToken = clientRes.body.access_token;

    // Create ADMIN
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'admin',
        email: 'admin@test.com',
        password: '123456',
        role: UserRole.ADMIN,
      });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'admin@test.com',
        password: '123456',
      });
    adminToken = adminRes.body.access_token;

    // ✅ Create DRIVER
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'driver',
        email: 'driver@test.com',
        password: '123456',
        role: UserRole.DRIVER,
      });

    const driverUser = await dataSource.query(`SELECT * FROM "user" WHERE email = 'driver@test.com'`);
    const deliveryDriver = await dataSource.query(`SELECT * FROM "delivery_driver" WHERE "userId" = ${driverUser[0].id}`);
    driverId = deliveryDriver[0].id;

    const driverRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'driver@test.com',
        password: '123456',
      });

    driverToken = driverRes.body.access_token;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create an order (POST /orders)', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        pickupLocation: 'Alexandria',
        dropoffLocation: 'Cairo',
        packageSize: 'small',
      });

    expect(res.status).toBe(201);
    createdOrderId = res.body.id;
    expect(createdOrderId).toBeDefined();
  });

  it('should get order by id (GET /orders/:id)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdOrderId);
  });

  it('admin should assign driver to the order (POST /assignments)', async () => {
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        orderId: createdOrderId,
        driverId: driverId,
      });

    expect(res.status).toBe(201);
    expect(res.body.order.id).toBe(createdOrderId);
    expect(res.body.driver.id).toBe(driverId);
  });

  it('driver should get their assigned orders (GET /orders/drivers/me/orders)', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders/drivers/me/orders')
      .set('Authorization', `Bearer ${driverToken}`);

    console.log('📦 Orders returned to driver:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBe(createdOrderId);
  });

  it('driver should update order status to IN_TRANSIT (PATCH /orders/:id/status)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        status: 'in_transit',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_transit');
  });

  it('driver should update order status to DELIVERED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        status: 'delivered',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('delivered');
  });

  it('admin should delete the order', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain(`Order with id ${createdOrderId} has been deleted`);
  });
});
