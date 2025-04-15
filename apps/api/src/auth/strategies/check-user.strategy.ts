import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { TokenService } from '../services/token.service';
import { Request } from 'express';

@Injectable()
export class CheckUserStrategy extends PassportStrategy(
  Strategy,
  'check-user',
) {
  constructor(
    @Inject(jwtConfig.KEY) jwtConfiguration: ConfigType<typeof jwtConfig>,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfiguration.secret,
      passReqToCallback: true,
      // استخدام خيار لتجاهل عدم وجود توكن
      // هذا لن يعمل بشكل مباشر مع passport-jwt، لذلك سنحتاج إلى guard مخصص
    });
  }

  async validate(req: Request, payload: AuthJwtPayload) {
    // هذه الدالة لن يتم استدعاؤها إلا إذا كان هناك توكن صالح
    const userId = payload.sub;
    try {
      return await this.tokenService.validateJwtUser(userId);
    } catch (error) {
      return null;
    }
  }
}
