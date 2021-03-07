FROM node:12

COPY package.json .

RUN yarn install --production

COPY . .

RUN yarn build

CMD ["sh", "-c", "node dist/bundle.js"]