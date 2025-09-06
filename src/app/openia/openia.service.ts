import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Ahora, el método acepta un array de mensajes en lugar de una sola cadena de texto.
  // Esto permite enviar el historial completo de la conversación.
  async generateText(messages: ChatCompletionMessageParam[]): Promise<ChatCompletion> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
      });
      return response;
    } catch (error) {
      this.logger.error('Error al comunicarse con OpenAI:', error);
      throw new Error('No se pudo generar la respuesta del modelo.');
    }
  }
}
