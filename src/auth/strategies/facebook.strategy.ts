import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy,'facebook'){
    constructor(private readonly configService:ConfigService){
        super({
            clientID: configService.get<string>('FACEBOOK_APP_ID')!, 
            clientSecret: configService.get<string>('FACEBOOK_APP_SECRET')!,
            callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL')!,
            scope: ['email'],
            profileFields: ['id', 'displayName', 'emails'],
        });
    }

    async validate(
        accessToken:string,
        refreshToken:string,
        profile:Profile,
    ): Promise<any>{
        const{id,displayName,emails} = profile;
        const user = {
            facebook:id,
            name:displayName,
            email:emails?.[0]?.value,
        };
        return user;
    }
}