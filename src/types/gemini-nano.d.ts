// Type definitions for Gemini Nano Prompt API
declare global {
  interface Window {
    ai?: {
      languageModel: {
        capabilities(): Promise<{
          available: 'readily' | 'after-download' | 'no';
          defaultTopK?: number;
          maxTopK?: number;
          defaultTemperature?: number;
        }>;
        create(options?: {
          systemPrompt?: string;
          initialPrompts?: Array<{
            role: 'system' | 'user' | 'assistant';
            content: string;
          }>;
          topK?: number;
          temperature?: number;
        }): Promise<AILanguageModelSession>;
      };
    };
  }

  // Prompt API (newer API)
  const LanguageModel: {
    availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
    create(options?: {
      signal?: AbortSignal;
      monitor?: (monitor: {
        addEventListener(event: 'downloadprogress', handler: (e: { loaded: number }) => void): void;
      }) => void;
      systemPrompt?: string;
      initialPrompts?: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
      topK?: number;
      temperature?: number;
    }): Promise<AILanguageModelSession>;
  };
}

interface AILanguageModelSession {
  prompt(input: string): Promise<string>;
  promptStreaming?(input: string): ReadableStream<string>;
  destroy(): void;
  clone?(): Promise<AILanguageModelSession>;
  temperature?: number;
  topK?: number;
}

export {};