FROM node:12

COPY . .

RUN yarn install --production

RUN yarn build

CMD node dist/bundle.js