FROM node:8.11-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install
RUN npm install -g nodemon

EXPOSE 3000

CMD [ "npm", "start" ]
