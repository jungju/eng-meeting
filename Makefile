deploy:
	yarn run deploy

dev:
	yarn run dev

test:
	yarn test

test-watch:
	yarn test:watch

test-e2e:
	yarn test:e2e

test-all:
	yarn test:all

spec:
	yarn spec

sound:
	cd utils && go run main.go