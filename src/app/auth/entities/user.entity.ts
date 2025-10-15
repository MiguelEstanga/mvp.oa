import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ length: 128 })
  firebase_uid: string;

  @Column({ length: 50 })
  @Index()
  username: string;

  @Column({ unique: true, nullable: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', default: 'core' })
  personality_archetype: string;

  @Column({ type: 'integer', default: 1 })
  bond_level: number;

  @Column({ type: 'bool', default: true })
  personality_active : boolean;

  @Column({ type: 'text', default: 'kai' })
  mvp_type: string;

  @Column({ type: 'varchar', nullable:true })
  birth_day: string;

  @Column({ type: 'text', nullable:true })
  descriptions : string;

  @Column({ type: 'varchar', nullable:true })
  token_fcm: string;

  @Column({ nullable: true })
  password: string;

  @CreateDateColumn()
  created_at: Date;
}
