import { forwardRef, Module } from '@nestjs/common';
import { CharacterUserController } from './character-user.controller';
import { CharacterUserService } from './character-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterUser } from './entitis/character-user.entiti';
import { AuthModule } from '../auth/auth.module';
 

@Module({
  imports: [
    
    TypeOrmModule.forFeature([CharacterUser]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CharacterUserController],
  providers: [CharacterUserService],
  exports: [CharacterUserService],
})
export class CharacterUserModule {}