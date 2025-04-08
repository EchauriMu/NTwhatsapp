FROM node:18

# Instalar dependencias de Chromium
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libgdk-pixbuf2.0-0 \
  libegl1 \
  libgles2 \
  libnspr4 \
  libxss1 \
  libvulkan1 \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  lsb-release \
  wget \
  ca-certificates \
  --no-install-recommends

# Crear el directorio de trabajo
WORKDIR /app

# Copiar y instalar las dependencias de Node
COPY package*.json ./
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 3005

# Iniciar la aplicación
CMD ["node", "server.js"]
