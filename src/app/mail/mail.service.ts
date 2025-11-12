import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { BaseService } from '../core/helper/BaseResponse';
import { ApiResponse } from '../core/types/ResponseType';
import { resetPasswordTemplate } from './templates/reset-password.template';

@Injectable()
export class MailService extends BaseService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {
    super();
    this.logger.log('✅ MailService inicializado con Gmail SMTP');
  }

  async sendPasswordResetCode(
    email: string,
    resetCode: string,
    name?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const html = resetPasswordTemplate(resetCode, name);

      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM || 'noreply@yourdomain.com', // Tu email de Gmail
        subject: '🔒 Código de recuperación de contraseña',
        html,
      });

      this.logger.log(`✅ Código de recuperación enviado a ${email}`);
      return this.success('Código de recuperación enviado correctamente', {
        email,
        sent: true,
      });
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar código de recuperación a ${email}:`,
        error,
      );
      return this.error('Error al enviar el código de recuperación', error);
    }
  }

  async sendPasswordChangedConfirmation(
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
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background-color: #E5123D;
            padding: 32px 24px;
            text-align: center;
          }
          .logo {
            color: #FFFFFF;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .content {
            padding: 40px 24px;
          }
          .icon-container {
            text-align: center;
            margin-bottom: 24px;
          }
          .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background-color: #E5123D;
            border-radius: 50%;
            font-size: 48px;
          }
          .title {
            font-size: 24px;
            color: #000000;
            text-align: center;
            margin-bottom: 24px;
            font-weight: 600;
          }
          .message {
            font-size: 15px;
            color: #000000;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .info-box {
            background-color: #f5f5f5;
            border-left: 4px solid #E5123D;
            padding: 16px;
            margin: 16px 0;
            border-radius: 4px;
          }
          .info-box p {
            font-size: 14px;
            color: #000000;
            margin: 8px 0;
          }
          .info-box strong {
            color: #E5123D;
          }
          .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .warning-box p {
            font-size: 14px;
            color: #856404;
            margin: 4px 0;
          }
          .footer {
            padding: 24px;
            text-align: center;
            color: #666666;
            font-size: 13px;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MVP.IA</div>
          </div>
          
          <div class="content">
            <div class="icon-container">
              <div class="icon">✓</div>
            </div>
            
            <div class="title">Contraseña actualizada</div>
            
            <div class="message">
              Hola <strong>${name || 'Usuario'}</strong>,<br><br>
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </div>
            
            <div class="info-box">
              <p><strong>📅 Fecha del cambio:</strong></p>
              <p>${new Date().toLocaleString('es-ES', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}</p>
            </div>
            
            <div class="warning-box">
              <p><strong>⚠️ ¿No fuiste tú?</strong></p>
              <p>Si no realizaste este cambio, tu cuenta podría estar comprometida. Contacta inmediatamente con nuestro soporte.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>🔒 Este es un email de seguridad automático</p>
            <p>Por favor no respondas a este mensaje</p>
            <p>© ${new Date().getFullYear()} MVP.IA - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM || 'noreply@yourdomain.com', // Tu email de Gmail
        subject: '✅ Tu contraseña ha sido actualizada',
        html,
      });

      this.logger.log(`✅ Confirmación enviada a ${email}`);
      return this.success('Confirmación enviada correctamente');
    } catch (error) {
      this.logger.error(`❌ Error al enviar confirmación a ${email}:`, error);
      return this.error('Error al enviar confirmación', error);
    }
  }
}