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
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async loginUser(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // 1️⃣ Verificar usuario en la base de datos
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException(
          'Usuario no encontrado en la base de datos',
        );
      }

      // 2️⃣ Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Contraseña incorrecta');
      }

      // 3️⃣ Obtener usuario en Firebase
      const userRecord = await this.firebaseAdminService
        .getAuth()
        .getUserByEmail(email);

      // 4️⃣ Generar custom token de Firebase
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
      console.error('Error en login:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error en el servidor: ${error.message}`,
      );
    }
  }

  async registerUser(req: any) {
    let userRecord: any = null;

    try {
      const { email, password, displayName } = req;
      console.log('displayName:', displayName);

      const check = await this.userRepository.findOne({
        where: { username: email.split('@')[0] },
      });

      if (check) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }

      // Validar campos requeridos
      if (!email || !password) {
        throw new BadRequestException('Email y contraseña son requeridos');
      }

      // Crear usuario en Firebase
      userRecord = await this.firebaseAdminService.getAuth().createUser({
        email,
        password, // Firebase maneja su hash propio
        displayName: email.split('@')[0] || 'Usuario',
      });

      console.log('Usuario creado en Firebase:', userRecord.uid);

      // Generar custom token para el usuario recién creado
      const customToken = await this.firebaseAdminService
        .getAuth()
        .createCustomToken(userRecord.uid);

      // 🔑 Hashear la contraseña para guardarla en tu BD
      const hashedPassword = await bcrypt.hash(password, 10);

      // Guardar usuario en nuestra base de datos
      const newUserData = {
        firebase_uid: userRecord.uid,
        username: userRecord.displayName || 'Usuario',
        email: userRecord.email,
        password: hashedPassword, // 👈 se guarda el hash
      };

      const user =await this.userRepository.save(newUserData);
    
      console.log('userRecord', userRecord);
      return {
        success: true,
        message: 'Usuario creado exitosamente',
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
      console.error('Error en registro:', error);

      // Si hay error y el usuario se creó en Firebase, eliminarlo
      if (userRecord?.uid) {
        try {
          await this.firebaseAdminService.getAuth().deleteUser(userRecord.uid);
          console.log('Usuario eliminado de Firebase por error en BD');
        } catch (deleteError) {
          console.error('Error eliminando usuario de Firebase:', deleteError);
        }
      }

      // Manejar errores específicos de Firebase
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('El email ya está registrado');
      }

      if (error.code === 'auth/invalid-email') {
        throw new BadRequestException('El formato del email no es válido');
      }

      if (error.code === 'auth/weak-password') {
        throw new BadRequestException(
          'La contraseña debe tener al menos 6 caracteres',
        );
      }

      // Error de base de datos
      if (error.code === '23505') {
        throw new ConflictException('El usuario ya existe en la base de datos');
      }

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error en el servidor');
    }
  }
}
