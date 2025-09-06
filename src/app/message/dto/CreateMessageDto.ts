import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { MessageRole } from '../types/MessageRoleTypes';

export class CreateMessageDto {
  

  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  role: MessageRole;

  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(5, { message: 'el contenido del msm debe tener minimo 5 linenas' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  content: string;

  @IsString({ message: 'El token de firabase es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  firebase_uid: string;

  @IsNumber()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })

  conversation_id: number;
}
