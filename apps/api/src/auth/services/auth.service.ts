import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Role } from '@prisma/client';
import { hash, verify } from 'argon2';
import { TokenService } from './token.service';
import { CreateOAuthUserDto } from '../dto/create-oauth-user';
import { LoginDto } from '../dto/login.dto';
import { Response } from 'express';
import mainConfig from 'src/common/config/main.config';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from 'src/user/user.repository';
@Injectable()
export class AuthService {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    @Inject(mainConfig.KEY)
    private readonly mainConfiguration: ConfigType<typeof mainConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findByEmail(createUserDto.email);
    if (user) throw new UnauthorizedException('User already exists'); // تحقق إذا كان اسم المستخدم موجودًا مسبقًا في قاعدة البيانات
    await this.userRepository.checkUsernameAvailability(createUserDto.username);

    const createdUser = await this.userAuthService.create(createUserDto);
    const { accessToken } = await this.tokenService.generateTokens(
      createdUser.id,
    );
    // const hashedRT = await hash(refreshToken);
    // await this.tokenService.updateHashedRefreshToken(createdUser.id, hashedRT);
    return {
      user: {
        name: createdUser.name,
        id: createdUser.id,
        email: createUserDto.email,
        username: createdUser.username,
        role: createdUser.role,
        emailVerified: false,
      },
      accessToken,
      // refreshToken,
    };
  }

  async validateLocalUser(email: string, password: string) {
    const findUser = await this.userRepository.findByEmail(email);
    if (!findUser) throw new UnauthorizedException('User not found');

    // التحقق إذا كانت كلمة المرور فارغة أو غير صحيحة
    if (password === '' || password.trim() === '') {
      throw new UnauthorizedException('Please provide your password');
    }

    // إذا كان المستخدم مسجلاً عبر جوجل ولا يوجد كلمة مرور محلية
    if (findUser.oauthId && (!findUser.password || findUser.password === '')) {
      throw new UnauthorizedException(
        'This account was registered via Google. Please sign in with Google.',
      );
    }

    // التأكد من أن password موجودة وبالتنسيق الصحيح قبل محاولة التحقق منها
    if (findUser.password) {
      try {
        // تحقق مما إذا كانت كلمة المرور بالتنسيق الصحيح (تبدأ بـ $)
        if (!findUser.password.startsWith('$')) {
          throw new UnauthorizedException(
            'Invalid password format. Please reset your password or sign in with Google.',
          );
        }

        const isPasswordMatched = await verify(findUser.password, password);

        if (!isPasswordMatched) {
          throw new UnauthorizedException('Invalid Credentials');
        }

        return {
          id: findUser.id,
          username: findUser.username,
          email: findUser.email,
          role: findUser.role,
          name: findUser.name,
          emailVerified: findUser.emailVerified,
        };
      } catch (error) {
        console.error('Password verification error:', error);
        throw new UnauthorizedException(
          'Authentication failed. Please try again or use Google sign-in.',
        );
      }
    } else {
      throw new UnauthorizedException('Invalid Credentials');
    }
  }
  async login({
    userId,
    username,
    role,
    name,
    emailVerified,
    email,
    oauthId,
    image,
  }: LoginDto) {
    const { accessToken } = await this.tokenService.generateTokens(userId);
    // const hashedRT = await hash(refreshToken);
    // await this.tokenService.updateHashedRefreshToken(userId, hashedRT);

    return {
      user: {
        id: userId,
        username,
        role,
        name,
        emailVerified,
        email,
        oauthId,
        image,
      },
      accessToken,
      // refreshToken,
    };
  }
  async sendLogin(req: any) {
    const loginDto: LoginDto = {
      userId: req.user.id,
      username: req.user.username, // أو يمكنك تعيين القيمة الفارغة أو قيمة من req.user إذا كانت موجودة
      role: req.user.role,
      name: req.user.name,
      emailVerified: req.user.emailVerified,
      email: req.user.email,
      oauthId: req.user.oauthId,
    };
    return this.login(loginDto);
  }
  async validateGoogleUser(googleUser: CreateOAuthUserDto) {
    const user = await this.userRepository.findByEmail(googleUser.email);
    if (!user) return this.userAuthService.createOAuthUser(googleUser);
    if (user && !user.oauthId)
      return this.userAuthService.update(user.id, {
        oauthId: googleUser.oauthId,
      });
    return user;
  }
  async sendGoogleCallback(req: any, res: Response) {
    const loginDto: LoginDto = {
      userId: req.user.id,
      username: req.user.username, // أو يمكنك تعيين القيمة الفارغة أو قيمة من req.user إذا كانت موجودة
      role: req.user.role,
      name: req.user.name,
      emailVerified: req.user.emailVerified,
      email: req.user.email,
      oauthId: req.user.oauthId,
      image: req.user.image,
    };
    const response = await this.login(loginDto);
    res.redirect(
      `${this.mainConfiguration.FRONTEND_URL}/api/auth/google/callback?email=${response.user.email}&oauthId=${response.user.oauthId}&userId=${response.user.id}&role=${response.user.role}&displayName=${response.user.name || null}&username=${response.user.username || null}&accessToken=${response.accessToken}&image=${response.user.image || null}`,
    );
  }
  async signout(userId: string) {
    // return await this.tokenService.updateHashedRefreshToken(userId, null);
  }
}
