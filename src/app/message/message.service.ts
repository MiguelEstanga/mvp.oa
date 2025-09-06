import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

import { BaseService } from '../core/helper/BaseResponse';
import { ApiResponse } from '../core/types/ResponseType';
import { OpenAIService } from '../openia/openia.service';
import { CreateMessageDto } from './dto/CreateMessageDto';
import { Message } from './entity/Message';
import { MessageTypes } from './types/MessageTypes';
import { MessageRole } from './types/MessageRoleTypes';
import { ConversationService } from '../conversation/conversation.service';
import { DataSource, FindOptionsOrderValue } from 'typeorm';
import { BondService } from '../bond_service/BondService.service';

@Injectable()
export class MessageService extends BaseService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly openAIService: OpenAIService,
    private readonly conversationService: ConversationService,
    private readonly dataSource: DataSource,
    private readonly bondService: BondService,
  ) {
    super();
  }

  async getMessagesConversation(
    conversation_id: number,
  ): Promise<ApiResponse<MessageTypes[]>> {
    try {
      const messages = await this.messageRepository.find({
        where: {
          conversation_id: Number(conversation_id),
        },
        relations: ['conversation'],
      });
      console.log('messages', messages);
      return this.success('Mensajes recuperados correctamente', messages);
    } catch (error) {
      return this.error('Error al recuperar los mensajes', error);
    }
  }
  // Este método parece ser solo para pruebas, por lo que lo he renombrado.
  async generateTestMessage(): Promise<ApiResponse<ChatCompletion>> {
    try {
      const data = await this.openAIService.generateText([
        {
          role: 'user',
          content: 'Hola, ¿cómo estás?',
        },
      ]);
      return this.success('Mensaje de prueba generado correctamente', data);
    } catch (error) {
      return this.error('Error al generar el mensaje de prueba', error);
    }
  }

  // El mensaje de éxito era incorrecto para un método GET, ahora es más descriptivo.
  async getMessagesByFirebaseUid(
    firebase_uid: string,
  ): Promise<ApiResponse<MessageTypes[]>> {
    try {
      const messages = await this.messageRepository.find({
        where: {
          firebase_uid,
        },
      });
      return this.success('Mensajes recuperados correctamente', messages);
    } catch (error) {
      return this.error('Error al recuperar los mensajes', error);
    }
  }

  async createMessage(
    body: CreateMessageDto,
  ): Promise<ApiResponse<MessageTypes[]>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let customConversationId: number;

      // 1. Si no hay conversation_id, se crea una nueva conversación.
      if (!body.conversation_id) {
        const newConversationResponse =
          await this.conversationService.createConversation({
            name: body.content.substring(0, 50),
            firebase_uid: body.firebase_uid,
          });
        const { data } = newConversationResponse;
        if (!data || !data.id) {
          throw new Error('Error al crear una nueva conversación.');
        }
        customConversationId = data.id;
      } else {
        customConversationId = body.conversation_id;
      }

      // 2. Se recupera el historial de mensajes de la conversación.
      const conversationHistory = await this.messageRepository.find({
        where: {
          conversation_id: customConversationId,
        },
        order: {
          created_at: 'ASC' as FindOptionsOrderValue,
        },
        take: 10,
      });

      // 3. Se formatea el historial y el nuevo mensaje del usuario para la API de OpenAI.
      // Se utiliza un mapeo explícito para asegurar que los tipos de rol sean cadenas literales.
      const messagesForOpenAI: ChatCompletionMessageParam[] =
        conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));
      messagesForOpenAI.push({
        role: 'user',
        content: body.content,
      });

      // 4. Se genera la respuesta del bot con el contexto completo.
      const messageBotResponse =
        await this.openAIService.generateText(messagesForOpenAI);
      const contentBot = messageBotResponse.choices[0].message?.content;

      if (!contentBot) {
        throw new Error('No se pudo obtener una respuesta válida de la IA.');
      }

      // 5. Se guardan los nuevos mensajes del usuario y del bot en la transacción.
      const userMessage = this.messageRepository.create({
        role: MessageRole.USER,
        content: body.content,
        firebase_uid: body.firebase_uid,
        conversation_id: customConversationId,
      });
      const savedUserMessage = await queryRunner.manager.save(userMessage);
      
      const botMessage = this.messageRepository.create({
        role: MessageRole.BOT,
        content: contentBot,
        firebase_uid: body.firebase_uid,
        conversation_id: customConversationId,
      });
      const savedBotMessage = await queryRunner.manager.save(botMessage);
      await this.bondService.updateBondFromMessage(
        body.firebase_uid,
        body.content,
      );
      // 6. Si todo fue bien, se confirma la transacción.
      await queryRunner.commitTransaction();
      
      return this.success('Mensajes enviados y guardados correctamente', [
        savedBotMessage,
      ]);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.error('Error al enviar y guardar el mensaje', error);
    } finally {
      await queryRunner.release();
    }
  }
}
