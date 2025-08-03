import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy,'linkedin'){
    constructor(private readonly authService:AuthService,
        private configService: ConfigService,
    ){
        super({
        clientID: configService.get<string>('LINKEDIN_CLIENT_ID')!,
            clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL')!,
            scope: ['r_emailaddress', 'r_liteprofile'],
        });
    }

    async validate(accessToken: string, _refreshToken: string, profile: any) {
    const { id, emails, displayName, photos } = profile;

    const user = {
        name:displayName,
        email:emails?.[0]?.value,
        profileImage:photos?.[0]?.value,
    };

    const data = await this.authService.handleLinkedinRedirect(user, 'linkedin');
    return {
        access_token: data.accessToken,
        user: data.user,
    };
}
}