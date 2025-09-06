// src/app/character_users/dto/character-user.dto.ts
import { IsString, IsNumber, IsOptional, Length, Min, Max } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';
 
export class CreateCharacterUserDto {


  @IsString()
  @Length(1, 128)
  firebase_uid: string; // ✅ Corregido: era 'firabase_uid'

  @IsNumber()
  @Min(1)
  character_id: number;

  @IsString()
  @Length(1, 128)
  character_name: string;
   
}