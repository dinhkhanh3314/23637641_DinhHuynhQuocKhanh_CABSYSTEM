FROM node:22-alpine

WORKDIR /app
COPY services/notification-service/package*.json ./
RUN npm ci --omit=dev
COPY services/notification-service/ .
COPY proto /proto

EXPOSE 3007 50057
CMD ["node", "server.js"]
