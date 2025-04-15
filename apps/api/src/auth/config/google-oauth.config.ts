import { registerAs } from '@nestjs/config';

export default registerAs('googleOauth', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  // إضافة خيارات متقدمة
  timeout: parseInt(process.env.OAUTH_TIMEOUT || '10000'),
  retries: parseInt(process.env.OAUTH_RETRIES || '5'),
}));
