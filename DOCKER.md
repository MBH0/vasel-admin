# Docker Deployment Guide

This guide explains how to deploy Vasel Admin using Docker.

## Quick Start

### 1. Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### 2. Configuration

Copy the example environment file:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` and fill in your values:

```bash
# Generate secure secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for STRAPI_JWT_SECRET
openssl rand -base64 32  # Use for STRAPI_ADMIN_JWT_SECRET
openssl rand -base64 32  # Use for STRAPI_API_TOKEN_SALT

# Generate 4 app keys for STRAPI_APP_KEYS
echo "$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

Required variables:
- `ADMIN_PASSWORD`: Password for Vasel Admin login
- `JWT_SECRET`: Secret for JWT tokens (min 32 chars)
- `OPENAI_API_KEY`: Your OpenAI API key
- `STRAPI_FULL_TOKEN`: Strapi API token (create in Strapi admin)
- `DATABASE_PASSWORD`: PostgreSQL password

### 3. Deploy

Start all services:

```bash
docker-compose --env-file .env.docker up -d
```

Check status:

```bash
docker-compose ps
```

View logs:

```bash
docker-compose logs -f
```

### 4. Access

- **Vasel Admin**: http://localhost:3000
- **Strapi Admin**: http://localhost:1337/admin

## Production Deployment

### Build optimized image

```bash
docker build -t vasel-admin:latest .
```

### Environment variables

In production, use secrets management:

```bash
# Using Docker secrets
docker secret create admin_password /path/to/password.txt
docker secret create jwt_secret /path/to/jwt_secret.txt

# Or Kubernetes secrets
kubectl create secret generic vasel-admin-secrets \
  --from-literal=admin-password=your_password \
  --from-literal=jwt-secret=your_jwt_secret
```

### Health checks

The container includes a health check that runs every 30 seconds:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' vasel-admin
```

### Scaling

Scale Vasel Admin:

```bash
docker-compose up -d --scale vasel-admin=3
```

Note: Use a load balancer (nginx, traefik) in front of multiple instances.

## Networking

Services communicate through a private network:

- `vasel-admin` → `strapi:1337`
- `strapi` → `postgres:5432`

Only expose required ports to the host:
- Port 3000: Vasel Admin (optional if behind reverse proxy)
- Port 1337: Strapi Admin (for initial setup only)

## Volumes

Persistent data:

```bash
# Backup Strapi data
docker run --rm -v vasel-admin_strapi-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/strapi-backup.tar.gz /data

# Backup PostgreSQL
docker-compose exec postgres pg_dump -U strapi strapi > strapi-backup.sql
```

## Troubleshooting

### Container won't start

Check logs:

```bash
docker-compose logs vasel-admin
```

### Database connection issues

Verify PostgreSQL is healthy:

```bash
docker-compose exec postgres pg_isready -U strapi
```

### Strapi connection issues

Test from vasel-admin container:

```bash
docker-compose exec vasel-admin wget -O- http://strapi:1337/_health
```

## Maintenance

### Update images

```bash
docker-compose pull
docker-compose up -d
```

### Clean up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Security Best Practices

1. **Never commit `.env.docker`** - Keep secrets out of version control
2. **Use strong passwords** - Minimum 32 characters for secrets
3. **Rotate secrets regularly** - Especially JWT secrets and API tokens
4. **Use HTTPS in production** - Deploy behind nginx with SSL/TLS
5. **Limit exposed ports** - Only expose what's necessary
6. **Keep images updated** - Regularly update base images for security patches
7. **Use read-only volumes** - Where possible, mount volumes as read-only
8. **Enable Docker security features**:
   ```yaml
   security_opt:
     - no-new-privileges:true
   cap_drop:
     - ALL
   cap_add:
     - NET_BIND_SERVICE
   ```

## Performance Tuning

### Node.js Memory Limits

```yaml
services:
  vasel-admin:
    environment:
      - NODE_OPTIONS=--max-old-space-size=2048
```

### Database Connection Pooling

Adjust PostgreSQL settings in docker-compose.yml:

```yaml
services:
  postgres:
    command:
      - postgres
      - -c
      - max_connections=200
      - -c
      - shared_buffers=256MB
```

## Multi-stage Build

The Dockerfile uses multi-stage builds for optimization:

1. **Builder stage**: Installs all dependencies and builds the app
2. **Production stage**: Only includes production dependencies and built artifacts

This results in a smaller final image (~200MB vs ~800MB).

## Support

For issues related to:
- Docker deployment: Check this guide
- Vasel Admin: See main README.md
- Strapi: Visit https://docs.strapi.io
