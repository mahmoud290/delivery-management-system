import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';
import { DeliveryDriver } from '../driver.entity';
import { DriverStatus } from '../dtos/create-driver.dto';
import { UserRole } from 'src/users/user-role.enum';
import * as bcrypt from 'bcrypt';

describe('Drivers Integration Test', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let dataSource: DataSource;
  let createdUser: User;
  let createdDriver: DeliveryDriver;
  let token: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get(DataSource);
// 🧹 Clear test data safely
  const driverRepo = dataSource.getRepository(DeliveryDriver);
  const allDrivers = await driverRepo.find();
  for (const driver of allDrivers) {
    await driverRepo.delete(driver.id);
  }

  const userRepository = dataSource.getRepository(User);
  const allUsers = await userRepository.find();
  for (const user of allUsers) {
    await userRepository.delete(user.id);
  }

    // Create hashed password
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Create test user
    const userRepo = dataSource.getRepository(User);
    createdUser = await userRepo.save({
      name: 'Driver User',
      email: 'driver@test.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    // Sign in to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'driver@test.com', password: 'test123' });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create a driver', async () => {
    const res = await request(app.getHttpServer())
      .post('/drivers')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: createdUser.id, status: DriverStatus.AVAILABLE })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe(DriverStatus.AVAILABLE);
    expect(res.body.user.id).toBe(createdUser.id);

    createdDriver = res.body;
  });

  it('should get all drivers', async () => {
    const res = await request(app.getHttpServer())
      .get('/drivers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get driver by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/drivers/${createdDriver.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(createdDriver.id);
  });

  it('should update driver status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/drivers/${createdDriver.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: DriverStatus.BUSY })
      .expect(200);

    expect(res.body.status).toBe(DriverStatus.BUSY);
  });

  it('should delete driver', async () => {
    await request(app.getHttpServer())
      .delete(`/drivers/${createdDriver.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
