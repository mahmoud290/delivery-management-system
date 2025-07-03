import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './database/typeorm.config';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { DriversModule } from './drivers/drivers.module';
import { DeliveryAssignmentModule } from './delivery-assignments/delivery-assignment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    UsersModule,
    OrdersModule,
    DriversModule,
    DeliveryAssignmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
