import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../users/user.entity';


export class SignupDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
  
  @IsEnum(UserRole)
  role!: UserRole;
}

export class SigninDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
