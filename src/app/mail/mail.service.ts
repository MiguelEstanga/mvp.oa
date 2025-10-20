import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { BaseService } from '../core/helper/BaseResponse';
import { ApiResponse } from '../core/types/ResponseType';
import { welcomeTemplate } from './templates/welcome.template';
import { resetPasswordTemplate } from './templates/reset-password.template';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

@Injectable()
export class MailService extends BaseService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  /**
   * Envía un email genérico
   */
  async sendEmail(options: EmailOptions): Promise<ApiResponse<any>> {
    try {
      const result = await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      this.logger.log(`Email enviado exitosamente a ${options.to}`);
      return this.success('Email enviado correctamente', result);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${options.to}:`, error);
      return this.error('Error al enviar el email', error);
    }
  }

  /**
   * Envía email de bienvenida a nuevos usuarios
   */
  async sendWelcomeEmail(
    email: string,
    name: string,
  ): Promise<ApiResponse<any>> {
    try {
      const html = welcomeTemplate(name);

      const result = await this.mailerService.sendMail({
        to: email,
        subject: '¡Bienvenido a nuestra plataforma! 🎉',
        html,
      });

      this.logger.log(`Email de bienvenida enviado a ${email}`);
      return this.success('Email de bienvenida enviado correctamente', result);
    } catch (error) {
      this.logger.error(
        `Error al enviar email de bienvenida a ${email}:`,
        error,
      );
      return this.error('Error al enviar email de bienvenida', error);
    }
  }

  /**
   * Envía email para recuperación de contraseña
   */
  async sendResetPasswordEmail(
    email: string,
    resetToken: string,
    name?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const html = resetPasswordTemplate(resetToken, name);

      const result = await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperación de contraseña 🔒',
        html,
      });

      this.logger.log(`Email de recuperación de contraseña enviado a ${email}`);
      return this.success(
        'Email de recuperación enviado correctamente',
        result,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de recuperación a ${email}:`,
        error,
      );
      return this.error('Error al enviar email de recuperación', error);
    }
  }

  /**
   * Envía código de verificación
   */
  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    name?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="color: #333; margin: 0;">Verifica tu cuenta ✉️</h1>
            </div>
            
            <div style="padding: 20px; line-height: 1.6; color: #666;">
              <p>Hola <strong>${name || 'Usuario'}</strong>,</p>
              
              <p>Gracias por registrarte. Tu código de verificación es:</p>
              
              <div style="background-color: #f0f8ff; border-left: 4px solid #4CAF50; padding: 20px; text-align: center; margin: 25px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </span>
              </div>
              
              <p style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                ⏱️ <strong>Importante:</strong> Este código expira en <strong>15 minutos</strong>.
              </p>
              
              <p>Si no solicitaste este código, puedes ignorar este mensaje de forma segura.</p>
              
              <p style="margin-top: 30px;">¡Saludos! 👋</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px;">
              <p>🔒 Por tu seguridad, nunca compartas este código con nadie.</p>
              <p style="margin: 5px 0;">Este es un email automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.mailerService.sendMail({
        to: email,
        subject: 'Código de verificación 🔐',
        html,
      });

      this.logger.log(`Email de verificación enviado a ${email}`);
      return this.success('Email de verificación enviado correctamente', result);
    } catch (error) {
      this.logger.error(
        `Error al enviar email de verificación a ${email}:`,
        error,
      );
      return this.error('Error al enviar email de verificación', error);
    }
  }

  /**
   * Envía notificación de cambio de contraseña
   */
  async sendPasswordChangedNotification(
    email: string,
    name?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="color: #333; margin: 0;">Contraseña actualizada ✅</h1>
            </div>
            
            <div style="padding: 20px; line-height: 1.6; color: #666;">
              <p>Hola <strong>${name || 'Usuario'}</strong>,</p>
              
              <p>Te confirmamos que tu contraseña ha sido cambiada exitosamente.</p>
              
              <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                ✅ Tu cuenta está segura y puedes iniciar sesión con tu nueva contraseña.
              </div>
              
              <p style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
                ⚠️ <strong>¿No fuiste tú?</strong> Si no realizaste este cambio, contacta inmediatamente con nuestro soporte.
              </p>
              
              <p>¡Saludos! 👋</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px;">
              <p>Este es un email automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.mailerService.sendMail({
        to: email,
        subject: 'Tu contraseña ha sido actualizada 🔒',
        html,
      });

      this.logger.log(`Notificación de cambio de contraseña enviada a ${email}`);
      return this.success('Notificación enviada correctamente', result);
    } catch (error) {
      this.logger.error(
        `Error al enviar notificación de cambio de contraseña a ${email}:`,
        error,
      );
      return this.error('Error al enviar notificación', error);
    }
  }

  /**
   * Envía emails masivos (máximo recomendado: 100 por llamada)
   */
  async sendBulkEmails(
    emails: string[],
    subject: string,
    html: string,
  ): Promise<ApiResponse<any>> {
    try {
      if (emails.length === 0) {
        return this.error('La lista de emails está vacía', null);
      }

      if (emails.length > 100) {
        return this.error(
          'No puedes enviar más de 100 emails a la vez',
          null,
        );
      }

      const results = await Promise.allSettled(
        emails.map((email) =>
          this.mailerService.sendMail({
            to: email,
            subject,
            html,
          }),
        ),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(
        `Emails masivos procesados: ${successful} exitosos, ${failed} fallidos de ${emails.length} totales`,
      );

      return this.success('Emails masivos procesados', {
        successful,
        failed,
        total: emails.length,
        successRate: `${((successful / emails.length) * 100).toFixed(2)}%`,
      });
    } catch (error) {
      this.logger.error('Error al enviar emails masivos:', error);
      return this.error('Error al procesar emails masivos', error);
    }
  }

  /**
   * Envía notificación personalizada
   */
  async sendNotification(
    email: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="color: #333; margin: 0;">${title}</h1>
            </div>
            
            <div style="padding: 20px; line-height: 1.6; color: #666;">
              <p>${message}</p>
              
              ${
                actionUrl && actionText
                  ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${actionUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    ${actionText}
                  </a>
                </div>
              `
                  : ''
              }
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px;">
              <p>Este es un email automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.mailerService.sendMail({
        to: email,
        subject: title,
        html,
      });

      this.logger.log(`Notificación enviada a ${email}`);
      return this.success('Notificación enviada correctamente', result);
    } catch (error) {
      this.logger.error(`Error al enviar notificación a ${email}:`, error);
      return this.error('Error al enviar notificación', error);
    }
  }
}