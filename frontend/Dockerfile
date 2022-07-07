FROM node:16-alpine3.16 AS build

WORKDIR /alkitab

COPY package.json ./
COPY package-lock.json ./
RUN npm clean-install
COPY . ./
RUN npm run build

FROM nginx:1.23-alpine
COPY --from=build /alkitab/dist /usr/share/nginx/html

# FROM httpd:2.4.54-alpine3.16
# COPY --from=build /alkitab/dist /usr/local/apache2/htdocs/
