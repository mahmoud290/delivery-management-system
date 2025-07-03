import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity'; 
import { DeliveryAssignment } from '../delivery-assignments/delivery-assignment.entity';

export type OrderStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  pickupLocation!: string;

  @Column()
  dropoffLocation!: string;

  @Column()
  packageSize!: string;

  @Column({ default: 'pending' })
  status!: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  client!: User;

  @ManyToOne(() => User, { nullable: true })   
  driver?: User;

  @OneToMany(() => DeliveryAssignment, (assignment) => assignment.order)
  assignments!: DeliveryAssignment[];
}
