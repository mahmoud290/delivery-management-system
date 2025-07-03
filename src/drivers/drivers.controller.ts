import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { DriversService } from "./drivers.service";
import { DeliveryDriver } from "./driver.entity";
import { CreateDriverDto, DriverStatus } from "./dtos/create-driver.dto";

@Controller('drivers')
export class DriversController{
    constructor(private readonly driversService:DriversService){}


    @Post()
    createDriver(@Body() dto: CreateDriverDto): Promise<DeliveryDriver> {
    return this.driversService.createDriver(dto);
}

    @Get()
    async getAllDrivers():Promise<DeliveryDriver[]> {
        return this.driversService.findAll();
    }
    @Get(':id')
    async getDriverById(@Param('id') id: string): Promise<DeliveryDriver> {
    return this.driversService.findOne(+id);
}

@Patch(':id/status')
updateDriverStatus(
    @Param('id') id: string,
    @Body('status') status: DriverStatus,
): Promise<DeliveryDriver> {
    return this.driversService.updateStatus(+id, status);
}
@Delete(':id')
async removeDriver(@Param('id') id: string): Promise<{ message: string }> {
await this.driversService.deleteDriver(+id);
return { message: `Driver with id ${id} has been deleted` };
}
}