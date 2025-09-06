import { CharacterUser } from 'src/app/character_users/entitis/character-user.entiti';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('game_characters')
export class GamerCharacter {
  @PrimaryGeneratedColumn() // ✅ Cambiado de @Column() a @PrimaryColumn()
  id: number;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  description: string;


  // ✅ Relación inversa
  @OneToOne(
    () => CharacterUser,
    (characterUser) => characterUser.gamerCharacter,
  )
  characterUser: CharacterUser;
}
