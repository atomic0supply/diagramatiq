'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAI } from '@/hooks/useAI';
import { DiagramContext } from '@/types/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onCodeGenerated: (code: string, language: 'mermaid' | 'plantuml' | 'graphviz') => void;
  currentCode?: string;
  currentLanguage?: 'mermaid' | 'plantuml' | 'graphviz';
  className?: string;
}

/**
 * Chat con AI para generar y modificar diagramas
 * Integración real con Perplexity API y Ollama
 */
export const AIChat: React.FC<AIChatProps> = ({
  onCodeGenerated,
  currentCode,
  currentLanguage = 'mermaid',
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isClient, setIsClient] = useState(false);

  // AI Integration
  const { 
    generateDiagram, 
    isLoading, 
    error, 
    lastProvider, 
    availableProviders, 
    checkAvailableProviders 
  } = useAI((code: string, explanation?: string) => {
    // Handle AI response
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: explanation || 'I\'ve generated a diagram for you.',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    onCodeGenerated(code, currentLanguage);
  });

  // Inicializar en el cliente para evitar errores de hidratación
  useEffect(() => {
    setIsClient(true);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I can help you create and modify diagrams. I support Mermaid, PlantUML, and Graphviz. Try asking me to create a flowchart, sequence diagram, or any other type of diagram.',
        timestamp: new Date(),
      },
    ]);

    // Check available providers on mount
    checkAvailableProviders();
  }, [checkAvailableProviders]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // Prepare context for AI
    const context: DiagramContext = {
      ...(currentCode && { currentCode }),
      language: currentLanguage,
      previousMessages: messages.slice(-3), // Last 3 messages for context
    };

    try {
      await generateDiagram(currentInput, context);
    } catch (err) {
      // Error is handled by the useAI hook
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error || 'Unknown error'}. Please try again or rephrase your request.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // No renderizar hasta que esté en el cliente
  if (!isClient) {
    return (
      <div className={cn('flex flex-col h-full bg-gray-800', className)}>
        <div className="flex items-center justify-between h-10 px-3 bg-gray-700 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white">AI Assistant</span>
            <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">
              Loading...
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const getProviderStatus = () => {
    if (availableProviders.length === 0) return { label: 'Checking...', color: 'bg-yellow-600' };
    if (availableProviders.includes('perplexity')) return { label: 'Perplexity', color: 'bg-green-600' };
    if (availableProviders.includes('ollama')) return { label: 'Ollama', color: 'bg-blue-600' };
    if (availableProviders.includes('mock')) return { label: 'Mock', color: 'bg-orange-600' };
    return { label: 'Offline', color: 'bg-red-600' };
  };

  const providerStatus = getProviderStatus();

  return (
    <div className={cn('flex flex-col h-full bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between h-10 px-3 bg-gray-700 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">AI Assistant</span>
          <span className={cn('text-xs px-2 py-1 rounded text-white', providerStatus.color)}>
            {providerStatus.label}
          </span>
          {lastProvider && (
            <span className="text-xs text-gray-400">
              via {lastProvider}
            </span>
          )}
        </div>
        {error && (
          <div className="text-xs text-red-400 max-w-xs truncate" title={error}>
            Error: {error}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              )}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Generating diagram...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-600">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the diagram you want to create..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              !input.trim() || isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            Send
          </button>
        </div>
        
        {/* Provider info */}
        <div className="mt-2 text-xs text-gray-400">
          Available providers: {availableProviders.length > 0 ? availableProviders.join(', ') : 'None'}
        </div>
      </div>
    </div>
  );
};

export default AIChat;