'use client';

import { useEffect } from 'react';
import { Header } from './Header';
import { DiagramRenderer } from '../diagram/DiagramRenderer';
import { CodeEditor } from '../editor/CodeEditor';
import { FloatingAIAssistant } from '../ai-chat/FloatingAIAssistant';
import { ProjectSidebar } from '../project/ProjectSidebar';
import { useEditorStore, useProjectStore } from '@/stores/editor-store';
import { DiagramType } from '@/types';

export default function MainLayout() {
  const { 
    code, 
    language, 
    currentDiagram, 
    hasUnsavedChanges, 
    autoSaveEnabled, 
    lastSaved,
    setCode, 
    setLanguage, 
    createNewDiagram 
  } = useEditorStore();
  
  const { 
    currentProject, 
    loadProjects 
  } = useProjectStore();

  // Initialize projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleLanguageChange = (newLanguage: 'mermaid' | 'plantuml' | 'graphviz') => {
    createNewDiagram(newLanguage as DiagramType);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header 
        language={language}
        onLanguageChange={handleLanguageChange}
        currentDiagram={currentDiagram}
        hasUnsavedChanges={hasUnsavedChanges}
        autoSaveEnabled={autoSaveEnabled}
        lastSaved={lastSaved}
        currentProject={currentProject}
      />
      <div className="flex-1 overflow-hidden flex">
        {/* Project Sidebar */}
        <ProjectSidebar className="w-64 flex-shrink-0" />
        
        {/* Main Content - Two Panel Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Editor Panel */}
          <div className="w-1/2 border-r border-border">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={language}
            />
          </div>
          
          {/* Diagram Panel */}
          <div className="w-1/2">
            <DiagramRenderer
              code={code}
              type={language}
            />
          </div>
        </div>
      </div>
      
      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
}