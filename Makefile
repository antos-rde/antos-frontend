

BUILDDIR = build/htdocs/os
BLUE=\033[1;34m
NC=\033[0m

coffees= 	src/core/core.coffee\
        	src/core/api.coffee\
			src/core/settings.coffee\
        	src/core/handlers/RemoteHandler.coffee\
        	src/core/vfs.coffee\
			src/core/vfs/GoogleDriveHandler.coffee\
			src/core/db.coffee\
			src/core/gui.coffee\
			src/core/BaseModel.coffee\
			src/core/BaseApplication.coffee\
			src/core/BaseService.coffee\
			src/core/BaseEvent.coffee\
			src/core/BaseDialog.coffee\
        	src/antos.coffee
 



packages = CoreServices NotePad wTerm ActivityMonitor Files MarkOn MarketPlace Blogger Preview

main:  build_coffees build_tags build_themes schemes libs  build_packages languages
	- cp src/index.html $(BUILDDIR)/

lite: build_coffee build_tag build_theme schemes   build_packages
#%.js: %.coffee
#		coffee --compile $< 

build_coffees:
	@echo "$(BLUE)Building coffee files$(NC)"
	- mkdir $(BUILDDIR)/scripts
	- rm $(BUILDDIR)/scripts/antos.js
	- rm $(BUILDDIR)/scripts/antos.coffee
	for f in $(coffees); do (cat "$${f}"; echo) >> $(BUILDDIR)/scripts/antos.coffee; done
	coffee --compile $(BUILDDIR)/scripts/antos.coffee
	- rm $(BUILDDIR)/scripts/antos.coffee


libs:
	@echo "$(BLUE)Copy lib files$(NC)"
	cp -rf src/libs/* $(BUILDDIR)/scripts/

schemes:
	@echo "$(BLUE)Copy schemes files$(NC)"
	- mkdir -p $(BUILDDIR)/resources/schemes
	cp src/core/schemes/* $(BUILDDIR)/resources/schemes/

testdata:
	@echo "$(BLUE)Copy JSON test files$(NC)"
	- mkdir -p $(BUILDDIR)/resources/jsons
	cp src/core/handlers/jsons/* $(BUILDDIR)/resources/jsons
build_tags:
	@echo "$(BLUE)Building tag files$(NC)"
	-mkdir $(BUILDDIR)/resources
	-rm $(BUILDDIR)/resources/antos_tags.js
	for f in src/core/tags/*; do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/antos_tags.js; done

languages:
	-mkdir $(BUILDDIR)/resources
	-mkdir $(BUILDDIR)/resources/languages
	cp src/core/languages/*.json $(BUILDDIR)/resources/languages/

genlang:
	read -r -p "Enter locale: " LOCAL;\
		./src/core/languages/gen.sh ./src ./src/core/languages/$$LOCAL.json
build_themes: antos_themes_build
	cp -r src/themes/system $(BUILDDIR)/resources/themes/

antos_themes_build:
	@echo "$(BLUE)Building themes name: antos$(NC)"
	-rm -rf $(BUILDDIR)/resources/themes/antos/*
	-mkdir -p $(BUILDDIR)/resources/themes/antos
	for f in src/themes/antos/*.css; do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/themes/antos/antos.css;done
	-mkdir -p $(BUILDDIR)/resources/themes/antos/fonts
	cp -rf src/themes/antos/fonts/* $(BUILDDIR)/resources/themes/antos/fonts
	cp src/themes/antos/wp* $(BUILDDIR)/resources/themes/antos/


build_packages:
	- mkdir $(BUILDDIR)/packages
	- for d in $(packages); do ( test -d $(BUILDDIR)/packages/$$d && rm -rf $(BUILDDIR)/packages/$$d/* ); done
	for d in $(packages); do (cd src/packages/$$d; make);done
	for d in $(packages); do ( test -d $(BUILDDIR)/packages/$$d || mkdir -p $(BUILDDIR)/packages/$$d && cp -rf src/packages/$$d/build/* $(BUILDDIR)/packages/$$d/);done
	for d in $(packages); do ( test -d src/packages/$$d/build && rm -r src/packages/$$d/build ); done

package:
	read -r -p "Enter package name: " PKG;\
	test -d $(BUILDDIR)/packages/$$PKG && rm -rf $(BUILDDIR)/packages/$$PKG/*;\
	cd src/packages/$$PKG && make;\
	cd ../../../;\
	test -d $(BUILDDIR)/packages/$$PKG || mkdir -p $(BUILDDIR)/packages/$$PKG;\
	cp -rf src/packages/$$PKG/build/* $(BUILDDIR)/packages/$$PKG/;\
	test -d src/packages/$$PKG/build && rm -r src/packages/$$PKG/build;


uglify:
	# uglify antos.js
	# npm install uglify-js -g
	uglifyjs $(BUILDDIR)/scripts/antos.js --compress --mangle --output $(BUILDDIR)/scripts/antos.js
	# uglify tags
	# npm install riot -g
	riot --ext js $(BUILDDIR)/resources/antos_tags.js $(BUILDDIR)/resources/antos_tags.js
	uglifyjs $(BUILDDIR)/resources/antos_tags.js --compress --mangle --output $(BUILDDIR)/resources/antos_tags.js
	sed -i 's/resources\/antos_tags.js/scripts\/riot.min.js/g' $(BUILDDIR)/index.html
	sed -i 's/scripts\/riot.compiler.min.js/resources\/antos_tags.js/g' $(BUILDDIR)/index.html
	sed -i 's/type=\"riot\/tag\"//g' $(BUILDDIR)/index.html
	# npm install minify -g
	# uglify the css
	minify  --output $(BUILDDIR)/resources/themes/antos/antos.css $(BUILDDIR)/resources/themes/antos/antos.css
	minify  --output $(BUILDDIR)/resources/themes/system/font-awesome.css $(BUILDDIR)/resources/themes/system/font-awesome.css
	#uglify each packages

	for d in $(packages); do\
		test -f $(BUILDDIR)/packages/$$d/main.js  &&  uglifyjs $(BUILDDIR)/packages/$$d/main.js --compress --mangle --output $(BUILDDIR)/packages/$$d/main.js;\
		test -f $(BUILDDIR)/packages/$$d/main.css  &&  minify --output $(BUILDDIR)/packages/$$d/main.css $(BUILDDIR)/packages/$$d/main.css;\
	done

release: main uglify

clean:
	rm -rf $(BUILDDIR)/*