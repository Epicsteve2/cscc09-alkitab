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

.PHONY: frontend/dev
## Runs frontend with CORS proxy port
frontend/dev: | exists/cmd/npm
	@echo "$(GREEN)Running alkitab-frontend locally...$(RESETCOLOR)"
	cd frontend/ && \
	npm run dev

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

.PHONY: docker-compose
## Brings up all containers for development
docker-compose: | exists/cmd/docker-compose
	@echo "$(GREEN)Bringing up all containers...$(RESETCOLOR)"
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

.PHONY: cors-proxy
## Runs the cors proxy image
cors-proxy:
	@echo "$(GREEN)Running cors proxy image...$(RESETCOLOR)"
	docker run \
		--network host \
		--volume "$$(pwd)/nginx/cors-proxy.conf:/etc/nginx/nginx.conf:ro" \
		nginx:1.23-alpine
