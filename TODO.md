# DiagramatIQ - TODO List

## ✅ COMPLETED - MVP Phase 1

### Core Infrastructure
- [x] **Project Setup**: Next.js 14 + TypeScript + TailwindCSS
- [x] **Dependencies**: Installed all required packages (Monaco Editor, React Resizable Panels, etc.)
- [x] **Security**: Resolved npm audit vulnerabilities (updated mermaid, jspdf)
- [x] **Type Safety**: TypeScript configuration and type checking working

### Layout & Components
- [x] **MainLayout**: Header with logo and language selector
- [x] **ThreePanelLayout**: Resizable panels using react-resizable-panels
- [x] **DiagramRenderer**: Placeholder component with preview functionality
- [x] **CodeEditor**: Monaco Editor integration with custom dark theme
- [x] **AIChat**: Mock AI interface with example responses

### Basic Functionality
- [x] **Code Editing**: Monaco Editor working with syntax highlighting
- [x] **Panel Resizing**: Horizontal and vertical panel resizing
- [x] **Language Selection**: Dropdown to switch between Mermaid/PlantUML/Graphviz
- [x] **Mock AI Responses**: Predefined responses for common diagram types
- [x] **State Management**: Basic state synchronization between components
- [x] **Hydration Fix**: Resolved SSR/client timestamp mismatch

### Development Environment
- [x] **Dev Server**: Running successfully on http://localhost:3000
- [x] **Hot Reload**: Working for all components
- [x] **Error Handling**: Basic error boundaries and loading states

## 🚧 IN PROGRESS - MVP Phase 2

### Diagram Rendering
- [x] **Mermaid Integration**: Real-time rendering of Mermaid diagrams ✅
- [x] **Error Handling**: Display syntax errors in diagrams ✅
- [x] **Export Functionality**: SVG/PNG export capabilities ✅

### AI Integration
- [x] **AI Infrastructure**: TypeScript types and provider architecture ✅
- [x] **Perplexity API**: Provider implementation with error handling ✅
- [x] **Ollama Integration**: Local AI model support with fallback ✅
- [x] **Mock Provider**: Fallback for development and offline use ✅
- [x] **Context Awareness**: AI understands current diagram context ✅
- [x] **React Hook**: useAI hook for component integration ✅
- [x] **Real AI Chat**: Updated AIChat component with real AI integration ✅
- [x] **Prompt Templates**: Predefined prompts for different diagram types ✅

### Storage & Persistence
- [ ] **IndexedDB**: Local storage using Dexie.js
- [ ] **Auto-save**: Save diagrams every 30 seconds
- [ ] **Project Management**: Multiple diagram tabs/projects

## 📋 PLANNED - Phase 3

### Advanced Features
- [ ] **PlantUML Support**: Kroki integration for PlantUML
- [ ] **Graphviz Support**: Kroki integration for Graphviz
- [ ] **Collaborative Editing**: Real-time collaboration
- [ ] **Version History**: Diagram version control
- [ ] **Templates**: Pre-built diagram templates

### UI/UX Improvements
- [ ] **Command Palette**: Quick access to all functions
- [ ] **Keyboard Shortcuts**: Power user shortcuts
- [ ] **Themes**: Multiple color themes
- [ ] **Accessibility**: ARIA labels and keyboard navigation

### Performance & Optimization
- [ ] **Code Splitting**: Lazy loading of heavy components
- [ ] **Caching**: Intelligent caching strategies
- [ ] **PWA**: Progressive Web App capabilities
- [ ] **Offline Support**: Work without internet connection

## 🔮 Futuro (Backlog)

### Fase 2 - Features Avanzadas
- [ ] Soporte para múltiples tabs/proyectos
- [ ] Historial de versiones de diagramas
- [ ] Exportación a múltiples formatos (SVG, PNG, PDF)
- [ ] Templates de diagramas pre-configurados
- [ ] Búsqueda y filtrado de diagramas guardados

### Fase 3 - Colaboración y Sync
- [ ] Autenticación de usuarios
- [ ] Compartir diagramas públicamente
- [ ] Colaboración en tiempo real
- [ ] Sync con GitHub/GitLab
- [ ] Plugin para VSCode

