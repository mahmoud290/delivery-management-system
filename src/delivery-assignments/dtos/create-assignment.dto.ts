import { IsNumber } from 'class-validator';

export class CreateAssignmentDto {
  @IsNumber()
  orderId!: number;

  @IsNumber()
  driverId!: number;
}
