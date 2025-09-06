import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from '../core/service/firabase/firabaseAdmin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Inyectamos TypeOrmModule y registramos la entidad User
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAdminService],

  exports: [AuthService], // Por si otros módulos lo necesitan
})
export class AuthModule {}
