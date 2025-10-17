import { MessageTypes } from "src/app/message/types/MessageTypes";

export interface ConversationTypes {
  id: number;
  name: string;
  firebase_uid: string;
  created_at: Date;
  messages?: MessageTypes[];
}