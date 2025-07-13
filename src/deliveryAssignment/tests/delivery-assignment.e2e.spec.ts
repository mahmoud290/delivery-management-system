import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { DeliveryStatus } from '../dtos/update-assignment.dto';

describe('DeliveryAssignment E2E Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let clientToken: string;
  let adminToken: string;
  let driverToken: string;
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
      TRUNCATE TABLE
        "delivery_assignment",
        "order",
        "delivery_driver",
        "user"
      RESTART IDENTITY CASCADE
    `);
  });

  it('✅ should do full E2E flow', async () => {
    // 1. Create client user and login
    await request(app.getHttpServer()).post('/auth/signup').send({
      name: 'Client',
      email: 'client@test.com',
      password: '123456',
      age: 30,
      role: 'client',
    });

    const clientLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'client@test.com', password: '123456' });

    clientToken = clientLogin.body.access_token;

    // 2. Create order
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        description: 'E2E Order',
        address: 'E2E Street',
        pickupLocation: 'E2E Pickup',
        dropoffLocation: 'E2E Drop',
        packageSize: 'Large',
      })
      .expect(201);

    orderId = orderRes.body.id;
    expect(orderId).toBeDefined();

    // 3. Create admin user and login
    await request(app.getHttpServer()).post('/auth/signup').send({
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      age: 35,
      role: 'admin',
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'admin@test.com', password: '123456' });

    adminToken = adminLogin.body.access_token;

    // 4. Create driver user and login
    await request(app.getHttpServer()).post('/auth/signup').send({
      name: 'Driver',
      email: 'driver@test.com',
      password: '123456',
      age: 28,
      role: 'driver',
    });

    const userRepo = dataSource.getRepository('User');
    const driverUser = await userRepo.findOneBy({ email: 'driver@test.com' });

    const driverRepo = dataSource.getRepository('DeliveryDriver');

const existingDriver = await driverRepo.findOne({
  where: { user: { id: driverUser!.id } },
  relations: ['user'],
});

let driverCreateRes;

if (!existingDriver) {
  driverCreateRes = await request(app.getHttpServer())
    .post('/drivers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Driver',
      status: 'available',
      userId: driverUser!.id,
    });

  console.log('🪵 DRIVER CREATE RESPONSE:', driverCreateRes.status, driverCreateRes.body);
  expect(driverCreateRes.status).toBe(201);
} else {
  console.log('🪵 DRIVER ALREADY EXISTS, SKIPPING CREATION');
}

const driverEntity = existingDriver ?? await driverRepo.findOne({
  where: { user: { id: driverUser!.id } },
  relations: ['user'],
});
driverId = driverEntity!.id;



    // 6. Driver login
    const driverLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'driver@test.com', password: '123456' });

    driverToken = driverLogin.body.access_token;

    // 7. Assign driver to order
    const assignRes = await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderId, driverId })
      .expect(201);

    assignmentId = assignRes.body.id;
    expect(assignRes.body.driver.id).toBe(driverId);

    // 8. Update status to PICKED_UP
    const statusRes = await request(app.getHttpServer())
      .patch(`/assignments/${assignmentId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: DeliveryStatus.PICKED_UP })
      .expect(200);

    expect(statusRes.body.pickedUpAt).toBeDefined();

    // 9. Delete assignment
    const deleteRes = await request(app.getHttpServer())
      .delete(`/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(deleteRes.body.message).toContain(`Assignment with ID ${assignmentId} has been deleted`);
  });

  afterAll(async () => {
    await app.close();
  });
});
