FROM node:12

WORKDIR /srv/app

COPY . .

RUN yarn install --production

RUN yarn build

CMD node dist/bundle.js