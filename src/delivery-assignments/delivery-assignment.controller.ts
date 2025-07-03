import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { DeliveryAssignmentService } from "./delivery-assignment.service";
import { CreateAssignmentDto } from "./dtos/create-assignment.dto";
import { DeliveryAssignment } from "./delivery-assignment.entity";
import { UpdateAssignmentStatusDto } from "./dtos/update-assignment.dto";

@Controller('assignments')
export class DeliveryAssignmentController{
    constructor(
        private readonly assignmentService:DeliveryAssignmentService){}

        @Post()
        async assign (@Body() dto:CreateAssignmentDto):Promise<DeliveryAssignment>{
            return this.assignmentService.assignDriverToOrder(dto.orderId,dto.driverId);
        }

        @Get()
        async getAll():Promise<DeliveryAssignment[]>{
            return this.assignmentService.getAssignments();
        }

        @Get(':id')
        async getById(@Param('id') id: string): Promise<DeliveryAssignment> {
        return this.assignmentService.getAssignmentById(+id);
}

        @Patch(':id/status')
        async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateAssignmentStatusDto,
        ): Promise<DeliveryAssignment> {
        return this.assignmentService.updateStatus(+id, dto);
}

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.assignmentService.deleteAssignment(+id);
    return { message: `Assignment with ID ${id} has been deleted` };
}
}