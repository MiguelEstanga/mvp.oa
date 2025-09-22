import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterUser } from '../character_users/entitis/character-user.entiti';
 
@Injectable()
export class BondService {
  constructor(
    @InjectRepository(CharacterUser)
    private characterUserRepository: Repository<CharacterUser>,
  ) {}

  /**
   * Actualiza el nivel de vínculo y los puntos de un usuario
   * basándose en el contenido de un mensaje.
   *
   * @param firebaseUid El ID único del usuario de Firebase.
   * @param messageText El texto del mensaje enviado por el usuario.
   */
  async updateBondFromMessage(firebaseUid: string, messageText: string): Promise<CharacterUser> {
    // 1. Encontrar la entidad del usuario en la base de datos.
    const userCharacter = await this.characterUserRepository.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!userCharacter) {
      console.error(`CharacterUser not found for firebaseUid: ${firebaseUid}`);
      throw new Error('CharacterUser not found for firebaseUid'); 
    }
    console.log('userCharacter', userCharacter);
    // 2. Lógica de Reinicio del Límite Diario.
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const lastReset = userCharacter.last_cap_reset_at || new Date(0);

    // Si ha pasado más de 24 horas desde el último reinicio.
    if (now.getTime() - lastReset.getTime() >= oneDayInMs) {
      userCharacter.daily_word_count = 0;
      userCharacter.daily_points_earned = 0;
      userCharacter.last_cap_reset_at = now;
    }

    // 3. Contar palabras y actualizar el contador diario.
    const wordCount = messageText.split(' ').filter(word => word.length > 0).length;
    const oldDailyWordCount = userCharacter.daily_word_count;
    const newDailyWordCount = oldDailyWordCount + wordCount;
    userCharacter.daily_word_count = newDailyWordCount;

    // 4. Determinar los puntos a ganar según la curva de progresión.
    // La curva es:
    // Nivel 1-2: +50 PV por cada 500 palabras
    // Nivel 2-3: +25 PV por cada 500 palabras
    // Nivel 3-7: +10 PV por cada 500 palabras
    // Nivel 8-10: +5 PV por cada 500 palabras
    const level = userCharacter.bond_level;
    let pointsPerSegment = 0;
    if (level >= 1 && level < 2) {
      pointsPerSegment = 50;
    } else if (level >= 2 && level < 3) {
      pointsPerSegment = 25;
    } else if (level >= 3 && level < 7) {
      pointsPerSegment = 10;
    } else if (level >= 7 && level < 10) {
      pointsPerSegment = 5;
    }

    const wordsPerSegment = 500;
    const segmentsCompletedToday = Math.floor(newDailyWordCount / wordsPerSegment) - Math.floor(oldDailyWordCount / wordsPerSegment);
    let pointsToAward = segmentsCompletedToday * pointsPerSegment;

    // 5. Aplicar el límite diario de 50 puntos.
    const pointsLeft = 50 - userCharacter.daily_points_earned;
    if (pointsToAward > pointsLeft) {
      pointsToAward = pointsLeft;
    }

    // Si se van a otorgar puntos, actualizarlos.
    if (pointsToAward > 0) {
      userCharacter.bond_points += pointsToAward;
      userCharacter.daily_points_earned += pointsToAward;

      // 6. Lógica de subida de nivel.
      while (userCharacter.bond_points >= 100 && userCharacter.bond_level < 10) {
        userCharacter.bond_level++;
        userCharacter.bond_points -= 100;
      }

      // Si el nivel es 10, no seguir acumulando puntos.
      if (userCharacter.bond_level >= 10) {
        userCharacter.bond_level = 10;
        userCharacter.bond_points = 100;
      }
    }

    // 7. Guardar los cambios en la base de datos.
    await this.characterUserRepository.save(userCharacter);
    return userCharacter;
  }
}
