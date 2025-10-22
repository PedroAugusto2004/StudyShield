import { geminiService, ChatMessage } from './geminiService';
import { geminiNanoService } from './geminiNanoService';

/**
 * Available AI modes for the service
 * @typedef {'online' | 'offline' | 'guest'} AIMode
 */
export type AIMode = 'online' | 'offline' | 'guest';

/**
 * Configuration interface for AI service
 * @interface AIServiceConfig
 */
export interface AIServiceConfig {
  /** Preferred AI mode to use */
  preferredMode: AIMode;
  /** Whether to enable fallback to other modes if preferred fails */
  fallbackEnabled: boolean;
}

/**
 * AI Service class that manages communication with different AI providers
 * Handles online/offline modes, fallback strategies, and streaming responses
 * 
 * @class AIService
 * @example
 * ```typescript
 * const aiService = new AIService();
 * const response = await aiService.sendMessage('Hello, how are you?');
 * ```
 */
export class AIService {
  private config: AIServiceConfig = {
    preferredMode: 'offline',
    fallbackEnabled: true
  };

  private isOnline = navigator.onLine;
  private nanoAvailable = false;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    this.checkNanoAvailability();
    
    // Preload Nano session on app start
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.initializeNano().catch(() => {});
      });
    }
  }

  /**
   * Checks if Gemini Nano is available on the device
   * @private
   * @returns {Promise<void>}
   */
  private async checkNanoAvailability(): Promise<void> {
    try {
      const result = await geminiNanoService.checkAvailability();
      this.nanoAvailable = result.available;
    } catch {
      this.nanoAvailable = false;
    }
  }

  /**
   * Initializes Gemini Nano for offline AI processing
   * @async
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async initializeNano(): Promise<boolean> {
    try {
      const success = await geminiNanoService.initializeNano();
      this.nanoAvailable = success;
      return success;
    } catch {
      this.nanoAvailable = false;
      return false;
    }
  }

  setConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getAvailableModes(): AIMode[] {
    const modes: AIMode[] = [];
    
    if (this.isOnline) {
      modes.push('online');
    }
    
    if (this.nanoAvailable) {
      modes.push('offline', 'guest');
    }
    
    return modes;
  }

  getCurrentMode(): AIMode {
    // Determine current mode based on availability and preferences
    if (this.config.preferredMode === 'online' && this.isOnline) {
      return 'online';
    }
    
    if (this.config.preferredMode === 'offline' && this.nanoAvailable) {
      return 'offline';
    }
    
    if (this.config.preferredMode === 'guest' && this.nanoAvailable) {
      return 'guest';
    }
    
    // Fallback logic
    if (this.config.fallbackEnabled) {
      if (this.isOnline) {
        return 'online';
      }
      if (this.nanoAvailable) {
        return 'offline';
      }
    }
    
    throw new Error('No AI service available');
  }

  /**
   * Sends a message to the AI service and returns the response
   * @async
   * @param {string} message - The message to send to the AI
   * @param {Object} options - Configuration options
   * @param {'flash' | 'pro'} [options.model='flash'] - Gemini model to use
   * @param {ChatMessage[]} [options.history] - Previous conversation history
   * @param {AbortSignal} [options.abortSignal] - Signal to abort the request
   * @param {AIMode} [options.forceMode] - Force a specific AI mode
   * @returns {Promise<string>} The AI response
   * @throws {Error} When no AI service is available or request fails
   * @example
   * ```typescript
   * const response = await aiService.sendMessage('What is machine learning?', {
   *   model: 'pro',
   *   history: previousMessages
   * });
   * ```
   */
  async sendMessage(
    message: string, 
    options: {
      model?: 'flash' | 'pro';
      history?: ChatMessage[];
      abortSignal?: AbortSignal;
      forceMode?: AIMode;
    } = {}
  ): Promise<string> {
    const mode = options.forceMode || this.getCurrentMode();
    
    try {
      switch (mode) {
        case 'online':
          return await this.sendOnlineMessage(message, options);
        
        case 'offline':
        case 'guest':
          return await this.sendOfflineMessage(message, mode);
        
        default:
          throw new Error(`Unsupported mode: ${mode}`);
      }
    } catch (error) {
      // Try fallback if enabled and not forced mode
      if (this.config.fallbackEnabled && !options.forceMode) {
        return await this.handleFallback(message, mode, options, error);
      }
      throw error;
    }
  }

  /**
   * Sends a message to the AI service with streaming response
   * @async
   * @param {string} message - The message to send to the AI
   * @param {Function} onChunk - Callback function called for each response chunk
   * @param {Object} options - Configuration options
   * @param {'flash' | 'pro'} [options.model='flash'] - Gemini model to use
   * @param {ChatMessage[]} [options.history] - Previous conversation history
   * @param {AbortSignal} [options.abortSignal] - Signal to abort the request
   * @param {AIMode} [options.forceMode] - Force a specific AI mode
   * @returns {Promise<string>} The complete AI response
   * @throws {Error} When no AI service is available or request fails
   * @example
   * ```typescript
   * const response = await aiService.sendMessageStream('Explain quantum computing', 
   *   (chunk) => console.log(chunk),
   *   { model: 'pro' }
   * );
   * ```
   */
  async sendMessageStream(
    message: string,
    onChunk: (chunk: string) => Promise<void> | void,
    options: {
      model?: 'flash' | 'pro';
      history?: ChatMessage[];
      abortSignal?: AbortSignal;
      forceMode?: AIMode;
    } = {}
  ): Promise<string> {
    const mode = options.forceMode || this.getCurrentMode();
    
    try {
      switch (mode) {
        case 'online':
          return await geminiService.sendMessageStream(
            message, 
            options.model, 
            options.history, 
            options.abortSignal, 
            onChunk
          );
        
        case 'offline':
        case 'guest':
          return await this.sendOfflineMessageStream(message, mode, onChunk, options.abortSignal);
        
        default:
          throw new Error(`Unsupported mode: ${mode}`);
      }
    } catch (error) {
      // Try fallback if enabled and not forced mode
      if (this.config.fallbackEnabled && !options.forceMode) {
        return await this.handleStreamFallback(message, onChunk, mode, options, error);
      }
      throw error;
    }
  }

  private async sendOnlineMessage(
    message: string, 
    options: { model?: 'flash' | 'pro'; history?: ChatMessage[]; abortSignal?: AbortSignal }
  ): Promise<string> {
    if (!this.isOnline) {
      throw new Error('Network unavailable');
    }
    
    return await geminiService.sendMessage(
      message, 
      options.model, 
      options.history, 
      options.abortSignal
    );
  }

  private async sendOfflineMessage(message: string, mode: 'offline' | 'guest'): Promise<string> {
    if (!this.nanoAvailable) {
      throw new Error('Offline AI not available');
    }

    if (!geminiNanoService.isAvailable()) {
      const initialized = await geminiNanoService.initializeNano();
      if (!initialized) {
        throw new Error('Failed to initialize Gemini Nano');
      }
    }

    const context = mode === 'guest' ? 'Guest mode' : undefined;
    return await geminiNanoService.sendMessage(message, context);
  }

  private async handleFallback(
    message: string, 
    failedMode: AIMode, 
    options: any, 
    error: any
  ): Promise<string> {
    console.warn(`${failedMode} mode failed, trying fallback:`, error);
    
    // Try online if offline failed
    if (failedMode !== 'online' && this.isOnline) {
      try {
        return await this.sendOnlineMessage(message, options);
      } catch (onlineError) {
        console.warn('Online fallback also failed:', onlineError);
      }
    }
    
    // Try offline if online failed
    if (failedMode !== 'offline' && this.nanoAvailable) {
      try {
        return await this.sendOfflineMessage(message, 'offline');
      } catch (offlineError) {
        console.warn('Offline fallback also failed:', offlineError);
      }
    }
    
    throw error;
  }

  private async handleStreamFallback(
    message: string,
    onChunk: (chunk: string) => Promise<void> | void,
    failedMode: AIMode,
    options: any,
    error: any
  ): Promise<string> {
    console.warn(`${failedMode} streaming failed, trying fallback:`, error);
    
    // Try online streaming if offline failed
    if (failedMode !== 'online' && this.isOnline) {
      try {
        return await geminiService.sendMessageStream(
          message, 
          options.model, 
          options.history, 
          options.abortSignal, 
          onChunk
        );
      } catch (onlineError) {
        console.warn('Online streaming fallback failed:', onlineError);
      }
    }
    
    // Try offline streaming
    if (failedMode !== 'offline' && this.nanoAvailable) {
      try {
        return await this.sendOfflineMessageStream(message, 'offline', onChunk, options.abortSignal);
      } catch (offlineError) {
        console.warn('Offline streaming fallback failed:', offlineError);
      }
    }
    
    throw error;
  }

  private async sendOfflineMessageStream(
    message: string,
    mode: 'offline' | 'guest',
    onChunk: (chunk: string) => Promise<void> | void,
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (!this.nanoAvailable) {
      throw new Error('Offline AI not available');
    }

    if (!geminiNanoService.isAvailable()) {
      const initialized = await geminiNanoService.initializeNano();
      if (!initialized) {
        throw new Error('Failed to initialize Gemini Nano');
      }
    }

    const context = mode === 'guest' ? 'Guest mode' : undefined;
    
    return await geminiNanoService.sendMessageStream(
      message,
      (chunk: string) => {
        if (abortSignal?.aborted) {
          throw new Error('Request was aborted');
        }
        onChunk(chunk);
      },
      context
    );
  }

  getStatus(): {
    online: boolean;
    nanoAvailable: boolean;
    currentMode: AIMode;
    availableModes: AIMode[];
  } {
    return {
      online: this.isOnline,
      nanoAvailable: this.nanoAvailable,
      currentMode: this.getCurrentMode(),
      availableModes: this.getAvailableModes()
    };
  }
}

export const aiService = new AIService();