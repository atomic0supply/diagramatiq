'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMermaid } from '@/hooks/useMermaid';
import styles from './DiagramRenderer.module.css';

interface DiagramRendererProps {
  code: string;
  type: 'mermaid' | 'plantuml' | 'graphviz';
  className?: string;
}

/**
 * Componente para renderizar diagramas
 * Soporta renderizado real de Mermaid con manejo de errores y zoom
 */
export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  code,
  type,
  className,
}) => {
  const { containerRef, isLoading, error, renderDiagram, exportSVG } = useMermaid({
    theme: 'dark'
  });
  
  const [lastRenderedCode, setLastRenderedCode] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const diagramWrapperRef = useRef<HTMLDivElement>(null);

  // Constantes para zoom
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.1;

  // Renderizar diagrama cuando cambie el código
  useEffect(() => {
    if (type === 'mermaid' && code && code !== lastRenderedCode) {
      renderDiagram(code);
      setLastRenderedCode(code);
      // Reset zoom cuando se renderiza un nuevo diagrama
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [code, type, renderDiagram, lastRenderedCode]);

  // Funciones de zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Manejo de zoom con rueda del mouse
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoomLevel(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  }, []);

  // Manejo de pan (arrastrar)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Solo botón izquierdo
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Cleanup de eventos
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    
    // Atajos de teclado para zoom
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo activar si el foco está en el componente de diagrama
      if (diagramWrapperRef.current && diagramWrapperRef.current.contains(document.activeElement)) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case '=':
            case '+':
              e.preventDefault();
              handleZoomIn();
              break;
            case '-':
              e.preventDefault();
              handleZoomOut();
              break;
            case '0':
              e.preventDefault();
              handleZoomReset();
              break;
          }
        }
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleZoomIn, handleZoomOut, handleZoomReset]);

  // Función para exportar SVG
  const handleExportSVG = () => {
    const svg = exportSVG();
    if (svg) {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Función para exportar PNG (usando canvas)
  const handleExportPNG = () => {
    const svg = exportSVG();
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Fondo blanco para PNG
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx!.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `diagram-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-gray-900',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between h-10 px-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Diagram</span>
          <span className={cn(
            'text-xs px-2 py-1 rounded',
            type === 'mermaid' && 'bg-blue-600 text-white',
            type === 'plantuml' && 'bg-green-600 text-white',
            type === 'graphviz' && 'bg-purple-600 text-white'
          )}>
            {type.toUpperCase()}
          </span>
          {error && (
            <span className="text-xs px-2 py-1 rounded bg-red-600 text-white">
              ERROR
            </span>
          )}
          
          {/* Zoom Controls */}
          {type === 'mermaid' && code && !error && (
            <div className={cn("flex items-center space-x-1 ml-4", styles.zoomControls)}>
              <button
                onClick={handleZoomOut}
                className={cn("p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors", styles.zoomButton)}
                title="Zoom Out"
                disabled={zoomLevel <= MIN_ZOOM}
              >
                <ZoomOut className="h-3 w-3" />
              </button>
              <span className={cn("text-xs text-gray-400 min-w-[3rem] text-center", styles.zoomLevel)}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className={cn("p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors", styles.zoomButton)}
                title="Zoom In"
                disabled={zoomLevel >= MAX_ZOOM}
              >
                <ZoomIn className="h-3 w-3" />
              </button>
              <button
                onClick={handleZoomReset}
                className={cn("p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors", styles.zoomButton)}
                title="Reset Zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Export buttons - solo para Mermaid por ahora */}
          {type === 'mermaid' && code && !error && (
            <>
              <button
                onClick={handleExportSVG}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                title="Export as SVG"
              >
                SVG
              </button>
              <button
                onClick={handleExportPNG}
                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                title="Export as PNG"
              >
                PNG
              </button>
            </>
          )}
          
          {isLoading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-xs text-gray-400">
            {error ? 'Error' : code ? 'Ready' : 'No diagram'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {code ? (
          <>
            {type === 'mermaid' ? (
              // Renderizado real de Mermaid con zoom y pan
              <div className="relative h-full w-full">
                <div 
                  ref={diagramWrapperRef}
                  className={cn(
                    "h-full w-full overflow-hidden",
                    styles.diagramWrapper,
                    isDragging && styles.dragging
                  )}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  tabIndex={0}
                  role="img"
                  aria-label="Interactive diagram with zoom and pan controls"
                >
                  <div
                    className={cn("h-full w-full flex items-center justify-center", styles.diagramContent)}
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <div 
                      ref={containerRef}
                      className={cn("diagram-container", styles.diagramContainer)}
                    />
                  </div>
                </div>
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className={cn("absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10", styles.loadingOverlay)}>
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-300">Rendering diagram...</p>
                    </div>
                  </div>
                )}
                
                {/* Zoom Instructions */}
                {!isLoading && !error && code && (
                  <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm">
                    <p>Scroll to zoom • Drag to pan</p>
                    <p className="text-gray-600">Ctrl/Cmd + +/- to zoom • Ctrl/Cmd + 0 to reset</p>
                  </div>
                )}
              </div>
            ) : (
              // Placeholder para PlantUML y Graphviz
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-yellow-400 mb-2">{type.toUpperCase()} Support Coming Soon</p>
                  <p className="text-xs text-gray-500 mb-4">
                    This diagram type will be supported in the next phase
                  </p>
                  
                  {/* Code preview para tipos no soportados */}
                  <div className="mt-4 p-3 bg-gray-800 rounded border text-left max-w-md">
                    <p className="text-xs text-gray-400 mb-2">Code Preview:</p>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {code.slice(0, 200)}{code.length > 200 ? '...' : ''}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">No diagram to display</p>
              <p className="text-xs text-gray-500">
                Start typing in the editor or ask AI to generate a diagram
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramRenderer;