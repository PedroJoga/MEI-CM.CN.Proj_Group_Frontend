.DEFAULT_GOAL := deploy

build:
	docker build -t cn-proj-group-frontend .

up:
	docker run --name "cn-proj-group-frontend" -p 3000:3000 -e NODE_ENV=production -d cn-proj-group-frontend

deploy: build up