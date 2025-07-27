/**
 * AI Service for DiagramatIQ
 * Manages multiple AI providers with fallback strategy
 */

import { AIProvider, AIResponse, DiagramContext, AIConfig, AIProviderType } from '@/types/ai';
import { PerplexityProvider, OllamaProvider, MockProvider } from './ai-providers';

export class AIService {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private config: AIConfig;
  private fallbackOrder: AIProviderType[] = ['perplexity', 'ollama', 'mock'];

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Perplexity if API key is provided
    if (this.config.perplexity?.apiKey) {
      this.providers.set('perplexity', new PerplexityProvider(
        this.config.perplexity.apiKey,
        this.config.perplexity.model,
        this.config.perplexity.baseUrl
      ));
    }

    // Initialize Ollama
    if (this.config.ollama) {
      this.providers.set('ollama', new OllamaProvider(
        this.config.ollama.baseUrl,
        this.config.ollama.model
      ));
    }

    // Always include mock provider as fallback
    this.providers.set('mock', new MockProvider());
  }

  /**
   * Generate diagram with fallback strategy
   */
  async generateDiagram(prompt: string, context?: DiagramContext): Promise<{
    response: AIResponse;
    provider: AIProviderType;
  }> {
    const errors: Array<{ provider: AIProviderType; error: Error }> = [];

    for (const providerType of this.fallbackOrder) {
      const provider = this.providers.get(providerType);
      
      if (!provider) continue;

      try {
        // Check if provider is available
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          console.warn(`${provider.name} provider is not available`);
          continue;
        }

        console.log(`Attempting to generate diagram with ${provider.name}...`);
        const response = await provider.generateDiagram(prompt, context);
        
        console.log(`Successfully generated diagram with ${provider.name}`);
        return { response, provider: providerType };

      } catch (error) {
        console.warn(`${provider.name} failed:`, error);
        errors.push({ 
          provider: providerType, 
          error: error instanceof Error ? error : new Error(String(error))
        });
        
        // If this is a retryable error and we have time, we might retry
        // For now, just continue to next provider
        continue;
      }
    }

    // If all providers failed, throw comprehensive error
    const errorMessage = `All AI providers failed:\n${errors.map(e => 
      `- ${e.provider}: ${e.error.message}`
    ).join('\n')}`;
    
    throw new Error(errorMessage);
  }

  /**
   * Get available providers
   */
  async getAvailableProviders(): Promise<AIProviderType[]> {
    const available: AIProviderType[] = [];
    const providerTypes = Array.from(this.providers.keys());

    for (const type of providerTypes) {
      const provider = this.providers.get(type);
      if (!provider) continue;
      
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          available.push(type);
        }
      } catch (error) {
        console.warn(`Error checking ${provider.name} availability:`, error);
      }
    }

    return available;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeProviders();
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Omit<AIConfig, 'perplexity'> & { perplexity?: { hasApiKey: boolean; model?: string } } {
    const result: any = {};

    if (this.config.perplexity) {
      result.perplexity = {
        hasApiKey: !!this.config.perplexity.apiKey,
        ...(this.config.perplexity.model && { model: this.config.perplexity.model }),
      };
    }

    if (this.config.ollama) {
      result.ollama = this.config.ollama;
    }

    if (this.config.fallbackToMock !== undefined) {
      result.fallbackToMock = this.config.fallbackToMock;
    }

    return result;
  }
}

/**
 * Default AI service instance
 */
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    // Initialize with environment variables or defaults
    const config: AIConfig = {
      ollama: {
        baseUrl: process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'codellama:7b',
      },
      fallbackToMock: true,
    };

    // Add Perplexity config if API key is available
    if (process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY) {
      config.perplexity = {
        apiKey: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY,
        model: process.env.NEXT_PUBLIC_PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online',
      };
    }

    aiServiceInstance = new AIService(config);
  }

  return aiServiceInstance;
}

/**
 * Reset AI service (useful for testing or config changes)
 */
export function resetAIService(): void {
  aiServiceInstance = null;
}