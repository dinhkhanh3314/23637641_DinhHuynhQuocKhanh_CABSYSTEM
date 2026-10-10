FROM node:22-alpine

WORKDIR /app
COPY services/customer-service/package*.json ./
RUN npm ci --omit=dev
COPY services/customer-service/ .
COPY proto /proto
RUN npx prisma generate

EXPOSE 3002 50052
CMD ["node", "server.js"]
