import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/CreateConversationDto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('test')
  async test() {
    return 'test';
  }
  @Get('/:firebase_uid')
  async getMemories(@Query('firebase_uid') firebase_uid: string) {
    console.log('firebase_uid', firebase_uid);
    return this.conversationService.getConversations(firebase_uid);
  }

  @Post()
  async createConversation(@Body() conversation: CreateConversationDto) {
    return this.conversationService.createConversation(conversation);
  }
}
