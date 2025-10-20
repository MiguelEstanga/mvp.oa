import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/SendEmailDto';
 
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendEmail(@Body() body: SendEmailDto) {
    return await this.mailService.sendEmail({
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
    });
  }

  @Post('welcome')
  async sendWelcome(@Body() body: { email: string; name: string }) {
    return await this.mailService.sendWelcomeEmail(body.email, body.name);
  }

  @Post('reset-password')
  async sendResetPassword(
    @Body() body: { email: string; resetToken: string; name?: string },
  ) {
    return await this.mailService.sendResetPasswordEmail(
      body.email,
      body.resetToken,
      body.name,
    );
  }

  @Post('verification')
  async sendVerification(
    @Body() body: { email: string; code: string; name?: string },
  ) {
    return await this.mailService.sendVerificationEmail(
      body.email,
      body.code,
      body.name,
    );
  }

  @Post('bulk')
  async sendBulk(
    @Body() body: { emails: string[]; subject: string; html: string },
  ) {
    return await this.mailService.sendBulkEmails(
      body.emails,
      body.subject,
      body.html,
    );
  }

  @Get('test')
  async testEmail(@Query('email') email: string) {
    if (!email) {
      return { success: false, message: 'Email requerido' };
    }
    
    return await this.mailService.sendEmail({
      to: email,
      subject: 'Email de prueba',
      html: '<h1>¡Funciona!</h1><p>Tu configuración de email está correcta.</p>',
    });
  }
}