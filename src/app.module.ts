import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './app/auth/auth.module';
import { GamerCharacterModule } from './app/game_character/gamer-character.module';
import { CharacterUserModule } from './app/character_users/character-user.module';
import { ConversationModule } from './app/conversation/conversation.module';
import { MessageModule } from './app/message/message.module';
import { OpenaiModule } from './app/openia/openia.module';
import { UserModule } from './app/user/user.module';
  
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ¡Este es el punto clave!
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
          url: configService.get<string>('DATABASE_URL'), 
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    GamerCharacterModule,
    CharacterUserModule,
    ConversationModule,
    MessageModule,
    OpenaiModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
