FROM node:7
MAINTAINER DerEnderKeks <admin@derenderkeks.me>

ENV NODE_ENV production

# Create working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Copy default configuration
COPY ./config/default.json /usr/src/app/config/default.json
COPY ./config/production.json /usr/src/app/config/production.json

#EXPOSE 3000
CMD [ "npm", "start" ]
