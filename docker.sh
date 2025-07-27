#!/bin/bash

# 🐳 DiagramatIQ Docker Compose Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DiagramatIQ]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success ".env file created. Please update it with your API keys."
        else
            print_error ".env.example not found. Please create .env manually."
            exit 1
        fi
    fi
}

# Show help
show_help() {
    echo "🧠 DiagramatIQ Docker Compose Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev           Start development environment (frontend + ollama)"
    echo "  full          Start full stack (frontend + backend + ollama)"
    echo "  ollama        Start only Ollama service"
    echo "  backend       Start only backend service"
    echo "  frontend      Start only frontend service"
    echo "  build         Build all services"
    echo "  down          Stop all services"
    echo "  logs          Show logs for all services"
    echo "  clean         Clean up containers, networks, and volumes"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev        # Start frontend + ollama for development"
    echo "  $0 full       # Start complete stack"
    echo "  $0 logs       # View logs"
    echo "  $0 clean      # Clean everything"
}

# Main script logic
case "${1:-help}" in
    "dev")
        print_status "Starting development environment (Frontend + Ollama)..."
        check_env
        docker-compose --profile with-frontend up -d
        print_success "Development environment started!"
        print_status "Frontend: http://localhost:3000"
        print_status "Ollama: http://localhost:11434"
        ;;
    
    "full")
        print_status "Starting full stack (Frontend + Backend + Ollama)..."
        check_env
        docker-compose --profile with-frontend --profile with-backend up -d
        print_success "Full stack started!"
        print_status "Frontend: http://localhost:3000"
        print_status "Backend: http://localhost:8080"
        print_status "Ollama: http://localhost:11434"
        ;;
    
    "ollama")
        print_status "Starting Ollama service..."
        docker-compose up ollama -d
        print_success "Ollama started!"
        print_status "Ollama: http://localhost:11434"
        ;;
    
    "backend")
        print_status "Starting backend service..."
        check_env
        docker-compose --profile with-backend up -d
        print_success "Backend started!"
        print_status "Backend: http://localhost:8080"
        ;;
    
    "frontend")
        print_status "Starting frontend service..."
        check_env
        docker-compose --profile with-frontend up -d
        print_success "Frontend started!"
        print_status "Frontend: http://localhost:3000"
        ;;
    
    "build")
        print_status "Building all services..."
        docker-compose build
        print_success "All services built!"
        ;;
    
    "down")
        print_status "Stopping all services..."
        docker-compose --profile with-frontend --profile with-backend down
        print_success "All services stopped!"
        ;;
    
    "logs")
        print_status "Showing logs for all services..."
        docker-compose --profile with-frontend --profile with-backend logs -f
        ;;
    
    "clean")
        print_warning "This will remove all containers, networks, and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Cleaning up..."
            docker-compose --profile with-frontend --profile with-backend down -v
            docker system prune -f
            print_success "Cleanup completed!"
        else
            print_status "Cleanup cancelled."
        fi
        ;;
    
    "help"|*)
        show_help
        ;;
esac