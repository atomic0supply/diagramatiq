# DiagramatIQ - Project Overview

## 🎯 Project Description

**DiagramatIQ** is a minimalist and intelligent web application for generating and editing technical diagrams using AI. It combines real-time diagram rendering with smart AI assistance to help developers create professional diagrams quickly and efficiently.

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **State Management**: Zustand + React Query
- **Editor**: Monaco Editor (VSCode embedded)
- **Diagram Rendering**: Mermaid.js + Kroki (PlantUML/Graphviz)

#### Backend (FastAPI)
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: SQLite (development), PostgreSQL (production)
- **AI Integration**: Perplexity API + Ollama (local)

#### Infrastructure
- **Development**: Docker Compose
- **Storage**: IndexedDB (Dexie.js) for local persistence
- **Deployment**: Vercel (frontend), Docker (backend)

### Project Structure

```
diagramatiq/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   │   ├── layout/        # Layout components
│   │   │   ├── editor/        # Monaco Editor
│   │   │   ├── diagram/       # Diagram rendering
│   │   │   ├── ai-chat/       # AI chat interface
│   │   │   └── ui/            # Reusable UI components
│   │   ├── lib/               # Utilities and configuration
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript definitions
│   │   └── hooks/             # Custom React hooks
│   └── package.json
├── backend/                     # FastAPI backend
│   ├── main.py                 # Main application
│   ├── routers/                # API routes
│   └── requirements.txt
├── docs/                        # Documentation
└── docker-compose.yml          # Development environment
```

## 🎯 Core Features

### Current Features (MVP Phase 2 - 98% Complete)
- ✅ **Real-time Diagram Rendering**: Mermaid diagrams with live preview
- ✅ **Smart Code Editor**: Monaco Editor with syntax highlighting
- ✅ **AI Integration**: Perplexity API + Ollama with intelligent fallback
- ✅ **Export Functionality**: SVG and PNG export capabilities
- ✅ **Context-Aware AI**: AI understands current diagram and language
- ✅ **Prompt Templates**: Predefined templates for different diagram types
- ✅ **Error Handling**: Syntax validation and error display
- ✅ **Responsive Layout**: Three-panel resizable interface

### Planned Features (Phase 3)
- 🔄 **PlantUML Support**: UML diagrams via Kroki integration
- 🔄 **Graphviz Support**: Graph visualization
- 🔄 **Local Storage**: IndexedDB with auto-save
- 🔄 **Project Management**: Multiple diagram tabs
- 🔄 **Collaboration**: Real-time collaborative editing

## 🤖 AI Integration Strategy

### Dual AI Approach
1. **Perplexity API** (Cloud): Primary AI provider for online use
2. **Ollama** (Local): Fallback for offline/privacy-focused usage
3. **Mock Provider**: Development and testing fallback

### AI Capabilities
- **Context Awareness**: Understands current diagram code and language
- **Smart Templates**: Suggests appropriate prompts based on user input
- **Multi-language Support**: Mermaid, PlantUML, Graphviz
- **Intelligent Fallback**: Automatic provider switching on failure

## 🎨 Design Principles

### Developer-First Experience
- **Keyboard Shortcuts**: Power user productivity
- **Dark Mode**: Default dark theme optimized for developers
- **Minimalist UI**: Clean interface without distractions
- **Performance**: < 500ms diagram rendering, < 3s load time

### Code Quality Standards
- **TypeScript Strict**: Zero tolerance for `any` types
- **Component Architecture**: Modular, reusable components
- **Error Boundaries**: Graceful error handling
- **Testing**: Unit tests for critical functionality

## 📊 Current Status

### MVP Progress: 98% Complete 🚀

#### ✅ Recently Completed
- Real Mermaid diagram rendering with custom hook
- AI chat with real provider integration
- Export functionality (SVG/PNG)
- Context-aware AI responses
- Comprehensive prompt template system
- Error handling and validation

#### 🎯 Next Priorities
1. **Storage Implementation**: IndexedDB with Dexie.js
2. **PlantUML/Graphviz**: Kroki service integration
3. **Auto-save Enhancement**: Improved persistence

### Performance Metrics
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3s
- **Diagram Render Time**: < 500ms
- **AI Response Time**: < 10s (Perplexity), < 5s (Ollama)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd diagramatiq

# Start services
docker-compose up -d

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_api_key
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:11434
NEXT_PUBLIC_KROKI_HOST=http://localhost:8000
NEXT_PUBLIC_BACKEND_HOST=http://localhost:8080
```

## 📋 Development Workflow

### Code Standards
- **Conventional Commits**: Standardized commit messages
- **TypeScript Strict**: Complete type safety
- **ESLint + Prettier**: Code formatting and linting
- **Component Testing**: Jest + Testing Library

### Documentation Requirements
- **TODO.md**: Updated after each session
- **Technical Docs**: Updated with significant changes
- **API Documentation**: Auto-generated from code
- **README**: Always current setup instructions

## 🎯 Success Criteria

### MVP Definition of Done
- ✅ Generate diagram from AI prompt in < 10 seconds
- ✅ Manual editing without losing changes
- ✅ Export SVG/PNG functionality
- 🔄 Auto-save every 30 seconds
- 🔄 Basic offline support with local AI

### Quality Gates
- TypeScript compilation without errors
- All tests passing
- Performance targets met
- Documentation updated
- No breaking changes to existing functionality

---

**Last Updated**: 2024-01-20  
**Current Phase**: MVP Phase 2 (98% Complete)  
**Next Milestone**: Phase 3 - Advanced Features