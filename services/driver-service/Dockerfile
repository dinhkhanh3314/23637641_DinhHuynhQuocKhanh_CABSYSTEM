FROM node:22-alpine

WORKDIR /app
COPY services/driver-service/package*.json ./
RUN npm ci --omit=dev
COPY services/driver-service/ .
COPY proto /proto
RUN npx prisma generate

EXPOSE 3003 50053
CMD ["node", "server.js"]
