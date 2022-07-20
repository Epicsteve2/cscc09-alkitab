SHELL := $(shell which bash)
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

RED := $(shell tput setaf 1)
GREEN := $(shell tput setaf 2)
YELLOW := $(shell tput setaf 3)
BLUE := $(shell tput setaf 4)
MAGENTA := $(shell tput setaf 5)
CYAN := $(shell tput setaf 6)
RESETCOLOR := $(shell tput sgr0)

.PHONY: help
## Show this help
help:
	@printf "Available targets:\n\n"
	@awk '/^[a-zA-Z\-\_0-9%:\\]+/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
		helpCommand = $$1; \
		helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
	gsub("\\\\", "", helpCommand); \
	gsub(":+$$", "", helpCommand); \
		printf "  \x1b[32;01m%-35s\x1b[0m %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST) | sort -u
	@printf "\n"

.PHONY: exists/cmd/%
## Test if the provided command exists
exists/cmd/%:
	@hash $(*) > /dev/null 2>&1 || (echo "ERROR: '$(*)' must be installed and available on your PATH"; exit 1)

.PHONY: exists/env/%
## Test if the provided environment variable exists
exists/env/%:
	@if [ -z '$($(*))' ]; then echo "ERROR: environment variable '$*' not set" && exit 1; fi

.PHONY: backend/build
## Builds backend docker image
backend/build: | exists/cmd/docker
	@echo "$(GREEN)Building alkitab-backend...$(RESETCOLOR)"
	docker build --tag alkitab-backend ./backend

.PHONY: frontend/build
## Builds frontend docker image
frontend/build: | exists/cmd/docker
	@echo "$(GREEN)Building alkitab-frontend...$(RESETCOLOR)"
	docker build --tag alkitab-frontend ./frontend

	@# For production, we want to directly add nginx.conf to the docker image instead of mounting it as a volume
	@#echo "$(GREEN)Building alkitab-frontend with the NGINX config file...$(RESETCOLOR)"
	@#docker build --tag alkitab-frontend --build-arg NGINX_CONFIG="$$(<nginx/nginx.conf)" ./frontend

.PHONY: frontend/run
## Runs frontend with CORS proxy port
frontend/run: | exists/cmd/npm
	@echo "$(GREEN)Running alkitab-frontend locally...$(RESETCOLOR)"
	cd frontend/ && npm run dev

.PHONY: nginx/run
## Runs nginx docker image with frontend static files
nginx/run: | exists/cmd/docker frontend/build
	@echo "$(GREEN)Running alkitab-frontend with mounted NGINX config file in docker...$(RESETCOLOR)"
	docker run \
		--publish 8080:80 \
		--volume "$$(pwd)"/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
		alkitab-frontend

	@# For production, we want to directly add nginx.conf to the docker image instead of mounting it as a volume
	@#echo "$(GREEN)Running alkitab-frontend in NGINX in docker...$(RESETCOLOR)"
	@#docker run --publish 8080:80 alkitab-frontend

.PHONY: nginx/sh
## sh into running nginx container
nginx/sh: | exists/cmd/docker
	@echo "$(GREEN)Notable commands to run:$(RESETCOLOR)"
	@echo "$(CYAN)watch tail -n +1 /etc/nginx/nginx.conf$(RESETCOLOR)"
	@echo "$(CYAN)nginx -s reload$(RESETCOLOR)"
	@echo "$(CYAN)cd /usr/share/nginx/html$(RESETCOLOR)"
	@echo
	@echo "$(GREEN)Running sh in NGINX container...$(RESETCOLOR)"
	docker exec \
		--interactive \
		--tty \
		alkitab-frontend \
		sh

.PHONY: backend/docker-compose
## Brings up only mongodb and express server using docker-compoes
backend/docker-compose: | exists/cmd/docker-compose
	@echo "$(GREEN)Bringing up mongodb and express server...$(RESETCOLOR)"
	docker-compose up \
		--build \
		--remove-orphans \
		alkitab-backend mongodb

.PHONY: backend/proxy
## Brings up CORS proxy for the backend to fix dev issues
backend/proxy: | exists/cmd/npx
	@echo "$(GREEN)Bringing up CORS proxy for the express server...$(RESETCOLOR)"
	npx lcp --proxyUrl 'http://localhost:3000'

.PHONY: docker-compose/develop
## Brings up all containers for development
docker-compose/develop: | exists/cmd/docker-compose
	@echo "$(GREEN)Bringing up all containers for development...$(RESETCOLOR)"
	docker-compose \
		--profile develop \
		up \
		--build \
		--remove-orphans

.PHONY: docker-compose/rebuild-frontend
## Rebuilds and runs frontend container
docker-compose/rebuild-frontend: | exists/cmd/docker-compose
	@echo "$(GREEN)Rebuilding frontend container...$(RESETCOLOR)"
	docker-compose up \
		--force-recreate \
		--detach \
		--no-deps \
		--build \
		alkitab-frontend
