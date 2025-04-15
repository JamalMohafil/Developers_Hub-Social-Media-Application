import { registerAs } from "@nestjs/config";


export default registerAs("mailer",()=>({
  sender:process.env.EMAIL_USER
}))