ORIGIN := ts
TARGET := js
TS_CONFIG := tsconfig.json
CLONE_FILES :=
OUT_FILE := js/game.js

CLONE_FILES_ORIGIN = $(patsubst %,$(ORIGIN)/%.ts,$(CLONE_FILES))
CLONE_FILES_TARGET = $(patsubst %,$(TARGET)/%.js,$(CLONE_FILES))

all : $(OUT_FILE) $(CLONE_FILES_TARGET)

.PHONY: all

$(OUT_FILE) :
	tsc -p $(TS_CONFIG)

$(CLONE_FILES_TARGET) : $(TARGET)/%.js : $(ORIGIN)/%.ts
	tsc --out $@ $<