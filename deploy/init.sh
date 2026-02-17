#!/bin/bash
set -euo pipefail

# ============================================
# Raccoons Web - Script de primer despliegue
# ============================================
# Uso: bash deploy/init.sh
# Ejecutar desde la raiz del proyecto en el VPS.
# ============================================

DOMAIN="raccoonsoax.com"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "======================================"
echo "  Raccoons Web - Despliegue inicial"
echo "======================================"

cd "$PROJECT_DIR"

# --- 1. Generar secrets ---
echo ""
echo "[1/7] Generando secrets..."

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n/+=')

echo "  Secrets generados correctamente."

# --- 2. Crear .env.production del backend ---
echo "[2/7] Creando backend/.env.production..."

if [ -f backend/.env.production ]; then
    echo "  ADVERTENCIA: backend/.env.production ya existe. Se crea backup."
    cp backend/.env.production "backend/.env.production.bak.$(date +%s)"
fi

cp backend/.env.production.example backend/.env.production

# Reemplazar placeholders
sed -i "s|GENERATE_WITH_openssl_rand_-base64_64|${JWT_SECRET}|" backend/.env.production
# El segundo reemplazo necesita ser diferente porque el primero ya cambio
sed -i "0,/${JWT_SECRET}/! s|${JWT_SECRET}|${JWT_REFRESH_SECRET}|" backend/.env.production
sed -i "s|CHANGE_ME|${POSTGRES_PASSWORD}|g" backend/.env.production

echo "  backend/.env.production creado."

# --- 3. Crear .env con POSTGRES_PASSWORD para docker-compose ---
echo "[3/7] Creando .env para docker-compose..."

cat > .env <<EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
EOF

echo "  .env creado."

# --- 4. Crear directorios ---
echo "[4/7] Creando directorios..."

mkdir -p certbot/conf certbot/www
mkdir -p backend/uploads backend/logs

echo "  Directorios creados."

# --- 5. Obtener certificado SSL ---
echo "[5/7] Obteniendo certificado SSL con certbot..."
echo ""
echo "  NOTA: El dominio ${DOMAIN} debe apuntar a este servidor."
echo "  Los puertos 80 y 443 deben estar disponibles."
echo ""

read -p "  Continuar con certificado SSL? (s/n): " REPLY
if [ "$REPLY" = "s" ] || [ "$REPLY" = "S" ]; then
    read -p "  Email para Let's Encrypt: " EMAIL

    docker run --rm \
        -v "$PROJECT_DIR/certbot/conf:/etc/letsencrypt" \
        -v "$PROJECT_DIR/certbot/www:/var/www/certbot" \
        -p 80:80 \
        certbot/certbot certonly \
        --standalone \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.${DOMAIN}"

    echo "  Certificado SSL obtenido."
else
    echo "  SSL omitido. Configurar manualmente despues."
fi

# --- 6. Levantar servicios ---
echo "[6/7] Levantando servicios con Docker Compose..."

docker compose up -d --build

echo "  Servicios levantados. Esperando que la base de datos este lista..."
sleep 10

# --- 7. Ejecutar migraciones y seed ---
echo "[7/7] Ejecutando migraciones de base de datos..."

docker compose exec backend npx prisma migrate deploy

echo ""
read -p "  Crear usuario admin inicial? (s/n): " REPLY
if [ "$REPLY" = "s" ] || [ "$REPLY" = "S" ]; then
    docker compose exec backend node src/infrastructure/database/seeds/seed.js
    echo "  Seed ejecutado."
fi

echo ""
echo "======================================"
echo "  Despliegue completado!"
echo "======================================"
echo ""
echo "  URL: https://${DOMAIN}"
echo "  API: https://${DOMAIN}/api/v1/health"
echo ""
echo "  IMPORTANTE:"
echo "  - Configurar email en backend/.env.production"
echo "  - Cambiar credenciales del admin seed"
echo "  - Revisar logs: docker compose logs -f"
echo ""
