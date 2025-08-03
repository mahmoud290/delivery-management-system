import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SigninDto, SignupDto } from "./auth.dto";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from 'express';
interface LinkedInUser {
access_token: string;
user: any;
}

@Controller('auth')
export class AuthController{
    constructor(private authService:AuthService){}

    @Post('signup')
    signup(@Body() dto:SignupDto){
        return this.authService.signup(dto);
    }

    @Post('signin')
    signin(@Body() dto:SigninDto){
        return this.authService.signin(dto);
    }

@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth(@Req() req:Request) {
return this.authService.googleAuth(req);
}

@Get('google/redirect')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req:Request) {
return this.authService.handleGoogleRedirect(req);
}

@Get('linkedin')
@UseGuards(AuthGuard('linkedin'))
async linkedinLogin(@Req() req:Request) {
    return this.authService.LinkedinAuth(req);

}

@Get('linkedin/redirect')
@UseGuards(AuthGuard('linkedin'))
async linkedinRedirect(@Req() req:Request, @Res() res:Response) {
    const { access_token, user } = req.user as LinkedInUser;

    return res.json({
    message: 'LinkedIn login successful',
    access_token,
    user,
    });
}
}
