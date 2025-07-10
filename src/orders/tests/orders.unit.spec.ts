import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../order.entity';
import { DeliveryAssignment } from 'src/delivery-assignments/delivery-assignment.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('OrdersService Unit Test', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<Repository<Order>>;
  let assignmentRepo: jest.Mocked<Repository<DeliveryAssignment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryAssignment),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    orderRepo = module.get(getRepositoryToken(Order));
    assignmentRepo = module.get(getRepositoryToken(DeliveryAssignment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order', async () => {
    const dto = {
      pickupLocation: 'A',
      dropoffLocation: 'B',
      packageSize: 'small',
    };

    const client = { id: 1, name: 'Client' } as User;

    const createdOrder = { id: 1, ...dto, status: OrderStatus.PENDING, client } as Order;

    orderRepo.create.mockReturnValue(createdOrder);
    orderRepo.save.mockResolvedValue(createdOrder);

    const result = await service.createOrder(dto, client);

    expect(orderRepo.create).toHaveBeenCalledWith({ ...dto, status: OrderStatus.PENDING, client });
    expect(orderRepo.save).toHaveBeenCalledWith(createdOrder);
    expect(result).toEqual(createdOrder);
  });

  it('should return all orders', async () => {
    const orders = [{ id: 1 }, { id: 2 }] as Order[];
    orderRepo.find.mockResolvedValue(orders);

    const result = await service.findAll();

    expect(orderRepo.find).toHaveBeenCalled();
    expect(result).toEqual(orders);
  });

  it('should return one order with relations', async () => {
    const order = { id: 1 } as Order;
    orderRepo.findOne.mockResolvedValue(order);

    const result = await service.findOne(1);

    expect(orderRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['client', 'driver'],
    });

    expect(result).toEqual(order);
  });

  it('should throw NotFoundException if order not found', async () => {
    orderRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(
      new NotFoundException('Order with id 99 not found'),
    );
  });

  it('should update order status if driver is assigned', async () => {
  const driver = { id: 10 } as User;

  const assignment = {
    driver: { user: driver },
    id: 1,
    order: {} as Order,
    pickedUpAt: null,
    deliveredAt: null,
  } as unknown as DeliveryAssignment;

  const order = {
    id: 1,
    status: OrderStatus.PENDING,
    assignments: [assignment],
  } as Order;

  orderRepo.findOne.mockResolvedValue(order);
  orderRepo.save.mockResolvedValue({ ...order, status: OrderStatus.DELIVERED });
  assignmentRepo.save.mockResolvedValue(assignment);

  const result = await service.updateOrderStatus(order.id, OrderStatus.DELIVERED, driver.id);

  expect(orderRepo.findOne).toHaveBeenCalledWith({
    where: { id: order.id },
    relations: ['assignments', 'assignments.driver'],
  });

  expect(assignmentRepo.save).toHaveBeenCalled();
  expect(orderRepo.save).toHaveBeenCalledWith({ ...order, status: OrderStatus.DELIVERED });
  expect(result.status).toBe(OrderStatus.DELIVERED);
});

it('should throw ForbiddenException if driver not assigned to order', async () => {
  const assignment = {
    driver: { user: { id: 99 } },
    id: 1,
    order: {} as Order,
    pickedUpAt: null,
    deliveredAt: null,
  } as unknown as DeliveryAssignment;

  const order = {
    id: 1,
    assignments: [assignment],
  } as Order;

  orderRepo.findOne.mockResolvedValue(order);

  await expect(
    service.updateOrderStatus(1, OrderStatus.DELIVERED, 10),
  ).rejects.toThrow(new ForbiddenException('Not your order'));
});

it('should return orders for driver', async () => {
  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([{ id: 1 }] as Order[]),
  };

  orderRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

  const result = await service.getOrdersForDriver(5);

  expect(orderRepo.createQueryBuilder).toHaveBeenCalledWith('order');
  expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('order.client', 'client');
  expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('order.assignments', 'assignment');
  expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('assignment.driver', 'driver');
  expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('driver.user', 'user');
  expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :driverId', { driverId: 5 });
  expect(result).toEqual([{ id: 1 }]);
});


  it('should delete order if exists', async () => {
    orderRepo.delete.mockResolvedValue({ affected: 1, raw: []});

    await service.delete(1);

    expect(orderRepo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if order to delete not found', async () => {
    orderRepo.delete.mockResolvedValue({affected: 0, raw: [] });

    await expect(service.delete(999)).rejects.toThrow(
      new NotFoundException('Order with id 999 not found'),
    );
  });
});
