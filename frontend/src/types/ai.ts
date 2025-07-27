/**
 * Types for AI integration
 * Supports both Perplexity API (cloud) and Ollama (local)
 */

export interface AIResponse {
  code: string;
  explanation?: string;
  suggestions?: string[];
  usage?: {
    tokens: number;
    cost?: number;
  };
}

export interface AIProvider {
  name: string;
  generateDiagram: (prompt: string, context?: DiagramContext) => Promise<AIResponse>;
  isAvailable: () => Promise<boolean>;
}

export interface DiagramContext {
  currentCode?: string;
  language: 'mermaid' | 'plantuml' | 'graphviz';
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AIConfig {
  perplexity?: {
    apiKey: string;
    model?: string;
    baseUrl?: string;
  };
  ollama?: {
    baseUrl: string;
    model: string;
  };
  fallbackToMock?: boolean;
}

export type AIProviderType = 'perplexity' | 'ollama' | 'mock';

export interface AIError extends Error {
  provider: AIProviderType;
  code?: string;
  retryable?: boolean;
}