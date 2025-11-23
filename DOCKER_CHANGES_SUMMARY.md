# Docker Setup - Changes Summary

This document summarizes all Docker-related files added to the FocusFlow project.

## Files Added

### Core Docker Files

1. **`Dockerfile`** (Root) - Multi-stage Dockerfile for backend
2. **`frontend/Dockerfile`** - Multi-stage Dockerfile for frontend with Nginx
3. **`frontend/nginx.conf`** - Nginx configuration for frontend
4. **`python_service/Dockerfile`** - Dockerfile for Python AI service
5. **`docker-compose.yml`** - Docker Compose configuration
6. **`.dockerignore`** (Root) - Docker ignore file for backend
7. **`frontend/.dockerignore`** - Docker ignore file for frontend
8. **`python_service/.dockerignore`** - Docker ignore file for Python service
9. **`DOCKER_SETUP.md`** - Comprehensive setup and usage guide

## File Contents Summary

### 1. Backend Dockerfile (`Dockerfile`)

**Type**: Multi-stage build
**Stages**:
- `deps`: Install production dependencies
- `builder`: Full build environment (if needed)
- `runtime`: Final production image

**Features**:
- Node.js 18 Alpine base
- Non-root user (nodejs:1001)
- Health check endpoint
- Port 4000 exposed
- Optimized layer caching

### 2. Frontend Dockerfile (`frontend/Dockerfile`)

**Type**: Multi-stage build
**Stages**:
- `builder`: Build React app with Vite
- `runtime`: Serve with Nginx

**Features**:
- Node.js 18 Alpine for build
- Nginx Alpine for runtime
- Production-optimized build
- Custom Nginx configuration
- Health check endpoint
- Port 80 exposed (mapped to 3000)

### 3. Nginx Configuration (`frontend/nginx.conf`)

**Features**:
- Gzip compression
- Security headers
- Static asset caching
- SPA routing support
- Health check endpoint
- Error page handling

### 4. Python Service Dockerfile (`python_service/Dockerfile`)

**Type**: Multi-stage build
**Features**:
- Python 3.11 slim base
- Non-root user
- Health check
- Port 8000 exposed
- Uvicorn server

### 5. Docker Compose (`docker-compose.yml`)

**Services**:
- `db`: PostgreSQL 14
- `backend`: Node.js API
- `frontend`: React + Nginx
- `python-service`: Python AI service (optional, profile: full)
- `adminer`: Database UI (optional, profile: tools)

**Features**:
- Health checks for all services
- Volume persistence for database
- Network isolation
- Environment variable support
- Service dependencies
- Restart policies

## Quick Test Commands

### 1. Build All Services

```bash
# Build all images
docker-compose build

# Build without cache (clean build)
docker-compose build --no-cache

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### 2. Start Services

```bash
# Start all core services (db, backend, frontend)
docker-compose up -d

# Start with Python service
docker-compose --profile full up -d

# Start with Adminer (database UI)
docker-compose --profile tools up -d

# Start everything
docker-compose --profile full --profile tools up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### 3. Verify Services

```bash
# Check service status
docker-compose ps

# Test backend health
curl http://localhost:4000/health

# Test frontend health
curl http://localhost:3000/health

# Test Python service health (if running)
curl http://localhost:8000/health

# Check database connection
docker-compose exec db pg_isready -U focusflow
```

### 4. Access Services

```bash
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Backend Health: http://localhost:4000/health
# Python Service: http://localhost:8000 (if enabled)
# Adminer: http://localhost:8080 (if enabled)
```

### 5. Database Operations

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Access PostgreSQL shell
docker-compose exec db psql -U focusflow -d focusflow

# Backup database
docker-compose exec db pg_dump -U focusflow focusflow > backup.sql

# View database logs
docker-compose logs db
```

### 6. Debugging

```bash
# Execute shell in container
docker-compose exec backend sh
docker-compose exec frontend sh

# View container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Restart service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend
```

### 7. Stop and Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker-compose down -v --rmi all
```

## Service Ports

| Service | Container Port | Host Port | URL |
|---------|--------------|-----------|-----|
| Frontend | 80 | 3000 | http://localhost:3000 |
| Backend | 4000 | 4000 | http://localhost:4000 |
| Database | 5432 | 5432 | postgresql://localhost:5432 |
| Python Service | 8000 | 8000 | http://localhost:8000 |
| Adminer | 8080 | 8080 | http://localhost:8080 |

## Environment Variables

Required environment variables (set in `.env` file):

```bash
# Security (Required)
JWT_SECRET=your-32-char-secret
TOKEN_ENCRYPTION_KEY=base64-encoded-key

# Zoho OAuth (Required for integration)
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REDIRECT_URI=http://localhost:4000/auth/callback

# Optional
LOG_LEVEL=info
LOG_FORMAT=text
```

## Health Checks

All services include health checks:

- **Backend**: `GET /health` - Returns service status
- **Frontend**: `GET /health` - Returns "healthy"
- **Database**: `pg_isready` - PostgreSQL readiness check
- **Python Service**: `GET /health` - FastAPI health endpoint

Check health status:
```bash
docker-compose ps
```

## Network Architecture

All services run on `focusflow-network` bridge network:
- Services can communicate using service names (e.g., `db`, `backend`)
- Database accessible at `db:5432` from backend
- Backend accessible at `backend:4000` from frontend
- External access via mapped ports

## Volume Persistence

- **PostgreSQL data**: Stored in `postgres_data` volume
- **Survives container restarts**: Data persists across `docker-compose down/up`
- **Backup**: Use `pg_dump` commands shown above

## Production Considerations

1. **Change default passwords** in `docker-compose.yml`
2. **Use secrets management** for sensitive data
3. **Add resource limits** to services
4. **Use reverse proxy** (nginx/traefik) for production
5. **Enable SSL/TLS** for all services
6. **Set up monitoring** and logging aggregation
7. **Configure backups** for database volume

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
netstat -an | grep 4000
netstat -an | grep 3000

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify connection string
docker-compose exec backend env | grep DATABASE_URL
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend

# Check nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Build Failures

```bash
# Clean build
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test-backend -f Dockerfile .

# Check available disk space
df -h
```

## Next Steps

1. **Set up environment variables** in `.env` file
2. **Build and start services**: `docker-compose up -d`
3. **Run database migrations**: `docker-compose exec backend npm run migrate`
4. **Access application**: http://localhost:3000
5. **Configure Zoho OAuth** credentials
6. **Test all endpoints** and verify health checks

For detailed instructions, see [DOCKER_SETUP.md](DOCKER_SETUP.md).



