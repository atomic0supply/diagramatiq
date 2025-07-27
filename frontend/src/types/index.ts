// Tipos para diagramas
export enum DiagramType {
  MERMAID = 'mermaid',
  PLANTUML = 'plantuml',
  GRAPHVIZ = 'graphviz',
}

export interface DiagramData {
  id: string;
  title: string;
  code: string;
  type: DiagramType;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  projectId?: string; // Relación con proyecto
}

// Tipos para el editor
export interface EditorState {
  code: string;
  language: DiagramType;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  cursorPosition?: {
    line: number;
    column: number;
  };
}

// Tipos para IA
export interface AIProvider {
  name: string;
  isAvailable: () => Promise<boolean>;
  generateDiagram: (prompt: string, context?: string) => Promise<AIResponse>;
}

export interface AIResponse {
  code: string;
  explanation?: string;
  suggestions?: string[];
  usage?: {
    tokens: number;
    cost?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  diagramId?: string; // Relación con diagrama
  metadata?: {
    diagramType?: DiagramType;
    tokens?: number;
  };
}

// Interfaz para proyectos (colección de diagramas)
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  diagramIds: string[];
}

// Tipos para almacenamiento
export interface StorageData {
  diagrams: DiagramData[];
  settings: UserSettings;
  chatHistory: ChatMessage[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  preferredAIProvider: 'perplexity' | 'ollama';
  autoSave: boolean;
  autoSaveInterval: number; // en segundos
  editorFontSize: number;
  showLineNumbers: boolean;
  wordWrap: boolean;
}

// Tipos para exportación
export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf' | 'code';
  quality?: number; // para PNG
  scale?: number;
  backgroundColor?: string;
}

// Tipos para errores
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

// Tipos para eventos
export interface DiagramEvent {
  type: 'render' | 'error' | 'export' | 'save';
  diagramId: string;
  timestamp: Date;
  data?: unknown;
}