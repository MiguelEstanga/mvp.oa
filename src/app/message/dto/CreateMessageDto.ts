// dto/CreateMessageDto.ts
import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'El contenido del mensaje no puede estar vacío' })
  content: string;

  @IsString()
  @IsNotEmpty({ message: 'El firebase_uid es requerido' })
  firebase_uid: string;

  @IsOptional()
  @IsNumber()
  conversation_id?: number;

  @IsOptional()
  @IsString()
  mvp_type?: string;

  @IsOptional()
  @IsString()
  personality_archetype?: string;

  @IsOptional()
  @IsBoolean()
  force_personality?: boolean;
}