FROM node:lts-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY app.js /app
RUN npm install
RUN npm install -g nodemon

EXPOSE 3000

CMD [ "npm", "start" ]
