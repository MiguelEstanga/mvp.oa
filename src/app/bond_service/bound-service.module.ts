import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CharacterUser } from "../character_users/entitis/character-user.entiti";
import { BondService } from "./BondService.service";

@Module({
  imports: [TypeOrmModule.forFeature([CharacterUser])],
  providers: [BondService],
  exports: [BondService],
})
export class BondServiceModule {}