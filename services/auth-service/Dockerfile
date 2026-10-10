FROM node:22-alpine

WORKDIR /app
COPY services/auth-service/package*.json ./
RUN npm ci --omit=dev
COPY services/auth-service/ .
COPY proto /proto
RUN npx prisma generate

EXPOSE 3001 50051
CMD ["node", "server.js"]
