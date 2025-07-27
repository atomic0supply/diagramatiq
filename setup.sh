#!/bin/bash

# 🧠 DiagramatIQ - Setup Script
# Configuración inicial completa del proyecto

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🧠 DiagramatIQ - Setup Inicial${NC}\n"

# Verificar dependencias
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 no está instalado. Por favor instálalo primero.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 encontrado${NC}"
    fi
}

echo -e "${YELLOW}Verificando dependencias...${NC}"
check_dependency "docker"
check_dependency "docker-compose"
check_dependency "node"
check_dependency "npm"

# Crear estructura de directorios
echo -e "\n${YELLOW}📁 Creando estructura de directorios...${NC}"
mkdir -p {frontend,backend,docs,scripts}
mkdir -p frontend/{src/{app,components,lib,stores,types},public}
mkdir -p backend/{routers,models,services,utils}

# Configurar variables de entorno
echo -e "\n${YELLOW}🔧 Configurando variables de entorno...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado desde .env.example${NC}"
    echo -e "${YELLOW}⚠️  Por favor edita .env con tus API keys antes de continuar${NC}"
else
    echo -e "${BLUE}ℹ️  Archivo .env ya existe${NC}"
fi

# Función para preguntar al usuario
ask_user() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde yes o no.";;
        esac
    done
}

# Configurar Perplexity API
echo -e "\n${YELLOW}🤖 Configuración de APIs de IA${NC}"
if ask_user "¿Tienes una API key de Perplexity?"; then
    read -p "Ingresa tu Perplexity API key: " perplexity_key
    if [ ! -z "$perplexity_key" ]; then
        sed -i.bak "s/PERPLEXITY_API_KEY=.*/PERPLEXITY_API_KEY=$perplexity_key/" .env
        echo -e "${GREEN}✅ Perplexity API key configurada${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Puedes configurar Perplexity más tarde en .env${NC}"
fi

# Levantar servicios base
echo -e "\n${YELLOW}🐳 Iniciando servicios con Docker...${NC}"
echo -e "${BLUE}Esto incluye: Kroki, Ollama, Redis${NC}"

docker-compose pull
docker-compose up -d kroki ollama redis

# Esperar a que los servicios estén listos
echo -e "\n${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar que los servicios estén funcionando
echo -e "\n${YELLOW}🔍 Verificando servicios...${NC}"

# Kroki
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Kroki funcionando en puerto 8000${NC}"
else
    echo -e "${RED}❌ Kroki no responde${NC}"
fi

# Ollama
if curl -s http://localhost:11434/api/version > /dev/null; then
    echo -e "${GREEN}✅ Ollama funcionando en puerto 11434${NC}"
    
    # Descargar modelo por defecto si el usuario quiere
    if ask_user "¿Descargar