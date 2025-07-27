# DiagramatIQ - API Reference

## 🌐 API Overview

DiagramatIQ uses a hybrid API architecture combining a FastAPI backend with external AI services and client-side integrations.

## 🔧 Backend API (FastAPI)

**Base URL**: `http://localhost:8080`  
**Documentation**: `http://localhost:8080/docs` (Swagger UI)  
**Alternative Docs**: `http://localhost:8080/redoc` (ReDoc)

### Core Endpoints

#### Health & Information

##### `GET /`
**Description**: Root endpoint with API information  
**Response**:
```json
{
  "message": "DiagramatIQ API",
  "version": "0.1.0",
  "docs": "/docs",
  "health": "/health"
}
```

##### `GET /health`
**Description**: Health check endpoint  
**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00Z",
  "version": "0.1.0"
}
```

#### Diagram Generation

##### `POST /api/generate-diagram`
**Description**: Generate diagram code using AI (Mock implementation)  
**Request Body**:
```json
{
  "prompt": "Create a flowchart for user authentication",
  "diagram_type": "mermaid",
  "context": "Optional context string"
}
```

**Response**:
```json
{
  "code": "graph TD\n    A[User Authentication] --> B[Generated Diagram]\n    B --> C[Success]",
  "explanation": "Generated mermaid diagram for: Create a flowchart for user authentication",
  "suggestions": [
    "Add more details",
    "Consider using colors", 
    "Add relationships"
  ]
}
```

**Error Response** (500):
```json
{
  "detail": "Error generating diagram: [error message]"
}
```

#### Diagram Types

##### `GET /api/diagram-types`
**Description**: Get supported diagram types  
**Response**:
```json
{
  "types": [
    {
      "id": "mermaid",
      "name": "Mermaid",
      "description": "Flowcharts, sequence diagrams, etc."
    },
    {
      "id": "plantuml", 
      "name": "PlantUML",
      "description": "UML diagrams"
    },
    {
      "id": "graphviz",
      "name": "Graphviz", 
      "description": "Graph visualization"
    }
  ]
}
```

### Error Handling

#### Standard Error Responses

**404 Not Found**:
```json
{
  "detail": "Endpoint not found"
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Internal server error"
}
```

## 🤖 AI Provider APIs

### Perplexity API Integration

**Base URL**: `https://api.perplexity.ai`  
**Authentication**: Bearer token  
**Model**: `llama-3.1-sonar-small-128k-online`

#### Chat Completions
**Endpoint**: `POST /chat/completions`  
**Headers**:
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request**:
```json
{
  "model": "llama-3.1-sonar-small-128k-online",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert diagram generator..."
    },
    {
      "role": "user", 
      "content": "Create a flowchart for user authentication"
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

**Response**:
```json
{
  "choices": [
    {
      "message": {
        "content": "```mermaid\ngraph TD\n    A[Start] --> B[Login]\n```\n\nThis diagram shows..."
      }
    }
  ],
  "usage": {
    "total_tokens": 150
  }
}
```

### Ollama Local API

**Base URL**: `http://localhost:11434`  
**Authentication**: None (local)

#### Model Availability
**Endpoint**: `GET /api/tags`  
**Response**:
```json
{
  "models": [
    {
      "name": "codellama:7b",
      "size": 3825819519
    }
  ]
}
```

#### Chat Generation
**Endpoint**: `POST /api/chat`  
**Request**:
```json
{
  "model": "codellama:7b",
  "messages": [
    {
      "role": "user",
      "content": "Create a mermaid diagram for user authentication"
    }
  ],
  "stream": false
}
```

## 🎨 Kroki API (Diagram Rendering)

**Base URL**: `http://localhost:8000`  
**Purpose**: Server-side diagram rendering for PlantUML and Graphviz

### Supported Formats

#### PlantUML
**Endpoint**: `POST /plantuml/svg`  
**Content-Type**: `text/plain`  
**Body**: PlantUML source code  
**Response**: SVG content

#### Graphviz
**Endpoint**: `POST /graphviz/svg`  
**Content-Type**: `text/plain`  
**Body**: DOT source code  
**Response**: SVG content

## 📱 Frontend API Integration

### AI Provider Hook (`useAI`)

```typescript
const {
  generateDiagram,
  isLoading,
  error,
  availableProviders
} = useAI();

// Generate diagram
const result = await generateDiagram(
  "Create a flowchart",
  { 
    language: 'mermaid',
    currentCode: 'graph TD...',
    previousMessages: []
  }
);
```

### Storage Hook (`useStorage`)

```typescript
const {
  saveDiagram,
  loadDiagram,
  getAllDiagrams,
  createProject
} = useStorage();

// Save diagram
await saveDiagram({
  id: 'diagram-1',
  code: 'graph TD...',
  language: 'mermaid',
  title: 'My Diagram'
});
```

## 🔐 Authentication & Security

### Current Implementation
- **No Authentication**: MVP version is completely local
- **CORS**: Configured for localhost development
- **API Keys**: Stored in environment variables (client-side)

### Future Implementation (Phase 3)
- JWT-based authentication
- User management endpoints
- Secure API key storage
- Rate limiting

## 📊 API Response Types

### TypeScript Interfaces

```typescript
// AI Response
interface AIResponse {
  code: string;
  explanation?: string;
  suggestions?: string[];
  usage?: {
    tokens: number;
    cost?: number;
  };
}

// Diagram Data
interface DiagramData {
  id: string;
  code: string;
  language: 'mermaid' | 'plantuml' | 'graphviz';
  title: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

// AI Context
interface DiagramContext {
  language: string;
  currentCode?: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

## 🚀 Development & Testing

### API Testing

#### Using curl
```bash
# Health check
curl http://localhost:8080/health

# Generate diagram
curl -X POST http://localhost:8080/api/generate-diagram \
  -H "Content-Type: application/json" \
  -d '{"prompt": "user login flow", "diagram_type": "mermaid"}'

# Get diagram types
curl http://localhost:8080/api/diagram-types
```

#### Using Frontend
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`

### Environment Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 📋 API Roadmap

### Phase 2 (Current)
- ✅ Basic FastAPI structure
- ✅ Mock diagram generation
- ✅ Health endpoints
- ✅ CORS configuration

### Phase 3 (Planned)
- 🔄 Real AI integration in backend
- 🔄 User authentication
- 🔄 Diagram persistence
- 🔄 Project management endpoints
- 🔄 Collaboration APIs

### Phase 4 (Future)
- 🔮 Public API with rate limiting
- 🔮 Webhook integrations
- 🔮 Plugin system APIs
- 🔮 Advanced analytics

---

**Last Updated**: 2024-01-20  
**API Version**: 0.1.0  
**Status**: Development (MVP Phase 2)