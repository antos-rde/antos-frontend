coffee_files = main.coffee

jsfiles =

cssfiles = main.css

copyfiles = scheme.html package.json 


BLUE=\033[1;34m
NC=\033[0m

main: title clean js css copy

title:
	@echo "$(BLUE)======= Package ActivityMonitor =======$(NC)"

coffee:
	- mkdir build
	for f in $(coffee_files); do (coffee -cs < $$f >build/"$$f.js");done
	for f in build/*.coffee.js; do (cat "$${f}"; echo) >> build/main.js; done
	- rm build/*.coffee.js

js: coffee
	for f in $(jsfiles); do (cat "$${f}"; echo) >> build/main.js; done

css:
	for f in $(cssfiles); do (cat "$${f}"; echo) >> build/main.css; done

copy:
	cp -rf $(copyfiles) build/
clean:
	- rm -rf build/*