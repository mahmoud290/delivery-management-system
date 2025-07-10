import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../orders/order.entity';
import { DeliveryDriver } from '../drivers/driver.entity';

@Entity()
export class DeliveryAssignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, { eager: true, onDelete:'CASCADE' })
  order!: Order;

  @ManyToOne(() => DeliveryDriver, { eager: true ,onDelete: 'CASCADE'})
  driver!: DeliveryDriver;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  pickedUpAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;
}
