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
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { VerifyCodeDto } from './dto/VerifyCodeDto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';

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
    console.log('login');
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

  @Get('verify-token-fcm/:firabase_uid')
  async verifyTokenFcm(@Param('firabase_uid') firebase_uid: string) {
    console.log(firebase_uid);
    try {
      return await this.authService.verifyTokenFcm(firebase_uid);
    } catch (error) {
      console.log(error);
    }
  }
  @Post('send-inactivity-notification')
  async sendInactivityNotification(@Body() body: InactivityNotificationDto) {
    return this.authService.sendInactivityNotification(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    console.log(resetPasswordDto);
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    console.log(verifyCodeDto);
    return await this.authService.verifyCode(verifyCodeDto);
  }

  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    console.log('sssssss')
    console.log(changePasswordDto);
    return await this.authService.changePassword(changePasswordDto);
  }
}
