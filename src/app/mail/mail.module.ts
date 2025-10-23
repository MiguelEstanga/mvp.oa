import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerOptions } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // 💡 Corregimos la lógica de `secure` y tipado.
      useFactory: (configService: ConfigService): MailerOptions => {
        const port = configService.get<number>('MAIL_PORT');
        
        // Convertimos el puerto y el host, asegurando los tipos correctos.
        const mailConfig: MailerOptions = {
          transport: {
             
            host: configService.get<string>('MAIL_HOST'),
            port: port,
            // 'secure' debe ser un booleano. Típicamente true si port es 465 (SSL/TLS).
            secure: port === 465, 
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"${configService.get('MAIL_FROM_NAME')}" <${configService.get('MAIL_FROM')}>`,
          },
        };

        // Puedes agregar un console.log aquí para debug, si es necesario.
 
        return mailConfig;
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
  // 💡 INYECTAR ConfigService para acceder a las variables cargadas
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService, // AHORA ESTÁ INYECTADO CORRECTAMENTE
  ) {
    console.log('--- Configuración MailModule ---');
    // Ahora estas llamadas deberían funcionar si ConfigModule.forRoot() es global.
    console.log('MAIL_HOST (Inyectado):', this.configService.get('MAIL_HOST'));
    console.log('MAIL_PORT (Inyectado):', this.configService.get('MAIL_PORT'));
    console.log('-------------------------------');
    
    // ❌ IMPORTANTE: ELIMINA la línea `const configService = new ConfigService();`
  }
}
