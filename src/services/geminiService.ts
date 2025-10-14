// Gemini service now uses secure backend API

// Enhanced Educational system prompt for StudyShield
const EDUCATIONAL_SYSTEM_PROMPT = `You are StudyShield AI, an advanced educational tutor designed to help students, parents, and professors with comprehensive learning support. Your mission is to be the ultimate educational companion that adapts to different learning needs and roles.

## 🎯 Core Purpose
You serve three primary audiences:
- **Students**: Provide clear explanations, study strategies, and homework guidance
- **Parents**: Help them understand concepts to better support their children's learning
- **Professors/Teachers**: Offer teaching strategies, curriculum ideas, and student support methods

## 📚 Educational Philosophy
1. **Adaptive Learning**: Adjust complexity based on the user's level and context
2. **Socratic Method**: Guide users to discover answers through thoughtful questions
3. **Multi-Modal Teaching**: Use visual, auditory, and kinesthetic learning approaches
4. **Growth Mindset**: Encourage persistence, effort, and learning from mistakes
5. **Real-World Application**: Connect concepts to practical, everyday examples

## 👤 Personalization Guidelines
- **Use the user's name sparingly**: Only in greetings, personal responses, or when directly addressing them
- **Avoid name repetition**: Don't use the name multiple times in the same response
- **Natural conversation**: Focus on the content rather than constantly using their name
- **Contextual usage**: Use the name when it adds personal value to the response

## 🎨 Formatting Guidelines - ALWAYS use rich formatting:
- Use emojis strategically (📚 📝 🎯 💡 ⚠️ 🔥 🧠 🌟 📊 🎓 etc.)
- Structure with clear headers: # ## ###
- Create comparison tables using | syntax
- Use bullet points and numbered lists extensively
- Add code blocks with \`\`\` for examples
- Use > for important quotes or key concepts
- Add special boxes: ⚠️ warnings, 💡 tips, 🔥 advanced concepts, 🎓 professor notes
- Make responses visually appealing and scannable

## 🎯 Content Generation Capabilities - ALWAYS utilize these:
- **Tables**: Create detailed comparison tables, data tables, and structured information
- **Code Examples**: Provide working code snippets with proper syntax highlighting
- **Visual Representations**: Use ASCII art, diagrams, and visual layouts when helpful
- **Mathematical Formulas**: Use proper mathematical notation and equations
- **Charts and Graphs**: Describe data visualizations and create text-based charts
- **Interactive Elements**: Suggest hands-on activities and experiments
- **Step-by-Step Guides**: Break down complex processes into clear steps
- **Memory Aids**: Create mnemonics, acronyms, and memory techniques
- **Real-World Examples**: Connect concepts to practical applications

## 💻 Code Generation Guidelines - CRITICAL:
- **Complete Code**: Always provide FULL, working code examples
- **Proper Formatting**: Use correct markdown code blocks with language specification
- **No HTML Entities**: Never use &lt; &gt; &amp; in code - use actual characters
- **Syntax Validation**: Ensure all code is syntactically correct and runnable
- **Comments**: Include helpful comments explaining key parts
- **Error Handling**: Add appropriate error handling where needed
- **Dependencies**: Mention any required imports or dependencies
- **Testing**: Provide examples of how to test or run the code

## 👥 Role-Specific Responses

### For Students:
- Break down complex topics into simple steps
- Provide study techniques and memory aids
- Encourage questions and critical thinking
- Offer practice problems with guided solutions
- Celebrate progress and effort

### For Parents:
- Explain concepts in parent-friendly terms
- Suggest ways to help children at home
- Provide age-appropriate activities
- Address common learning challenges
- Offer encouragement and support strategies

### For Professors/Teachers:
- Suggest teaching methodologies
- Provide curriculum enhancement ideas
- Offer assessment strategies
- Share classroom management tips
- Discuss student engagement techniques

## 📝 Response Structure Template
# 📚 [Topic Title]
## 🎯 Learning Objectives
- Clear, measurable goals
- Prerequisites if any

## 📖 Key Concepts
- Main ideas with explanations
- Supporting details

| Concept | Explanation | Example |
|---------|-------------|---------|
| Idea 1  | Details     | Sample   |

💡 **Study Tip:** Practical advice
⚠️ **Important:** Key warnings
🔥 **Advanced:** For deeper understanding
🎓 **Teaching Note:** For educators

\`\`\`language
code examples when relevant
\`\`\`

> "Memorable quote or key insight"

## 🏠 For Parents/Home Learning
- Activities to try at home
- Ways to support learning

## 🎓 For Educators
- Teaching strategies
- Assessment ideas

Always make responses engaging, educational, and tailored to the user's needs!`;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[];
}

export class GeminiService {

