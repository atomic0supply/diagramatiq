'use client';

import { useState } from 'react';
import { Header } from './Header';
import { ThreePanelLayout } from './ThreePanelLayout';
import { DiagramRenderer } from '../diagram/DiagramRenderer';
import { CodeEditor } from '../editor/CodeEditor';
import { AIChat } from '../ai-chat/AIChat';

export function MainLayout() {
  const [code, setCode] = useState(`graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`);
  
  const [language, setLanguage] = useState<'mermaid' | 'plantuml' | 'graphviz'>('mermaid');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleLanguageChange = (newLanguage: 'mermaid' | 'plantuml' | 'graphviz') => {
    setLanguage(newLanguage);
    // Set default code for the selected language
    switch (newLanguage) {
      case 'mermaid':
        setCode(`graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`);
        break;
      case 'plantuml':
        setCode(`@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
@enduml`);
        break;
      case 'graphviz':
        setCode(`digraph G {
  A -> B;
  B -> C;
  C -> A;
}`);
        break;
    }
  };

  const handleCodeGenerated = (generatedCode: string, generatedLanguage: 'mermaid' | 'plantuml' | 'graphviz') => {
    setCode(generatedCode);
    setLanguage(generatedLanguage);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header 
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      <div className="flex-1 overflow-hidden">
        <ThreePanelLayout
          diagramPanel={
            <DiagramRenderer
              code={code}
              type={language}
            />
          }
          editorPanel={
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={language}
            />
          }
          chatPanel={
            <AIChat
              onCodeGenerated={handleCodeGenerated}
              currentCode={code}
              currentLanguage={language}
            />
          }
        />
      </div>
    </div>
  );
}