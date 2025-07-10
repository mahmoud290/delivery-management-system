import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import {  ConfigService } from "@nestjs/config";
import { RolesGuard } from "./guards/roles.guard";
import { PassportModule } from "@nestjs/passport";
import { DeliveryDriver } from "src/drivers/driver.entity";
import { DriversModule } from "src/drivers/drivers.module";

@Module({
    imports:[
        TypeOrmModule.forFeature([User,DeliveryDriver]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
JwtModule.registerAsync({
useFactory: (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '1h' },
}),
inject: [ConfigService],
}),
DriversModule,
],
controllers:[AuthController],
providers:[AuthService, JwtStrategy,RolesGuard],
exports:[JwtStrategy]
})
export class AuthModule{}