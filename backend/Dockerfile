FROM node:16-alpine3.16 AS build

WORKDIR /alkitab-backend

COPY package.json package-lock.json ./
RUN npm clean-install
COPY . ./
RUN npm run build


FROM node:16-alpine3.16

WORKDIR /alkitab-backend
COPY --from=build /alkitab-backend/node_modules ./node_modules
COPY --from=build /alkitab-backend/build ./build

EXPOSE 3000
CMD [ "node", "build/app.js"]
