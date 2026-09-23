.PHONY: test build install clean

test: install
	npm test

build: install
	npm run build

install: node_modules

node_modules: package.json
	npm install

clean:
	rm -rf node_modules js/dist
