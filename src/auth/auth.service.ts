import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { SigninDto, SignupDto } from './auth.dto';
import { DeliveryDriver } from 'src/drivers/driver.entity';
import { UserRole } from 'src/users/user-role.enum';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService{
    constructor(
        @InjectRepository(User)
        private userRepository:Repository<User>,

        @InjectRepository(DeliveryDriver)
        private driverRepository: Repository<DeliveryDriver>,

        private usersService: UsersService,
        private jwtService:JwtService
    ){}

    async signup(dto:SignupDto){
        const existingUser = await this.userRepository.findOneBy({ email: dto.email });
if (existingUser) {
    throw new BadRequestException('Email is already in use');
}

        const hashed = await bcrypt.hash(dto.password,10) 
        const user = this.userRepository.create({...dto,password:hashed});
        await this.userRepository.save(user);

        if (user.role === UserRole.DRIVER) {
    const deliveryDriver = this.driverRepository.create({ user });
    await this.driverRepository.save(deliveryDriver);
}

        return { message: 'Signup successful' };
    }

    async signin(dto:SigninDto){
        const user = await this.userRepository.findOneBy({email:dto.email});
        if(!user) throw new UnauthorizedException('Invalid credentials');

        const match = await bcrypt.compare(dto.password,user.password);
        if(!match) throw new UnauthorizedException('Invalid credentials');

        const payload = {sub:user.id,role:user.role};
        const token = await this.jwtService.signAsync(payload);

        return { access_token: token };
    }

    googleAuth(req: Request) {
    return { message: 'Redirecting to Google...' };
}

async handleGoogleRedirect(req:any){
    const googleUser = req.user;

    if(!googleUser || !googleUser.email){
        throw new UnauthorizedException('No Google user data found');
    }

    let user = await this.userRepository.findOne({where:{email:googleUser.email}});

    if (!user) {
    user = this.userRepository.create({
    email: googleUser.email,
    name: googleUser.name,
    profileImage: googleUser.picture,
    role: UserRole.CLIENT,
    });

    await this.userRepository.save(user);
}
const payload = { sub: user.id, role: user.role };
const token = await this.jwtService.signAsync(payload);

return {
    message: 'Google login successful',
    access_token: token,
    user,
};
}
LinkedinAuth(req: Request) {
    return { message: 'Redirecting to Linkedin...' };
}
async handleLinkedinRedirect(profile:any , provider:any){
    let user = await this.usersService.findByEmail(profile.email);
    
    if (!user) {
    user = await this.usersService.createUser({
        name: profile.name,
        email: profile.email,
        profileImage: profile.profileImage,
        password: '', 
        role: UserRole.CLIENT,
    });
    }

    const payload = {
    sub: user.id,
    role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
}
}