# Makefile for running frontend and backend tests with coverage

.PHONY: frontend-test backend-test

# Run frontend tests with coverage
frontend-test:
	npm run test
	npm run coverage

backend-test:
	. venv/bin/activate && pytest