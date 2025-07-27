/**
 * Custom hook for AI integration in DiagramatIQ
 * Provides easy access to AI diagram generation with state management
 */

import { useState, useCallback } from 'react';
import { getAIService } from '@/lib/ai-service';
import { DiagramContext, AIProviderType } from '@/types/ai';

interface UseAIResult {
  generateDiagram: (prompt: string, context?: DiagramContext) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  lastProvider: AIProviderType | null;
  availableProviders: AIProviderType[];
  checkAvailableProviders: () => Promise<void>;
}

export function useAI(onCodeGenerated: (code: string, explanation?: string) => void): UseAIResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProvider, setLastProvider] = useState<AIProviderType | null>(null);
  const [availableProviders, setAvailableProviders] = useState<AIProviderType[]>([]);

  const aiService = getAIService();

  const generateDiagram = useCallback(async (prompt: string, context?: DiagramContext) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Generating diagram with prompt:', prompt);
      
      const result = await aiService.generateDiagram(prompt, context);
      
      console.log('Diagram generated successfully:', {
        provider: result.provider,
        codeLength: result.response.code.length,
        hasExplanation: !!result.response.explanation,
      });

      setLastProvider(result.provider);
      onCodeGenerated(result.response.code, result.response.explanation);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('AI generation failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, aiService, onCodeGenerated]);

  const checkAvailableProviders = useCallback(async () => {
    try {
      const providers = await aiService.getAvailableProviders();
      setAvailableProviders(providers);
      console.log('Available AI providers:', providers);
    } catch (err) {
      console.warn('Failed to check available providers:', err);
      setAvailableProviders(['mock']); // Fallback to mock
    }
  }, [aiService]);

  return {
    generateDiagram,
    isLoading,
    error,
    lastProvider,
    availableProviders,
    checkAvailableProviders,
  };
}