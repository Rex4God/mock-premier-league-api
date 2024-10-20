
FROM node:16.0.0

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install nodemon -g

COPY . .

EXPOSE 7000

CMD nodemon src/server.ts