### Mejoras Técnicas Futuras
- [ ] Server-side rendering para diagramas
- [ ] PWA con offline support
- [ ] API pública para integraciones
- [ ] Métricas y analytics
- [ ] CI/CD pipeline completo

## 🐛 Bugs Identificados
_(Ninguno identificado aún - proyecto en fase inicial)_

## 🧪 Testing Requirements
- [ ] Setup de Jest y Testing Library
- [ ] Tests unitarios para stores
- [ ] Tests de integración para componentes principales
- [ ] Tests end-to-end con Playwright
- [ ] Coverage mínimo del 70%

## 📊 Métricas de Progreso

### MVP Milestones
- [ ] **M1**: Proyecto setup completo (0/8 tareas)
- [ ] **M2**: Layout y UI básica (0/5 tareas)  
- [ ] **M3**: Editor funcional (0/5 tareas)
- [ ] **M4**: Renderizado de diagramas (0/5 tareas)
- [ ] **M5**: IA chat básico (0/6 tareas)

### Definición de MVP Completo
El MVP estará listo cuando:
- ✅ Usuario puede escribir código Mermaid en el editor
- ✅ Diagrama se renderiza en tiempo real
- ✅ Chat IA puede generar y modificar diagramas
- ✅ Auto-guardado funciona correctamente
- ✅ Exportación SVG/PNG funcional
- ✅ Aplicación deployable con Docker

### Performance Targets
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Diagram render time < 500ms
- [ ] AI response time < 10s (Perplexity), < 5s (Ollama)

## 📋 Notas y Decisiones Técnicas

### Decisiones de Arquitectura
- **Frontend-first approach**: MVP no requiere backend propio
- **Dual AI strategy**: Perplexity (nube) + Ollama (local) para máxima flexibilidad
- **Client-side rendering**: Mermaid.js primario, Kroki como backup
- **No autenticación**: MVP será completamente local

### Dependencias Críticas
- **Mermaid.js**: Para renderizado de diagramas ✅
- **Monaco Editor**: Para editor de código ✅
- **React Resizable Panels**: Para layout ✅
- **Perplexity API**: Para IA en la nube (pendiente)
- **Ollama**: Para IA local (pendiente)

## 📊 ESTADO ACTUAL

**MVP Progress: 98%** 🚀

### ✅ Completado Recientemente (Fase 2)
- **Renderizado Real de Mermaid**: Implementado con hook personalizado `useMermaid`
- **Manejo de Errores**: Validación de sintaxis y display de errores
- **Exportación**: Funcionalidad SVG y PNG completamente funcional
- **Tema Oscuro**: Configuración personalizada para DiagramatIQ
- **Performance**: Renderizado optimizado con useEffect y memoización
- **AI Integration**: Arquitectura completa con Perplexity, Ollama y Mock providers
- **Context Awareness**: AI entiende el código actual y el lenguaje seleccionado
- **Real AI Chat**: Chat funcional con integración real de AI y fallbacks
- **Prompt Templates**: Sistema completo de templates predefinidos para diferentes tipos de diagramas

### 🎯 Próximas Prioridades (Fase 2 - Final)
1. **Storage**: Implementar IndexedDB con Dexie.js para persistencia local
2. **PlantUML/Graphviz**: Integración con Kroki para soporte completo
3. **Auto-save**: Mejorar el sistema de auto-guardado

### 🔧 Funcionalidades Activas
- ✅ Layout responsivo de 3 paneles
- ✅ Editor Monaco con syntax highlighting
- ✅ Renderizado real de diagramas Mermaid
- ✅ Exportación SVG/PNG
- ✅ Manejo de errores de sintaxis
- ✅ Chat AI con integración real (Perplexity/Ollama/Mock)
- ✅ Context awareness para AI
- ✅ **Prompt Templates**: Templates inteligentes para flowcharts, sequence, class, etc.
- ✅ Auto-save local (básico)
- ✅ Variables de entorno configuradas

### 🚀 Listo para Probar
La aplicación está funcionando en http://localhost:3000 con:
- Renderizado real de diagramas Mermaid
- Exportación funcional (botones SVG/PNG)
- Manejo de errores de sintaxis
- Editor Monaco completamente funcional
- **Chat AI real** con detección automática de providers disponibles
- **Sistema de templates inteligente** que sugiere prompts basados en el contexto
- Fallback inteligente: Perplexity → Ollama → Mock