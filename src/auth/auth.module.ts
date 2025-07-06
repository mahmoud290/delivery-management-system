import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports:[TypeOrmModule.forFeature([User]),
JwtModule.register({
    secret:  process.env.JWT_SECRET, 
    signOptions: { expiresIn: '1h' },
}),
],
controllers:[AuthController],
providers:[AuthService, JwtStrategy],
exports:[JwtStrategy]
})
export class AuthModule{}