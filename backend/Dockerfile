FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema para Prisma
RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias y generar Prisma client
RUN npm ci --only=production && \
    npx prisma generate

# Copiar codigo fuente
COPY src ./src/

# Crear directorios para runtime
RUN mkdir -p uploads logs

EXPOSE 3001

CMD ["node", "src/server.js"]
