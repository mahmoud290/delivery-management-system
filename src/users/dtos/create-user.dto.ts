import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  
@IsEnum(UserRole)
role!: UserRole;
}
