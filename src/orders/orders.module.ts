import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { DeliveryAssignment } from "../deliveryAssignment/delivery-assignment.entity";

@Module({
    imports:[TypeOrmModule.forFeature([Order,DeliveryAssignment])],
    providers:[OrdersService],
    controllers:[OrdersController],
})
export class OrdersModule{}