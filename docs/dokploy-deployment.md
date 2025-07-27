# 🚀 DiagramatIQ - Dokploy Deployment Guide

## 📋 Resumen

DiagramatIQ está **listo para despliegue en Dokploy** con las siguientes características:

- ✅ **Docker Compose** configurado para producción
- ✅ **Dockerfiles** optimizados (frontend + backend)
- ✅ **Health checks** implementados
- ✅ **Variables de entorno** configuradas
- ✅ **Volúmenes persistentes** para Ollama
- ✅ **Networking** interno configurado

## 🎯 Arquitectura de Despliegue

```
┌─────────────────────────────────────────┐
│                Dokploy                  │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐   │
│  │  Frontend   │  │    Backend      │   │
│  │  (Next.js)  │  │   (FastAPI)     │   │
│  │   :3000     │  │     :8080       │   │
│  └─────────────┘  └─────────────────┘   │
│         │                   │           │
│         └───────────────────┼───────────┤
│                             │           │
│  ┌─────────────────────────────────────┐ │
│  │           Ollama AI                 │ │
│  │         :11434                      │ │
│  │    (Persistent Volume)              │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🚀 Pasos para Despliegue en Dokploy

### 1. Preparación del Repositorio

```bash
# Asegurar que todos los archivos están en el repo
git add .
git commit -m "feat: production-ready configuration for Dokploy"
git push origin main
```

### 2. Configuración en Dokploy

#### A. Crear Nueva Aplicación
1. **Tipo**: Docker Compose
2. **Repositorio**: Tu repositorio de GitHub
3. **Branch**: `main`
4. **Docker Compose File**: `docker-compose.prod.yml`

#### B. Variables de Entorno (CRÍTICAS)
```env
# URLs de tu dominio
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_OLLAMA_HOST=https://tu-dominio.com:11434
NEXT_PUBLIC_BACKEND_HOST=https://tu-dominio.com:8080

# API Keys (opcional pero recomendado)
PERPLEXITY_API_KEY=tu_api_key_aqui

# Seguridad
CORS_ORIGINS=https://tu-dominio.com
ALLOWED_ORIGINS=https://tu-dominio.com

# Configuración
NODE_ENV=production
OLLAMA_DEFAULT_MODEL=llama3.2:3b
```

#### C. Configuración de Puertos
- **Frontend**: `3000` → Puerto público
- **Backend**: `8080` → Puerto interno
- **Ollama**: `11434` → Puerto interno

#### D. Configuración de Dominio
- **Dominio principal**: `tu-dominio.com` → Frontend (:3000)
- **Subdominio API**: `api.tu-dominio.com` → Backend (:8080)
- **Subdominio AI**: `ai.tu-dominio.com` → Ollama (:11434)

### 3. Configuración de Volúmenes

Dokploy debe configurar volúmenes persistentes para:
- **Ollama Data**: `/root/.ollama` (modelos AI)
- **Logs**: `/app/logs` (opcional)

### 4. Configuración de Red

```yaml
# Dokploy debe crear una red interna
networks:
  diagramatiq-network:
    driver: bridge
```

## 🔧 Configuración Específica de Dokploy

### Dockerfile de Producción

El proyecto incluye:
- **Frontend**: `frontend/Dockerfile` (optimizado para producción)
- **Backend**: `backend/Dockerfile` (FastAPI con Uvicorn)

### Health Checks

Todos los servicios tienen health checks configurados:
- **Frontend**: `GET /` (Next.js)
- **Backend**: `GET /health` (FastAPI)
- **Ollama**: `GET /api/tags` (Ollama API)

### Orden de Inicio

```yaml
# Orden automático con depends_on
1. Ollama (base)
2. Backend (depende de Ollama)
3. Frontend (depende de Backend)
```

## 📊 Recursos Recomendados

### Mínimos para MVP
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Bandwidth**: 100GB/mes

### Recomendados para Producción
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Bandwidth**: 500GB/mes

## 🔍 Verificación Post-Despliegue

### 1. Health Checks
```bash
# Frontend
curl https://tu-dominio.com

# Backend
curl https://api.tu-dominio.com/health

# Ollama
curl https://ai.tu-dominio.com/api/tags
```

### 2. Funcionalidad Core
- [ ] **Página principal** carga correctamente
- [ ] **Editor Monaco** funciona
- [ ] **Renderizado Mermaid** funciona
- [ ] **Chat IA** responde (si Perplexity configurado)
- [ ] **Ollama local** responde
- [ ] **Auto-guardado** funciona

### 3. Performance
- [ ] **Tiempo de carga** < 3 segundos
- [ ] **Interacciones** < 100ms
- [ ] **Generación IA** < 30 segundos

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Frontend no carga
```bash
# Verificar logs
docker logs diagramatiq-frontend

# Verificar variables de entorno
echo $NEXT_PUBLIC_APP_URL
```

#### 2. Backend no responde
```bash
# Verificar conexión a Ollama
docker exec diagramatiq-backend curl http://ollama:11434/api/tags

# Verificar logs
docker logs diagramatiq-backend
```

#### 3. Ollama no funciona
```bash
# Verificar modelo instalado
docker exec diagramatiq-ollama ollama list

# Instalar modelo si falta
docker exec diagramatiq-ollama ollama pull llama3.2:3b
```

### Logs Importantes

```bash
# Ver todos los logs
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs ollama
```

## 🔐 Seguridad en Producción

### Variables Sensibles
- **PERPLEXITY_API_KEY**: Mantener secreta
- **CORS_ORIGINS**: Configurar dominios específicos
- **ALLOWED_ORIGINS**: Limitar a tu dominio

### Recomendaciones
1. **HTTPS obligatorio** para todos los servicios
2. **Rate limiting** en el proxy reverso
3. **Firewall** para puertos internos (8080, 11434)
4. **Backup regular** del volumen de Ollama

## ✅ Checklist de Despliegue

### Pre-Despliegue
- [ ] Código en repositorio actualizado
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado en DNS
- [ ] SSL/TLS certificado listo

### Durante Despliegue
- [ ] Dokploy detecta docker-compose.prod.yml
- [ ] Todos los servicios inician correctamente
- [ ] Health checks pasan
- [ ] Volúmenes se crean correctamente

### Post-Despliegue
- [ ] Aplicación accesible desde internet
- [ ] Todas las funcionalidades funcionan
- [ ] Performance aceptable
- [ ] Logs sin errores críticos

---

## 🎉 ¡Listo para Producción!

DiagramatIQ está **completamente preparado** para despliegue en Dokploy con:

- **Configuración robusta** de Docker
- **Health checks** y **restart policies**
- **Variables de entorno** bien definidas
- **Documentación completa** de despliegue
- **Troubleshooting guide** incluida

**Siguiente paso**: Configurar en Dokploy siguiendo esta guía.