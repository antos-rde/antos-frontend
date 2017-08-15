

BUILDDIR = build/htdocs
BLUE=\033[1;34m
NC=\033[0m

coffees= 	src/core/core.coffee\
        	src/core/api.coffee\
        	src/core/handlers/InBrowserHandler.coffee\
        	src/core/gui.coffee\
			src/core/BaseModel.coffee\
			src/core/BaseApplication.coffee\
			src/core/BaseService.coffee\
			src/core/BaseEvent.coffee\
        	src/antos.coffee

tags=	src/core/tags/afx-button.js\
        src/core/tags/afx-menu.js\
        src/core/tags/afx-sys-panel.js\
        src/core/tags/afx-apps-dock.js\
        src/core/tags/afx-app-window.js\
        src/core/tags/afx-vbox.js\
        src/core/tags/afx-hbox.js\
        src/core/tags/afx-list-view.js\
		src/core/tags/afx-tree-view.js \
		src/core/tags/afx-overlay.js\
		src/core/tags/afx-dummy.js\
		src/core/tags/afx-feed.js\
		src/core/tags/afx-grid-view.js 

antos_themes = 	src/themes/antos/font-awesome.css\
        		src/themes/antos/ubuntu-regular.css\
        		src/themes/antos/hermit-light.css\
        		src/themes/antos/antos.css\
        		src/themes/antos/afx-button.css\
        		src/themes/antos/afx-menu.css\
        		src/themes/antos/afx-sys-panel.css\
        		src/themes/antos/afx-dock.css\
				src/themes/antos/afx-list-view.css\
				src/themes/antos/afx-tree-view.css\
				src/themes/antos/afx-grid-view.css\
				src/themes/antos/afx-feed.css\
        		src/themes/antos/afx-app-window.css 



packages = NotePad wTerm ActivityMonitor DummyApp
services = PushNotification Spotlight Calendar

main: clean build_coffees build_tags build_themes schemes libs build_services build_packages
	- cp src/index.html $(BUILDDIR)/

lite: build_coffee build_tag build_theme schemes  build_services build_packages
#%.js: %.coffee
#		coffee --compile $< 

build_coffees:
	@echo "$(BLUE)=======Building coffee files=======$(NC)"
	- mkdir $(BUILDDIR)/scripts
	- rm $(BUILDDIR)/scripts/antos.js
	for f in $(coffees); do (cat "$${f}"; echo) >> $(BUILDDIR)/scripts/antos.coffee; done
	coffee --compile $(BUILDDIR)/scripts/antos.coffee
	- rm $(BUILDDIR)/scripts/antos.coffee


libs:
	@echo "$(BLUE)=======Copy lib files=======$(NC)"
	cp -rf src/libs/* $(BUILDDIR)/scripts/

schemes:
	@echo "$(BLUE)=======Copy schemes files======= $(NC)"
	- mkdir -p $(BUILDDIR)/resources/schemes
	cp src/core/schemes/* $(BUILDDIR)/resources/schemes/
	
build_tags:
	@echo "=======$(BLUE)Building tag files=======$(NC)"
	-mkdir $(BUILDDIR)/resources 
	-rm $(BUILDDIR)/resources/antos_tags.js
	for f in $(tags); do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/antos_tags.js; done

build_themes: antos_themes_build


antos_themes_build:
	@echo "=======$(BLUE)Building themes name: antos=======$(NC)"
	-rm -rf $(BUILDDIR)/resources/themes/antos/*
	-mkdir -p $(BUILDDIR)/resources/themes/antos
	for f in $(antos_themes); do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/themes/antos/antos.css; done
	-mkdir -p $(BUILDDIR)/resources/themes/antos/fonts
	cp -rf src/themes/antos/fonts/* $(BUILDDIR)/resources/themes/antos/fonts
	cp src/themes/antos/wallpaper.jpg $(BUILDDIR)/resources/themes/antos/


build_services:
	@echo "=======$(BLUE)Building services=======$(NC)"
	-mkdir -p $(BUILDDIR)/services
	-rm -rf $(BUILDDIR)/services/*
	for f in $(services); do (coffee -cs < "src/services/$$f.coffee" >$(BUILDDIR)/services/"$$f.js");done
build_packages:
	- mkdir $(BUILDDIR)/packages
	- for d in $(packages); do ( test -d $(BUILDDIR)/packages/$$d && rm -rf $(BUILDDIR)/packages/$$d/* ); done
	for d in $(packages); do (cd src/packages/$$d; make);done
	for d in $(packages); do ( test -d $(BUILDDIR)/packages/$$d || mkdir -p $(BUILDDIR)/packages/$$d && cp -rf src/packages/$$d/build/* $(BUILDDIR)/packages/$$d/);done
	for d in $(packages); do ( test -d src/packages/$$d/build && rm -r src/packages/$$d/build ); done
clean:
	rm -rf $(BUILDDIR)/*