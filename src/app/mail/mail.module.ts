import { Module } from '@nestjs/common';
 import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
 

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: configService.get<number>('MAIL_PORT'),
          secure: false, // true para 465, false para otros puertos
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'), // 👈 App Password aquí
          },
          tls: {
            rejectUnauthorized: false,
          },
          // Configuración adicional para Railway
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
        },
        defaults: {
          from: `"${configService.get<string>('MAIL_FROM_NAME')}" <${configService.get<string>('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
  constructor(private readonly mailService: MailService) {
    console.log('mail service');
     const configService = new ConfigService();
    console.log(configService.get('MAIL_HOST'));
    console.log(configService.get('MAIL_PORT'));
    console.log(configService.get('MAIL_USER'));
    console.log(configService.get('MAIL_PASSWORD'));
    console.log(configService.get('MAIL_FROM_NAME'));
    console.log(configService.get('MAIL_FROM'));
  }
}