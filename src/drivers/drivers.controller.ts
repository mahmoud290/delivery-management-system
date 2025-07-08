import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { DriversService } from "./drivers.service";
import { DeliveryDriver } from "./driver.entity";
import { CreateDriverDto, DriverStatus } from "./dtos/create-driver.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";

@Controller('drivers')
export class DriversController{
    constructor(private readonly driversService:DriversService){}


    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    createDriver(@Body() dto: CreateDriverDto): Promise<DeliveryDriver> {
    return this.driversService.createDriver(dto);
}

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async getAllDrivers():Promise<DeliveryDriver[]> {
        return this.driversService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin','driver')
    async getDriverById(@Param('id') id: string): Promise<DeliveryDriver> {
    return this.driversService.findOne(+id);
}

@Patch(':id/status')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
updateDriverStatus(
    @Param('id') id: string,
    @Body('status') status: DriverStatus,
): Promise<DeliveryDriver> {
    return this.driversService.updateStatus(+id, status);
}

@Delete(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
async removeDriver(@Param('id') id: string): Promise<{ message: string }> {
await this.driversService.deleteDriver(+id);
return { message: `Driver with id ${id} has been deleted` };
}
}