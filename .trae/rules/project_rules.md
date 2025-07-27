# 📋 DiagramatIQ - Project Rules

Este archivo define las reglas y convenciones que el agente debe seguir al trabajar en el proyecto DiagramatIQ.

## 🎯 PRINCIPIOS FUNDAMENTALES

### 1. Developer Experience First
- **Prioridad máxima** a herramientas que mejoren la productividad del desarrollador
- **Hot reload** debe funcionar siempre
- **Error messages** claros y accionables
- **TypeScript strict mode** - cero tolerancia a `any`

### 2. Funcionalidad sobre Forma
- Implementa la funcionalidad core **antes** que las mejoras visuales
- **Prototipa rápido**, refina después
- **MVP primero**, features avanzadas después

### 3. Documentación Obligatoria
- **TODO.md** actualizado en cada sesión
- **Documentación técnica** en `/docs/` actualizada con cada cambio significativo
- **Comentarios en código** para lógica compleja
- **README.md** siempre actualizado con instrucciones de setup

## 🏗️ ARQUITECTURA Y CÓDIGO

### Estructura de Archivos - OBLIGATORIA

```
diagramatiq/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router ONLY
│   │   ├── components/          # Componentes organizados por feature
│   │   │   ├── layout/         # Header, Sidebar, Layout components
│   │   │   ├── editor/         # Monaco Editor y relacionados
│   │   │   ├── diagram/        # Rendering de diagramas
│   │   │   ├── ai-chat/        # Chat IA y componentes relacionados
│   │   │   └── ui/             # Componentes base reutilizables
│   │   ├── lib/                # Utilities, configs, externos
│   │   ├── stores/             # Zustand stores - UN archivo por dominio
│   │   ├── types/              # TypeScript definitions globales
│   │   └── hooks/              # Custom hooks reutilizables
│   ├── public/                 # Assets estáticos
│   └── package.json
├── backend/                    # FastAPI (opcional para MVP)
├── docs/                       # Documentación técnica - MANTENER ACTUALIZADA
├── docker-compose.yml
├── TODO.md                     # Estado actual del proyecto - CRÍTICO
└── README.md
```

### Convenciones de Naming

#### Archivos y Carpetas
- **kebab-case**: para carpetas (`ai-chat/`, `diagram-renderer/`)
- **PascalCase**: para componentes React (`DiagramRenderer.tsx`)
- **camelCase**: para utilities y hooks (`useLocalStorage.ts`)
- **UPPERCASE**: para constantes y configs (`API_ENDPOINTS.ts`)

#### Variables y Funciones
```typescript
// ✅ CORRECTO
const diagramCode = 'graph TD...';
const handleDiagramUpdate = () => {};
const API_BASE_URL = 'http://localhost:8080';
const useAIChat = () => {};

// ❌ INCORRECTO
const DiagramCode = 'graph TD...';
const HandleDiagramUpdate = () => {};
const apiBaseUrl = 'http://localhost:8080';  // constante debe ser UPPERCASE
```

### TypeScript Rules - ESTRICTAS

#### Obligatorio
```typescript
// ✅ Interfaces explícitas
interface DiagramData {
  id: string;
  code: string;
  type: 'mermaid' | 'plantuml' | 'graphviz';
  createdAt: Date;
}

// ✅ Tipos de retorno explícitos en funciones
const renderDiagram = (code: string): Promise<string> => {
  return mermaid.render('diagram', code);
};

// ✅ Enums para constantes relacionadas
enum DiagramType {
  MERMAID = 'mermaid',
  PLANTUML = 'plantuml',
  GRAPHVIZ = 'graphviz'
}
```

#### Prohibido
```typescript
// ❌ NUNCA usar any
const data: any = {};

// ❌ NUNCA funciones sin tipos de retorno
const processData = (input) => {
  return input.transform();
};

// ❌ NUNCA propiedades opcionales sin razón
interface BadInterface {
  id?: string;  // Si siempre debe existir, no debe ser opcional
}
```

## 🎨 COMPONENTES Y UI

### Estructura de Componentes React

```typescript
// ✅ Estructura estándar para todos los componentes
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Props siempre tipadas
  className?: string;
  children?: React.ReactNode;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('default-classes', className)} {...props}>
      {children}
    </div>
  );
};

// Export por defecto si es el componente principal del archivo
export default ComponentName;
```

### Reglas de Styling

#### TailwindCSS - Obligatorio
- **SOLO Tailwind** para estilos, no CSS custom salvo excepciones
- **Responsive design** con mobile-first approach
- **Dark mode** como tema principal
- **Consistent spacing** usando escala de Tailwind (4, 8, 12, 16, etc.)

```typescript
// ✅ CORRECTO - Tailwind classes organizadas
<div className="
  flex items-center justify-between 
  w-full h-12 px-4 
  bg-gray-900 border-b border-gray-700
  dark:bg-gray-800 dark:border-gray-600
">

// ❌ INCORRECTO - CSS inline o clases custom
<div style={{display: 'flex', padding: '16px'}} className="custom-header">
```

## 🔧 ESTADO Y DATA MANAGEMENT

### Zustand Stores - Reglas

```typescript
// ✅ Un store por dominio lógico
interface EditorStore {
  code: string;
  language: DiagramType;
  isLoading: boolean;
  
  // Actions con nombres descriptivos
  updateCode: (code: string) => void;
  setLanguage: (lang: DiagramType) => void;
  resetEditor: () => void;
}

// ✅ Usar immer para estado inmutable
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useEditorStore = create<EditorStore>()(
  immer((set) => ({
    code: '',
    language: DiagramType.MERMAID,
    isLoading: false,
    
    updateCode: (code) => set((state) => {
      state.code = code;
    }),
    
    setLanguage: (language) => set((state) => {
      state.language = language;
    }),
    
    resetEditor: () => set((state) => {
      state.code = '';
      state.language = DiagramType.MERMAID;
      state.isLoading = false;
    }),
  }))
);
```

