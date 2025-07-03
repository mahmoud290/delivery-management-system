import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryDriver } from './driver.entity'; 
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateDriverDto } from './dtos/create-driver.dto';


@Injectable()
export class DriversService{
    constructor(
        @InjectRepository(DeliveryDriver)
        private driversRepository:Repository<DeliveryDriver>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    async createDriver(dto: CreateDriverDto): Promise<DeliveryDriver> {
    const user = await this.userRepository.findOneBy({ id: dto.userId });
    if (!user) {
        throw new NotFoundException(`User with id ${dto.userId} not found`);
    }

    const driver = this.driversRepository.create({
    user,
    status: dto.status,
    });

    return this.driversRepository.save(driver);
}

    async findAll():Promise<DeliveryDriver[]>{
        return this.driversRepository.find({ relations: ['user'] });
    }

    async findOne(id:number):Promise<DeliveryDriver>{
        const driver = await this.driversRepository.findOne({
            where:{id},
            relations:['user'],
        });
        if(!driver){
            throw new NotFoundException(`Driver with id ${id} not found`);
        }

        return driver;
    }

    async updateStatus(id: number, status: string): Promise<DeliveryDriver> {
    const driver = await this.findOne(id);
    driver.status = status as any;
    return this.driversRepository.save(driver);
}

async deleteDriver(id: number): Promise<void> {
const result = await this.driversRepository.delete(id);

if (result.affected === 0) {
    throw new NotFoundException(`Driver with id ${id} not found`);
}
}
}