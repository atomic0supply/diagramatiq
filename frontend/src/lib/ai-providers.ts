/**
 * AI Providers for DiagramatIQ
 * Implements Perplexity API (cloud) and Ollama (local) with fallback strategy
 */

import { AIProvider, AIResponse, DiagramContext, AIProviderType } from '@/types/ai';
import { 
  getSuggestedTemplates, 
  buildSystemPromptWithTemplate, 
  buildUserPromptWithTemplate
} from './prompt-templates';

/**
 * Perplexity API Provider
 * Cloud-based AI service for diagram generation
 */
export class PerplexityProvider implements AIProvider {
  name = 'Perplexity';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model = 'llama-3.1-sonar-small-128k-online', baseUrl = 'https://api.perplexity.ai') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });
      
      return response.status !== 401; // Not unauthorized
    } catch (error) {
      console.warn('Perplexity availability check failed:', error);
      return false;
    }
  }

  async generateDiagram(prompt: string, _context?: DiagramContext): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new AIError('Perplexity API key not configured', 'perplexity');
    }

    // Get suggested templates based on user prompt and context
    const language = _context?.language || 'mermaid';
    const suggestedTemplates = getSuggestedTemplates(prompt, language);
    
    let systemPrompt: string;
    let userPrompt: string;

    if (suggestedTemplates.length > 0) {
      // Use the best matching template
      const bestTemplate = suggestedTemplates[0];
      if (bestTemplate) {
        systemPrompt = buildSystemPromptWithTemplate(bestTemplate, _context);
        userPrompt = buildUserPromptWithTemplate(bestTemplate, prompt, _context);
        
        console.log(`Using template: ${bestTemplate.name} for prompt: ${prompt}`);
      } else {
        // Fallback to basic prompts
        systemPrompt = this.buildSystemPrompt(_context);
        userPrompt = this.buildUserPrompt(prompt, _context);
      }
    } else {
      // Fallback to basic prompts
      systemPrompt = this.buildSystemPrompt(_context);
      userPrompt = this.buildUserPrompt(prompt, _context);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new AIError(
          `Perplexity API error: ${response.status} ${response.statusText}`,
          'perplexity'
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new AIError('No content received from Perplexity', 'perplexity');
      }

      return this.parseResponse(content, data.usage);
    } catch (error) {
      if (error instanceof AIError) throw error;
      
      throw new AIError(
        `Perplexity request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'perplexity',
        undefined,
        true // retryable
      );
    }
  }

  private buildSystemPrompt(context?: DiagramContext): string {
    const language = context?.language || 'mermaid';
    
    return `You are an expert diagram generator for DiagramatIQ. Your task is to generate ${language} diagram code based on user requests.

IMPORTANT RULES:
1. Always respond with valid ${language} syntax
2. Include ONLY the diagram code in a code block
3. Add a brief explanation after the code
4. If modifying existing code, preserve the structure when possible

Current context:
- Language: ${language}
- Current diagram: ${context?.currentCode ? 'User has existing code' : 'Starting fresh'}

Response format:
\`\`\`${language}
[diagram code here]
\`\`\`

[Brief explanation of the diagram]`;
  }

  private buildUserPrompt(prompt: string, context?: DiagramContext): string {
    let userPrompt = prompt;

    if (context?.currentCode) {
      userPrompt += `\n\nCurrent diagram code:\n\`\`\`${context.language}\n${context.currentCode}\n\`\`\``;
    }

    if (context?.previousMessages && context.previousMessages.length > 0) {
      userPrompt += '\n\nPrevious conversation context:\n';
      context.previousMessages.slice(-3).forEach(msg => {
        userPrompt += `${msg.role}: ${msg.content}\n`;
      });
    }

    return userPrompt;
  }

  private parseResponse(content: string, usage?: any): AIResponse {
    // Extract code block
    const codeMatch = content.match(/```(?:mermaid|plantuml|graphviz|dot)?\n([\s\S]*?)\n```/);
    const code = codeMatch?.[1]?.trim() || '';

    // Extract explanation (text after code block)
    const explanationText = content.replace(/```(?:mermaid|plantuml|graphviz|dot)?\n[\s\S]*?\n```/, '').trim();

    if (!code) {
      throw new AIError('No diagram code found in response', 'perplexity');
    }

    const response: AIResponse = {
      code,
    };

    if (explanationText) {
      response.explanation = explanationText;
    }

    if (usage) {
      response.usage = {
        tokens: usage.total_tokens || 0,
        cost: this.calculateCost(usage.total_tokens || 0),
      };
    }

    return response;
  }

  private calculateCost(tokens: number): number {
    // Perplexity pricing (approximate)
    const costPer1kTokens = 0.001; // $0.001 per 1k tokens
    return (tokens / 1000) * costPer1kTokens;
  }
}

