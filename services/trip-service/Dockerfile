FROM node:22-alpine

WORKDIR /app
COPY services/trip-service/package*.json ./
RUN npm ci --omit=dev
COPY services/trip-service/ .
COPY proto /proto

EXPOSE 3005 50055
CMD ["node", "server.js"]
