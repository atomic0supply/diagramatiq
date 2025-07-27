# DiagramatIQ - Backend Documentation

## 🏗️ Backend Architecture

The DiagramatIQ backend is built with **FastAPI** and serves as a lightweight API layer for diagram generation and future features like user management and persistence.

## 📁 Project Structure

```
backend/
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
├── conftest.py            # Test configuration
└── routers/               # API route modules (empty - future use)
```

## 🚀 FastAPI Application

### Core Configuration

**File**: `main.py`  
**Framework**: FastAPI 0.104.1  
**Python**: 3.11+  
**Port**: 8080  
**Documentation**: Auto-generated Swagger UI

### Application Setup

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DiagramatIQ API",
    description="Backend API for DiagramatIQ - AI-powered diagram generation",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Data Models (Pydantic)

### Request Models

```python
class DiagramRequest(BaseModel):
    prompt: str
    diagram_type: str = "mermaid"
    context: Optional[str] = None
```

### Response Models

```python
class DiagramResponse(BaseModel):
    code: str
    explanation: Optional[str] = None
    suggestions: Optional[List[str]] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
```

## 🛣️ API Routes

### Health & Information Routes

#### Root Endpoint
```python
@app.get("/", response_model=dict)
async def root():
    return {
        "message": "DiagramatIQ API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }
```

#### Health Check
```python
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="0.1.0"
    )
```

### Diagram Generation Routes

#### Generate Diagram (Mock Implementation)
```python
@app.post("/api/generate-diagram", response_model=DiagramResponse)
async def generate_diagram(request: DiagramRequest):
    # Current: Mock implementation
    # Future: Real AI integration
    
    if request.diagram_type == "mermaid":
        mock_code = f"""graph TD
    A[{request.prompt}] --> B[Generated Diagram]
    B --> C[Success]"""
    elif request.diagram_type == "plantuml":
        mock_code = f"""@startuml
title {request.prompt}
A --> B: Generated
B --> C: Success
@enduml"""
    else:
        mock_code = f"digraph G {{\n  \"{request.prompt}\" -> \"Generated\";\n}}"
    
    return DiagramResponse(
        code=mock_code,
        explanation=f"Generated {request.diagram_type} diagram for: {request.prompt}",
        suggestions=["Add more details", "Consider using colors", "Add relationships"]
    )
```

#### Supported Diagram Types
```python
@app.get("/api/diagram-types")
async def get_diagram_types():
    return {
        "types": [
            {"id": "mermaid", "name": "Mermaid", "description": "Flowcharts, sequence diagrams, etc."},
            {"id": "plantuml", "name": "PlantUML", "description": "UML diagrams"},
            {"id": "graphviz", "name": "Graphviz", "description": "Graph visualization"}
        ]
    }
```

## 🔧 Dependencies

### Core Dependencies (`requirements.txt`)

```python
# Core FastAPI
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database (Future)
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9  # PostgreSQL
# sqlite3 (built-in for development)

# AI Integration (Future)
openai==1.3.7
httpx==0.25.2
aiohttp==3.9.1

# Utilities
python-multipart==0.0.6  # File uploads
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4  # Password hashing
python-dotenv==1.0.0

# CORS and middleware
python-cors==1.7.0

# Optional: Redis for caching
redis==5.0.1
```

### Development Dependencies

```python
# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
pytest-mock==3.12.0
httpx==0.25.2  # For testing FastAPI endpoints
factory-boy==3.3.0  # Test data factories

# Code Quality
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1
```

## 🔒 Error Handling

### Global Exception Handlers

```python
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

### Custom Error Classes (Future)

```python
class DiagramGenerationError(Exception):
    def __init__(self, message: str, provider: str):
        self.message = message
        self.provider = provider
        super().__init__(self.message)

class AIProviderUnavailableError(Exception):
    pass
```

## 🚀 Development Setup

### Local Development

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### Docker Development

```bash
# Using docker-compose (recommended)
docker-compose up backend

# Or standalone Docker
docker build -t diagramatiq-backend .
docker run -p 8080:8080 diagramatiq-backend
```

### Environment Variables

```bash
# .env file (future implementation)
DATABASE_URL=postgresql://user:password@localhost/diagramatiq
REDIS_URL=redis://localhost:6379
PERPLEXITY_API_KEY=your_api_key
OLLAMA_HOST=http://localhost:11434
SECRET_KEY=your_secret_key
DEBUG=true
```

## 🧪 Testing

### Test Structure (Future)

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_main.py
│   ├── test_diagram_generation.py
│   └── test_health.py
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_main.py

# Run with verbose output
pytest -v
```

### Example Test

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["version"] == "0.1.0"

def test_generate_diagram():
    response = client.post(
        "/api/generate-diagram",
        json={
            "prompt": "user login flow",
            "diagram_type": "mermaid"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "code" in data
    assert "explanation" in data
```

## 📋 Future Implementation Roadmap

### Phase 2 (Current - Mock Implementation)
- ✅ Basic FastAPI structure
- ✅ Mock diagram generation endpoints
- ✅ Health check and documentation
- ✅ CORS configuration for frontend

### Phase 3 (Real AI Integration)
- 🔄 **AI Provider Integration**: Connect to Perplexity and Ollama APIs
- 🔄 **Database Layer**: SQLAlchemy models for diagrams and users
- 🔄 **Authentication**: JWT-based user authentication
- 🔄 **Diagram Persistence**: Save/load diagrams from database

### Phase 4 (Advanced Features)
- 🔮 **User Management**: Registration, profiles, preferences
- 🔮 **Project Management**: Organize diagrams into projects
- 🔮 **Collaboration**: Real-time collaborative editing
- 🔮 **Version Control**: Diagram history and versioning

### Phase 5 (Production Ready)
- 🔮 **Rate Limiting**: API usage limits
- 🔮 **Caching**: Redis for performance optimization
- 🔮 **Monitoring**: Logging, metrics, health checks
- 🔮 **Security**: Input validation, SQL injection prevention

## 🔧 Database Design (Future)

### Planned Models

```python
# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="owner")

# Project model
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True)
    name = Column(String, index=True)
    description = Column(Text)
    owner_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    diagrams = relationship("Diagram", back_populates="project")

# Diagram model
class Diagram(Base):
    __tablename__ = "diagrams"
    
    id = Column(String, primary_key=True)
    title = Column(String, index=True)
    code = Column(Text)
    language = Column(String)  # mermaid, plantuml, graphviz
    project_id = Column(String, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="diagrams")
```

## 🚀 Deployment

### Production Deployment (Future)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Docker Compose Production

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/diagramatiq
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: diagramatiq
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    
volumes:
  postgres_data:
```

---

**Last Updated**: 2024-01-20  
**Backend Version**: 0.1.0  
**Status**: MVP Phase 2 (Mock Implementation)  
**Next Milestone**: Real AI Integration