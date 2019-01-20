DOCKER=/usr/local/bin/docker
IMG=node-healthcheck

build:
	$(DOCKER) build . -t $(IMG)

run:
	$(DOCKER) run --rm -v $(PWD):/app -p 3000:3000 \
		-e IP="0.0.0.0" $(IMG)
