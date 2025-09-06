import { Message } from 'src/app/message/entity/Message';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
 
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 128 })
  firebase_uid: string; // Usuario propietario de la conversación

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relación uno a muchos con mensajes
  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages: Message[];
}