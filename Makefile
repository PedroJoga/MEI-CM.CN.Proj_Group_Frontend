.DEFAULT_GOAL := deploy

build:
	docker build -t cn-proj-ind-frontend .

up:
	docker run --name "cn-proj-ind-frontend" -p 3000:3000 -e NODE_ENV=production -d cn-proj-ind-frontend

deploy: build up