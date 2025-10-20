import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { RegisterDto } from './dto/RegisterDto';
import { UpdateTokenFcmDto } from './dto/updateTokenFcm.dto';
import { InactivityNotificationDto } from './dto/InactivityNotificationDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('state-acount/:firebase_uid') 
  async getStateAcount(@Param('firebase_uid') firebase_uid: string) {
    console.log(firebase_uid);
    try {
      // 3. Uso la variable corregida
      return this.authService.getStateAcount(firebase_uid);
    } catch (error) {
      // Es mejor relanzar el error o lanzar una excepción HTTP para que el cliente reciba una respuesta adecuada (e.g., 404 Not Found, 500 Internal Server Error).
      console.error('Error in getStateAcount endpoint:', error);
      throw error; // O una excepción NestJS como new InternalServerErrorException()
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginDto: LoginDto) {
    console.log('login')
    return await this.authService.loginUser(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerDto: RegisterDto) {
    return await this.authService.registerUser(registerDto);
  }

  @Post('updateTokenFcm')
  async getUserByFirebaseUid(@Body() data: UpdateTokenFcmDto) {
    console.log(data);
    try {
      return await this.authService.updateTokenFcm(data);
    } catch (error) {
      console.log(error);
    }
  }
  @Post('send-inactivity-notification')
  async sendInactivityNotification(@Body() body: InactivityNotificationDto) {
    return this.authService.sendInactivityNotification(body);
  }
}
