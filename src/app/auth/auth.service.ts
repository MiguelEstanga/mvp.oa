import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { FirebaseAdminService } from '../core/service/firabase/firabaseAdmin.service';
import { LoginDto } from './dto/LoginDto';
import * as bcrypt from 'bcrypt';
import { UserResponseMapper } from '../user/mapper/user-mapper';
import { UpdateTokenFcmDto } from './dto/updateTokenFcm.dto';
import * as admin from 'firebase-admin';
import { InactivityNotificationDto } from './dto/InactivityNotificationDto';
import { OpenAIService } from '../openia/openia.service';
import { ConversationService } from '../conversation/conversation.service';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/CreateMessageDto';
import { MessageInsertTypes } from '../message/types/MessageTypes';
import { MessageRole } from '../message/types/MessageRoleTypes';
import { CreateConversationDto } from '../conversation/dto/CreateConversationDto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
import { ApiResponse } from '../core/types/ResponseType';
import { BaseService } from '../core/helper/BaseResponse';
import { Logger } from '@nestjs/common';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { VerifyCodeDto } from './dto/VerifyCodeDto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';

@Injectable()
export class AuthService extends BaseService {
  getUserByFirebaseUid(uid: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly openAIService: OpenAIService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async loginUser(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Validate email format
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      // 1️⃣ Check user in DB
      const user = await this.userRepository.findOne({ where: { email } });
      console.log(`estado de la cuenta ${user}`);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 2️⃣ Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 3️⃣ Verify user in Firebase
      let userRecord;
      try {
        userRecord = await this.firebaseAdminService
          .getAuth()
          .getUserByEmail(email);
      } catch (firebaseError) {
        // User exists in DB but not in Firebase (inconsistency)
        console.error('User not found in Firebase:', firebaseError);
        throw new InternalServerErrorException(
          'Synchronization error. Please contact support.',
        );
      }

      // 4️⃣ Check that Firebase account is not disabled
      if (userRecord.disabled) {
        throw new UnauthorizedException('Account disabled');
      }

      // 5️⃣ Generate custom token
      const customToken = await this.firebaseAdminService
        .getAuth()
        .createCustomToken(userRecord.uid);

      const responseData = UserResponseMapper.toLoginResponse(
        user,
        userRecord,
        customToken,
      );

      return {
        success: true,
        message: 'Login successful',
        data: responseData,
      };
    } catch (error) {
      console.error('Error in login:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Server error');
    }
  }

  async registerUser(req: any) {
    let userRecord: any = null;

    try {
      const { email, password, displayName } = req;

      // Validate required fields
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      // Validate basic email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('Invalid email format');
      }

      // 🔥 STRICT VALIDATION: Check if email ALREADY exists in DB
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      const existingUserName = await this.userRepository.findOne({
        where: { username: displayName },
      });
      if (existingUserName) {
        throw new ConflictException('Username is already taken');
      }
      if (existingUser) {
        throw new ConflictException('Email is already registered in database');
      }

      // 🔥 STRICT VALIDATION: Check if email ALREADY exists in Firebase
      try {
        await this.firebaseAdminService.getAuth().getUserByEmail(email);
        // If we get here, user exists in Firebase
        throw new ConflictException('Email is already registered in Firebase');
      } catch (firebaseError) {
        // If error is "user not found", it's ok, we can continue
        if (firebaseError.code !== 'auth/user-not-found') {
          // Any other Firebase error, we throw it
          throw firebaseError;
        }
      }

      // Create user in Firebase
      userRecord = await this.firebaseAdminService.getAuth().createUser({
        email,
        password,
        displayName,
      });

      console.log('User created in Firebase:', userRecord.uid);

      // Generate custom token
      const customToken = await this.firebaseAdminService
        .getAuth()
        .createCustomToken(userRecord.uid);

      // Hash password for DB
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save in DB
      const newUserData = {
        firebase_uid: userRecord.uid,
        username: displayName,
        email: userRecord.email,
        statte: 1,
        password: hashedPassword,
        bond_level:1
      };

      const user = await this.userRepository.save(newUserData);

      return {
        success: true,
        message: 'User created successfully',
        data: {
          uid: user.firebase_uid,
          email: user.email,
          displayName: user.username,
          token: customToken,
          mvpType: user.mvp_type,
          personalityArchetype: user.personality_archetype,
          bondLevel: user.bond_level,
          description: user.descriptions,
          birth_day: user.birth_day,
          state: user.state,
        },
      };
    } catch (error) {
      console.error('Error in registration:', error);

      // Rollback: delete from Firebase if created
      if (userRecord?.uid) {
        try {
          await this.firebaseAdminService.getAuth().deleteUser(userRecord.uid);
          console.log('User deleted from Firebase due to DB error');
        } catch (deleteError) {
          console.error('Error deleting user from Firebase:', deleteError);
        }
      }

      // Firebase errors
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email is already registered in Firebase');
      }

