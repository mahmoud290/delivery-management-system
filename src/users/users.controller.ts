import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    UseGuards
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";

@Controller('users')
export class UsersController{
    constructor(private readonly usersService:UsersService){}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async create(@Body() dto:CreateUserDto):Promise<User>{
        return this.usersService.createUser(dto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async getAllUsers():Promise<User[]>{
        return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
}

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async updateUser(
        @Param('id') id:string,
        @Body() dto:Partial<CreateUserDto>,
    ):Promise<User>{
        return this.usersService.updateUser(+id,dto);
    }

    
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async removeUser(@Param('id') id:string):Promise<{message:string}>{
        await this.usersService.deleteUser(+id)
        return { message: `User with id ${id} has been deleted` };
    }
}