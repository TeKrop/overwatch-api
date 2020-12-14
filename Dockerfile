FROM node:15
MAINTAINER TeKrop <contact@tekrop.fr>

# app directory
WORKDIR /usr/src/app

# copy package.json and package-lock.json
COPY package*.json ./

# install packages
RUN npm install

# copy app files
COPY . .

# expose application port
EXPOSE 8081

# execution command
CMD ["bash", "app-start.sh"]