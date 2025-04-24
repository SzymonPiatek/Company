# --- Stage 1: Build ---
FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY apps/resource-service ./apps/resource-service
COPY tsconfig.json ./
COPY apps/resource-service/tsconfig.json ./apps/resource-service/tsconfig.json

RUN npm install

# --- Stage 2: Runtime ---
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

EXPOSE 3000
ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--prefix", "apps/resource-service"]
