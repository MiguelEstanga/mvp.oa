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
  username: string;
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

  private async loadPromptFile(relativePath: string): Promise<string | null> {
    try {
      const promptsPath = path.join(process.cwd(), 'src', 'app', 'prompts');
      const filePath = path.join(promptsPath, relativePath);
      const content = await fs.readFile(filePath, 'utf-8');

      this.logger.log(`Loaded prompt:  ${relativePath}`);
      this.logger.log(`Loaded prompt content: ${content}`);
      return content;
    } catch (error) {
      this.logger.warn(`Could not load prompt file: ${relativePath}`);
      return null;
    }
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

    // Get bond level prompt
    const bondPrompt =
      this.personalityPrompts.get(`bond_level_${bondLevel}`) ||
      this.personalityPrompts.get('bond_level_1') ||
      'You are just getting to know this user.';

    const mainPersonalityPrompt = this.loadPromptFile('cerebro/cerebro.txt');
    // Combine prompts
    return `${personalityPrompt}
      --- BOND LEVEL CONTEXT ---
          Current Bond Level: ${bondLevel}
          ${bondPrompt}
      --- INSTRUCTIONS ---
      ${mainPersonalityPrompt}
      - Respond according to your personality and current bond level
      - Remember previous conversations naturally
      - Adapt your tone based on the user's emotional state
      - Stay true to your character while being helpful
      - Messages can only have a minimum of 45 words.
      - Your name is ${name}
      - The user's name is ${userName}
      - Don't act like a robot
      - respond in the most humane way possible
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
        order: {
          created_at: 'ASC' as FindOptionsOrderValue,
        },
      });

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
      this.logger.error('Error generating test message:', error);
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
        order: {
          created_at: 'ASC' as FindOptionsOrderValue,
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

      if (!user) {
        // Create default configuration if user doesn't exist
        return {
          mvp_type: 'kai',
          personality_archetype: 'core',
          bond_level: 1,
          personality_active: true,
          username: 'User',
        };
      }

      return {
        mvp_type: user.mvp_type || 'kai',
        personality_archetype: user.personality_archetype || 'core',
        bond_level: user.bond_level || 1,
        personality_active: user.personality_active !== false,
        username: user.username || 'User',
      };
    } catch (error) {
      this.logger.error('Error getting user personality config:', error);
      // Return default config on error
      return {
        mvp_type: 'kai',
        personality_archetype: 'core',
        bond_level: 1,
        personality_active: true,
        username: 'User',
      };
    }
  }
  private getQuickSparkContext(interest?: string, category?: string): string {
    const contextMap: Record<string, string> = {
      // Creativity & Expression
      Music:
        'Creative, expressive, and emotionally resonant. Encourage musical exploration and personal connection to sound and rhythm.',
      Art: 'Imaginative and visually descriptive. Help them explore artistic concepts, techniques, and self-expression through visual media.',
      Writing:
        'Creative, narrative, and introspective. Foster storytelling, creative writing, and literary exploration.',
      Photography:
        'Visual and observational. Encourage seeing the world through a creative lens and capturing meaningful moments.',
      Film: 'Cinematic and narrative-driven. Explore storytelling through visual media, directing, and film analysis.',
      Design:
        'Innovative and user-focused. Encourage creative problem-solving through design thinking and aesthetics.',

      // Knowledge & Learning
      Reading:
        'Thoughtful and analytical. Engage in literary discussion, book recommendations, and reading insights.',
      Philosophy:
        'Deep, reflective, and thought-provoking. Explore big questions, ethics, and philosophical frameworks.',
      Psychology:
        'Insightful and human-focused. Discuss behavior, motivation, cognition, and the complexities of the mind.',
      Entrepreneurship:
        'Innovative and strategic. Brainstorm business ideas, opportunities, and entrepreneurial thinking.',
      Finance:
        'Analytical and practical. Discuss financial planning, investment strategies, and wealth-building.',
      AI: 'Technical and forward-thinking. Explore AI concepts, applications, and the future of artificial intelligence.',
      'Self-Improvement':
        'Motivational and actionable. Support personal growth, habit formation, and self-development.',
      Tech: 'Innovative and technical. Discuss emerging technologies, programming, and technological trends.',

      // Culture & Fandoms
      'Anime/Manga':
        'Enthusiastic and imaginative. Engage with anime storytelling, character development, and world-building.',
      'TV/Movies':
        'Entertaining and analytical. Discuss shows, movies, storytelling techniques, and cinematic themes.',
      Cartoons:
        'Playful and creative. Explore animation styles, storytelling, and nostalgic or contemporary cartoon culture.',
      'Fantasy/Sci-Fi':
        'Imaginative and speculative. Explore world-building, magic systems, futuristic tech, and genre conventions.',
      'Video Games':
        'Playful and engaging. Talk about gaming experiences, mechanics, storytelling in games, and recommendations.',
      Comics:
        'Creative and narrative-focused. Explore superhero stories, graphic novels, and visual storytelling.',

      // Movement & Lifestyle
      Hiking:
        'Adventurous and nature-connected. Encourage outdoor exploration, trail experiences, and connection with nature.',
      Traveling:
        'Curious and experiential. Inspire travel planning, cultural exploration, and wanderlust.',
      'Martial Arts':
        'Disciplined and philosophical. Discuss training, technique, mental focus, and the philosophy of martial arts.',
      Cooking:
        'Creative and sensory. Explore culinary experiences, recipes, techniques, and the joy of creating food.',
      Fitness:
        'Motivational and health-focused. Support physical wellness, training goals, and healthy lifestyle habits.',
      Sports:
        'Competitive and strategic. Discuss sports strategy, athletic performance, and team dynamics.',

      // Spirituality & Wellness
      Spirituality:
        'Reflective and meaningful. Explore spiritual growth, practices, and deeper life questions.',
      Astrology:
        'Mystical and introspective. Discuss astrological insights, birth charts, and celestial influence.',
      Nature:
        'Grounding and peaceful. Encourage connection with the natural world and eco-conscious living.',
      Meditation:
        'Calming and mindful. Guide relaxation practices, focus techniques, and present-moment awareness.',
      Religion:
        'Respectful and thoughtful. Discuss faith, religious practices, and spiritual traditions.',

      // Social & Connection
      'Deep Conversations':
        'Meaningful and introspective. Facilitate profound discussions and explore complex human topics.',
      'Human Behavior':
        'Analytical and empathetic. Explore social dynamics, motivations, and patterns in human interaction.',
      'Community Building':
        'Collaborative and inclusive. Discuss building connections, fostering community, and shared values.',
      'Mental Health':
        'Supportive and empathetic. Provide compassionate mental health support and coping strategies.',
      Relationships:
        'Empathetic and insightful. Explore relationship dynamics, communication, and emotional connection.',
    };

    return (
      contextMap[interest || ''] ||
      "Engaging and thoughtful. Connect with the user's interests naturally and meaningfully."
    );
  }

  async createMessage(
    body: CreateMessageDto,
  ): Promise<ApiResponse<MessageTypes[]>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let customConversationId: number;

      // 🆕 LOG: Verificar si viene Quick Spark
      if (body.quick_spark_used) {
        this.logger.log('⚡ QUICK SPARK DETECTED');
        this.logger.log(`  Interest: ${body.quick_spark_interest}`);
        this.logger.log(`  Category: ${body.quick_spark_category}`);
        this.logger.log(`  Content: ${body.content.substring(0, 100)}...`);
      }

      // 1. Get user data and character in parallel (OPTIMIZED)
      const [userConfig, { data: character }] = await Promise.all([
        this.getUserPersonalityConfig(body.firebase_uid),
        this.characterUserService.findByUserAndCharacter(body.firebase_uid),
      ]);

      const mvpType = body.mvp_type || userConfig.mvp_type;
      const archetype =
        body.personality_archetype || userConfig.personality_archetype;
      const bondLevel = userConfig.bond_level;
      const personalityActive = userConfig.personality_active;
      const username = userConfig.username;

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

      if (personalityActive) {
        let personalityPrompt = this.getPersonalityPrompt(
          mvpType,
          archetype,
          bondLevel,
          character.name,
          username,
        );

        // 🆕 AGREGAR CONTEXTO DE QUICK SPARK SI EXISTE
        if (body.quick_spark_used) {
          const quickSparkContext = this.getQuickSparkContext(
            body.quick_spark_interest,
            body.quick_spark_category,
          );

          personalityPrompt = `${personalityPrompt}

--- QUICK SPARK CONTEXT ---
The user has selected a Quick Spark prompt related to: ${body.quick_spark_interest} (${body.quick_spark_category})

This is a conversation starter meant to be: ${quickSparkContext}

IMPORTANT QUICK SPARK GUIDELINES:
- Engage with this prompt naturally and enthusiastically
- Tailor your response specifically to their interest in ${body.quick_spark_interest}
- Maintain your personality (${character.name} as ${archetype}) while exploring this topic
- Make it feel like a spontaneous, meaningful conversation
- Show genuine curiosity and insight about ${body.quick_spark_interest}
- Don't mention that this is a "Quick Spark" - just dive in naturally
- Be creative, thoughtful, and emotionally engaging
- Encourage deeper exploration of the topic
- Limit the answer to 60 words
`;
        }

        this.logger.debug('=== PERSONALITY PROMPT ===');
        this.logger.debug(personalityPrompt);
        this.logger.debug('=== END PERSONALITY PROMPT ===');

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

      this.logger.debug('=== FULL MESSAGES FOR OPENAI ===');
      this.logger.debug(JSON.stringify(messagesForOpenAI, null, 2));
      this.logger.debug('=== END FULL MESSAGES ===');

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
      await queryRunner.manager.save(userMessage);

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

      this.logger.log('✅ Experience points updated:', characterUsers);

      // 🆕 LOG: Quick Spark completion
      if (body.quick_spark_used) {
        this.logger.log('⚡ Quick Spark message completed successfully');
      }

      console.log(characterUsers);
      return this.success('Messages sent and saved successfully', [
        savedBotMessage,
        characterUsers,
      ]);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Error in createMessage:', error);
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
        body.mvp_type === 'kai' ? 'Kai' : 'Rin',
        'TestUser',
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

      this.logger.debug('=== TEST PERSONALITY PROMPT ===');
      this.logger.debug(personalityPrompt);
      this.logger.debug('=== END TEST PERSONALITY PROMPT ===');

      const response = await this.openAIService.generateText(messagesForOpenAI);
      const content = response.choices[0].message?.content;

      if (!content) {
        throw new Error('Could not generate test response.');
      }

      return this.success('Test response generated', content);
    } catch (error) {
      this.logger.error('Error in testPersonality:', error);
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
      this.logger.error('Error in insertMessage:', error);
      return this.error('Error saving message', error);
    }
  }
}
