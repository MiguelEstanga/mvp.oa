import { Module } from '@nestjs/common';
import { CharacterUserController } from './character-user.controller';
import { CharacterUserService } from './character-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterUser } from './entitis/character-user.entiti';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CharacterUser,
    ]),
  ],
  controllers: [CharacterUserController],
  providers: [CharacterUserService ],
})
export class CharacterUserModule {}
