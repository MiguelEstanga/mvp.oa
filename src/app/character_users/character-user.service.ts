import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CharacterUser } from './entitis/character-user.entiti';
import { Repository } from 'typeorm';
import { CharacterUserTypes } from './types/CharacterUserType';
import { CreateCharacterUserDto } from './dto/CharacterUserDto';
import { BaseService } from '../core/helper/BaseResponse';
import { ApiResponse } from '../core/types/ResponseType';

@Injectable()
export class CharacterUserService extends BaseService {
  constructor(
    @InjectRepository(CharacterUser)
    private readonly characterUserRepository: Repository<CharacterUser>,
  ) {
    super();
  }

  async findOrCreateCharacterUser(
    characterUser: CreateCharacterUserDto,
  ): Promise<ApiResponse<CharacterUserTypes>> {
    try {
      const existingCharacterUser = await this.characterUserRepository.findOne({
        where: {
          firebase_uid: characterUser.firebase_uid,
          character_id: characterUser.character_id,
        },
        relations: ['gamerCharacter' , 'user'],
      });
      if (existingCharacterUser) {
        return this.success(
          'CharacterUser obtenido correctamente',
          existingCharacterUser,
        );
      }

      const newCharacterUser = this.characterUserRepository.create({
        character_id: characterUser.character_id,
        name: characterUser.character_name,
        bond_level: 0,
        bond_points: 0,
        firebase_uid: characterUser.firebase_uid,
      });
      const savedCharacterUser =
        await this.characterUserRepository.save(newCharacterUser);
      return this.success(
        'CharacterUser creado correctamente',
        savedCharacterUser,
      );
    } catch (error) {
      return this.error('Error en findOrCreateCharacterUser', error);
    }
  }

  async findByUserAndCharacter(
    firebase_uid: string,
  ): Promise<ApiResponse<CharacterUserTypes>> {
    try {
      const data = await this.characterUserRepository.findOne({
        where: {
          firebase_uid,
        },
        relations: ['gamerCharacter'],
      });
      return this.success('CharacterUser obtenido correctamente', data);
    } catch (error) {
      throw new Error(
        `Error al buscar relación usuario-personaje: ${error.message}`,
      );
    }
  }
}
