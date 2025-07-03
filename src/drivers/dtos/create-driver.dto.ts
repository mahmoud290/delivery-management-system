import { IsEnum, IsNumber } from 'class-validator';

export enum DriverStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
}

export class CreateDriverDto {
  @IsNumber()
  userId!: number;

  @IsEnum(DriverStatus)
  status!: DriverStatus;
}