/**
 * Ollama Local Provider
 * Local AI service for diagram generation
 */
export class OllamaProvider implements AIProvider {
  name = 'Ollama';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'codellama:7b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.warn('Ollama availability check failed:', error);
      return false;
    }
  }

  async generateDiagram(prompt: string, context?: DiagramContext): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new AIError(
          `Ollama API error: ${response.status} ${response.statusText}`,
          'ollama'
        );
      }

      const data = await response.json();
      const content = data.response;

      if (!content) {
        throw new AIError('No content received from Ollama', 'ollama');
      }

      return this.parseResponse(content);
    } catch (error) {
      if (error instanceof AIError) throw error;
      
      throw new AIError(
        `Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ollama',
        undefined,
        true // retryable
      );
    }
  }

  private buildSystemPrompt(context?: DiagramContext): string {
    const language = context?.language || 'mermaid';
    
    return `You are an expert diagram generator. Generate ${language} diagram code based on user requests.

RULES:
1. Respond with valid ${language} syntax only
2. Include the diagram code in a code block
3. Add a brief explanation
4. Current language: ${language}

${context?.currentCode ? `Current code:\n${context.currentCode}\n` : ''}

Format:
\`\`\`${language}
[code here]
\`\`\`
[explanation]`;
  }

  private parseResponse(content: string): AIResponse {
    // Extract code block
    const codeMatch = content.match(/```(?:mermaid|plantuml|graphviz|dot)?\n([\s\S]*?)\n```/);
    const code = codeMatch?.[1]?.trim() || '';

    // Extract explanation
    const explanationText = content.replace(/```(?:mermaid|plantuml|graphviz|dot)?\n[\s\S]*?\n```/, '').trim();

    if (!code) {
      throw new AIError('No diagram code found in response', 'ollama');
    }

    const response: AIResponse = {
      code,
    };

    if (explanationText) {
      response.explanation = explanationText;
    }

    return response;
  }
}

/**
 * Mock Provider for development and fallback
 */
export class MockProvider implements AIProvider {
  name = 'Mock';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateDiagram(prompt: string, context?: DiagramContext): Promise<AIResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerPrompt = prompt.toLowerCase();
    const language = context?.language || 'mermaid';
    
    if (lowerPrompt.includes('flowchart') || lowerPrompt.includes('flow')) {
      return {
        code: `flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,
        explanation: "I've created a simple flowchart with a decision point and two possible paths.",
      };
    }
    
    if (lowerPrompt.includes('sequence') || lowerPrompt.includes('interaction')) {
      return {
        code: `sequenceDiagram
    participant A as User
    participant B as Frontend
    participant C as API
    participant D as Database
    
    A->>B: Request
    B->>C: API Call
    C->>D: Query
    D-->>C: Data
    C-->>B: Response
    B-->>A: Display`,
        explanation: "Here's a sequence diagram showing typical web application interactions.",
      };
    }
    
    if (lowerPrompt.includes('class') || lowerPrompt.includes('uml')) {
      return {
        code: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Order {
        +String id
        +Date date
        +calculate()
    }
    
    User ||--o{ Order : places`,
        explanation: "I've created a class diagram showing the relationship between User and Order entities.",
      };
    }
    
    // Default response based on language
    if (language === 'plantuml') {
      return {
        code: `@startuml
actor User
User -> System : Request
System -> Database : Query
Database -> System : Data
System -> User : Response
@enduml`,
        explanation: "Here's a simple PlantUML diagram. Could you be more specific about what you need?",
      };
    }
    
    return {
      code: `graph LR
    A[Input] --> B[Process]
    B --> C[Output]`,
      explanation: "Here's a simple process diagram. Could you be more specific about what type of diagram you need?",
    };
  }
}

/**
 * Custom AI Error class
 */
class AIError extends Error {
  provider: AIProviderType;
  code?: string;
  retryable?: boolean;

  constructor(message: string, provider: AIProviderType, code?: string, retryable = false) {
    super(message);
    this.name = 'AIError';
    this.provider = provider;
    if (code !== undefined) {
      this.code = code;
    }
    this.retryable = retryable;
  }
}