// src/app/openia/openia.module.ts
import { Module } from '@nestjs/common';
 import { OpenAIService } from './openia.service';
 
@Module({
 
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenaiModule {}