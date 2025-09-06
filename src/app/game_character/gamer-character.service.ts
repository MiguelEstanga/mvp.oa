import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GamerCharacter } from "./entitis/gamer_character.entiti";
import { Repository } from "typeorm";
import { GamerCharacterTypes } from "./types/GamerCharacterTypes";
import { ApiResponse } from "../core/types/ResponseType";
import { BaseService } from "../core/helper/BaseResponse";

@Injectable()
export class GamerCharacterService extends BaseService {

  constructor(
    @InjectRepository(GamerCharacter)
    private readonly gamerCharacterRepository: Repository<GamerCharacter>,
  ) {
    super();
   }

  /**
   * 
   * @returns {Promise<GamerCharacterTypes[]>}
   */
  async getAllGamerCharacters(): Promise<GamerCharacterTypes[]> {
    try{
       return await this.gamerCharacterRepository.find();
    }catch(error){
      console.error('Error en getAllGamerCharacters:', error);
      throw error;
    }
  }

  /**
   * 
   * @param {number} id 
   * @returns {Promise<GamerCharacterTypes>}
   */
  async getGamerCharacterById(id: number): Promise<ApiResponse<GamerCharacterTypes[]>> {
    try{
      const gamerCharacter = await this.gamerCharacterRepository.findOne({
        where:{
          id
        }
      });
      return this.success('GamerCharacter obtenido correctamente', gamerCharacter);
    }catch(error){
      return this.error('Error al obtener GamerCharacter', error);
    }
  }
}