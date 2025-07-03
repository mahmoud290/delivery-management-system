import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { Repository } from "typeorm";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { User } from "../users/user.entity";

@Injectable()
export class OrdersService{
    constructor(
        @InjectRepository(Order)
        private orderRepository:Repository<Order>
    ){}

    async createOrder(dto:CreateOrderDto, client:User):Promise<Order>{
        const order = this.orderRepository.create({
            ...dto,
            status:'pending',
            client,
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

async update(id: number, dto: Partial<CreateOrderDto>):Promise<Order>{
    const order = await this.findOne(id);

    Object.assign(order, dto);

    return this.orderRepository.save(order);
}
async delete(id: number): Promise<void> {
const result = await this.orderRepository.delete(id);

if (result.affected === 0) {
    throw new NotFoundException(`Order with id ${id} not found`);
}
}
}