# --- Stage 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY apps/warehouse-service ./apps/warehouse-service
COPY apps/warehouse-service/tsconfig.json ./apps/warehouse-service/tsconfig.json
COPY libs ./libs

RUN npm install

# --- Stage 2: Runtime ---
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

EXPOSE 3000
ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--prefix", "apps/warehouse-service"]
