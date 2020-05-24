
BLUE=\033[1;34m
NC=\033[0m

main: title clean js css copy

title:
	@echo "$(BLUE)======= Package $(PKG_NAME) =======$(NC)"

module:
	- mkdir build
	echo "(function() {" > "build/main.js"
	for f in $(module_files); do (cat "$${f}"; echo) >>"build/main.js";done
	echo "}).call(this);" >> "build/main.js"

js: module
	for f in $(libfiles); do (cat "$${f}"; echo) >> build/main.js; done

css:
	for f in $(cssfiles); do (cat "$${f}"; echo) >> build/main.css; done

copy:
	cp -rf $(copyfiles) build/
clean:
	- rm -rf build/*

.PHONY: all main clean copy css js cofee