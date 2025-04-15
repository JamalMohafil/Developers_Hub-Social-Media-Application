import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
@Processor('send-otp')
export class SendOtpProcessor extends WorkerHost {
  private readonly logger = new Logger(SendOtpProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

    try {
      // The job name is "send-otp", so we need to check the data to determine what to do
      const { type, data } = job.data;

      switch (type) {
        case 'verification':
          return await this.handleVerificationEmail(data);
        case 'reset-password':
          return await this.handleResetPasswordEmail(data);
        default:
          return await this.handleGenericEmail(data);
      }
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}`, error);
      throw error;
    }
  }

  private async handleVerificationEmail(data: { to: string; code: number }) {
    const { to, code } = data;

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        /* Reset styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
        }
        
        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        /* Header */
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
        }
        
        .logo {
            width: 180px;
            margin-bottom: 15px;
        }
        
        /* Content */
        .content {
            padding: 30px 20px;
            text-align: center;
        }
        
        h1 {
            color: #2d3748;
            font-size: 24px;
            margin-bottom: 20px;
        }
        
        p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #4a5568;
        }
        
        /* Verification Code */
        .verification-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #3182ce;
            padding: 15px 25px;
            margin: 25px 0;
            background-color: #ebf8ff;
            border-radius: 6px;
            display: inline-block;
        }
        
        /* Button */
        .btn {
            display: inline-block;
            background-color: #4299e1;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            font-size: 16px;
            margin-top: 15px;
            transition: background-color 0.3s ease;
        }
        
        .btn:hover {
            background-color: #3182ce;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            font-size: 14px;
            color: #718096;
        }
        
        .social-links {
            margin: 15px 0;
        }
        
        .social-icon {
            display: inline-block;
            width: 32px;
            height: 32px;
            background-color: #e2e8f0;
            border-radius: 50%;
            margin: 0 8px;
            text-align: center;
            line-height: 32px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://via.placeholder.com/180x60?text=Developers+Hub" alt="Developers Hub Logo" class="logo">
        </div>
        
        <div class="content">
            <h1>Welcome to Developers Hub!</h1>
            <p>Thank you for joining our community. To complete your registration, please verify your email address using the verification code below:</p>
            
            <div class="verification-code">${code}</div>
            
            <p>This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
            
            <a href="#" class="btn">Visit Developers Hub</a>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="#" class="social-icon">f</a>
                <a href="#" class="social-icon">t</a>
                <a href="#" class="social-icon">in</a>
                <a href="#" class="social-icon">g</a>
            </div>
            <p>&copy; 2025 Developers Hub. All rights reserved.</p>
            <p>123 Tech Street, Innovation City, 10001</p>
        </div>
    </div>
</body>
</html>`;

    await this.mailerService.sendMail({
      to: to,
      subject: 'Verify Your Email - Developers Hub',
      html: htmlTemplate,
    });

    this.logger.log(`Verification email sent successfully to ${to}`);
    return { success: true, message: 'Verification email sent successfully' };
  }

  private async handleResetPasswordEmail(data: {
    email: string;
    resetLink: string;
  }) {
    const { email, resetLink } = data;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password - Developers Hub',
      text: `Click the link to reset your password in developers hub: ${resetLink}`,
    });

    this.logger.log(`Reset password email sent successfully to ${email}`);
    return { success: true, message: 'Reset password email sent successfully' };
  }

  private async handleGenericEmail(data: any) {
    const { from, to, subject, text, html } = data;

    await this.mailerService.sendMail({
      from: from,
      to: to,
      subject: subject || 'Message from Developers Hub',
      text: text,
      html: html,
    });

    this.logger.log(`Generic email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  }
}
