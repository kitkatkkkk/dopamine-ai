import { GoogleGenAI } from '@google/genai';
import { DOPAMINE_AI_SYSTEM_INSTRUCTIONS } from './systemPrompt.ts';
import { MockChatService } from '../src/services/mockChatService.ts';
import type { ChatRequest, ChatResponse } from '../src/types/chat.ts';

/**
 * Server-Side AI Service for DOPAMINE AI
 *
 * Keeps secrets strictly on the server.
 * Uses configurable Gemini Model ID from environment variables.
 * Falls back to Scripted Demo Mode when no API key is provided.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// Default to standard fast model if not explicitly specified
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

let genAIClient: GoogleGenAI | null = null;

if (GEMINI_API_KEY.trim()) {
  try {
    genAIClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY.trim(),
    });
    console.log(`[DOPAMINE AI] Initialized Google GenAI SDK with model: ${GEMINI_MODEL}`);
  } catch (err) {
    console.warn('[DOPAMINE AI] Could not initialize Google GenAI SDK:', err);
  }
} else {
  console.log('[DOPAMINE AI] No GEMINI_API_KEY found. Running in Scripted Demo Mode.');
}

export function isAiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY.trim() && genAIClient);
}

export function getActiveModel(): string {
  return isAiConfigured() ? GEMINI_MODEL : 'dopamine-scripted-demo';
}

/**
 * Check if the text implies seeking human psychologist help or crisis
 */
function shouldShowConnectButton(text: string): boolean {
  const lower = text.toLowerCase();
  const triggerWords = [
    'психолог', 'dopamine connect', 'connect', 'дәрігер', 'маман',
    'консультация', 'жазылу', 'суицид', 'депрессия', '111', '103', '150',
    'поговорить с психологом', 'записаться'
  ];
  return triggerWords.some((word) => lower.includes(word));
}

/**
 * Generate AI Response with Google GenAI SDK or fallback to Mock Demo Mode
 */
export async function generateAiResponse(request: ChatRequest): Promise<ChatResponse> {
  const userText = (request.message || '').trim();

  // If AI is not configured, seamlessly return scripted demo mode
  if (!isAiConfigured() || !genAIClient) {
    const demoResponse = await MockChatService.processMessage(request);
    return {
      ...demoResponse,
      isDemo: true,
      model: 'dopamine-scripted-demo (No API Key)',
    };
  }

  try {
    // 1. Try Google AI Studio interactions API (matches dopamine-ai.ts export)
    let replyText = '';

    try {
      const interaction = await (genAIClient as any).interactions.create({
        model: GEMINI_MODEL,
        input: userText,
        system_instruction: DOPAMINE_AI_SYSTEM_INSTRUCTIONS,
        generation_config: {
          max_output_tokens: 2048,
          thinkingLevel: 'low',
        },
      });

      if (interaction && interaction.output_text) {
        replyText = interaction.output_text;
      }
    } catch (interactionError: any) {
      console.warn('[DOPAMINE AI] Interactions API call failed, falling back to models.generateContent:', interactionError?.message || interactionError);
    }

    // 2. Fallback to models.generateContent if interactions didn't return text
    if (!replyText) {
      const response = await (genAIClient as any).models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          ...(request.history?.map((h) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: h.parts,
          })) || []),
          {
            role: 'user',
            parts: [{ text: userText }],
          },
        ],
        config: {
          systemInstruction: DOPAMINE_AI_SYSTEM_INSTRUCTIONS,
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        replyText = typeof response.text === 'function' ? response.text() : response.text;
      }
    }

    if (!replyText) {
      throw new Error('Empty response received from Gemini API');
    }

    const showConnect = shouldShowConnectButton(userText) || shouldShowConnectButton(replyText);

    return {
      text: replyText,
      isDemo: false,
      model: GEMINI_MODEL,
      showConnectButton: showConnect,
      language: request.language,
    };
  } catch (error: any) {
    console.error('[DOPAMINE AI] Live Gemini API error:', error?.message || error);
    // Graceful fallback to demo mode on network or rate limit errors
    const fallbackResponse = await MockChatService.processMessage(request);
    return {
      ...fallbackResponse,
      isDemo: true,
      model: `${GEMINI_MODEL} (Fallback: ${error?.message || 'API Error'})`,
      showConnectButton: fallbackResponse.showConnectButton || shouldShowConnectButton(userText),
    };
  }
}
