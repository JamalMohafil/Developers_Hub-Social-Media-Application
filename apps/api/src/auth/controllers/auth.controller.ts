import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  Request,
  Res,
  Response,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VerifyEmailDto } from '../dto/email-verify.dto';
import { GoogleAuthGuard } from '../guards/google-auth/google-auth.guard';
import { Public } from '../decoratores/public.decorator';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { TokenService } from '../services/token.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LocalAuthGuard } from '../guards/local-auth/local-auth.guard';
import { Roles } from '../decoratores/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { RefreshAuthGuard } from '../guards/refresh-auth/refresh-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { UserAuthService } from '../services/user-auth.service';
import { PasswordService } from '../services/password.service';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { CheckUserGuard } from '../guards/check-user/check-user.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly userAuthService: UserAuthService,
    private readonly passwordService: PasswordService,
  ) {}

  @Public()
  @Post('signup')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }

  @Public()
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  login(@Req() req) {
    return this.authService.sendLogin(req);
  }
  @Public()
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Response() res) {
    return this.authService.sendGoogleCallback(req, res);
  }

  @Get('signout')
  async signout(@Req() req) {
    return await this.authService.signout(req.user.id);
  }

  @Public()
  @UseInterceptors(TransformInterceptor)
  @Get('allUsers')
  async getAllUsers() {
    return this.userAuthService.getAll();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('protected')
  getAll(@Request() req) {
    return {
      messege: `Now you can access this protected API. this is your user ID: ${req.user.id}`,
    };
  }

  @Get('me')
  // @RateLimit('me', 5000, 300)
  async getMe(@Req() req) {
    return await this.userAuthService.getMe(req.user.id);
  }



  // @Get('refresh')
  // @UseGuards(RefreshAuthGuard)
  // refreshToken(@Req() req) {
  //   return this.tokenService.refreshToken(req.user.id, req.user.username);
  // }

  @Post('send-otp')
  async sendOtp(@Body() { userId }: { userId: string }) {
    return this.emailService.sendOtp(userId);
  }

  @Post('verify-email')
  verifyOtp(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.emailService.verifyEmail(
      verifyEmailDto.id,
      verifyEmailDto.code,
    );
  }

  @Public()
  @Post('reset-password-request')
  async requestResetPassword(@Body() { email }: { email: string }) {
    return this.passwordService.requestResetPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body() { newPassword }: { newPassword: string },
  ) {
    // return newPassword
    return this.passwordService.resetPassword(token, newPassword);
  }
}
