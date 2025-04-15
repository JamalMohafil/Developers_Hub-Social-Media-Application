import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { TokenService } from '../services/token.service';
 
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY) jwtConfigu: ConfigType<typeof jwtConfig>,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfigu.secret as string,
      ignoreExpiration: false,
    });
  }
  async validate(payload: AuthJwtPayload) {
    const userId = payload.sub;
    const res = await this.tokenService.validateJwtUser(userId);
    return res;
  }
}
