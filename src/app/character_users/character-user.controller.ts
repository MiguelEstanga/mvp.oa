import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateCharacterUserDto } from "./dto/CharacterUserDto";
import { CharacterUserService } from "./character-user.service";

@Controller('character-user')
export class CharacterUserController {
  constructor(private readonly characterUserService: CharacterUserService) {}

  @Get("test")
  async Test(){
    return 'test';
  }
  @Get(":firebase_uid")
  async getAllCharacterUsers(
    @Param('firebase_uid') firebase_uid: string,
  ) {
    console.log('fira base_uid');
     console.log(firebase_uid);
     return  await this.characterUserService.findByUserAndCharacter(firebase_uid);
  }
  
  @Post()
  async createCharacterUser(@Body() characterUser: CreateCharacterUserDto) {
    try {
      console.log(characterUser);
      const createdCharacterUser =
      await this.characterUserService.findOrCreateCharacterUser(characterUser);
      return {
        success: true,
        message: 'CharacterUser creado correctamente',
        data: createdCharacterUser,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear CharacterUser',
        data: error,
      };
    }
  }
  
  
}