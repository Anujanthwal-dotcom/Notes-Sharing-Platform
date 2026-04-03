import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_SENDER,
        to,
        subject: 'Your Login OTP',
        html: `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error in sending verification email',
      );
    }
  }
}
