import { MessageRole } from "./MessageRoleTypes"

export interface MessageTypes{
  id:string,
  role:string,
  content:string,
  firabase_uid:string,
  conversation_id:number,
  created_at:Date
}

export interface MessageInsertTypes{
  content:string,
  firebase_uid:string,
  conversation_id:number,
  role:MessageRole
}