import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create-user.dto";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    async findAll():Promise<User[]>{
        return this.userRepository.find();
    }

    async createUser(dto:CreateUserDto):Promise<User>{
        const user = this.userRepository.create(dto);
        return this.userRepository.save(user);
    }

    async findOne(id:number):Promise<User>{
        const user = await this.userRepository.findOneBy({id});
        if(!user){
            throw new NotFoundException(`User with id ${id} not found`);
        }
            return user;
    }

    async updateUser(id:number, dto:Partial<CreateUserDto>):Promise<User>{
        const user = await this.userRepository.findOneBy({id});

        if(!user){
            throw new NotFoundException(`User with id ${id} not found`);
        }
        const updateUser = Object.assign(user,dto);
        return this.userRepository.save(updateUser);
    }

    async deleteUser(id: number): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
    throw new NotFoundException(`User with id ${id} not found`);
    }

    return { message: `User with id ${id} has been deleted` };
}
}
