import { Module } from '@nestjs/common';
 import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
 

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          family: 4,
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: true, // true para 465, false para otros puertos
          auth: {
            user:'apikey',
            pass: configService.get('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"${configService.get('MAIL_FROM_NAME')}" <${configService.get('MAIL_FROM')}>`,
        },
      }),
    }),
  ],
  controllers: [MailController],
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