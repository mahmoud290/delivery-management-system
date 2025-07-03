import { IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  pickupLocation!: string;

  @IsString()
  dropoffLocation!: string;

  @IsString()
  packageSize!: string;
}
