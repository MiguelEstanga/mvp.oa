import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import * as fs from 'fs/promises';
import * as path from 'path';

import { BaseService } from '../core/helper/BaseResponse';
import { ApiResponse } from '../core/types/ResponseType';
import { OpenAIService } from '../openia/openia.service';
import { CreateMessageDto } from './dto/CreateMessageDto';
import { Message } from './entity/Message';
import { MessageInsertTypes, MessageTypes } from './types/MessageTypes';
import { MessageRole } from './types/MessageRoleTypes';
import { ConversationService } from '../conversation/conversation.service';
import { DataSource, FindOptionsOrderValue } from 'typeorm';
import { BondService } from '../bond_service/BondService.service';
import { User } from '../auth/entities/user.entity';
import { CharacterUserService } from '../character_users/character-user.service';

interface UserPersonalityConfig {
  mvp_type: string;
  personality_archetype: string;
  bond_level: number;
  personality_active: boolean;
}

@Injectable()
export class MessageService extends BaseService {
  private personalityPrompts = new Map<string, string>();
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly characterUserService: CharacterUserService,
    private readonly openAIService: OpenAIService,
    private readonly conversationService: ConversationService, 
    private readonly dataSource: DataSource,
    private readonly bondService: BondService,
  ) {
    super();
    this.loadPersonalityPrompts();
  }

  private async loadPersonalityPrompts() {
    try {
      const promptsPath = path.join(process.cwd(), 'src', 'app', 'prompts');

      // Load base personalities
      const mvps = ['kai', 'rin'];
      const archetypes = [
        'core_personality',
        'cheerful_buddy',
        'wise_philosopher',
        'chaotic_trickster',
        'heartwright',
      ];

      for (const mvp of mvps) {
        for (const archetype of archetypes) {
          try {
            const filePath = path.join(promptsPath, mvp, `${archetype}.txt`);
            const content = await fs.readFile(filePath, 'utf-8');
            this.personalityPrompts.set(`${mvp}_${archetype}`, content);
            this.logger.log(`Loaded personality: ${mvp}_${archetype}`);
          } catch (error) {
            this.logger.warn(`Could not load personality file: ${promptsPath}`);
          }
        }
      }

      // Load bond levels
      for (let i = 1; i <= 10; i++) {
        try {
          const filePath = path.join(
            promptsPath,
            'bond_levels',
            `level_${i}.txt`,
          );
          const content = await fs.readFile(filePath, 'utf-8');
          this.personalityPrompts.set(`bond_level_${i}`, content);
          this.logger.log(`Loaded bond level: ${i}`);
        } catch (error) {
          this.logger.warn(`Could not load bond level file: level_${i}`);
        }
      }
    } catch (error) {
      this.logger.error('Error loading personality prompts:', error);
    }
  }

  private getPersonalityPrompt(
    mvpType: string,
    archetype: string,
    bondLevel: number,
    name: string,
    userName: string,
  ): string {
    // Normalize file names
    const normalizedArchetype =
      archetype === 'core' ? 'core_personality' : archetype;

    // Get personality prompt
    const personalityKey = `${mvpType}_${normalizedArchetype}`;
    const personalityPrompt =
      this.personalityPrompts.get(personalityKey) ||
      this.personalityPrompts.get(`${mvpType}_core_personality`) ||
      `You are ${name}, a helpful AI assistant.`;
    console.log('personalityPrompt', personalityPrompt);
    
    // Get bond level prompt
    const bondPrompt =
      this.personalityPrompts.get(`bond_level_${bondLevel}`) ||
      this.personalityPrompts.get('bond_level_1') ||
      'You are just getting to know this user.';

    // Combine prompts
    return `${personalityPrompt}
      --- BOND LEVEL CONTEXT ---
          Current Bond Level: ${bondLevel}
          ${bondPrompt}
      --- INSTRUCTIONS ---
      - Respond according to your personality and current bond level
      - Remember previous conversations naturally
      - Adapt your tone based on the user's emotional state
      - Stay true to your character while being helpful
      - Messages can only have a minimum of 45 words.
      - your name is ${name}
      - and my name is ${userName}
      `;
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

      this.logger.log('messages', messages);
      this.logger.log('messages', messages.length);

      return this.success('Messages retrieved successfully', messages);
    } catch (error) {
      return this.error('Error retrieving messages', error);
    }
  }

  async generateTestMessage(): Promise<ApiResponse<ChatCompletion>> {
    try {
      const data = await this.openAIService.generateText([
        {
          role: 'user',
          content: 'Hello, how are you?',
        },
      ]);
      return this.success('Test message generated successfully', data);
    } catch (error) {
      console.log('error', error);
      return this.error('Error generating test message', error);
    }
  }

  async getMessagesByFirebaseUid(
    firebase_uid: string,
  ): Promise<ApiResponse<MessageTypes[]>> {
    try {
      const messages = await this.messageRepository.find({
        where: {
          firebase_uid,
        },
      });
      return this.success('Messages retrieved successfully', messages);
    } catch (error) {
      return this.error('Error retrieving messages', error);
    }
  }

  private async getUserPersonalityConfig(
    firebase_uid: string,
  ): Promise<UserPersonalityConfig> {
    try {
      const user = await this.userRepository.findOne({
        where: { firebase_uid },
      });
      this.logger.log('user', user);
      if (!user) {
        // Create default configuration if user doesn't exist
        return {
          mvp_type: 'kai',
          personality_archetype: 'core',
          bond_level: 1,
          personality_active: true,
        };
      }

      return {
        mvp_type: user.mvp_type || 'kai',
        personality_archetype: user.personality_archetype || 'core',
        bond_level: user.bond_level || 1,
        personality_active: user.personality_active !== false, // Default true
      };
    } catch (error) {
      this.logger.error('Error getting user personality config:', error);
      // Return default config on error
      return {
        mvp_type: 'kai',
        personality_archetype: 'core',
        bond_level: 1,
        personality_active: true,
      };
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

      // 1. Get user personality configuration
      const userConfig = await this.getUserPersonalityConfig(body.firebase_uid);

      const { data: character } =
        await this.characterUserService.findByUserAndCharacter(
          body.firebase_uid,
        );
      
      
      const mvpType = body.mvp_type || userConfig.mvp_type;
      const archetype =
        body.personality_archetype || userConfig.personality_archetype;
      const bondLevel = userConfig.bond_level;
      const personalityActive = userConfig.personality_active;

      // 2. If there's no conversation_id, create new conversation
      if (!body.conversation_id) {
        const newConversationResponse =
          await this.conversationService.createConversation({
            name: body.content.substring(0, 50),
            firebase_uid: body.firebase_uid,
          });
        const { data } = newConversationResponse;
        if (!data || !data.id) {
          throw new Error('Error creating new conversation.');
        }
        customConversationId = data.id;
      } else {
        customConversationId = body.conversation_id;
      }

      // 3. Retrieve message history
      const conversationHistory = await this.messageRepository.find({
        where: {
          conversation_id: customConversationId,
        },
        order: {
          created_at: 'ASC' as FindOptionsOrderValue,
        },
      });

      // 4. Build messages for OpenAI
      const messagesForOpenAI: ChatCompletionMessageParam[] = [];
      const user = await this.userRepository.findOne({
        where: { firebase_uid: body.firebase_uid },
      });
      console.log('user', user);
      if (personalityActive) {
        const personalityPrompt = this.getPersonalityPrompt(
          mvpType,
          archetype,
          bondLevel,
          character.name,
          user!.username  ,
        );
         
        console.log('personalityPrompt', personalityPrompt);
        messagesForOpenAI.push({
          role: 'system',
          content: personalityPrompt,
        });
      }

      // Add conversation history
      messagesForOpenAI.push(
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      );

      // Add new user message
      messagesForOpenAI.push({
        role: 'user',
        content: body.content,
      });
      console.log('generate message', messagesForOpenAI);
      
      // 5. Generate response
      const messageBotResponse =
        await this.openAIService.generateText(messagesForOpenAI);
      const contentBot = messageBotResponse.choices[0].message?.content;

      if (!contentBot) {
        throw new Error('Could not get a valid response from AI.');
      }

      // 6. Save user message
      const userMessage = this.messageRepository.create({
        role: MessageRole.USER,
        content: body.content,
        firebase_uid: body.firebase_uid,
        conversation_id: customConversationId,
      });
      const savedUserMessage = await queryRunner.manager.save(userMessage);

      // 7. Save bot message with personality metadata
      const botMessage = this.messageRepository.create({
        role: MessageRole.BOT,
        content: contentBot,
        firebase_uid: body.firebase_uid,
        conversation_id: customConversationId,
        personality_used: personalityActive
          ? `${mvpType}_${archetype}`
          : 'core',
        bond_level_at_time: bondLevel,
      });
      const savedBotMessage = await queryRunner.manager.save(botMessage);
      
      // 8. Update bond level
      const characterUsers = await this.bondService.updateBondFromMessage(
        body.firebase_uid,
        body.content,
      );

      // 9. Commit transaction
      await queryRunner.commitTransaction();
      console.log('experience points', characterUsers);
      
      return this.success('Messages sent and saved successfully', [
        savedBotMessage,
        characterUsers,
      ]);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.error('Error sending and saving message', error);
    } finally {
      await queryRunner.release();
    }
  }

  // Method for testing personalities
  async testPersonality(body: {
    message: string;
    mvp_type: 'kai' | 'rin';
    archetype: string;
    bond_level: number;
  }): Promise<ApiResponse<string>> {
    try {
      const personalityPrompt = this.getPersonalityPrompt(
        body.mvp_type,
        body.archetype,
        body.bond_level,
        'test',
        'test'
      );

      const messagesForOpenAI: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: personalityPrompt,
        },
        {
          role: 'user',
          content: body.message,
        },
      ];

      const response = await this.openAIService.generateText(messagesForOpenAI);
      const content = response.choices[0].message?.content;

      if (!content) {
        throw new Error('Could not generate test response.');
      }

      return this.success('Test response generated', content);
    } catch (error) {
      return this.error('Error generating test response', error);
    }
  }

  async insertMessage(message: MessageInsertTypes) {
    try {
      const newMessage = this.messageRepository.create({
        role: message.role,
        content: message.content,
        firebase_uid: message.firebase_uid,
        conversation_id: message.conversation_id,
      });
      const savedMessage = await this.messageRepository.save(newMessage);
      return this.success('Message saved successfully', savedMessage);
    } catch (error) {
      return this.error('Error saving message', error);
    }
  }
}