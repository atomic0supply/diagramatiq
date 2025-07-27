'use client';

import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'mermaid' | 'plantuml' | 'graphviz';
  className?: string;
}

/**
 * Editor de código usando Monaco Editor
 * Configurado para diagramas con syntax highlighting básico
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  className,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configurar tema dark personalizado
    monaco.editor.defineTheme('diagramatiq-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1F2937',
        'editor.foreground': '#F3F4F6',
        'editorLineNumber.foreground': '#6B7280',
        'editor.selectionBackground': '#374151',
        'editor.lineHighlightBackground': '#374151',
      },
    });
    
    monaco.editor.setTheme('diagramatiq-dark');
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  // Mapear language a Monaco language
  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'mermaid':
        return 'markdown'; // Temporal, hasta configurar syntax highlighting específico
      case 'plantuml':
        return 'text';
      case 'graphviz':
        return 'text';
      default:
        return 'text';
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-gray-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between h-10 px-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Code Editor</span>
          <span className={cn(
            'text-xs px-2 py-1 rounded',
            language === 'mermaid' && 'bg-blue-600 text-white',
            language === 'plantuml' && 'bg-green-600 text-white',
            language === 'graphviz' && 'bg-purple-600 text-white'
          )}>
            {language.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            {value.length} chars
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            theme: 'diagramatiq-dark',
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default CodeEditor;