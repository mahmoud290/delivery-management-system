import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { SigninDto, SignupDto } from './auth.dto';
@Injectable()
export class AuthService{
    constructor(
        @InjectRepository(User)
        private userRepository:Repository<User>,
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
}