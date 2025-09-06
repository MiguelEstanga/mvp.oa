import { Controller, Get, Param } from '@nestjs/common';
import { GamerCharacterService } from './gamer-character.service';

@Controller('gamer-character')
export class GamerCharacterController {
  constructor(private readonly gamerCharacterService: GamerCharacterService) {}

  @Get()
  async getAllGamerCharacters() {
    console.log('hola');
    return this.gamerCharacterService.getAllGamerCharacters();
  }

  @Get(':id')
  async getGamerCharacterById(@Param('id') id: number) {
    return this.gamerCharacterService.getGamerCharacterById(id);
  }
}
