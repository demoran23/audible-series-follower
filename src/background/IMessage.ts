export type MessageType = 'refresh' | 'show-app' | 'initialize' | 'clear';

export interface IMessage {
  type: MessageType;
  data?: any;
}
