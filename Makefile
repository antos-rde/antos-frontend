

BUILDDIR = build/htdocs/os
BLUE=\033[1;34m
NC=\033[0m

coffees= 	src/core/core.coffee\
        	src/core/api.coffee\
        	src/core/handlers/RemoteHandler.coffee\
        	src/core/vfs.coffee\
			src/core/gui.coffee\
			src/core/BaseModel.coffee\
			src/core/BaseApplication.coffee\
			src/core/BaseService.coffee\
			src/core/BaseEvent.coffee\
			src/core/BaseDialog.coffee\
        	src/antos.coffee
 




packages = CoreServices NotePad wTerm ActivityMonitor DummyApp Files MarkOn MarketPlace

main:  build_coffees build_tags build_themes schemes libs  build_packages
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

build_themes: antos_themes_build


antos_themes_build:
	@echo "$(BLUE)Building themes name: antos$(NC)"
	-rm -rf $(BUILDDIR)/resources/themes/antos/*
	-mkdir -p $(BUILDDIR)/resources/themes/antos
	for f in src/themes/antos/*.css; do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/themes/antos/antos.css;done
	-mkdir -p $(BUILDDIR)/resources/themes/antos/fonts
	cp -rf src/themes/antos/fonts/* $(BUILDDIR)/resources/themes/antos/fonts
	cp src/themes/antos/wp.png $(BUILDDIR)/resources/themes/antos/


build_packages:
	- mkdir $(BUILDDIR)/packages
	- for d in $(packages); do ( test -d $(BUILDDIR)/packages/$$d && rm -rf $(BUILDDIR)/packages/$$d/* ); done
	for d in $(packages); do (cd src/packages/$$d; make);done
	for d in $(packages); do ( test -d $(BUILDDIR)/packages/$$d || mkdir -p $(BUILDDIR)/packages/$$d && cp -rf src/packages/$$d/build/* $(BUILDDIR)/packages/$$d/);done
	for d in $(packages); do ( test -d src/packages/$$d/build && rm -r src/packages/$$d/build ); done
clean:
	rm -rf $(BUILDDIR)/*