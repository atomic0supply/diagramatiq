'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface UseMermaidOptions {
  theme?: 'dark' | 'default' | 'forest' | 'neutral';
}

interface UseMermaidReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error: string | null;
  renderDiagram: (code: string) => Promise<void>;
  exportSVG: () => string | null;
}

/**
 * Hook personalizado para renderizar diagramas Mermaid
 * Maneja el ciclo de vida del renderizado, errores y exportación
 */
export const useMermaid = (options: UseMermaidOptions = {}): UseMermaidReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar Mermaid una sola vez
  useEffect(() => {
    if (!isInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: options.theme || 'dark',
        securityLevel: 'loose',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        darkMode: options.theme === 'dark',
        themeVariables: {
          // Tema oscuro personalizado para DiagramatIQ
          primaryColor: '#3b82f6',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#1e40af',
          lineColor: '#6b7280',
          sectionBkgColor: '#1f2937',
          altSectionBkgColor: '#374151',
          gridColor: '#4b5563',
          secondaryColor: '#10b981',
          tertiaryColor: '#f59e0b',
          background: '#111827',
          mainBkg: '#1f2937',
          secondBkg: '#374151',
          tertiaryBkg: '#4b5563',
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
        },
        sequence: {
          useMaxWidth: true,
          wrap: true,
          width: 150,
          height: 65,
        },
        gantt: {
          useMaxWidth: true,
          leftPadding: 75,
          rightPadding: 20,
        },
      });
      setIsInitialized(true);
    }
  }, [isInitialized, options.theme]);

  const renderDiagram = useCallback(async (code: string) => {
    if (!containerRef.current || !code.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Limpiar contenedor anterior
      containerRef.current.innerHTML = '';

      // Generar ID único para el diagrama
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Validar sintaxis antes de renderizar
      const isValid = await mermaid.parse(code);
      if (!isValid) {
        throw new Error('Invalid Mermaid syntax');
      }

      // Renderizar el diagrama
      const { svg } = await mermaid.render(diagramId, code);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        
        // Aplicar estilos adicionales al SVG
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.background = 'transparent';
        }
      }
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      
      let errorMessage = 'Failed to render diagram';
      if (err instanceof Error) {
        if (err.message.includes('Parse error')) {
          errorMessage = 'Syntax error in diagram code';
        } else if (err.message.includes('Invalid')) {
          errorMessage = 'Invalid diagram syntax';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Mostrar error en el contenedor
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full min-h-[200px] text-center">
            <div>
              <div class="w-12 h-12 mx-auto mb-3 bg-red-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-red-400 font-medium mb-1">Diagram Error</p>
              <p class="text-sm text-gray-400">${errorMessage}</p>
            </div>
          </div>
        `;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportSVG = useCallback((): string | null => {
    if (!containerRef.current) return null;
    
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return null;
    
    return svgElement.outerHTML;
  }, []);

  return {
    containerRef,
    isLoading,
    error,
    renderDiagram,
    exportSVG,
  };
};