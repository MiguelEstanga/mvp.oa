import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from '../core/service/firabase/firabaseAdmin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OpenAIService } from '../openia/openia.service';
import { ConversationService } from '../conversation/conversation.service';
import { ConversationModule } from '../conversation/conversation.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Inyectamos TypeOrmModule y registramos la entidad User
    ConversationModule,
    MessageModule
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAdminService , OpenAIService  ],

  exports: [AuthService], // Por si otros módulos lo necesitan
})
export class AuthModule {}
