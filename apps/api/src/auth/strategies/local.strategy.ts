import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class localStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  // request.user
  validate(email: string, password: string) {
    if (!password || password === '' || password.trim() === '') {
      throw new UnauthorizedException('Please provide your password');
    }
    return this.authService.validateLocalUser(email, password);
  }
}
