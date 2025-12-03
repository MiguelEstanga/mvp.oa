// dto/CreateMessageDto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
export enum SparkType {
  CREATIVE = 'creative',
  REFLECTIVE = 'reflective',
  PLAYFUL = 'playful',
  DEEP = 'deep',
  PRODUCTIVE = 'productive',
}
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

  @IsOptional()
  @IsBoolean()
  is_quick_spark?: boolean;

  quick_spark_used?: boolean;  // Indica si viene de Quick Sparks
  quick_spark_interest?: string;  // El interés usado (ej: "Music")
  quick_spark_category?: string; 
}
