FROM node:18-alpine

WORKDIR /usr/src/app

COPY prisma ./prisma
COPY package*.json ./
COPY libs ./libs

RUN npm install
RUN npx prisma generate --schema=./prisma

EXPOSE 5555
