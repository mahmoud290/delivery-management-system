import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeliveryAssignment } from "./delivery-assignment.entity";
import { DeliveryDriver } from "../drivers/driver.entity";
import { Order } from "../orders/order.entity";
import { DeliveryAssignmentService } from "./delivery-assignment.service";
import { DeliveryAssignmentController } from "./delivery-assignment.controller";
import { DriversModule } from "src/drivers/drivers.module";

@Module({
    imports:[TypeOrmModule.forFeature([DeliveryAssignment,DeliveryDriver,Order]),
DriversModule,
],
    providers:[DeliveryAssignmentService],
    controllers:[DeliveryAssignmentController],
})
export class DeliveryAssignmentModule{}