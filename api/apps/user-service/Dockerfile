# --- Stage 1: Build ---
FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY tsconfig.paths.json ./tsconfig.paths.json
COPY apps/user-service ./apps/user-service
COPY apps/user-service/tsconfig.json ./apps/user-service/tsconfig.json
COPY libs ./libs

RUN npm install

# --- Stage 2: Runtime ---
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

EXPOSE 3000
ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--prefix", "apps/user-service"]
