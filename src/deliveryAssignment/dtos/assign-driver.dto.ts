import { IsInt, IsPositive } from 'class-validator';

export class AssignDriverDto {
  @IsInt()
  @IsPositive()
  orderId!: number;

  @IsInt()
  @IsPositive()
  driverId!: number;
}
