---
to: Dockerfile
---
FROM node:14.15.4-alpine3.12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY .npmrc package*.json ./

# In order to run node alpine image avoiding Python error
RUN apk --no-cache add --virtual builds-deps build-base python3

RUN npm install --quiet

# Bundle app source
COPY . .

EXPOSE 4000

RUN npm run manifest

CMD [ "npm", "start" ]
