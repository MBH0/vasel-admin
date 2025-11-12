# Vasel Admin - Deployment Guide

## Docker Compose Deployment

### Prerequisitos

1. Docker y Docker Compose instalados
2. Variables de entorno configuradas

### Configuración

#### 1. Crear archivo `.env`

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` y configura:

**Variables REQUERIDAS:**
- `ADMIN_PASSWORD` - Tu contraseña de administrador
- `JWT_SECRET` - Secret para JWT (mínimo 64 caracteres)
- `STRAPI_URL` - URL de tu servidor Strapi
- `STRAPI_FULL_TOKEN` - Token de API de Strapi

**Variables OPCIONALES:**
- `OPENAI_API_KEY` - Si usas características de IA

#### 2. Generar JWT_SECRET

Puedes generar un JWT_SECRET seguro con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deployment Options

#### Opción 1: Solo Vasel Admin (Strapi separado)

Si ya tienes Strapi deployado en otro servidor:

```bash
docker-compose -f docker-compose.standalone.yml up -d
```

#### Opción 2: Stack completo (Vasel Admin + Strapi + PostgreSQL)

Si quieres deployar todo junto:

1. Configura variables adicionales en `.env`:
   ```
   DATABASE_NAME=strapi
   DATABASE_USERNAME=strapi
   DATABASE_PASSWORD=your-secure-password
   STRAPI_JWT_SECRET=random-string
   STRAPI_ADMIN_JWT_SECRET=random-string
   STRAPI_APP_KEYS=random-string
   STRAPI_API_TOKEN_SALT=random-string
   ```

2. Deploy:
   ```bash
   docker-compose up -d
   ```

### Verificar Deployment

1. Verifica que los contenedores estén corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica los logs:
   ```bash
   docker-compose logs -f vasel-admin
   ```

3. Verifica el healthcheck:
   ```bash
   docker inspect vasel-admin | grep -A 10 Health
   ```

4. Accede a la aplicación:
   ```
   http://localhost:4321
   ```

### Troubleshooting

#### Healthcheck falla

Si el healthcheck falla, verifica:

1. El contenedor está corriendo:
   ```bash
   docker ps | grep vasel-admin
   ```

2. La aplicación responde internamente:
   ```bash
   docker exec vasel-admin curl -f http://localhost:4321
   ```

3. Los logs para errores:
   ```bash
   docker-compose logs vasel-admin
   ```

#### Error de login "data and hash arguments required"

Este error significa que `ADMIN_PASSWORD` o `JWT_SECRET` no están configurados:

1. Verifica que el archivo `.env` existe y tiene las variables
2. Reconstruye y reinicia:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

#### CSP Errors en producción

Si ves errores de Content Security Policy:

1. Asegúrate de que `STRAPI_URL` apunta a tu servidor de producción
2. Verifica que las URLs permitidas en `hooks.server.ts` incluyen tu dominio

### Deployment en Coolify

1. **Crear nuevo servicio:**
   - Selecciona "Docker Compose"
   - Sube el archivo `docker-compose.standalone.yml` o `docker-compose.yml`

2. **Configurar variables de entorno:**
   - En la sección "Environment Variables" de Coolify:
     - `ADMIN_PASSWORD` = tu contraseña
     - `JWT_SECRET` = resultado del comando crypto.randomBytes
     - `STRAPI_URL` = https://tu-strapi-url.com
     - `STRAPI_FULL_TOKEN` = tu token de Strapi
     - `OPENAI_API_KEY` = tu API key (opcional)

3. **Configurar dominio:**
   - Añade tu dominio custom (ej: vaseladmin.tudominio.com)
   - Coolify configurará automáticamente Traefik

4. **Deploy:**
   - Click en "Deploy"
   - Verifica logs para confirmar que inicia correctamente

### Build y Push Manual

Si prefieres construir y pushear la imagen a un registry:

```bash
# Build
docker build -t tu-registry/vasel-admin:latest .

# Push
docker push tu-registry/vasel-admin:latest
```

Luego actualiza el docker-compose para usar la imagen en lugar de build:

```yaml
services:
  vasel-admin:
    image: tu-registry/vasel-admin:latest
    # ... resto de configuración
```

## Puertos

- **4321** - Puerto de la aplicación Vasel Admin
- **1337** - Puerto de Strapi (si usas stack completo)
- **5432** - Puerto de PostgreSQL (si usas stack completo, no expuesto externamente)

## Seguridad

1. **NUNCA** commitees el archivo `.env` al repositorio
2. Usa contraseñas seguras para `ADMIN_PASSWORD` y `DATABASE_PASSWORD`
3. Genera JWT_SECRET aleatorios y únicos para cada ambiente
4. En producción, considera usar Docker secrets o servicios de gestión de secretos
