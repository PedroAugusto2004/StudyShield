// Gemini Nano offline service using Prompt API
export class GeminiNanoService {
  private session: any = null;
  private isInitializing = false;
  private initializationPromise: Promise<boolean> | null = null;
  private cache = new Map<string, string>();
  private readonly MAX_CACHE_SIZE = 50;

  async initializeNano(): Promise<boolean> {
    // Prevent multiple simultaneous initialization attempts
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.session) {
      return true;
    }

    this.isInitializing = true;
    this.initializationPromise = this.performInitialization();
    
    try {
      const result = await this.initializationPromise;
      return result;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<boolean> {
    try {
      // Check if browser supports Prompt API (LanguageModel)
      if (typeof LanguageModel === 'undefined') {
        console.warn('Gemini Nano: LanguageModel API not available');
        return false;
      }

      // Check availability
      const availability = await LanguageModel.availability();
      console.log('Gemini Nano availability:', availability);
      
      if (availability !== 'available') {
        console.warn(`Gemini Nano: Not available. Status: ${availability}`);
        return false;
      }

      // Create session with optimized parameters
      this.session = await LanguageModel.create({
        systemPrompt: `StudyShield AI: Clear, concise educational help.`,
        temperature: 0.7,
        topK: 20
      });
      
      if (!this.session) {
        console.error('Gemini Nano: Failed to create session');
        return false;
      }

      console.log('Gemini Nano: Successfully initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini Nano:', error);
      this.session = null;
      return false;
    }
  }

  async sendMessage(message: string, context?: string): Promise<string> {
    if (!this.session) {
      throw new Error('Gemini Nano not initialized. Please ensure your browser supports Gemini Nano and it is enabled.');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    try {
      const enhancedMessage = context ? `${message}\n\n${context}` : message;
      const cacheKey = enhancedMessage.toLowerCase().trim();
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const response = await this.session.prompt(enhancedMessage);
      
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from Gemini Nano');
      }

      // Cache response
      this.updateCache(cacheKey, response);

      return response;
    } catch (error: any) {
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error('Rate limit reached. Please wait a moment before trying again.');
      }
      if (error.message?.includes('context') || error.message?.includes('length')) {
        throw new Error('Message too long. Please try a shorter message.');
      }
      throw new Error(`Failed to get response from offline AI: ${error.message || 'Unknown error'}`);
    }
  }

  async sendMessageStream(
    message: string,
    onChunk: (chunk: string) => void,
    context?: string
  ): Promise<string> {
    if (!this.session) {
      throw new Error('Gemini Nano not initialized.');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    try {
      const enhancedMessage = context ? `${message}\n\n${context}` : message;
      const cacheKey = enhancedMessage.toLowerCase().trim();
      
      // Check cache - stream cached response
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        await this.streamText(cached, onChunk);
        return cached;
      }

      // Use native streaming if available
      if (this.session.promptStreaming) {
        const stream = this.session.promptStreaming(enhancedMessage);
        const reader = stream.getReader();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          onChunk(value);
          fullResponse += value;
        }

        this.updateCache(cacheKey, fullResponse);
        return fullResponse;
      }

      // Fallback to non-streaming
      const response = await this.session.prompt(enhancedMessage);
      this.updateCache(cacheKey, response);
      await this.streamText(response, onChunk);
      return response;
    } catch (error: any) {
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error('Rate limit reached. Please wait a moment before trying again.');
      }
      if (error.message?.includes('context') || error.message?.includes('length')) {
        throw new Error('Message too long. Please try a shorter message.');
      }
      throw new Error(`Failed to get response from offline AI: ${error.message || 'Unknown error'}`);
    }
  }

  private async streamText(text: string, onChunk: (chunk: string) => void): Promise<void> {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      onChunk(i === 0 ? words[i] : ' ' + words[i]);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  }

  private updateCache(key: string, value: string): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clearCache(): void {
    this.cache.clear();
  }

  isAvailable(): boolean {
    return this.session !== null;
  }

  async checkAvailability(): Promise<{ available: boolean; reason?: string }> {
    try {
      if (typeof LanguageModel === 'undefined') {
        return { available: false, reason: 'Browser does not support Gemini Nano (LanguageModel API not found)' };
      }

      const availability = await LanguageModel.availability();
      
      if (availability !== 'available') {
        return { 
          available: false, 
          reason: `Gemini Nano status: ${availability}. Please enable experimental AI features in Chrome.` 
        };
      }

      return { available: true };
    } catch (error: any) {
      return { available: false, reason: `Error checking availability: ${error.message}` };
    }
  }

  destroy() {
    try {
      if (this.session) {
        if (typeof this.session.destroy === 'function') {
          this.session.destroy();
        }
        this.session = null;
      }
      this.cache.clear();
    } catch (error) {
      console.error('Error destroying Gemini Nano session:', error);
      this.session = null;
    }
  }

  async resetSession(): Promise<boolean> {
    this.destroy();
    return this.initializeNano();
  }

  async cloneSession(): Promise<any> {
    if (!this.session || !this.session.clone) {
      return null;
    }
    return await this.session.clone();
  }
}

export const geminiNanoService = new GeminiNanoService();