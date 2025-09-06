import { Module } from "@nestjs/common";
import { GamerCharacterController } from "./gamer-character.controller";
import { GamerCharacterService } from "./gamer-character.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GamerCharacter } from "./entitis/gamer_character.entiti";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GamerCharacter,
    ]),
  ],
  controllers: [
    GamerCharacterController,
  ],
  providers: [
    GamerCharacterService,
  ],
  exports: [
    GamerCharacterService,
  ],
 
})
export class GamerCharacterModule {}