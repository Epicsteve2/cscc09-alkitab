FROM node:16-alpine3.16 AS build

WORKDIR /alkitab-frontend

COPY package.json package-lock.json ./
RUN npm clean-install
COPY . ./
ARG VITE_ALKITAB_BACKEND_PORT
ARG VITE_ALKITAB_BACKEND_URL
# RUN npm run build
# Ok so the node-html-parser library really confuses vite. Only way I can think of fixing this for now is to do this...
RUN npm run build -- --target esnext --minify false
RUN sed -i 's|parse\$1|nhp|g' dist/assets/*.js
RUN sed -i 's|const nhp = nhp.parse;|const parse\$1 = nhp.parse;|g' dist/assets/*.js

FROM nginx:1.23-alpine
COPY --from=build /alkitab-frontend/dist /usr/share/nginx/html

## The following syntax doesn't work because it's
## outside of the build context. I hate docker >:(
## More info: https://stackoverflow.com/a/47544999
# COPY ../nginx/nginx.conf /etc/nginx/nginx.conf

# For production, we want to directly add nginx.conf
# to the docker image instead of mounting it as a volume
ARG NGINX_CONFIG
# RUN echo "$NGINX_CONFIG" > /etc/nginx/nginx.conf
RUN echo "$NGINX_CONFIG" > /etc/nginx/conf.d/alkitab.conf
