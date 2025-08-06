import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesService } from "./files.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin') 
@Controller('file')
export class FilesController{
constructor(private readonly filesService:FilesService){}

@Post('write')
async writeToFile(@Body('data') data:string){
    await this.filesService.writeToFile(data);
    return { message: 'Data written to file successfully' };
}
@Get('read')
async readFromFile(){
    const content = await this.filesService.readFromFile();
    return {content};
}

@Post('upload')
@UseInterceptors(
    FileInterceptor('file',{
        storage:diskStorage({
            destination:'./uploads',
            filename:(req,file,cb)=>{
                cb(null,file.originalname)
            },
        }),
    }),
)

uploadfile(@UploadedFile() file:Express.Multer.File){
    return {
        message:'File uploaded successfully',
        filename: file.originalname,
    };
}

@Get('download/:filename')
async downloadFile(@Param('filename') filename:string, @Res() res:Response){
    const filePath= path.join(process.cwd(),'uploads',filename);

    if(fs.existsSync(filePath)){
        return res.download(filePath);
    }else{
            return res.status(404).json({ message: 'File not found' });

    }
    }
        }