.DEFAULT_GOAL := deploy

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

build:
	docker build -t cc-proj-group-frontend .

build-amd64:
	docker buildx build --platform linux/amd64 -t ${DOCKER_HUB_USER}/cc-proj-group-frontend:amd64 .

up:
	docker run --name "cc-proj-group-frontend" -p 3000:3000 -e NODE_ENV=production -d cc-proj-group-frontend

deploy: prepare-to-build build up

push-image:
	docker push ${DOCKER_HUB_USER}/cc-proj-group-frontend:amd64

prepare-to-build:
	npm install

push: prepare-to-build build-amd64 push-image