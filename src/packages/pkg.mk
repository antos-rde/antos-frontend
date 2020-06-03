
BLUE=\033[1;34m
NC=\033[0m
DIST=../../../dist/packages/$(PKG_NAME)
main: title clean js css copy

title:
	@echo "$(BLUE)======= Package $(PKG_NAME) =======$(NC)"

module:
	- mkdir build
	for f in $(module_files); do (cat "$(DIST)/$${f}"; echo) >>"build/main.js";done

js: module
	for f in $(libfiles); do (cat "$${f}"; echo) >> build/main.js; done

css:
	for f in $(cssfiles); do (cat "$${f}"; echo) >> build/main.css; done

copy:
	cp -rf $(copyfiles) build/
clean:
	- rm -rf build/*

.PHONY: all main clean copy css js cofee