      if (error.code === 'auth/invalid-email') {
        throw new BadRequestException('Invalid email format');
      }

      if (error.code === 'auth/weak-password') {
        throw new BadRequestException('Password must be at least 6 characters');
      }

      // DB error (unique constraint)
      if (error.code === '23505') {
        throw new ConflictException('User already exists in database');
      }

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Server error');
    }
  }

  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ApiResponse<any>> {
    try {
      const { email } = forgotPasswordDto;

      // Buscar usuario por email
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return this.success(
          'Si el email está registrado, recibirás un código de recuperación',
          null,
        );
      }

      // Generar código de 6 dígitos
      const resetCode = this.generateResetCode();
      const resetCodeExpires = new Date();
      resetCodeExpires.setMinutes(resetCodeExpires.getMinutes() + 15); // Expira en 15 minutos

      user.reset_password_code = resetCode;
      user.reset_password_expires = resetCodeExpires;

      this.userRepository.save(user);
      // solo cuando el smtp este listo
      const mail = await this.mailService.sendPasswordResetCode(
        email,
        resetCode,
        user.username || user.email,
      );
      console.log(email);
      if (mail.success) {
        return this.success(
          'Si el email está registrado, recibirás un código de recuperación',
          { email },
        );
      }

      return this.error('Error al enviar el código de recuperación', mail);
    } catch (error) {
      Logger.error('Error en forgotPassword:', error);
      return this.error('Error al procesar la solicitud', error);
    }
  }
  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    try {
      const { email, code } = verifyCodeDto;
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return this.error('No existe un usuario con ese email');
      }

      if (user.reset_password_code !== code) {
        return this.error(
          'El código de verificación no coincide con el registro',
        );
      }

      return this.success('codigo confirmado');
    } catch (error) {
      Logger.error('Error en verifyCode:', error);
      return this.error('Error al procesar la solicitud', error);
    }
  }
  /**
   * Paso 2: Validar código y cambiar contraseña
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiResponse<any>> {
    try {
      const { email, code, newPassword } = resetPasswordDto;

      // Buscar usuario con código válido y no expirado
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      if (!user || user.reset_password_code !== code) {
        throw new BadRequestException('code expired or invalid');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña y limpiar código
      user.password = hashedPassword;
      user.reset_password_code = null;
      user.reset_password_expires = null;
      await this.userRepository.save(user);

      // Enviar confirmación por email
      await this.mailService.sendPasswordChangedConfirmation(
        email,
        user.username || user.email,
      );

      return this.success('Contraseña actualizada correctamente', {
        email,
        changed: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        return this.error(error.message, null);
      }

      return this.error('Error al restablecer la contraseña', error);
    }
  }

  async updateTokenFcm(data: UpdateTokenFcmDto) {
    try {
      const { firebase_uid, token_fcm } = data;
      const user = await this.userRepository.findOne({
        where: { firebase_uid },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.token_fcm = token_fcm;
      await this.userRepository.save(user);
      return {
        success: true,
        message: 'Token updated successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error in updateTokenFcm:', error);
      throw new InternalServerErrorException('Server error');
    }
  }

  async verifyTokenFcm(firebase_uid: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { firebase_uid },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.token_fcm) {
        return {
          success: false,
          message: 'Token not updated',
          data: user,
        };
      }

      return {
        success: true,
        message: 'Token updated successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error in updateTokenFcm:', error);
      throw new InternalServerErrorException('Server error');
    }
  }

  //updated state acount

  async updateStateAcount(firebase_uid: string, state: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { firebase_uid },
      });

      if (!user) {
        throw new NotFoundException('user with firabase_uid');
      }
      user.state = state;
      const updateUser = await this.userRepository.save(user);
      return {
        success: true,
        stateAcount: updateUser.state,
      };
    } catch (error) {
      console.error('Error in updateStateAcount:', error);
      throw new InternalServerErrorException('Server error');
    }
  }
  //
  async getStateAcount(firebase_uid: string) {
    try {
      const acountState = await this.userRepository.findOne({
        where: {
          firebase_uid,
        },
      });

      if (!acountState) {
        throw new InternalServerErrorException('server error user not fount');
      }

      return {
        success: true,
        stateAcount: acountState.state,
      };
    } catch (error) {
      console.log('error in getStateAcount');
      throw new InternalServerErrorException('error getStateAcount');
    }
  }

  /**
   * 📩 Handles user inactivity by sending a contextual or greeting message.
   */
  async sendInactivityNotification(body: InactivityNotificationDto) {
    try {
      console.log('📥 Inactivity detected:', body);
      const { firebase_uid } = body;

      // 1️⃣ Find user
      const user = await this.userRepository.findOne({
        where: { firebase_uid },
      });

      if (!user || !user.token_fcm) {
        console.warn('⚠️ User not found or missing FCM token:', firebase_uid);
        throw new BadRequestException('User not found or missing FCM token');
      }

      // 2️⃣ Fetch last conversation
      const conversationResponse =
        await this.conversationService.getConversations(firebase_uid);

      let messageBody: string;
      let conversationId: string;

      const hasConversations =
        conversationResponse?.data && conversationResponse.data.length > 0;

      console.log(
        '📥 Conversations found:',
        hasConversations ? conversationResponse.data.length : 0,
      );

      if (!hasConversations) {
        // 💤 No previous conversation → create a new one
        const newConversation: CreateConversationDto = {
          name: 'mvp.ia chat',
          firebase_uid,
        };

        const createdConversation =
          await this.conversationService.createConversation(newConversation);
        conversationId = String(createdConversation.data.id);

        console.log('🆕 New conversation created:', conversationId);

        // Generate a friendly greeting
        messageBody = this.getRandomGreeting();
      } else {
        // 💬 Get last conversation and its messages
        const lastConversation =
          conversationResponse.data[conversationResponse.data.length - 1];
        const messagesChat: any = lastConversation.messages || [];
        conversationId = String(lastConversation.id);

        console.log('🗂️ Last conversation:', {
          id: conversationId,
          totalMessages: messagesChat.length,
        });

        // 🧩 If conversation exists but has no messages → reuse it as new
        if (messagesChat.length === 0) {
          messageBody = this.getRandomGreeting();
        } else {
          // 3️⃣ Build OpenAI prompt
          const metadata: ChatCompletionMessageParam[] = [
            {
              role: 'system',
              content:
                'You are an empathetic, casual, and concise assistant. Your task is to send a single short message (max 50 characters) to naturally resume the conversation. If the previous chat doesn’t make much sense, create a fun message like: "haha you were kind of wild yesterday 😅".',
            },
            ...messagesChat.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content:
                'Based on the previous context, write a short, friendly phrase to restart the chat naturally.',
            },
          ];

          // 4️⃣ Generate message using OpenAI
          const completion = await this.openAIService.generateText(metadata);
          messageBody =
            completion.choices?.[0]?.message?.content?.trim() ||
            'Shall we continue our last chat? 💬';
        }
      }

      // 5️⃣ Insert the generated message (bot)
      const payload: MessageInsertTypes = {
        content: messageBody,
        firebase_uid: user.firebase_uid,
        conversation_id: Number(conversationId),
        role: MessageRole.BOT,
      };

      await this.messageService.insertMessage(payload);
      console.log('💬 Bot message inserted into conversation:', conversationId);

      // 6️⃣ Send push notification via FCM
      const fcmMessage = {
        notification: {
          title: '👑 MVP',
          body: messageBody,
        },
        data: {
          type: 'inactivity_alert',
          conversation_id: conversationId,
          action: 'open_chat',
          message: messageBody,
        },
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'high_importance_channel',
            icon: 'ic_notification',
            sound: 'default',
          },
        },
        token: user.token_fcm,
      };

      const response = await admin.messaging().send(fcmMessage);
      console.log('✅ Notification sent successfully');

      return {
        success: true,
        messageId: response,
        conversationId,
      };
    } catch (error) {
      console.error('❌ Error sending inactivity notification:', error);
      throw new InternalServerErrorException(
        'Error sending inactivity notification',
      );
    }
  }

  /**
   * 🤖 Generates a random friendly greeting for new users.
   */
  private getRandomGreeting(): string {
    const greetings = [
      '👋 Hey there! How are you today?',
      'Hi! Got something new to share?',
      'Hey! Long time no chat 😄',
      'Ready for a quick talk? 💬',
      'Hello! Are you around? 👀',
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { email, newPassword, oldPassword } = changePasswordDto;

    try {
      // 1. Buscar al usuario por email
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        // Usa una excepción genérica para no dar pistas si el email existe o no
        throw new NotFoundException('Usuario o contraseña incorrectos');
      }

      // 2. Verificar la contraseña antigua de forma ASÍNCRONA (Mejor rendimiento)
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Contraseña antigua incorrecta');
      }

      // 3. Generar el hash de la nueva contraseña
      // El factor de sal (saltRounds) de 10 es un buen valor predeterminado
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // 4. Guardar los cambios
      const updatedUser = await this.userRepository.save(user);

      // 5. Preparar la respuesta: Excluir la contraseña (¡Mejora de seguridad!)
      // Esto asume que tu entidad tiene una propiedad 'password'
      const { password, ...userData } = updatedUser;

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: userData, // Retorna todo el usuario EXCEPTO el hash
      };
    } catch (error) {
      // Registrar el error para el servidor (debugging)
      console.error('Error al cambiar la contraseña:', error);

      // Si el error es una excepción de NestJS (NotFound, BadRequest), relanzarla.
      if (error.status) {
        throw error;
      }

      // Para cualquier otro error (ej: error de DB), lanzar un error 500
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al procesar la solicitud.',
      );
    }
  }
}
