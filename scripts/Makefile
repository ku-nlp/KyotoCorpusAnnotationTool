TOOL_DATA_DIR := data/files
# KWDLC or KyotoCorpus
CORPUS := KWDLC

SHELL := /bin/bash

ifeq ($(CORPUS),KWDLC)
    CORPUS_DIR := data/KWDLC/knp
else ifeq ($(CORPUS),KyotoCorpus)
    CORPUS_DIR := data/KyotoCorpusFull/knp
    CORPUS_DAT_DIR := data/KyotoCorpus/dat
else
    $(error "Unknown corpus: $(CORPUS)")
endif

.PHONY: push pull

push:
	./scripts/push-$(CORPUS).sh $(CORPUS_DIR) $(TOOL_DATA_DIR)

pull:
	./scripts/pull-$(CORPUS).sh $(CORPUS_DIR) $(TOOL_DATA_DIR) $(CORPUS_DAT_DIR)
