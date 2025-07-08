import {Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { Order, OrderStatus } from "./order.entity";
import { User } from "../users/user.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";
import { Request } from 'express';
@Controller('orders')
export class OrdersController{
    constructor(
        private readonly ordersService:OrdersService
    ){}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('client')
    async createOrder(
        @Body() dto:CreateOrderDto,
        @Req() req: Request,
    ):Promise<Order>{
        const user = req.user; 
        return this.ordersService.createOrder(dto, user as User);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async getAllOrders(): Promise<Order[]> {
    return this.ordersService.findAll();
}

@Get(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'client', 'driver')
async getOrderById(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(+id);
}


@Get('drivers/me/orders')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Roles('driver')
getMyOrders(@Req() req: Request) {
    const driver = req.user as any; 
    return this.ordersService.getOrdersForDriver(driver.id);
}

@Patch(':id/status')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('driver') 
async updateStatus(
@Param('id') id: string,
@Body('status') status: OrderStatus,
@Req() req: Request,
): Promise<Order> {
const user = req.user as any; 
return this.ordersService.updateOrderStatus(+id, status, user.id);
}

@Delete(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
async deleteOrder(@Param('id') id: string): Promise<{ message: string }> {
    await this.ordersService.delete(+id);
    return { message: `Order with id ${id} has been deleted` };
}
}