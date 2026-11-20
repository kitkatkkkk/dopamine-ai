import type {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  IChatService,
  PsychologistBookingRequest,
  SupportedLanguage,
} from '../types/chat.ts';
import { MockChatService } from './mockChatService.ts';

/**
 * DOPAMINE AI - Chat Service
 * Clean, typed service module for easy integration by other developers.
 *
 * Supports:
 * - 'live': sends requests to server endpoint (/api/chat)
 * - 'demo': runs fully in-browser using MockChatService (works offline, no backend required)
 * - 'auto': tries server endpoint first, gracefully falls back to mock demo mode on network failure
 */

export type ServiceMode = 'auto' | 'live' | 'demo';

export class ChatService implements IChatService {
  private apiEndpoint: string;
  private mode: ServiceMode;

  constructor(apiEndpoint = '/api/chat', mode: ServiceMode = 'auto') {
    this.apiEndpoint = apiEndpoint;
    this.mode = mode;
  }

  public setMode(mode: ServiceMode) {
    this.mode = mode;
  }

  public getMode(): ServiceMode {
    return this.mode;
  }

  public async checkBackendHealth(): Promise<{ configured: boolean; model: string; reachable: boolean }> {
    try {
      const healthUrl = this.apiEndpoint.replace(/\/chat$/, '/health');
      const res = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('Health check non-200');
      const data = await res.json();
      return {
        configured: Boolean(data.configured),
        model: data.activeModel || 'dopamine-scripted-demo',
        reachable: true,
      };
    } catch {
      return {
        configured: false,
        model: 'dopamine-scripted-demo (offline)',
        reachable: false,
      };
    }
  }

  public async sendMessage(req: ChatRequest): Promise<ChatResponse> {
    const payload = {
      ...req,
      message: (req.message || '').trim(),
    };

    // In demo mode or if requested, bypass network entirely
    if (this.mode === 'demo') {
      // Simulate realistic typing delay (400-800ms) for pleasant UX
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MockChatService.processMessage(payload);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (networkError: any) {
      console.warn('[DOPAMINE AI] Network/API call failed:', networkError?.message);

      // In auto mode, gracefully fall back to local scripted demo mode
      if (this.mode === 'auto') {
        const mockFallback = await MockChatService.processMessage(req);
        return {
          ...mockFallback,
          isDemo: true,
          model: `dopamine-scripted-demo (Offline Fallback)`,
        };
      }

      // In strict live mode, throw error so UI can display network retry button
      throw new Error(
        req.language === 'kk'
          ? 'Желілік байланыс қатесі. Сервер қолжетімсіз. Демо режимге ауысып көріңіз.'
          : 'Сетевая ошибка. Сервер недоступен. Попробуйте переключиться в демо-режим.'
      );
    }
  }

  public getInitialMessage(language: SupportedLanguage = 'kk'): ChatMessage {
    return MockChatService.getInitialMessage(language);
  }

  public getSuggestedStarters(language: SupportedLanguage = 'kk'): string[] {
    return MockChatService.getSuggestedStarters(language);
  }

  public async submitPsychologistBooking(req: PsychologistBookingRequest): Promise<any> {
    const endpoint = this.apiEndpoint.replace(/\/chat$/, '/connect-psychologist');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback mock booking
    }

    // Purely fictional demo response
    return {
      success: true,
      isDemo: true,
      notice: 'Демонстрациялық жазба (Офлайн)',
      messageKk: 'Рахмет! Өтінішің қабылданды (демо). Қызылорда студенттік қолдау маманы жақында хабарласады.',
      messageRu: 'Спасибо! Ваша заявка принята (демо). Специалист службы поддержки свяжется с вами.',
      bookingDetails: {
        id: 'DEMO-' + Math.floor(1000 + Math.random() * 9000),
        institution: req.institution,
        preferredTime: req.preferredTime,
        status: 'Демо-кеңес жоспарланды',
      },
    };
  }
}

// Export singleton instance for easy import by other developers
export const defaultChatService = new ChatService('/api/chat', 'auto');
