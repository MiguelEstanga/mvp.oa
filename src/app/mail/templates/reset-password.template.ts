export const resetPasswordTemplate = (resetCode: string, name?: string): string => {
  return `
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
        .greeting {
          font-size: 18px;
          color: #000000;
          margin-bottom: 16px;
        }
        .message {
          font-size: 15px;
          color: #000000;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .code-container {
          background-color: #f5f5f5;
          border: 2px solid #E5123D;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          margin: 32px 0;
        }
        .code-label {
          font-size: 13px;
          color: #666666;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .code {
          font-size: 36px;
          font-weight: 700;
          color: #E5123D;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .expiry {
          font-size: 13px;
          color: #666666;
          margin-top: 12px;
        }
        .security-note {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 16px;
          margin: 24px 0;
          border-radius: 4px;
        }
        .security-note p {
          font-size: 14px;
          color: #856404;
          margin: 0;
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
          <div class="greeting">Hola${name ? ' ' + name : ''},</div>
          
          <div class="message">
            Recibimos una solicitud para recuperar tu contraseña. Usa el siguiente código para continuar:
          </div>
          
          <div class="code-container">
            <div class="code-label">Tu código de verificación</div>
            <div class="code">${resetCode}</div>
            <div class="expiry">Este código expira en 15 minutos</div>
          </div>
          
          <div class="security-note">
            <p><strong>⚠️ Importante:</strong> Si no solicitaste este código, ignora este mensaje. Tu cuenta está segura.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas.</p>
          <p>© ${new Date().getFullYear()} MVP.IA - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
};