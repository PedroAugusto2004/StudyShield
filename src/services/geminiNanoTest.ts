// Simple test utility for Gemini Nano integration
import { geminiNanoService } from './geminiNanoService';

export const testGeminiNano = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('Testing Gemini Nano integration...');
    
    // Check availability
    const { available, reason } = await geminiNanoService.checkAvailability();
    if (!available) {
      return {
        success: false,
        message: `Gemini Nano not available: ${reason}`,
        details: { available, reason }
      };
    }
    
    // Try to initialize
    const initialized = await geminiNanoService.initializeNano();
    if (!initialized) {
      return {
        success: false,
        message: 'Failed to initialize Gemini Nano',
        details: { initialized }
      };
    }
    
    // Test a simple message
    const testMessage = 'Hello, can you help me with math?';
    const response = await geminiNanoService.sendMessage(testMessage);
    
    if (!response || response.trim().length === 0) {
      return {
        success: false,
        message: 'Gemini Nano returned empty response',
        details: { response }
      };
    }
    
    return {
      success: true,
      message: 'Gemini Nano integration test passed',
      details: {
        testMessage,
        response: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
        responseLength: response.length
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Gemini Nano test failed: ${error.message}`,
      details: { error: error.message, stack: error.stack }
    };
  }
};

// Console test function for development
export const runGeminiNanoTest = async () => {
  const result = await testGeminiNano();
  console.log('Gemini Nano Test Result:', result);
  return result;
};