FROM node:alpine as development

RUN mkdir -p /usr/src/app

ENV PORT 3000

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm install

COPY . /usr/src/app

EXPOSE 3000

RUN npx prisma generate && npm run build 

ENTRYPOINT ["npm", "run"]