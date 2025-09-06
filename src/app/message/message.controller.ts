import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/CreateMessageDto";
 
 
@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService : MessageService,
  ) {}

  @Post('test')
  async getMessages() {
    return this.messageService.generateTestMessage();
  }

  @Get('conversation_message')
  async getMessagesConversation(  @Query('conversation_id') conversation_id: number) {
    return this.messageService.getMessagesConversation(  conversation_id);
  }
  
  @Get(':firabase_uid')
  async getAllMessageConversation(@Query() firabase_uid :string){
    return this.messageService.getMessagesByFirebaseUid(firabase_uid);
  }

  @Post()
  async sedMessage(@Body() body: CreateMessageDto  ){
    return this.messageService.createMessage(body);
  }
}

 
