# Docker Setup Guide for FocusFlow

This guide provides step-by-step instructions for building and running FocusFlow using Docker and Docker Compose.

## Prerequisites

- **Docker** 20.10+ installed
- **Docker Compose** 2.0+ installed
- **Git** (to clone the repository)

Verify installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Clone and Navigate

```bash
git clone https://github.com/dhinakar001/focus_flow_deploy.git
cd focus_flow_deploy
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp env.example .env

# Edit .env and set required variables (at minimum):
# - JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - TOKEN_ENCRYPTION_KEY (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
# - ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET (if using Zoho integration)
```

### 3. Build and Start Services

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Verify Services

```bash
# Check all services are running
docker-compose ps

# Test backend health
curl http://localhost:4000/health

# Test frontend
curl http://localhost:3000/health

# Test database connection (if adminer is running)
# Open http://localhost:8080 in browser
```

## Service URLs

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Backend Health**: http://localhost:4000/health
- **Python AI Service**: http://localhost:8000 (if enabled)
- **Adminer (Database UI)**: http://localhost:8080 (if enabled)

## Detailed Commands

### Build Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Run Commands

```bash
# Start all services in detached mode
docker-compose up -d

# Start specific services
docker-compose up -d db backend frontend

# Start with Python service
docker-compose --profile full up -d

# Start with Adminer
docker-compose --profile tools up -d

# Start all (including optional services)
docker-compose --profile full --profile tools up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Database Commands

```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Access PostgreSQL shell
docker-compose exec db psql -U focusflow -d focusflow

# Backup database
docker-compose exec db pg_dump -U focusflow focusflow > backup.sql

# Restore database
docker-compose exec -T db psql -U focusflow focusflow < backup.sql
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Check backend health
curl http://localhost:4000/health

# Check frontend health
curl http://localhost:3000/health

# Check Python service health (if running)
curl http://localhost:8000/health

# View health check logs
docker inspect focusflow-backend | grep -A 10 Health
```

### Debugging

```bash
# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db psql -U focusflow -d focusflow

# View container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend
```

## Service Configuration

### Backend Service

- **Port**: 4000
- **Health Check**: http://localhost:4000/health
- **Environment Variables**: Set in `.env` file
- **Dependencies**: PostgreSQL database

### Frontend Service

- **Port**: 3000 (mapped from container port 80)
- **Health Check**: http://localhost:3000/health
- **Build**: Production build with Vite
- **Server**: Nginx

### Database Service

- **Port**: 5432
- **User**: focusflow
- **Password**: focusflow_password (change in production!)
- **Database**: focusflow
- **Volumes**: Persistent storage for data

### Python AI Service (Optional)

- **Port**: 8000
- **Health Check**: http://localhost:8000/health
- **Start with**: `docker-compose --profile full up -d`

### Adminer (Optional)

- **Port**: 8080
- **URL**: http://localhost:8080
- **Server**: db
- **Username**: focusflow
- **Password**: focusflow_password
- **Database**: focusflow
- **Start with**: `docker-compose --profile tools up -d`

## Production Considerations

### Security

1. **Change Default Passwords**
   ```yaml
   # In docker-compose.yml, update:
   POSTGRES_PASSWORD: your_strong_password
   ```

2. **Use Secrets Management**
   - Use Docker secrets or environment files
   - Never commit `.env` files
   - Rotate secrets regularly

3. **Network Security**
   - Use internal networks (already configured)
   - Expose only necessary ports
   - Use reverse proxy (nginx/traefik) in production

### Performance

1. **Resource Limits**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

2. **Database Optimization**
   - Adjust connection pool size
   - Use read replicas for scaling
   - Enable query caching

### Monitoring

1. **Health Checks**: Already configured for all services
2. **Logging**: Use `docker-compose logs` or integrate with logging service
3. **Metrics**: Add Prometheus/Grafana for production monitoring

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check if ports are in use
netstat -an | grep 4000
netstat -an | grep 3000
netstat -an | grep 5432

# Restart Docker daemon (if needed)
sudo systemctl restart docker
```

### Database Connection Issues

```bash
# Check database is healthy
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec backend node -e "require('pg').Pool({connectionString: 'postgresql://focusflow:focusflow_password@db:5432/focusflow'}).query('SELECT 1', (e,r) => console.log(e||'Connected'))"
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend

# Check nginx configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Backend Health Check Failing

```bash
# Check backend logs
docker-compose logs backend

# Check environment variables
docker-compose exec backend env | grep -E 'JWT|DATABASE|ZOHO'

# Test health endpoint manually
docker-compose exec backend curl http://localhost:4000/health
```

## Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup (⚠️ removes everything)
docker-compose down -v --rmi all
docker system prune -a
```

## Next Steps

1. **Run Database Migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

2. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

3. **Set Up Zoho Integration**
   - Configure OAuth credentials in `.env`
   - Update `ZOHO_REDIRECT_URI` to match your setup

4. **Enable Optional Services**
   ```bash
   # Python AI Service
   docker-compose --profile full up -d
   
   # Adminer (Database UI)
   docker-compose --profile tools up -d
   ```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FocusFlow README](README.md)
- [Deployment Guide](docs/DEPLOYMENT.md)



