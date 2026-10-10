FROM node:22-alpine

WORKDIR /app
COPY services/api-gateway/package*.json ./
RUN npm ci --omit=dev
COPY services/api-gateway/ .
COPY proto /proto

EXPOSE 3000
CMD ["node", "server.js"]
