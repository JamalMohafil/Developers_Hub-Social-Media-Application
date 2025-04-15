import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import refreshConfig from '../config/refresh.config';
import { Request } from 'express';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshConfig.KEY)
    refreshConfiguration: ConfigType<typeof refreshConfig>,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshConfiguration.secret as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const { sub: userId } = payload;
    // Extract the token from Authorization header instead of cookies
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader ? authHeader.split(' ')[1] : '';
 

    return this.tokenService.validateRefreshToken(userId, refreshToken);
  }
}
