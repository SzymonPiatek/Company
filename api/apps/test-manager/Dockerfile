FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma
COPY libs ./libs
COPY apps ./apps
COPY jest.config.base.ts ./

RUN npm install
