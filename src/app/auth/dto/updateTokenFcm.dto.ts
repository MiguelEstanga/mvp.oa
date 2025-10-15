import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTokenFcmDto {
  @IsString()
  @IsNotEmpty()
  token_fcm: string;

  @IsString()
  @IsNotEmpty()
  firabase_uid: string;
}
