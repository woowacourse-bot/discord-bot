FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/index.js"]
