FROM node:18
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
VOLUME /usr/src/app/logs
EXPOSE 3000
CMD ["npm", "start"]