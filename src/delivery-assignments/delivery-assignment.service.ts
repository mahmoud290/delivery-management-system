import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryAssignment } from "./delivery-assignment.entity";
import { Repository } from "typeorm";
import { Order } from "../orders/order.entity";
import { DeliveryDriver } from "../drivers/driver.entity";
import { DeliveryStatus, UpdateAssignmentStatusDto } from "./dtos/update-assignment.dto";

@Injectable()
export class DeliveryAssignmentService{
    constructor(
        @InjectRepository(DeliveryAssignment)
        private assignmentRepository: Repository<DeliveryAssignment>,
        @InjectRepository(Order)
        private orderRepository:Repository<Order>,
        @InjectRepository(DeliveryDriver)
        private driverRepository:Repository<DeliveryDriver>
    ){}

    async assignDriverToOrder(orderID:number,driverId:number){
        const order = await this.orderRepository.findOneBy({id:orderID})
        if(!order) throw new NotFoundException('Order Not Found')

            const driver = await this.driverRepository.findOneBy({id:driverId});
            if(!driver) throw new NotFoundException('Driver Not Found');

            const assignment = this.assignmentRepository.create({
                order,
                driver,
            });
            return this.assignmentRepository.save(assignment);
    }

    async getAssignments(): Promise<DeliveryAssignment[]> {
    return this.assignmentRepository.find({ relations: ['driver', 'order'] });
}

async getAssignmentById(id: number): Promise<DeliveryAssignment> {
  const assignment = await this.assignmentRepository.findOne({
    where: { id },
    relations: ['order', 'driver'],
  });

  if (!assignment) {
    throw new NotFoundException(`Assignment with ID ${id} not found`);
  }

  return assignment;
}

async updateStatus(id: number, dto: UpdateAssignmentStatusDto): Promise<DeliveryAssignment> {
  const assignment = await this.assignmentRepository.findOne({ where: { id } });

  if (!assignment) throw new NotFoundException('Assignment not found');

  const now = new Date();

  switch (dto.status) {
    case DeliveryStatus.ASSIGNED:
      assignment.assignedAt = now;
      break;
    case DeliveryStatus.PICKED_UP:
      assignment.pickedUpAt = now;
      break;
    case DeliveryStatus.DELIVERED:
      assignment.deliveredAt = now;
      break;
  }

  return this.assignmentRepository.save(assignment);
}

async deleteAssignment(id: number): Promise<void> {
  const result = await this.assignmentRepository.delete(id);

  if (result.affected === 0) {
    throw new NotFoundException(`Assignment with ID ${id} not found`);
  }
}
}