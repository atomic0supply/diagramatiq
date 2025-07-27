'use client';

import React, { useState, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { DiagramContext } from '@/types/ai';

export default function TestAIPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  
  const { generateDiagram, isLoading, error, availableProviders, checkAvailableProviders } = useAI(
    (code: string, explanation?: string) => {
      setResult(code);
      setExplanation(explanation || '');
    }
  );

  useEffect(() => {
    checkAvailableProviders();
  }, [checkAvailableProviders]);

  const handleTest = async () => {
    if (!prompt.trim()) return;
    
    setResult('');
    setExplanation('');
    
    try {
      const context: DiagramContext = {
        language: 'mermaid',
        currentCode: '',
        previousMessages: []
      };
      
      await generateDiagram(prompt, context);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 AI Testing - Ollama Integration</h1>
        
        {/* Provider Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Available Providers:</h2>
          <div className="flex gap-2">
            {availableProviders.map(provider => (
              <span 
                key={provider} 
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                {provider}
              </span>
            ))}
          </div>
        </div>

        {/* Test Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Test Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Create a flowchart for user registration process"
            className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Test Button */}
        <button
          onClick={handleTest}
          disabled={!prompt.trim() || isLoading}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !prompt.trim() || isLoading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Generating...' : 'Test AI Generation'}
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span>Generating diagram with AI...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-900 border border-red-600 rounded-lg">
            <h3 className="font-semibold text-red-400 mb-2">Error:</h3>
            <pre className="text-red-300 text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-900 border border-green-600 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">Generated Code:</h3>
              <pre className="text-green-300 text-sm whitespace-pre-wrap bg-gray-800 p-3 rounded overflow-x-auto">
                {result}
              </pre>
            </div>
            
            {explanation && (
              <div className="p-4 bg-blue-900 border border-blue-600 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2">AI Explanation:</h3>
                <p className="text-blue-300 text-sm">{explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Test Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setPrompt('Create a simple flowchart for user login process')}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
          >
            <div className="font-medium">Test 1: Login Flowchart</div>
            <div className="text-sm text-gray-400">Simple user authentication flow</div>
          </button>
          
          <button
            onClick={() => setPrompt('Create a sequence diagram showing API request flow between client, server and database')}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
          >
            <div className="font-medium">Test 2: API Sequence</div>
            <div className="text-sm text-gray-400">Client-server-database interaction</div>
          </button>
        </div>
      </div>
    </div>
  );
}