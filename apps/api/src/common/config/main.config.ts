import { registerAs } from "@nestjs/config";


export default registerAs('main', () => ({
  port: process.env.PORT,
  API_URL: process.env.API_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
}));