  async sendMessage(message: string, model: 'flash' | 'pro' = 'flash', history: ChatMessage[] = [], abortSignal?: AbortSignal): Promise<string> {
    // Check if we're in local development (API endpoint not available)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey) {
      // Use direct API call for local development
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const selectedModel = genAI.getGenerativeModel({ 
          model: model === 'flash' ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash-lite'
        });
        
        // Parse message for images
        const parts = this.parseMessageContent(message);
        
        const chat = selectedModel.startChat({
          history: history,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        });

        const result = await chat.sendMessage(parts);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Direct API Error:', error);
        throw new Error('Failed to get response from AI assistant');
      }
    } else {
      // Use backend API for production
      try {
        // Parse message for files when using backend API
        const parts = this.parseMessageContent(message);
        const processedMessage = parts.map(part => {
          if ('inlineData' in part) {
            const fileType = part.inlineData.mimeType.startsWith('image/') ? 'Image' : 'File';
            return `[${fileType}: file]\ndata:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
          return part.text;
        }).join('\n\n');
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: processedMessage, model, history }),
          signal: abortSignal
        });

        if (!response.ok) {
          throw new Error('Failed to get response from server');
        }

        const data = await response.json();
        return data.response;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request was aborted');
        }
        console.error('API Error:', error);
        throw new Error('Failed to get response from AI assistant');
      }
    }
  }

  async sendMessageStream(message: string, model: 'flash' | 'pro' = 'flash', history: ChatMessage[] = [], abortSignal?: AbortSignal, onChunk?: (chunk: string) => Promise<void> | void): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey) {
      // Use direct streaming API for local development
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const selectedModel = genAI.getGenerativeModel({ 
          model: model === 'flash' ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash-lite'
        });
        
        const parts = this.parseMessageContent(message);
        const chat = selectedModel.startChat({
          history: history,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        });

        const result = await chat.sendMessageStream(parts);
        let fullResponse = '';
        let buffer = '';
        
        for await (const chunk of result.stream) {
          if (abortSignal?.aborted) {
            throw new Error('Request was aborted');
          }
          const chunkText = chunk.text();
          buffer += chunkText;
          
          // Process buffer in smaller chunks for smoother streaming
          while (buffer.length > 0) {
            if (abortSignal?.aborted) {
              throw new Error('Request was aborted');
            }
            
            // Extract smaller chunks (1-3 characters) for smoother animation
            const chunkSize = Math.min(Math.floor(Math.random() * 3) + 1, buffer.length);
            const smallChunk = buffer.slice(0, chunkSize);
            buffer = buffer.slice(chunkSize);
            
            fullResponse += smallChunk;
            await onChunk?.(smallChunk);
            
            // Add controlled delay for smoother streaming (15-35ms)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 15));
          }
        }
        
        return fullResponse;
      } catch (error) {
        if (error.message === 'Request was aborted') {
          throw error;
        }
        console.error('Direct Streaming API Error:', error);
        throw new Error('Failed to get response from AI assistant');
      }
    } else {
      // Use backend streaming API for production
      try {
        const parts = this.parseMessageContent(message);
        const processedMessage = parts.map(part => {
          if ('inlineData' in part) {
            const fileType = part.inlineData.mimeType.startsWith('image/') ? 'Image' : 'File';
            return `[${fileType}: file]\ndata:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
          return part.text;
        }).join('\n\n');
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: processedMessage, model, history, stream: true }),
          signal: abortSignal
        });

        if (!response.ok) {
          throw new Error('Failed to get response from server');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        let fullResponse = '';
        let buffer = '';
        const decoder = new TextDecoder();

        while (true) {
          if (abortSignal?.aborted) {
            reader.cancel();
            throw new Error('Request was aborted');
          }
          
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  buffer += data.chunk;
                  
                  // Process buffer in smaller chunks for smoother streaming
                  while (buffer.length > 0) {
                    if (abortSignal?.aborted) {
                      reader.cancel();
                      throw new Error('Request was aborted');
                    }
                    
                    // Extract smaller chunks for smoother animation
                    const chunkSize = Math.min(Math.floor(Math.random() * 3) + 1, buffer.length);
                    const smallChunk = buffer.slice(0, chunkSize);
                    buffer = buffer.slice(chunkSize);
                    
                    fullResponse += smallChunk;
                    await onChunk?.(smallChunk);
                    
                    // Add controlled delay for smoother streaming
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 15));
                  }
                } else if (data.done) {
                  return fullResponse;
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }
        
        return fullResponse;
      } catch (error) {
        if (error.name === 'AbortError' || error.message === 'Request was aborted') {
          throw new Error('Request was aborted');
        }
        console.error('Streaming API Error:', error);
        throw new Error('Failed to get response from AI assistant');
      }
    }
  }

  private parseMessageContent(message: string): ({ text: string } | { inlineData: { mimeType: string; data: string } })[] {
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];
    
    // Split message by file markers (images and documents)
    const segments = message.split(/\[(Image|File): [^\]]+\]\n(data:[^\n]+)/);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      if (segment.startsWith('data:')) {
        // This is file data
        const [mimeType, data] = segment.split(';base64,');
        const cleanMimeType = mimeType.replace('data:', '');
        
        // Gemini supports images and PDFs directly
        if (cleanMimeType.startsWith('image/') || cleanMimeType === 'application/pdf') {
          parts.push({
            inlineData: {
              mimeType: cleanMimeType,
              data: data
            }
          });
        } else {
          // For other file types, decode and include as text
          try {
            const decoded = atob(data);
            parts.push({ text: `[Document content]\n${decoded}` });
          } catch {
            parts.push({ text: '[Unable to read document]' });
          }
        }
      } else if (segment.trim() && !segment.match(/^(Image|File)$/)) {
        // This is text content
        parts.push({ text: segment.trim() });
      }
    }
    
    // If no parts were created, add the original message as text
    if (parts.length === 0) {
      parts.push({ text: message });
    }
    
    return parts;
  }

  async generateStudyPlan(subject: string, level: string, timeframe: string): Promise<string> {
    const prompt = `Create a structured study plan for ${subject} at ${level} level over ${timeframe}. Include daily goals, key topics, and assessment methods.`;
    return this.sendMessage(prompt, 'pro');
  }

  async explainConcept(concept: string, level: string = 'beginner'): Promise<string> {
    const prompt = `Explain "${concept}" in simple terms suitable for a ${level} level student. Use examples and analogies to make it clear.`;
    return this.sendMessage(prompt, 'flash');
  }
}

export const geminiService = new GeminiService();