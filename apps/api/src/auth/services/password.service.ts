import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserAuthService } from './user-auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { hash } from 'argon2';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import mainConfig from 'src/common/config/main.config';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class PasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAuthService: UserAuthService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    @Inject(mainConfig.KEY)
    private readonly mainConfiguration: ConfigType<typeof mainConfig>,
  ) {}

  async requestResetPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User Not Found');

    // التحقق مما إذا كان لدى المستخدم `resetToken` موجود مسبقًا
    user.resetToken &&
      (await this.tokenService.checkResetPasswordToken(user.resetToken));

    // إنشاء رمز إعادة تعيين جديد
    const token = await this.tokenService.generateResetToken(user.id);

    // تحديث المستخدم بالتوكن الجديد

    await this.userAuthService.updateResetToken(user.id, token);
    // إنشاء رابط إعادة تعيين كلمة المرور
    const resetLink = `${this.mainConfiguration.FRONTEND_URL}/reset-password/token?token=${token}`;

    // إرسال البريد الإلكتروني
    try {
      await this.emailService.sendResetPasswordEmail(user.email, resetLink);

      return {
        statusCode: HttpStatus.OK, // أو HttpStatus.ACCEPTED إذا كنت تفضل ذلك
        message: 'Check your email to reset your password',
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      await this.userAuthService.updateResetToken(user.id, null);

      if (error.code === 'ECONNRESET') {
        throw new HttpException(
          'Connection to mail server was reset. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // احذف التوكن إذا فشل إرسال البريد
      await this.userAuthService.updateResetToken(user.id, null);

      throw new HttpException(
        'Failed to send reset email. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async resetPassword(token: string, newPassword: string) {
    // try {
    const { userId } = await this.jwtService.verify(token);
    const user = await this.userRepository.findUserById(userId);

    if (!user || user.resetToken !== token) {
      throw new BadRequestException(`Invalid or expired token`);
    }

    await this.userAuthService.updatePassword(userId, newPassword);

    return {
      message: 'Password reset successfully',
      statusCode: HttpStatus.CREATED,
    };
  }
}
