export const resetPasswordTemplate = (
  resetCode: string,
  name?: string,
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <div style="background-color: #4CAF50; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 48px;">🔒</span>
          </div>
          <h1 style="color: #333; margin: 20px 0 10px 0;">Recuperación de contraseña</h1>
        </div>
        
        <div style="padding: 20px; line-height: 1.6; color: #666;">
          <p>Hola <strong>${name || 'Usuario'}</strong>,</p>
          
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          
          <p style="margin: 25px 0;">Usa el siguiente código para continuar:</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; margin: 25px 0;">
            <div style="background-color: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px;">
              <span style="font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #333; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                ${resetCode}
              </span>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404;">
              ⏱️ <strong>Importante:</strong> Este código expira en <strong>15 minutos</strong>.
            </p>
          </div>
          
          <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #721c24;">
              ⚠️ Si no solicitaste este cambio, ignora este email y tu contraseña permanecerá sin cambios.
            </p>
          </div>
          
          <p style="margin-top: 30px;">Si tienes problemas, contacta con nuestro soporte.</p>
          <p>¡Saludos! 👋</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px;">
          <p style="margin: 5px 0;">🔒 Por tu seguridad, nunca compartas este código con nadie</p>
          <p style="margin: 5px 0;">Este es un email automático, por favor no respondas</p>
        </div>
      </div>
    </body>
    </html>
  `;
};