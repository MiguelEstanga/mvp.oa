import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entity/Message';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenaiModule } from '../openia/openia.module';
 import { ConversationModule } from '../conversation/conversation.module';
import { BondServiceModule } from '../bond_service/bound-service.module';
 
@Module({
  imports: [TypeOrmModule.forFeature([Message]) , OpenaiModule , ConversationModule , BondServiceModule],
  controllers: [MessageController],
  providers: [MessageService   ],
 
})
export class MessageModule {}
