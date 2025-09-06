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

  @Column({ unique: true , nullable: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  password: string;

  @CreateDateColumn()
  created_at: Date;

 
}
