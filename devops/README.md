# SETUP
- `minkube start`
  - I used the kvm driver. idk what's better lol
  - `minikube start --driver=kvm2`
- `export PULUMI_CONFIG_PASSPHRASE=WFLC2r4fXit2cjfC`
  - obviously don't do this in prod
- `minikube addons enable ingress`
- `minikube tunnel`
- `docker build --build-arg NGINX_CONFIG="$(<nginx/nginx.conf)" --tag alkitab-frontend ./frontend`
- `docker build --tag alkitab-backend ./backend`
- `minikube image load alkitab-backend:latest`
- `minikube image load alkitab-frontend:latest`
- Or all in 1 go
  ```bash
  docker build --tag alkitab-backend ./backend && \
  docker build --build-arg NGINX_CONFIG="$(<nginx/frontend.conf)" --tag alkitab-frontend ./frontend && \
  minikube image load alkitab-frontend:latest && \
  minikube image load alkitab-backend:latest
  ```
- `pulumi login --local`
- `pulumi --emoji up`
