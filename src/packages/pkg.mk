
BLUE=\033[1;34m
NC=\033[0m

main: title clean js css copy

title:
	@echo "$(BLUE)======= Package $(PKG_NAME) =======$(NC)"

coffee:
	- mkdir build
	- [ ! -z "$(module_dir)" ] && [ -d build/$(module_dir) ] && rm -r build/$(module_dir)
	mkdir -p build/$(module_dir)
	for f in $(coffee_files); do (cat "$${f}"; echo) >>"build/main.coffee";done
	coffee --compile build/main.coffee
	- rm build/*.coffee
	[ -z "$(module_dir_src)" ] || (for f in $(module_dir_src)/*; do cp -rf "$$f" build/$(module_dir)/; done)
	[ -z "$(module_dir_src)" ] || (for f in build/$(module_dir)/*.coffee; do coffee --compile "$$f"; done)
	[ -z "$(module_dir_src)" ] || (rm build/$(module_dir)/*.coffee)
	

js: coffee
	for f in $(jsfiles); do (cat "$${f}"; echo) >> build/main.js; done

css:
	for f in $(cssfiles); do (cat "$${f}"; echo) >> build/main.css; done

copy:
	cp -rf $(copyfiles) build/
clean:
	- rm -rf build/*

.PHONY: all main clean copy css js cofee