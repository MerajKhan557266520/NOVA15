
export enum AppState {
  LOCKED = 'LOCKED',
  SCANNING = 'SCANNING',
  CONNECTING = 'CONNECTING',
  AUTHORIZED = 'AUTHORIZED',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
}

export enum OSView {
  NEXUS = 'NEXUS', 
  TERMINAL = 'TERMINAL',
  DATA_STREAM = 'DATA_STREAM',
  SECURITY = 'SECURITY'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
}

export interface SystemStats {
  cpu: number;
  memory: number;
  network: number;
  temperature: number;
}

export interface MarketData {
  symbol: string;
  price: string;
  change: string;
  trend: 'up' | 'down';
}

export type NovaExpression = 'neutral' | 'happy' | 'sad' | 'curious' | 'thinking' | 'surprise';
export type NovaGesture = 'idle' | 'wave' | 'working' | 'scan' | 'explaining' | 'listening' | 'sleep';

export interface NovaResponse {
  speech: string;
  facial_expression: NovaExpression;
  gesture: NovaGesture;
  posture: 'standing' | 'leaning' | 'relaxed';
  action: string;
  wake_state: 'awake' | 'sleep';
  media_instruction?: string;
  task_instruction?: string;
}
