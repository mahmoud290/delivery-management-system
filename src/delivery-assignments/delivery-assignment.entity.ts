import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { DeliveryDriver } from '../drivers/driver.entity'; 
import { Order } from '../orders/order.entity'; 

export type DeliveryStatus = 'assigned' | 'picked_up' | 'in_transit' | 'delivered';

@Entity()
export class DeliveryAssignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => DeliveryDriver, (driver) => driver.assignments)
  driver!: DeliveryDriver;

  @ManyToOne(() => Order, (order) => order.assignments)
  order!: Order;

  @Column({ type: 'varchar' })
  status!: DeliveryStatus;

  @CreateDateColumn()
  assignedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  pickedUpAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt!: Date;
}
