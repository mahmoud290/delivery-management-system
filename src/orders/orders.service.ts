import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus } from "./order.entity";
import { Repository } from "typeorm";
import { CreateOrderDto } from "./dtos/create-order.dto"; 
import { User } from "../users/user.entity";
import { DeliveryAssignment } from "../delivery-assignments/delivery-assignment.entity";

@Injectable()
export class OrdersService{
    constructor(
        @InjectRepository(Order)
        private orderRepository:Repository<Order>,

        @InjectRepository(DeliveryAssignment)
        private readonly assignmentRepository:Repository<DeliveryAssignment>,
    ){}

    async createOrder(dto:CreateOrderDto, client:User):Promise<Order>{
        const order = this.orderRepository.create({
            ...dto,
            status: OrderStatus.PENDING,
            client: client,
        });
        return this.orderRepository.save(order);
    }

    async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
}

async findOne(id:number):Promise<Order>{
    const order =await this.orderRepository.findOne({
        where:{id},
        relations:['client','driver'],
    });

    if(!order){
        throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
}

async updateOrderStatus(orderId: number, status: OrderStatus, driverId: number): Promise<Order> {
  const order = await this.orderRepository.findOne({
    where: { id: orderId },
    relations: ['assignments', 'assignments.driver'],
  });

  if (!order) throw new NotFoundException('Order not found');

const assignment = order.assignments.find(
  a => a.driver.user.id === driverId,
);
  if (!assignment) throw new ForbiddenException('Not your order');

  order.status = status;

  const now = new Date();
  if (status === OrderStatus.IN_TRANSIT) {
    assignment.pickedUpAt = now;
  } else if (status === OrderStatus.DELIVERED) {
    assignment.deliveredAt = now;
  }

  await this.assignmentRepository.save(assignment);
  return this.orderRepository.save(order);
}

async getOrdersForDriver(driverId: number): Promise<Order[]> {
  return this.orderRepository
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.client', 'client')
    .leftJoinAndSelect('order.assignments', 'assignment')
    .leftJoinAndSelect('assignment.driver', 'driver')
    .leftJoinAndSelect('driver.user', 'user')
    .where('user.id = :driverId', { driverId })
    .getMany();
}


async delete(id: number): Promise<void> {
const result = await this.orderRepository.delete(id);

if (result.affected === 0) {
    throw new NotFoundException(`Order with id ${id} not found`);
}
}
}