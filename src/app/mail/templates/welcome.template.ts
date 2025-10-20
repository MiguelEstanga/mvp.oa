export const welcomeTemplate = (name: string): string => {
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
          <h1 style="color: #333; margin: 0;">¡Bienvenido!</h1>
        </div>
        
        <div style="padding: 20px; line-height: 1.6; color: #666;">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>¡Gracias por unirte a nuestra plataforma! Estamos emocionados de tenerte con nosotros.</p>
          
          <p>Ahora puedes disfrutar de todas las funcionalidades de nuestra aplicación.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Comenzar ahora
            </a>
          </div>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <p>¡Saludos!</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};