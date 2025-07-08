import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { RolesGuard } from "./guards/roles.guard";
import { PassportModule } from "@nestjs/passport";

@Module({
    imports:[
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
JwtModule.register({
    secret:  process.env.JWT_SECRET, 
    signOptions: { expiresIn: '1h' },
}),
],
controllers:[AuthController],
providers:[AuthService, JwtStrategy,RolesGuard],
exports:[JwtStrategy]
})
export class AuthModule{}