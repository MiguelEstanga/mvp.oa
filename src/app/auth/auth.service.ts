import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { FirebaseAdminService } from '../core/service/firabase/firabaseAdmin.service';
import { LoginDto } from './dto/LoginDto';
import * as bcrypt from 'bcrypt';
import { UserResponseMapper } from '../user/mapper/user-mapper';
import { UpdateTokenFcmDto } from './dto/updateTokenFcm.dto';
@Injectable()
export class AuthService {
  getUserByFirebaseUid(uid: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async loginUser(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Validate email format
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      // 1️⃣ Check user in DB
      const user = await this.userRepository.findOne({ where: { email } });
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
    console.log(req);
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
        password: hashedPassword,
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

  async updateTokenFcm(data: UpdateTokenFcmDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { firebase_uid: data.firabase_uid },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.token_fcm = data.token_fcm;
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
}
