// dto/inactivity-notification.dto.ts
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class InactivityNotificationDto {
  @IsString()
  @IsNotEmpty()
  firebase_uid: string;

  @IsNumber()
  @IsNotEmpty()
  inactive_minutes: number;

  @IsString()
  @IsNotEmpty()
  timestamp: string;
}