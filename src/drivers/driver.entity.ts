import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { DriverStatus } from './dtos/create-driver.dto';
import { DeliveryAssignment } from '../deliveryAssignment/delivery-assignment.entity';

@Entity()
export class DeliveryDriver {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User,{ onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  user!: User;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.AVAILABLE,
  })
  status!: DriverStatus;

  @OneToMany(() => DeliveryAssignment, (assignment) => assignment.driver)
  assignments!: DeliveryAssignment[];
}
