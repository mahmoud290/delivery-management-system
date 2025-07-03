import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { DeliveryDriver } from '../drivers/driver.entity';
import * as dotenv from 'dotenv';
import { DeliveryAssignment } from '../delivery-assignments/delivery-assignment.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Order, DeliveryDriver,DeliveryAssignment],
  synchronize: true,
});
