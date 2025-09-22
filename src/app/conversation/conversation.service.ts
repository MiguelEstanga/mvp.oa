import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entity/Conversation';
import { Repository } from 'typeorm';
import { ApiResponse } from '../core/types/ResponseType';
import { BaseService } from '../core/helper/BaseResponse';
import { CreateConversationDto } from './dto/CreateConversationDto';

@Injectable()
export class ConversationService extends BaseService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {
    super();
  }

  async getConversations(
    firebase_uid: string,
  ): Promise<ApiResponse<ConversationTypes[]>> {
    try {
      const conversations: ConversationTypes[] =
        await this.conversationRepository.find({
          where: {
            firebase_uid,
          },
          relations: ['messages'],
        });
        
      return this.success(
        'Conversaciones obtenidas correctamente',
        conversations,
      );
    } catch (error) {
      return this.error('Error en el servidor', error.message);
    }
  }

  async createConversation(
    conversation: CreateConversationDto,
  ): Promise<ApiResponse<ConversationTypes>> {
    try {
      const newConversation = this.conversationRepository.create(conversation);
      const savedConversation =
        await this.conversationRepository.save(newConversation);
      return this.success(
        'Conversación creada correctamente',
        savedConversation,
      );
    } catch (error) {
      console.log('s');
      return this.error('Error al crear conversación', error.message);
    }
  }

  async checkConversation(id: number): Promise<ApiResponse<ConversationTypes>> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: {
          id,
        },
      });
      console.log('conversation', conversation);
      if (conversation) {
        return this.success('Conversación creada correctamente', conversation);
      } else {
        return this.notFound('Conversación creada correctamente', conversation);
      }
    } catch {
      return this.error('error al comprobar si la conversacion funciona');
    }
  }
}
