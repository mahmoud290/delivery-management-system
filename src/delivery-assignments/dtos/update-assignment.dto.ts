import { IsEnum } from 'class-validator';

export enum DeliveryStatus {
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
}

export class UpdateAssignmentStatusDto {
  @IsEnum(DeliveryStatus)
  status!: DeliveryStatus;
}
