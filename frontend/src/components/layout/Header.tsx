'use client';

import React from 'react';
import { Save, Clock, FolderOpen, FileText } from 'lucide-react';
import { DiagramData, Project, DiagramType } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  language: DiagramType;
  onLanguageChange: (language: 'mermaid' | 'plantuml' | 'graphviz') => void;
  currentDiagram?: DiagramData | null;
  hasUnsavedChanges?: boolean;
  autoSaveEnabled?: boolean;
  lastSaved?: Date | null;
  currentProject?: Project | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  language, 
  onLanguageChange,
  currentDiagram,
  hasUnsavedChanges = false,
  autoSaveEnabled = false,
  lastSaved,
  currentProject
}) => {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">D</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">DiagramatIQ</h1>
      </div>
      
      {/* Project and Diagram Info */}
      <div className="flex items-center space-x-4 ml-6">
        {currentProject && (
          <div className="flex items-center space-x-2 text-sm">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{currentProject.name}</span>
          </div>
        )}
        
        {currentDiagram && (
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{currentDiagram.title}</span>
            {hasUnsavedChanges && (
              <span className="text-orange-500 text-xs">●</span>
            )}
          </div>
        )}
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        {/* Auto-save Status */}
        <div className="flex items-center space-x-2 text-sm">
          <div className={cn(
            "flex items-center space-x-1",
            autoSaveEnabled ? "text-green-600" : "text-muted-foreground"
          )}>
            <Save className="h-4 w-4" />
            <span className="text-xs">
              {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
            </span>
          </div>
          
          {lastSaved && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatLastSaved(lastSaved)}</span>
            </div>
          )}
        </div>
        
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as 'mermaid' | 'plantuml' | 'graphviz')}
          className="bg-input text-foreground text-sm rounded px-2 py-1 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="mermaid">Mermaid</option>
          <option value="plantuml">PlantUML</option>
          <option value="graphviz">Graphviz</option>
        </select>
        
        <span className="text-sm text-muted-foreground">v0.1.0-MVP</span>
      </div>
    </header>
  );
};

export default Header;