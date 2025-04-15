import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AuthService } from 'src/auth/services/auth.service';

@Processor('auth')
export class AuthProcessor extends WorkerHost {
  private readonly logger = new Logger(AuthProcessor.name);
  constructor(private readonly authService: AuthService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.debug(
      `Processing job ${job.id} with data ${JSON.stringify(job.data)}`,
    );
    try {
      // التعامل مباشرة مع الوظيفة حسب اسم المهمة
      if (job.name === 'oauth-validation') {
        return await this.validateOAuth(job.data);
      }

      return null;
    } catch (e) {
      this.logger.error(`Processing Failed For Job ${job.id}`, e);
      throw e;
    }
  }

  private async validateOAuth(data: any) {
    try {
      const user = await this.authService.validateGoogleUser({
        email: data.email,
        name: data.name,
        oauthId: data.oauthId,
        image: data.image,
      });
      this.logger.debug(`OAuth User ${user.email} validated successfully`);
      return user;
    } catch (e) {
      this.logger.error(`Error validation user ${e.message}`, e.stack);
      throw e;
    }
  }
}