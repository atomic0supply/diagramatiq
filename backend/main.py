# 🧠 DiagramatIQ Backend - Main FastAPI Application

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="DiagramatIQ API",
    description="Backend API for DiagramatIQ - AI-powered diagram generation",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class DiagramRequest(BaseModel):
    prompt: str
    diagram_type: str = "mermaid"
    context: Optional[str] = None

class DiagramResponse(BaseModel):
    code: str
    explanation: Optional[str] = None
    suggestions: Optional[List[str]] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str

# Routes
@app.get("/", response_model=dict)
async def root():
    """Root endpoint - API information"""
    return {
        "message": "DiagramatIQ API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="0.1.0"
    )

@app.post("/api/generate-diagram", response_model=DiagramResponse)
async def generate_diagram(request: DiagramRequest):
    """Generate diagram code using AI"""
    try:
        # Mock implementation for now
        # TODO: Integrate with actual AI providers (Perplexity/Ollama)
        
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
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating diagram: {str(e)}")

@app.get("/api/diagram-types")
async def get_diagram_types():
    """Get supported diagram types"""
    return {
        "types": [
            {"id": "mermaid", "name": "Mermaid", "description": "Flowcharts, sequence diagrams, etc."},
            {"id": "plantuml", "name": "PlantUML", "description": "UML diagrams"},
            {"id": "graphviz", "name": "Graphviz", "description": "Graph visualization"}
        ]
    }

# Error handlers
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )