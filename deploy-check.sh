#!/bin/bash

# 🚀 DiagramatIQ - Production Deployment Script for Dokploy

set -e

echo "🚀 DiagramatIQ - Preparing for Dokploy Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found. Are you in the project root?"
    exit 1
fi

print_status "Validating production configuration..."

# Validate docker-compose.prod.yml
if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    print_success "docker-compose.prod.yml is valid"
else
    print_error "docker-compose.prod.yml has configuration errors"
    docker-compose -f docker-compose.prod.yml config
    exit 1
fi

# Check if .env.prod exists
if [ -f ".env.prod" ]; then
    print_success ".env.prod found"
else
    print_warning ".env.prod not found - you'll need to configure environment variables in Dokploy"
fi

# Check if production Dockerfiles exist
if [ -f "frontend/Dockerfile" ]; then
    print_success "Frontend production Dockerfile found"
else
    print_error "Frontend production Dockerfile missing"
    exit 1
fi

if [ -f "backend/Dockerfile" ]; then
    print_success "Backend production Dockerfile found"
else
    print_error "Backend production Dockerfile missing"
    exit 1
fi

# Check Next.js configuration
if grep -q "output: 'standalone'" frontend/next.config.js; then
    print_success "Next.js configured for standalone output"
else
    print_error "Next.js not configured for standalone output"
    exit 1
fi

# Test build process (optional)
if [ "$1" = "--test-build" ]; then
    print_status "Testing production build process..."
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    cd ..
    
    # Test docker-compose build
    print_status "Testing Docker Compose build..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    if [ $? -eq 0 ]; then
        print_success "Docker Compose build successful"
    else
        print_error "Docker Compose build failed"
        exit 1
    fi
fi

print_success "✅ DiagramatIQ is ready for Dokploy deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub"
echo "2. Create a new Docker Compose application in Dokploy"
echo "3. Set the Docker Compose file to: docker-compose.prod.yml"
echo "4. Configure environment variables from .env.prod"
echo "5. Set up your domain and SSL certificates"
echo "6. Deploy!"
echo ""
echo "📖 For detailed instructions, see: docs/dokploy-deployment.md"
echo ""
print_status "Happy deploying! 🚀"