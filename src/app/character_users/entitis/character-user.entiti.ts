import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { GamerCharacter } from 'src/app/game_character/entitis/gamer_character.entiti';

@Entity('users_characters')
export class CharacterUser {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'firebase_uid',
    referencedColumnName: 'firebase_uid',
  })
  user: User;

  @Column({ length: 128 })
  firebase_uid: string;

  @ManyToOne(() => GamerCharacter)
  @JoinColumn({
    name: 'character_id',
    referencedColumnName: 'id',
  })
  gamerCharacter: GamerCharacter;

  @Column()
  character_id: number;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({ nullable: true , default: 1 })
  bond_level: number;

  @Column({ nullable: true })
  bond_points: number;

  @Column({ default: 0 })
  daily_word_count: number;

  @Column({ default: 0 })
  daily_points_earned: number;

  @Column({ type: 'timestamp', nullable: true })
  last_cap_reset_at: Date;
}
