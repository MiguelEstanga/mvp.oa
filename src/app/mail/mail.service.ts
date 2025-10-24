import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { BaseService } from '../core/helper/BaseResponse';
import { ApiResponse } from '../core/types/ResponseType';
import { resetPasswordTemplate } from './templates/reset-password.template';

@Injectable()
export class MailService extends BaseService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    super();
    
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY no está configurada - Los emails no se enviarán');
    } else {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend inicializado correctamente');
    }
  }

  /**
   * Envía email con código de recuperación de contraseña
   */
  async sendPasswordResetCode(
    email: string,
    resetCode: string,
    name?: string,
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.resend) {
        throw new Error('Resend no está configurado');
      }

      const html = resetPasswordTemplate(resetCode, name);

      const { data, error } = await this.resend.emails.send({
        from: 'MVP.IA <onboarding@resend.dev>', // Cambiar cuando tengas dominio verificado
        to: [email],
        subject: '🔒 Código de recuperación de contraseña',
        html,
      });

      if (error) {
        this.logger.error(`Error de Resend al enviar a ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Código de recuperación enviado a ${email} (ID: ${data?.id})`);
      return this.success('Código de recuperación enviado correctamente', {
        email,
        sent: true,
        messageId: data?.id,
      });
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar código de recuperación a ${email}:`,
        error,
      );
      return this.error('Error al enviar el código de recuperación', error);
    }
  }

  /**
   * Notifica que la contraseña fue cambiada exitosamente
   */
  async sendPasswordChangedConfirmation(
    email: string,
    name?: string,
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.resend) {
        throw new Error('Resend no está configurado');
      }

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
              <div style="background-color: #28a745; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 48px;">✓</span>
              </div>
              <h1 style="color: #333; margin: 20px 0 10px 0;">Contraseña actualizada</h1>
            </div>
            
            <div style="padding: 20px; line-height: 1.6; color: #666;">
              <p>Hola <strong>${name || 'Usuario'}</strong>,</p>
              
              <p>Tu contraseña ha sido cambiada exitosamente.</p>
              
              <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #155724;">
                  ✅ <strong>Cambio exitoso:</strong> Tu cuenta está segura y puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404;">
                  📅 <strong>Fecha del cambio:</strong> ${new Date().toLocaleString('es-ES', { 
                    dateStyle: 'full', 
                    timeStyle: 'short' 
                  })}
                </p>
              </div>
              
              <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #721c24;">
                  ⚠️ <strong>¿No fuiste tú?</strong>
                </p>
                <p style="margin: 0; color: #721c24;">
                  Si no realizaste este cambio, tu cuenta podría estar comprometida. 
                  Contacta inmediatamente con nuestro soporte.
                </p>
              </div>
              
              <p style="margin-top: 30px;">Gracias por mantener tu cuenta segura.</p>
              <p>¡Saludos! 👋</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px;">
              <p style="margin: 5px 0;">🔒 Este es un email de seguridad automático</p>
              <p style="margin: 5px 0;">Por favor no respondas a este mensaje</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await this.resend.emails.send({
        from: 'MVP.IA <onboarding@resend.dev>',
        to: [email],
        subject: '✅ Tu contraseña ha sido actualizada',
        html,
      });

      if (error) {
        this.logger.error(`Error de Resend al enviar confirmación a ${email}:`, error);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Confirmación de cambio de contraseña enviada a ${email} (ID: ${data?.id})`);
      return this.success('Confirmación enviada correctamente', {
        messageId: data?.id,
      });
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar confirmación de cambio a ${email}:`,
        error,
      );
      return this.error('Error al enviar confirmación', error);
    }
  }
}