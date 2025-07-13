import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { DeliveryStatus } from '../dtos/update-assignment.dto';

describe('DeliveryAssignment Integration Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let driverToken: string;
  let clientToken: string;
  let orderId: number;
  let driverId: number;
  let assignmentId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleRef.get(DataSource);

    await dataSource.query(`
      TRUNCATE TABLE "delivery_assignment", "order", "delivery_driver", "user" RESTART IDENTITY CASCADE
    `);

    const userRepo = dataSource.getRepository('User');
    const driverRepo = dataSource.getRepository('DeliveryDriver');
    const orderRepo = dataSource.getRepository('Order');

    // 👤 Create admin user
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: '123456',
        age: 30,
        role: 'admin',
      });
    await userRepo.update({ email: 'admin@test.com' }, { role: 'admin' });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'admin@test.com', password: '123456' });
    adminToken = adminRes.body.access_token;

    // 👤 Create driver user
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Test Driver',
        email: 'driver@test.com',
        password: '123456',
        age: 25,
        role: 'driver',
      });
    await userRepo.update({ email: 'driver@test.com' }, { role: 'driver' });

    const driverUser = await userRepo.findOne({
      where: { email: 'driver@test.com' },
    });

    // 🚚 Create driver
    await request(app.getHttpServer())
      .post('/drivers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Driver',
        status: 'AVAILABLE',
        userId: driverUser!.id,
      });

    const driverEntity = await driverRepo.findOne({
      where: { user: { id: driverUser!.id } },
      relations: ['user'],
    });

    driverId = driverEntity!.id;
    console.log('✅ driverId:', driverId);

    const driverLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'driver@test.com', password: '123456' });
    driverToken = driverLogin.body.access_token;

    // 👤 Create client user
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Test Client',
        email: 'client@test.com',
        password: '123456',
        age: 28,
        role: 'client',
      });
    await userRepo.update({ email: 'client@test.com' }, { role: 'client' });

    const clientLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'client@test.com', password: '123456' });
    clientToken = clientLogin.body.access_token;

    // 📦 Create order using client
  const orderRes = await request(app.getHttpServer())
  .post('/orders')
  .set('Authorization', `Bearer ${clientToken}`)
  .send({
    description: 'Test Order',
    address: '123 Street',
    pickupLocation: 'Location A',
    dropoffLocation: 'Location B',
    packageSize: 'Medium'
  });

    console.log('Status code from /orders:', orderRes.statusCode);
    console.log('Body from /orders:', orderRes.body);

    if (!orderRes.body || !orderRes.body.id) {
      throw new Error('❌ Failed to create order or missing ID in response');
    }

    orderId = orderRes.body.id;
    console.log('✅ orderId:', orderId);

    if (!driverId || !orderId) {
      throw new Error('❌ driverId or orderId is undefined!');
    }
  });

  it('✅ should assign driver to order', async () => {
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderId, driverId })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.driver.id).toBe(driverId);
    assignmentId = res.body.id;
  });

  it('✅ should get all assignments', async () => {
    const res = await request(app.getHttpServer())
      .get('/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('✅ should get assignment by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(assignmentId);
    expect(res.body.driver.id).toBe(driverId);
  });

  it('✅ should update status to PICKED_UP', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/assignments/${assignmentId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: DeliveryStatus.PICKED_UP })
      .expect(200);

    expect(res.body.pickedUpAt).toBeDefined();
  });

  it('✅ should delete assignment', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toContain(
      `Assignment with ID ${assignmentId} has been deleted`,
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
