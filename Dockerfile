FROM ubuntu:latest

RUN apt-get update && apt-get -y install cron curl 

WORKDIR /app

COPY crontab /etc/cron.d/crontab

COPY crontab.sh /app/crontab.sh

RUN chmod 0644 /etc/cron.d/crontab

RUN /usr/bin/crontab /etc/cron.d/crontab

# run crond as main process of container
CMD ["cron", "-f"]
