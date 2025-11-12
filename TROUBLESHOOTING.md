# Troubleshooting Guide - Vasel Admin

## DNS Resolution Errors (EAI_AGAIN)

### Síntoma
```
Error publishing service: TypeError: fetch failed
Strapi connection attempt 1 failed (EAI_AGAIN), retrying in...
```

### Causa
El contenedor `vasel-admin` no puede resolver el nombre DNS `strapi-vasel` para conectarse a Strapi.

### Diagnóstico

#### 1. Verificar que el contenedor de Strapi existe y está corriendo

```bash
docker ps --format "table {{.Names}}\t{{.Networks}}\t{{.Status}}"
```

Debes ver un contenedor llamado **`strapi-vasel`** (o el nombre que hayas configurado en `STRAPI_URL`).

#### 2. Verificar que ambos contenedores están en la misma red

```bash
# Ver redes de vasel-admin
docker inspect vasel-admin | grep -A 10 "Networks"

# Ver redes de strapi-vasel
docker inspect strapi-vasel | grep -A 10 "Networks"
```

Ambos deben estar en la red `vasel-database`.

#### 3. Ver todos los contenedores en la red vasel-database

```bash
docker network inspect vasel-database
```

Debes ver tanto `vasel-admin` como `strapi-vasel` listados en la sección "Containers".

#### 4. Probar resolución DNS desde dentro del contenedor

```bash
# Usando nslookup
docker exec vasel-admin nslookup strapi-vasel

# Usando getent (más similar a lo que usa Node.js)
docker exec vasel-admin getent hosts strapi-vasel

# Usando ping
docker exec vasel-admin ping -c 3 strapi-vasel
```

Si estos comandos funcionan pero el fetch sigue fallando, el problema es de timing (Strapi no está listo aún).

### Soluciones

#### Solución 1: Verificar nombre del contenedor en STRAPI_URL

El `STRAPI_URL` debe apuntar al **nombre exacto** del contenedor de Strapi:

```bash
# En .env o en variables de entorno de Coolify
STRAPI_URL=http://strapi-vasel:1337
```

**Importante**: Debe coincidir con el `container_name` en el docker-compose de Strapi:

```yaml
services:
  strapi:
    container_name: strapi-vasel  # Este nombre
```

#### Solución 2: Usar IP directa en lugar de hostname

Si el DNS no funciona, puedes usar la IP directa del contenedor:

```bash
# Obtener IP del contenedor de Strapi
docker inspect strapi-vasel | grep IPAddress

# Configurar STRAPI_URL con la IP
STRAPI_URL=http://172.18.0.2:1337  # Reemplaza con tu IP
```

**Desventaja**: La IP puede cambiar cuando reinicies los contenedores.

#### Solución 3: Conectar ambos contenedores a la misma red

Si los contenedores están en diferentes redes, conéctalos a una red compartida:

```bash
# Crear red si no existe
docker network create vasel-database

# Conectar vasel-admin
docker network connect vasel-database vasel-admin

# Conectar strapi
docker network connect vasel-database strapi-vasel

# Reiniciar contenedores
docker restart vasel-admin strapi-vasel
```

#### Solución 4: Usar docker-compose con depends_on y healthcheck

Asegúrate de que Strapi está completamente listo antes de que vasel-admin intente conectarse:

```yaml
# En docker-compose.yml de vasel-admin
services:
  vasel-admin:
    depends_on:
      strapi:
        condition: service_healthy
    environment:
      - STRAPI_URL=http://strapi-vasel:1337
    networks:
      - vasel-database

# En docker-compose.yml de Strapi
services:
  strapi:
    container_name: strapi-vasel
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1337/_health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - vasel-database
```

#### Solución 5: Aumentar el start_period del healthcheck

Si vasel-admin intenta conectarse antes de que Strapi esté listo:

```yaml
# En docker-compose.yml de vasel-admin
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4321"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 30s  # Aumentar a 30-60s
```

### Verificación de Configuración

#### Variables de entorno necesarias:

```bash
# Verificar dentro del contenedor
docker exec vasel-admin env | grep STRAPI

# Debe mostrar:
STRAPI_URL=http://strapi-vasel:1337
STRAPI_FULL_TOKEN=tu-token-aqui
```

#### Logs útiles:

```bash
# Ver logs de vasel-admin
docker logs vasel-admin -f

# Ver logs de strapi
docker logs strapi-vasel -f

# Buscar errores específicos
docker logs vasel-admin 2>&1 | grep -i "strapi\|eai_again\|dns"
```

## Otros Errores Comunes

### Error: "ADMIN_PASSWORD or JWT_SECRET not configured"

**Causa**: Variables de entorno no están configuradas.

**Solución**:
```bash
# En .env o Coolify
ADMIN_PASSWORD=tu-contraseña
JWT_SECRET=tu-jwt-secret-64-chars
```

### Error: "Strapi API error: 401 - Unauthorized"

**Causa**: El token de Strapi es inválido o ha expirado.

**Solución**:
1. Genera un nuevo Full Access Token en Strapi (Settings → API Tokens)
2. Actualiza la variable `STRAPI_FULL_TOKEN`

### Error: "Content Security Policy blocked"

**Causa**: CSP bloqueando conexiones a dominios no permitidos.

**Solución**: Actualiza `hooks.server.ts` para incluir el dominio de Strapi en CSP.

## Ayuda Adicional

Si ninguna de estas soluciones funciona, recopila la siguiente información:

```bash
# 1. Estado de contenedores
docker ps -a

# 2. Redes
docker network ls
docker network inspect vasel-database

# 3. Logs recientes
docker logs vasel-admin --tail 100
docker logs strapi-vasel --tail 100

# 4. Variables de entorno
docker exec vasel-admin env | grep -E "STRAPI|NODE_ENV|PORT"

# 5. Test de conectividad
docker exec vasel-admin curl -v http://strapi-vasel:1337/_health
```

Y comparte esta información para recibir ayuda específica.
