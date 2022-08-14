TOOL_DATA_DIR := data/files
CORPUS_DIR := data/KWDLC/knp
# KWDLC, KyotoCorpus
CORPUS := KWDLC

SHELL := /bin/bash

.PHONY: all push pull

push:
	./scripts/push-$(CORPUS).sh $(CORPUS_DIR) $(TOOL_DATA_DIR)

pull:
	./scripts/pull-$(CORPUS).sh $(CORPUS_DIR) $(TOOL_DATA_DIR)
