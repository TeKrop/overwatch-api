FROM debian:bullseye

EXPOSE 8081

CMD ["bash", "/opt/overwatch-api/app-start.sh"]

RUN apt update \
    && apt install -y --no-install-recommends apt-transport-https apt-utils ca-certificates curl \
    && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt install -y --no-install-recommends nodejs build-essential git \
    && cd /opt/ \
    && git clone https://github.com/TeKrop/overwatch-api.git \
    && cd overwatch-api \
    && npm install \
    && rm -rf /var/lib/{apt,dpkg,cache,log}/ /tmp/* /var/tmp/*