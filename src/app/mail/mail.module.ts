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
          host: 'smtp.gmail.com',
          port: 465,
          secure: configService.get('MAIL_PORT') === 465, // true para 465, false para otros puertos
          auth: {
            user:  'miguelestanga12@gmail.com',
            pass:  'jawueiwvemgreygs',
          },
        },
        defaults: {
          from: `miguelestanga12@gmail.com`,
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