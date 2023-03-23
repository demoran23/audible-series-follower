export type MessageType = 'refresh' | 'show-app' | 'initialize';

export interface IMessage {
  type: MessageType;
  data: any;
}
