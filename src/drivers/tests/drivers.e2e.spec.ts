import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';
import { UserRole } from 'src/users/user-role.enum';
import * as bcrypt from 'bcrypt';
import { DriverStatus } from '../dtos/create-driver.dto';
import { DeliveryDriver } from '../driver.entity';

describe('Drivers E2E Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let createdDriverId: number;
  let userId: number;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get(DataSource);

const driverRepo = dataSource.getRepository(DeliveryDriver);
  const allDrivers = await driverRepo.find();
  if (allDrivers.length > 0) await driverRepo.remove(allDrivers);

  const userRepo = dataSource.getRepository(User);
  const allUsers = await userRepo.find();
  if (allUsers.length > 0) await userRepo.remove(allUsers);


    const password = await bcrypt.hash('admin123', 10);
    const adminUser = dataSource.getRepository(User).create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password,
      role: UserRole.ADMIN,
    });

    const savedUser = await dataSource.getRepository(User).save(adminUser);
    userId = savedUser.id;

    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'admin@test.com', password: 'admin123' });

    token = res.body.access_token;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create a driver', async () => {
    const res = await request(app.getHttpServer())
      .post('/drivers')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId, status: DriverStatus.AVAILABLE })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    createdDriverId = res.body.id;
  });

  it('should get all drivers', async () => {
    const res = await request(app.getHttpServer())
      .get('/drivers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get driver by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/drivers/${createdDriverId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(createdDriverId);
  });

  it('should update driver status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/drivers/${createdDriverId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: DriverStatus.BUSY })
      .expect(200);

    expect(res.body.status).toBe(DriverStatus.BUSY);
  });

  it('should delete driver', async () => {
    await request(app.getHttpServer())
      .delete(`/drivers/${createdDriverId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
