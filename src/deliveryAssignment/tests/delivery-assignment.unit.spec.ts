import { UpdateAssignmentStatusDto, DeliveryStatus } from '../dtos/update-assignment.dto';
import { Test } from '@nestjs/testing';
import { DeliveryAssignmentService } from '../delivery-assignment.service';
import { DeliveryAssignment } from '../delivery-assignment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from 'src/orders/order.entity'; 
import { DeliveryDriver } from 'src/drivers/driver.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DeliveryAssignmentService', () => {
  let service: DeliveryAssignmentService;
  let assignmentRepo: Repository<DeliveryAssignment>;
  let orderRepo: Repository<Order>;
  let driverRepo: Repository<DeliveryDriver>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeliveryAssignmentService,
        {
          provide: getRepositoryToken(DeliveryAssignment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryDriver),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(DeliveryAssignmentService);
    assignmentRepo = moduleRef.get(getRepositoryToken(DeliveryAssignment));
    orderRepo = moduleRef.get(getRepositoryToken(Order));
    driverRepo = moduleRef.get(getRepositoryToken(DeliveryDriver));
  });

  describe('assignDriverToOrder', () => {
    it('should assign driver to order', async () => {
      const fakeOrder = { id: 1 } as Order;
      const fakeDriver = { id: 1 } as DeliveryDriver;
      const fakeAssignment = { id: 1, order: fakeOrder, driver: fakeDriver };

      (orderRepo.findOneBy as jest.Mock).mockResolvedValue(fakeOrder);
      (driverRepo.findOneBy as jest.Mock).mockResolvedValue(fakeDriver);
      (assignmentRepo.create as jest.Mock).mockReturnValue(fakeAssignment);
      (assignmentRepo.save as jest.Mock).mockResolvedValue(fakeAssignment);

      const result = await service.assignDriverToOrder(1, 1);

      expect(result).toEqual(fakeAssignment);
    });

    it('should throw if order not found', async () => {
      (orderRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.assignDriverToOrder(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw if driver not found', async () => {
      (orderRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1 });
      (driverRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.assignDriverToOrder(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update to ASSIGNED', async () => {
      const assignment = {} as DeliveryAssignment;
      (assignmentRepo.findOne as jest.Mock).mockResolvedValue(assignment);
      (assignmentRepo.save as jest.Mock).mockResolvedValue(assignment);

      const dto: UpdateAssignmentStatusDto = { status: DeliveryStatus.ASSIGNED };
      const result = await service.updateStatus(1, dto);

      expect(assignment.assignedAt).toBeDefined();
      expect(result).toBe(assignment);
    });

    it('should throw if assignment not found', async () => {
      (assignmentRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.updateStatus(1, { status: DeliveryStatus.DELIVERED }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAssignments', () => {
    it('should return all assignments', async () => {
      const assignments = [{ id: 1 }] as DeliveryAssignment[];
      (assignmentRepo.find as jest.Mock).mockResolvedValue(assignments);
      const result = await service.getAssignments();
      expect(result).toBe(assignments);
    });
  });

  describe('getAssignmentById', () => {
    it('should return assignment', async () => {
      const assignment = { id: 1 } as DeliveryAssignment;
      (assignmentRepo.findOne as jest.Mock).mockResolvedValue(assignment);
      const result = await service.getAssignmentById(1);
      expect(result).toBe(assignment);
    });

    it('should throw if not found', async () => {
      (assignmentRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.getAssignmentById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAssignment', () => {
    it('should delete assignment', async () => {
      (assignmentRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await expect(service.deleteAssignment(1)).resolves.not.toThrow();
    });

    it('should throw if not deleted', async () => {
      (assignmentRepo.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await expect(service.deleteAssignment(1)).rejects.toThrow(NotFoundException);
    });
  });
});
