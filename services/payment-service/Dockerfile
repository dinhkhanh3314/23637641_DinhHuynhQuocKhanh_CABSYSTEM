FROM node:22-alpine

WORKDIR /app
COPY services/payment-service/package*.json ./
RUN npm ci --omit=dev
COPY services/payment-service/ .
COPY proto /proto
RUN npx prisma generate

EXPOSE 3006 50056
CMD ["node", "server.js"]
