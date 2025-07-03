import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";

@Controller('users')
export class UsersController{
    constructor(private readonly usersService:UsersService){}

    @Post()
    async create(@Body() dto:CreateUserDto):Promise<User>{
        return this.usersService.createUser(dto);
    }

    @Get()
    async getAllUsers():Promise<User[]>{
        return this.usersService.findAll();
    }

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
}

    @Put(':id')
    async updateUser(
        @Param('id') id:string,
        @Body() dto:Partial<CreateUserDto>,
    ):Promise<User>{
        return this.usersService.updateUser(+id,dto);
    }

    @Delete(':id')
    async removeUser(@Param('id') id:string):Promise<{message:string}>{
        await this.usersService.deleteUser(+id)
        return { message: `User with id ${id} has been deleted` };
    }
}