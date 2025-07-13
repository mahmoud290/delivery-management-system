import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from '../drivers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeliveryDriver } from '../driver.entity';
import { DriverStatus } from '../dtos/create-driver.dto';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DriversService Unit Test', () => {
  let service: DriversService;
  let driverRepo: jest.Mocked<Repository<DeliveryDriver>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        {
          provide: getRepositoryToken(DeliveryDriver),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(DriversService);
    driverRepo = module.get(getRepositoryToken(DeliveryDriver));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  it('should create driver if user exists', async () => {
    const dto = { userId: 1, status: DriverStatus.AVAILABLE };
    const user = { id: 1 } as User;
    const createdDriver = { id: 10, user, status: DriverStatus.AVAILABLE } as DeliveryDriver;

    userRepo.findOneBy.mockResolvedValue(user);
    driverRepo.create.mockReturnValue(createdDriver);
    driverRepo.save.mockResolvedValue(createdDriver);

    const result = await service.createDriver(dto);

    expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: dto.userId });
    expect(driverRepo.create).toHaveBeenCalledWith({ user, status: dto.status });
    expect(result).toEqual(createdDriver);
  });

  it('should throw if user not found on create', async () => {
    userRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.createDriver({ userId: 999, status: DriverStatus.AVAILABLE }),
    ).rejects.toThrow(new NotFoundException('User with id 999 not found'));
  });

  it('should return all drivers', async () => {
    const drivers = [{ id: 1 }] as DeliveryDriver[];
    driverRepo.find.mockResolvedValue(drivers);

    const result = await service.findAll();

    expect(driverRepo.find).toHaveBeenCalledWith({ relations: ['user'] });
    expect(result).toEqual(drivers);
  });

  it('should return one driver', async () => {
    const driver = { id: 1 } as DeliveryDriver;
    driverRepo.findOne.mockResolvedValue(driver);

    const result = await service.findOne(1);

    expect(driverRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['user'] });
    expect(result).toEqual(driver);
  });

  it('should throw if driver not found', async () => {
    driverRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(123)).rejects.toThrow(
      new NotFoundException('Driver with id 123 not found'),
    );
  });

  it('should update status of a driver', async () => {
    const driver = { id: 1, status: DriverStatus.BUSY } as DeliveryDriver;

    jest.spyOn(service, 'findOne').mockResolvedValue(driver);
    driverRepo.save.mockResolvedValue({ ...driver, status: DriverStatus.AVAILABLE });

    const result = await service.updateStatus(1, DriverStatus.AVAILABLE);

    expect(driver.status).toBe(DriverStatus.AVAILABLE);
    expect(driverRepo.save).toHaveBeenCalledWith(driver);
    expect(result.status).toBe(DriverStatus.AVAILABLE);
  });

  it('should delete driver if exists', async () => {
driverRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

    await service.deleteDriver(1);

    expect(driverRepo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if driver to delete not found', async () => {
driverRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

    await expect(service.deleteDriver(99)).rejects.toThrow(
      new NotFoundException('Driver with id 99 not found'),
    );
  });
});
