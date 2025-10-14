declare global {
  interface Window {
    ai?: {
      languageModel: {
        capabilities(): Promise<{ available: string }>;
        create(options: { systemPrompt: string }): Promise<{
          prompt(message: string): Promise<string>;
          destroy(): void;
        }>;
      };
    };
  }

  // Prompt API (newer API for Gemini Nano)
  const LanguageModel: {
    availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
    create(options?: {
      signal?: AbortSignal;
      monitor?: (monitor: {
        addEventListener(event: 'downloadprogress', handler: (e: { loaded: number }) => void): void;
      }) => void;
      systemPrompt?: string;
    }): Promise<{
      prompt(message: string): Promise<string>;
      destroy(): void;
    }>;
  };
}

export {};