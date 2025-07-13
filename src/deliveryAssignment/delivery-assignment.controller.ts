import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { DeliveryAssignmentService } from "./delivery-assignment.service";
import { CreateAssignmentDto } from "./dtos/create-assignment.dto";
import { DeliveryAssignment } from "./delivery-assignment.entity";
import { UpdateAssignmentStatusDto } from "./dtos/update-assignment.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";

@Controller('assignments')
export class DeliveryAssignmentController{
    constructor(
        private readonly assignmentService:DeliveryAssignmentService){}

        @Post()
        @UseGuards(AuthGuard('jwt'), RolesGuard)
        @Roles('admin')
        async assign (@Body() dto:CreateAssignmentDto):Promise<DeliveryAssignment>{
            return this.assignmentService.assignDriverToOrder(dto.orderId,dto.driverId);
        }

        @Get()
        @UseGuards(AuthGuard('jwt'), RolesGuard)
        @Roles('admin')
        async getAll():Promise<DeliveryAssignment[]>{
            return this.assignmentService.getAssignments();
        }

        @Get(':id')
        @UseGuards(AuthGuard('jwt'), RolesGuard)
        @Roles('admin', 'driver', 'client')
        async getById(@Param('id') id: string): Promise<DeliveryAssignment> {
        return this.assignmentService.getAssignmentById(+id);
}

        @Patch(':id/status')
        @UseGuards(AuthGuard('jwt'), RolesGuard)
        @Roles('driver')
        async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateAssignmentStatusDto,
        ): Promise<DeliveryAssignment> {
        return this.assignmentService.updateStatus(+id, dto);
}

        @Delete(':id')
        @UseGuards(AuthGuard('jwt'), RolesGuard)
        @Roles('admin')
        async delete(@Param('id') id: string): Promise<{ message: string }> {
        await this.assignmentService.deleteAssignment(+id);
        return { message: `Assignment with ID ${id} has been deleted` };
}
}