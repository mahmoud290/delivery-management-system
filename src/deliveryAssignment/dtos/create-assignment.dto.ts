import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @Type(() => Number)
  @IsNumber()
  orderId!: number;

  @Type(() => Number)
  @IsNumber()
  driverId!: number;
}
