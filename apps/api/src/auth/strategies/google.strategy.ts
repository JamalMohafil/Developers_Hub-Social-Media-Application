import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import * as https from 'https';
import googleOauthConfig from '../config/google-oauth.config';
import { AuthService } from '../services/auth.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  private queueEvents: QueueEvents;

  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService,
    @InjectQueue('auth') private readonly authQueue: Queue,
  ) {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackUrl,
      scope: ['email', 'profile'],
      // خيارات متقدمة لتحسين الاتصال
      proxy: true,
      timeout: googleConfig.timeout,
      // إنشاء وكيل HTTPS مخصص
      agent: new https.Agent({
        keepAlive: true,
        timeout: googleConfig.timeout,
        rejectUnauthorized: true,
      }),
    });

    // سجل معلومات التكوين عند التشغيل (مع إخفاء السر)
    this.logger.log(
      `Google OAuth setup with clientID: ${googleConfig.clientId!.substring(0, 5)}... and callbackURL: ${googleConfig.callbackUrl}`,
    );
    this.queueEvents = new QueueEvents('auth', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      this.logger.debug(`Received OAuth profile: ${profile.id}`);

      if (!profile || !profile.emails || !profile.emails.length) {
        this.logger.error('Invalid profile data received from Google');
        return done(new Error('Invalid profile data'), false);
      }

      // إضافة مهمة إلى قائمة الانتظار مع إمكانية إعادة المحاولة
      const job = await this.authQueue.add(
        'oauth-validation',
        {
          // تغيير هيكل البيانات ليتوافق مع العملية
          email: profile.emails[0].value,
          name: profile._json?.name || profile.displayName,
          oauthId: profile.id,
          image: profile._json?.picture,
        },
        {
          attempts: this.googleConfig.retries,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );

      // انتظار النتيجة من مهمة قائمة الانتظار
      const result = await job.waitUntilFinished(
        this.queueEvents,
        this.googleConfig.timeout,
      );
      console.log(result,'resultsdrgfbc')

      return done(null, result);
    } catch (error) {
      this.logger.error(
        `Google OAuth validation error: ${error.message}`,
        error.stack,
      );

      // إرسال خطأ أكثر دقة مع معلومات مفيدة
      if (error.code === 'ECONNRESET' || error.errno === -4077) {
        return done(
          new Error(
            'Connection reset during OAuth handshake. Please try again.',
          ),
          false,
        );
      }

      return done(error, false);
    }
  }
}
