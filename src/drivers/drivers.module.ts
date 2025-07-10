import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryDriver } from './driver.entity';
import { User } from '../users/user.entity';

@Module({
    imports:[TypeOrmModule.forFeature([DeliveryDriver,User])],
    providers:[DriversService],
    controllers:[DriversController],
    exports:[TypeOrmModule],
})
export class DriversModule{}