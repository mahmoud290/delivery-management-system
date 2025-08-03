import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
    console.log('✅ JWT Secret in strategy:', configService.get<string>('JWT_SECRET'));
  }

  async validate(payload: { sub: number; role: string }) {
    console.log('✅ Inside JwtStrategy.validate()');
  return { 
    id: payload.sub,
    role: payload.role }; 
  }
}