### React Query - API Calls

```typescript
// ✅ Queries tipadas y con error handling
export const useAIGeneration = () => {
  return useQuery({
    queryKey: ['ai-generation'],
    queryFn: async ({ queryKey }) => {
      const response = await aiProvider.generateDiagram(prompt);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

## 🤖 INTEGRACIÓN IA

### API Providers - Estructura Obligatoria

```typescript
// lib/ai-providers.ts
interface AIProvider {
  name: string;
  generateDiagram: (prompt: string, context?: string) => Promise<AIResponse>;
  isAvailable: () => Promise<boolean>;
}

interface AIResponse {
  code: string;
  explanation?: string;
  suggestions?: string[];
  usage?: {
    tokens: number;
    cost?: number;
  };
}

// Implementaciones específicas
export class PerplexityProvider implements AIProvider {
  // Implementation
}

export class OllamaProvider implements AIProvider {
  // Implementation
}
```

### Error Handling para IA

```typescript
// ✅ Manejo robusto de errores
const generateWithFallback = async (prompt: string) => {
  try {
    // Intentar Perplexity primero
    return await perplexityProvider.generateDiagram(prompt);
  } catch (perplexityError) {
    console.warn('Perplexity failed, trying Ollama:', perplexityError);
    
    try {
      return await ollamaProvider.generateDiagram(prompt);
    } catch (ollamaError) {
      console.error('All AI providers failed:', { perplexityError, ollamaError });
      
      // Fallback a template o error state
      throw new Error('AI services unavailable. Please try again later.');
    }
  }
};
```

## 📝 DOCUMENTACIÓN Y MANTENIMIENTO

### TODO.md - Formato Obligatorio

```markdown
# DiagramatIQ - TODO

## 🚧 En Progreso
- [ ] Task being worked on right now
- [ ] Another active task

## ✅ Completado (Última Sesión)
- [x] Task completed in last session
- [x] Another completed task

## 📋 Próximo (Prioridad Alta)
- [ ] Next high priority task
- [ ] Another urgent task

## 🔮 Futuro (Backlog)
- [ ] Feature for later phases
- [ ] Nice to have improvements

## 🐛 Bugs Identificados
- [ ] Bug that needs fixing
- [ ] Another known issue

## 📊 Métricas de Progreso
- MVP Progress: X% complete
- Current Phase: Phase 1 - Core Functionality
- Last Updated: YYYY-MM-DD
```

### Commits - Formato Obligatorio

```bash
# ✅ CORRECTO - Conventional Commits
feat(editor): add Monaco editor with Mermaid syntax highlighting
fix(ai-chat): resolve API timeout issues with Ollama
docs(setup): update README with Docker configuration
refactor(stores): migrate from Redux to Zustand

# ❌ INCORRECTO
updated editor
fixed bug
changes
```

### Code Comments - Cuando Usar

```typescript
// ✅ Comentarios útiles
/**
 * Renders Mermaid diagram using kroki service with fallback to client-side
 * @param code - Mermaid diagram code
 * @param options - Rendering options (theme, scale, etc.)
 * @returns Promise resolving to SVG string
 */
const renderMermaidDiagram = async (code: string, options: RenderOptions) => {
  // Try server-side rendering first for better performance
  try {
    return await krokiService.render(code, 'mermaid', options);
  } catch (error) {
    // Fallback to client-side rendering if server fails
    console.warn('Kroki service failed, using client-side rendering:', error);
    return await mermaid.render('diagram', code);
  }
};

// ❌ Comentarios innecesarios
const count = 0; // Initialize count to zero
const isVisible = true; // Set visibility to true
```

## ⚡ PERFORMANCE Y OPTIMIZACIÓN

### Reglas de Performance

1. **Lazy loading** para componentes pesados
2. **Memoización** para cálculos costosos
3. **Debouncing** para inputs de usuario (300ms mínimo)
4. **Code splitting** por rutas y features
5. **Bundle analysis** regular con `@next/bundle-analyzer`

```typescript
// ✅ Lazy loading
const DiagramRenderer = lazy(() => import('@/components/diagram/DiagramRenderer'));

// ✅ Memoización apropiada
const MemoizedEditor = memo(CodeEditor, (prevProps, nextProps) => {
  return prevProps.code === nextProps.code && prevProps.language === nextProps.language;
});

// ✅ Debouncing para auto-save
const debouncedSave = useDebouncedCallback(
  (code: string) => {
    saveToIndexedDB(code);
  },
  300
);
```

## 🚫 PROHIBICIONES ABSOLUTAS

1. **NUNCA** usar `any` en TypeScript
2. **NUNCA** hacer commits sin actualizar TODO.md
3. **NUNCA** implementar features sin tests básicos
4. **NUNCA** usar CSS inline salvo casos excepcionales
5. **NUNCA** hacer llamadas API sin error handling
6. **NUNCA** commit code que rompa el build
7. **NUNCA** usar librerías externas sin justificación documentada

## ✅ DEFINITION OF DONE

Una tarea está completa cuando:

- [ ] **Funciona** según acceptance criteria
- [ ] **TypeScript** sin errores ni warnings
- [ ] **Documentación** actualizada en `/docs/`
- [ ] **TODO.md** actualizado con progreso
- [ ] **Tests básicos** implementados
- [ ] **Performance** aceptable (< 100ms interactions)
- [ ] **Error handling** implementado
- [ ] **Commit message** sigue conventional commits
- [ ] **No rompe** funcionalidad existente

---

**ESTAS REGLAS SON OBLIGATORIAS. NO NEGOCIABLES.**