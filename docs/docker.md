# 🐳 DiagramatIQ Docker Setup

Este documento explica cómo ejecutar DiagramatIQ usando Docker Compose para desarrollo y producción.

## 📋 Prerrequisitos

- Docker Desktop instalado
- Docker Compose v2.0+
- Al menos 4GB de RAM disponible para Ollama

## 🚀 Inicio Rápido

### 1. Configuración Inicial

```bash
# Clonar el repositorio
git clone <repository-url>
cd diagramatiq

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys
```

### 2. Ejecutar con el Script Helper

```bash
# Desarrollo (Frontend + Ollama)
./docker.sh dev

# Stack completo (Frontend + Backend + Ollama)
./docker.sh full

# Solo Ollama
./docker.sh ollama
```

### 3. Comandos Manuales de Docker Compose

```bash
# Desarrollo - Solo frontend y Ollama
docker-compose --profile with-frontend up -d

# Completo - Frontend, backend y Ollama
docker-compose --profile with-frontend --profile with-backend up -d

# Solo servicios específicos
docker-compose up ollama -d
```

## 🏗️ Arquitectura de Servicios

### 📊 Servicios Disponibles

| Servicio | Puerto | Descripción | Profile |
|----------|--------|-------------|---------|
| `frontend` | ${FRONTEND_PORT:-3000} | Next.js App | `with-frontend` |
| `backend` | ${BACKEND_PORT:-8080} | FastAPI API | `with-backend` |
| `ollama` | ${OLLAMA_PORT:-11434} | IA Local | Siempre activo |

### 🌐 URLs de Acceso

- **Frontend**: http://localhost:${FRONTEND_PORT:-3000}
- **Backend API**: http://localhost:${BACKEND_PORT:-8080}
- **Backend Docs**: http://localhost:${BACKEND_PORT:-8080}/docs
- **Ollama**: http://localhost:${OLLAMA_PORT:-11434}

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# API Keys
PERPLEXITY_API_KEY=your_key_here

# 🚢 Port Configuration (Configurable)
FRONTEND_PORT=3000
BACKEND_PORT=8080
OLLAMA_PORT=11434

# Service URLs (Uses configurable ports)
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:${OLLAMA_PORT}
NEXT_PUBLIC_BACKEND_HOST=http://localhost:${BACKEND_PORT}

# Docker
COMPOSE_PROJECT_NAME=diagramatiq
```

### 🔧 Configuración de Puertos

Todos los puertos son configurables a través de variables de entorno:

- **FRONTEND_PORT**: Puerto del frontend Next.js (default: 3000)
- **BACKEND_PORT**: Puerto del backend FastAPI (default: 8080)  
- **OLLAMA_PORT**: Puerto del servicio Ollama (default: 11434)

Para cambiar los puertos, simplemente modifica las variables en tu archivo `.env`:

```bash
# Ejemplo: Usar puertos alternativos
FRONTEND_PORT=3001
BACKEND_PORT=8081
OLLAMA_PORT=11435
```

**Importante**: Si cambias los puertos, asegúrate de actualizar también las URLs de servicio:

```bash
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:11435
NEXT_PUBLIC_BACKEND_HOST=http://localhost:8081
```

### GPU Support (Opcional)

Para habilitar soporte GPU en Ollama:

1. Descomenta la sección GPU en `docker-compose.yml`
2. Asegúrate de tener NVIDIA Docker runtime instalado

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## 📝 Comandos Útiles

### Gestión de Servicios

```bash
# Ver logs
./docker.sh logs
docker-compose logs -f

# Parar servicios
./docker.sh down
docker-compose down

# Rebuild servicios
./docker.sh build
docker-compose build

# Limpiar todo
./docker.sh clean
```

### Desarrollo

```bash
# Entrar al contenedor del frontend
docker-compose exec frontend sh

# Entrar al contenedor del backend
docker-compose exec backend bash

# Ver logs específicos
docker-compose logs frontend
docker-compose logs backend
docker-compose logs ollama
```

### Ollama Management

```bash
# Instalar modelos en Ollama
docker-compose exec ollama ollama pull llama3.2:3b
docker-compose exec ollama ollama pull llama3.2:3b

# Listar modelos instalados
docker-compose exec ollama ollama list

# Probar Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hello world"
}'
```

## 🐛 Troubleshooting

### Problemas Comunes

**Puerto ya en uso:**
```bash
# Verificar qué está usando el puerto
lsof -i :3000
lsof -i :8080
lsof -i :11434

# Parar servicios conflictivos
./docker.sh down
```

**Ollama no responde:**
```bash
# Verificar logs
docker-compose logs ollama

# Reiniciar Ollama
docker-compose restart ollama
```

**Frontend no conecta al backend:**
```bash
# Verificar variables de entorno
docker-compose exec frontend env | grep NEXT_PUBLIC

# Verificar red
docker network ls
docker network inspect diagramatiq_diagramatiq-network
```

**Problemas de memoria:**
```bash
# Verificar uso de recursos
docker stats

# Limpiar recursos no utilizados
docker system prune -f
```

### Logs y Debugging

```bash
# Logs detallados
docker-compose logs --tail=100 -f

# Verificar salud de servicios
docker-compose ps

# Inspeccionar contenedor
docker-compose exec frontend sh
docker-compose exec backend bash
```

## 🔄 Workflows de Desarrollo

### Desarrollo Frontend

```bash
# Iniciar solo frontend + Ollama
./docker.sh dev

# Hacer cambios en código
# Los cambios se reflejan automáticamente (hot reload)

# Ver logs
docker-compose logs frontend -f
```

### Desarrollo Full Stack

```bash
# Iniciar stack completo
./docker.sh full

# Desarrollo con hot reload en ambos servicios
# Frontend: http://localhost:3000
# Backend: http://localhost:8080/docs
```

### Testing

```bash
# Ejecutar tests en frontend
docker-compose exec frontend npm test

# Ejecutar tests en backend
docker-compose exec backend pytest
```

## 📦 Producción

Para producción, usar el Dockerfile de producción del frontend:

```bash
# Build para producción
docker-compose -f docker-compose.prod.yml build

# Ejecutar en producción
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Seguridad

- Nunca commitear archivos `.env` con API keys reales
- Usar secrets de Docker en producción
- Configurar firewall apropiadamente
- Actualizar imágenes regularmente

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [Ollama Docker Guide](https://ollama.ai/blog/ollama-is-now-available-as-an-official-docker-image)