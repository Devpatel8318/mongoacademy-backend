FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json yarn.lock ./

FROM base AS dependencies

RUN yarn install --frozen-lockfile

FROM dependencies AS development

ENV NODE_ENV=development

EXPOSE 9050

COPY . .

CMD ["yarn", "dev"]

FROM dependencies AS builder

COPY . .

RUN yarn build

FROM base AS production

ENV NODE_ENV=production

EXPOSE 9050

RUN yarn install --production --frozen-lockfile && yarn cache clean

COPY --from=builder /app/dist ./dist

CMD ["yarn", "start"]