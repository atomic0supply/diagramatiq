'use client';

import React from 'react';

interface HeaderProps {
  language: 'mermaid' | 'plantuml' | 'graphviz';
  onLanguageChange: (language: 'mermaid' | 'plantuml' | 'graphviz') => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">D</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">DiagramatIQ</h1>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
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