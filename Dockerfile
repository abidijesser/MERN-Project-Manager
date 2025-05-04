FROM node:16-alpine

WORKDIR /app

COPY ./Server /app

COPY ./Server/.env /app/.env

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]
