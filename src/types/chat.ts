export type MessageRole = 'user' | 'assistant' | 'system';

export type SupportedLanguage = 'kk' | 'ru';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isDemo?: boolean;
  language?: SupportedLanguage;
  suggestedActions?: string[];
  showConnectButton?: boolean;
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface ChatRequest {
  message: string;
  history?: ChatHistoryItem[];
  language?: SupportedLanguage;
}

export interface ChatResponse {
  text: string;
  isDemo: boolean;
  model?: string;
  language?: SupportedLanguage;
  suggestedActions?: string[];
  showConnectButton?: boolean;
}

export interface ChatError {
  message: string;
  code?: string;
  isNetworkError?: boolean;
}

export interface IChatService {
  sendMessage(req: ChatRequest): Promise<ChatResponse>;
  getInitialMessage(language: SupportedLanguage): ChatMessage;
  getSuggestedStarters(language: SupportedLanguage): string[];
}

export interface MoodOption {
  id: string;
  emoji: string;
  labelKk: string;
  labelRu: string;
  promptKk: string;
  promptRu: string;
  colorClass: string;
}

export interface PsychologistBookingRequest {
  studentName: string;
  contact: string;
  institution: string; // school or university in Kyzylorda
  preferredTime: string;
  notes?: string;
}
