FROM node:22-alpine

WORKDIR /app
COPY services/booking-service/package*.json ./
RUN npm ci --omit=dev
COPY services/booking-service/ .
COPY proto /proto
RUN npx prisma generate

EXPOSE 3004 50054
CMD ["node", "server.js"]
