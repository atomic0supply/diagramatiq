'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIChat } from './AIChat';
import { useEditorStore } from '@/stores/editor-store';
import { DiagramType } from '@/types';

interface FloatingAIAssistantProps {
  className?: string;
}

export function FloatingAIAssistant({ className }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const floatingRef = useRef<HTMLDivElement>(null);

  // Get editor state and actions
  const { code, language, setCode, setLanguage } = useEditorStore();

  // Handle AI code generation
  const handleCodeGenerated = (newCode: string, newLanguage: 'mermaid' | 'plantuml' | 'graphviz') => {
    setCode(newCode);
    
    // Convert language format
    const diagramType = newLanguage === 'mermaid' ? DiagramType.MERMAID : 
                       newLanguage === 'plantuml' ? DiagramType.PLANTUML : 
                       DiagramType.GRAPHVIZ;
    setLanguage(diagramType);
  };

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!floatingRef.current) return;
    
    const rect = floatingRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - (isOpen ? 400 : 60);
      const maxY = window.innerHeight - (isOpen ? 600 : 60);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isOpen]);

  // Floating dot when closed
  if (!isOpen) {
    return (
      <div
        ref={floatingRef}
        className={`fixed z-50 ${className}`}
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 group"
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (!isDragging) {
              setIsOpen(true);
            }
          }}
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    );
  }

  // Expanded AI Assistant
  return (
    <div
      ref={floatingRef}
      className={`fixed z-50 bg-background border border-border rounded-lg shadow-2xl ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? '300px' : '400px',
        height: isMinimized ? '60px' : '600px',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-border bg-muted/50 rounded-t-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-[calc(100%-60px)] overflow-hidden">
          <AIChat 
            className="h-full border-0 rounded-none"
            onCodeGenerated={handleCodeGenerated}
            currentCode={code}
            currentLanguage={language === DiagramType.MERMAID ? 'mermaid' : 
                           language === DiagramType.PLANTUML ? 'plantuml' : 'graphviz'}
          />
        </div>
      )}
    </div>
  );
}