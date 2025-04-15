import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as otpGenerator from 'otp-generator';
import { UserAuthService } from './user-auth.service';
import { SendEmailDto } from '../dto/send-email.dto';
import { ConfigType } from '@nestjs/config';
import mailerConfig from '../config/mailer.config';
import { MailerService } from '@nestjs-modules/mailer';
import { RedisService } from 'src/redis/services/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private userAuthService: UserAuthService,
    private readonly redisService: RedisService,
    private readonly userRepository: UserRepository,

    @InjectQueue('send-otp') private readonly emailQueue: Queue,
  ) {}

  async generateOtp(userId: string): Promise<number> {
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
    await this.prisma.otp.create({
      data: {
        code: parseInt(otp),
        userId,
        expiresIn: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    return parseInt(otp);
  }

  async checkOtpRemainingTime(userId: string) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        userId,
        expiresIn: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) return true;
    const remainingTime = otpRecord.expiresIn.getTime() - Date.now();
    const remainingSeconds = Math.ceil(remainingTime / 10000);
    throw new HttpException(
      `Please wait ${remainingSeconds} seconds until send a new otp | Otp already sent`,
      HttpStatus.BAD_REQUEST,
    );
  }

  async validateOtp(userId: string, code: number): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        userId,
        code,
        expiresIn: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) throw new BadRequestException('Invalid OTP!');

    await this.prisma.otp.deleteMany({ where: { userId } });

    return true;
  }

  async verifyEmail(id: string, code: number) {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new UnauthorizedException('User not found');

    let profile = await this.userRepository.getProfileByUserId(id);
    await this.validateOtp(user.id, code);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });

    const userCache = await this.redisService.get(`user:${id}`);
    if (userCache) await this.redisService.del(`user:${id}`);

    await this.redisService.set(`user:${id}`, updatedUser, 3600);

    if (profile) {
      profile = {
        ...profile,
        user: {
          ...profile?.user,
          emailVerified: true,
        },
      };

      const profileCache = await this.redisService.get(`profile:${user.id}`);
      if (profileCache) await this.redisService.del(`profile:${user.id}`);

      await this.redisService.set(`profile:${user.id}`, profile, 3600);
    }

    return new HttpException('Email verified successfully', HttpStatus.CREATED);
  }

  async sendOtp(userId: string) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);

    if (user.emailVerified === true)
      throw new HttpException('User Already Verified', HttpStatus.BAD_REQUEST);

    await this.checkOtpRemainingTime(userId);
    const code = await this.generateOtp(userId);

    // Add job to the queue with the correct structure
    await this.emailQueue.add(
      'send-otp',
      {
        type: 'verification',
        data: {
          to: user.email,
          code: code,
        },
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return new HttpException('OTP sent successfully', HttpStatus.CREATED);
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    // Add to the queue with the correct structure
    await this.emailQueue.add(
      'send-otp',
      {
        type: 'generic',
        data: sendEmailDto,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async sendResetPasswordEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    try {
      // Add to the queue with the correct structure
      await this.emailQueue.add(
        'send-otp',
        {
          type: 'reset-password',
          data: {
            email,
            resetLink,
          },
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    } catch (error) {
      console.error('Failed to queue reset password email:', error);
      throw new InternalServerErrorException(
        'Failed to send reset email. Please try again later.',
      );
    }
  }
}
