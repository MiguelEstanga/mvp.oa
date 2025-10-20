export const resetPasswordTemplate = (
  resetToken: string,
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
          <h1 style="color: #333; margin: 0;">Recuperación de contraseña</h1>
        </div>
        
        <div style="padding: 20px; line-height: 1.6; color: #666;">
          <p>Hola ${name || 'Usuario'},</p>
          
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          
          <p>Tu código de recuperación es:</p>
          
          <div style="background-color: #f9f9f9; border: 2px dashed #ddd; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
              ${resetToken}
            </span>
          </div>
          
          <p style="color: #e74c3c; font-weight: bold;">
            Este código expira en 1 hora.
          </p>
          
          <p>Si no solicitaste este cambio, ignora este email y tu contraseña permanecerá sin cambios.</p>
          
          <p>¡Saludos!</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>Por tu seguridad, nunca compartas este código con nadie.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};