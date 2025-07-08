import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { DeliveryAssignment } from '../delivery-assignments/delivery-assignment.entity';

export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders') // optional
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  pickupLocation!: string;

  @Column()
  dropoffLocation!: string;

  @Column()
  packageSize!: string;

  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  client!: User;

  @ManyToOne(() => User, (user) => user.deliveries, { nullable: true })
  driver?: User;

  @OneToMany(() => DeliveryAssignment, (assignment) => assignment.order)
  assignments!: DeliveryAssignment[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;
}
