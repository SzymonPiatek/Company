FROM node:18-alpine

WORKDIR /usr/src/app

COPY prisma ./prisma
COPY package*.json ./

RUN npm install
RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 5555
CMD ["npx", "prisma", "studio", "--schema=prisma/schema.prisma", "--port", "5555"]
