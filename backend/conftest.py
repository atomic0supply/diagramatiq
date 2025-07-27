# 🧠 DiagramatIQ Backend - Test Configuration

import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from main import app

# Test client setup
@pytest.fixture
def client():
    """Synchronous test client"""
    return TestClient(app)

@pytest.fixture
async def async_client():
    """Asynchronous test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Database fixtures (for future use)
@pytest.fixture
def test_db():
    """Test database fixture - placeholder for future implementation"""
    # TODO: Implement test database setup when we add database functionality
    pass

# Mock data fixtures
@pytest.fixture
def sample_diagram_request():
    """Sample diagram request for testing"""
    return {
        "prompt": "Create a simple flowchart",
        "diagram_type": "mermaid",
        "context": "Testing context"
    }

@pytest.fixture
def sample_mermaid_code():
    """Sample Mermaid diagram code"""
    return """graph TD
    A[Start] --> B[Process]
    B --> C[End]"""

@pytest.fixture
def sample_plantuml_code():
    """Sample PlantUML diagram code"""
    return """@startuml
title Sample Diagram
A --> B: Process
B --> C: End
@enduml"""