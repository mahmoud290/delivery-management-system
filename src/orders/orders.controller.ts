import {Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { Order } from "./order.entity";
import { User } from "../users/user.entity";

@Controller('orders')
export class OrdersController{
    constructor(
        private readonly ordersService:OrdersService
    ){}

    @Post()
    async createOrder(
        @Body() dto:CreateOrderDto
    ):Promise<Order>{
        const dummyUser = new User();
    dummyUser.id = 1; 
    return this.ordersService.createOrder(dto, dummyUser);
    }

    @Get()
    async getAllOrders(): Promise<Order[]> {
    return this.ordersService.findAll();
}

@Get(':id')
async getOrderById(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(+id);
}

@Put(':id')
async updateOrder(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOrderDto>,
): Promise<Order> {
    return this.ordersService.update(+id, dto);
}

@Delete(':id')
async deleteOrder(@Param('id') id: string): Promise<{ message: string }> {
    await this.ordersService.delete(+id);
    return { message: `Order with id ${id} has been deleted` };
}
}