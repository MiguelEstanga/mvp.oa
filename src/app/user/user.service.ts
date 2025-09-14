import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { BaseService } from '../core/helper/BaseResponse';
import { UpdateMvpDto } from './dto/update-mvp';
import { UpdatePersonalityDto } from './dto/update-personality';
import { ApiResponse } from '../core/types/ResponseType';
import { UpdateUserDto } from './dto/update-user';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async getUserByFirebaseUid(firebase_uid: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { firebase_uid },
      });
      return this.success('Usuario obtenido correctamente', user);
    } catch (error) {
      return this.error('Error al obtener el usuario', error);
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
      return this.success('Usuario obtenido correctamente', user);
    } catch (error) {
      return this.error('Error al obtener el usuario', error);
    }
  }

  async editMvpType(body: UpdateMvpDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { firebase_uid: body.firebase_uid },
      });
      if (!user) {
        return this.error('Usuario no encontrado', null);
      }
      user.mvp_type = body.mvp_type;
      await this.userRepository.save(user);
      return this.success('MVP actualizado correctamente', user);
    } catch (error) {
      return this.error('Error al actualizar el usuario', error);
    }
  }

  async editPersonality(body: UpdatePersonalityDto) {
    try {
      console.log('body', body);
      const user = await this.userRepository.findOne({
        where: { firebase_uid: body.firebase_uid },
      });
      console.log('user', user);
      if (!user) {
        return this.error('Usuario no encontrado', null);
      }

      user.personality_archetype = body.personality_archetype;
      await this.userRepository.save(user);
      return this.success(
        'Peronality updated correctly',
        user.personality_archetype,
      );
    } catch (error) {
      return this.error('Error al actualizar el usuario', error);
    }
  }

  async editUser(data: UpdateUserDto): Promise<ApiResponse<User>> {
    try {
      const { uid, ...updateData } = data;
      console.log(updateData);
      // 1. Verificar si el usuario existe antes de actualizar
      const userExists = await this.userRepository.exists({
        where: { firebase_uid: 'ZW2fpa5EvcQQbLH1ogYhw7a0byp1' },
      });

      console.log(userExists);

      if (!userExists) {
        return this.error('User not found', null);
      }

      // 2. Usar el método update para una actualización atómica y eficiente
      await this.userRepository.update({ firebase_uid: 'ZW2fpa5EvcQQbLH1ogYhw7a0byp1' }, updateData);

      // 3. Opcional: Obtener el usuario actualizado si es necesario
      const updatedUser = await this.userRepository.findOne({
        where: { firebase_uid: "ZW2fpa5EvcQQbLH1ogYhw7a0byp1" },
      });

      return this.success('User updated correctly', {
        "uid": updatedUser?.firebase_uid,
        "displayName": updatedUser?.username,
        "email": updatedUser?.email,
        "personality_archetype": updatedUser?.personality_archetype,
        "bond_level": updatedUser?.bond_level,
        "personality_active": updatedUser?.personality_active,
        "mvp_type": updatedUser?.mvp_type,
        "birth_day": updatedUser?.birth_day,
      });
    } catch (error) {
      return this.error('Error updating user', error);
    }
  }
}
