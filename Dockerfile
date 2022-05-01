#Creates a layer from node:alpine image.
FROM node:alpine as infocoin-app

#Creates directories
RUN mkdir -p /usr/src/app

#Sets an environment variable
ENV PORT 3000

#Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD commands
WORKDIR /usr/src/app

#Copy new files or directories into the filesystem of the container
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

#Execute commands in a new layer on top of the current image and commit the results
RUN npm install

##Copy new files or directories into the filesystem of the container
COPY . /usr/src/app

RUN npx prisma generate && npm run build

#Informs container runtime that the container listens on the specified network ports at runtime
EXPOSE 3000

ENTRYPOINT ["npm", "run"]

FROM ubuntu:latest as infocoin-cron

RUN apt-get update && apt-get -y install cron curl 

WORKDIR /app

COPY crontab /etc/cron.d/crontab

COPY crontab.sh /app/crontab.sh

RUN chmod 0644 /etc/cron.d/crontab

RUN /usr/bin/crontab /etc/cron.d/crontab

# run crond as main process of container
CMD ["cron", "-f"]