import { Conversation } from 'src/app/conversation/entity/Conversation';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MessageRole } from '../types/MessageRoleTypes';

@Entity('messages')
export class Message {
  @PrimaryColumn({ type: 'varchar', length: 36, unique: false })
  id: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.USER,
  })
  role: MessageRole;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 128 })
  firebase_uid: string; // Usuario que envía el mensaje

  @Column({ type: 'text', nullable: true })
  personality_used: string;

  @Column({ type: 'integer', nullable: true })
  bond_level_at_time: number;

  @Column()
  conversation_id: number;

  @Column({ type: 'text', default: 'kai' })
  mvp_type: string;

  @CreateDateColumn()
  created_at: Date;

  // Relación muchos a uno con conversación
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // Generar UUID antes de insertar
  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
