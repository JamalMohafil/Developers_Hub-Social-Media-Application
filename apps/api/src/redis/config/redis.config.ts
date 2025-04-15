import { registerAs } from "@nestjs/config"

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST as string,
  port: process.env.REDIS_PORT!! as unknown as number,
  keyPrefix: process.env.REDIS_KEY_PREFIX,
}));

 

