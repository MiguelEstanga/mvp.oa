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
          host: configService.get<string>('MAIL_HOST'), // smtp.gmail.com
          port:  587, // 587
          secure: false, // false para 587, true para 465
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false,
          },
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
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
  constructor(private readonly configService: ConfigService) {
    console.log('📧 Mail Module inicializado con Gmail SMTP');
    console.log('🔍 MAIL_HOST:', configService.get('MAIL_HOST'));
    console.log('🔍 MAIL_PORT:', configService.get('MAIL_PORT'));
    console.log('🔍 MAIL_USER:', configService.get('MAIL_USER'));
    console.log('🔍 MAIL_PASSWORD:', configService.get('MAIL_PASSWORD') ? '✅ Configurada (oculta)' : '❌ FALTA');
    console.log('🔍 MAIL_FROM:', configService.get('MAIL_FROM'));
    console.log('🔍 MAIL_FROM_NAME:', configService.get('MAIL_FROM_NAME'));
  }
}