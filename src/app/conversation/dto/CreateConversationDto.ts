import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  firebase_uid: string;
}
