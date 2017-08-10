

BUILDDIR = build/htdocs
BLUE=\033[0;34m
NC=\033[0m

coffees= 	src/define.coffee\
        	src/core/apis/api.coffee\
        	src/core/apis/handlers/InBrowserHandler.coffee\
        	src/core/gui/gui.coffee\
			src/core/gui/BaseApplication.coffee\
        	src/antos.coffee

tags=	src/core/gui/tags/afx-button.js\
        src/core/gui/tags/afx-menu.js\
        src/core/gui/tags/afx-sys-panel.js\
        src/core/gui/tags/afx-apps-dock.js\
        src/core/gui/tags/afx-app-window.js\
        src/core/gui/tags/afx-vbox.js\
        src/core/gui/tags/afx-hbox.js\
        src/core/gui/tags/afx-list-view.js

antos_themes = 	src/core/gui/themes/antos/font-awesome.css\
        		src/core/gui/themes/antos/ubuntu-regular.css\
        		src/core/gui/themes/antos/hermit-light.css\
        		src/core/gui/themes/antos/antos.css\
        		src/core/gui/themes/antos/afx-button.css\
        		src/core/gui/themes/antos/afx-menu.css\
        		src/core/gui/themes/antos/afx-sys-panel.css\
        		src/core/gui/themes/antos/afx-dock.css\
        		src/core/gui/themes/antos/afx-app-window.css


packages = NotePad

main: build_coffee build_tag build_theme schemes libs packages_builds
	- cp src/index.html $(BUILDDIR)/

#%.js: %.coffee
#		coffee --compile $< 

build_coffee:
	- echo "$(BLUE)=======Building coffee files=======$(NC)"
	- mkdir $(BUILDDIR)/scripts
	- rm $(BUILDDIR)/scripts/antos.js
	for f in $(coffees); do (cat "$${f}"; echo) >> $(BUILDDIR)/scripts/antos.coffee; done
	coffee --compile $(BUILDDIR)/scripts/antos.coffee
	- rm $(BUILDDIR)/scripts/antos.coffee


libs:
	- echo "$(BLUE)=======Copy lib files=======$(NC)
	- cp -rf src/libs/* $(BUILDDIR)/scripts

schemes:
	- echo "$(BLUE)=======Copy schemes files======= $(NC)"
	- mkdir -p $(BUILDDIR)/resources/schemes
	- cp src/core/gui/schemes/* $(BUILDDIR)/resources/schemes

build_tag:
	- echo "=======$(BLUE)Building tag files=======$(NC)"
	-mkdir $(BUILDDIR)/resources 
	-rm $(BUILDDIR)/resources/antos_tags.js
	- for f in $(tags); do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/antos_tags.js; done

build_theme: antos_themes_build


antos_themes_build:
	- echo "=======$(BLUE)Building themes name: antos=======$(NC)"
	-mkdir -p $(BUILDDIR)/resources/themes/antos
	- for f in $(antos_themes); do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/themes/antos/antos.css; done
	-mkdir -p $(BUILDDIR)/resources/themes/antos/fonts
	- cp -rf src/core/gui/themes/antos/fonts/* $(BUILDDIR)/resources/themes/antos/fonts
	- cp src/core/gui/themes/antos/wallpaper.jpg $(BUILDDIR)/resources/themes/antos/


packages_builds:
	- mkdir $(BUILDDIR)/packages
	- for d in $(packages); do (cd src/packages/$$d; make);done
	- for d in $(packages); do ( test -d $(BUILDDIR)/packages/$$d || mkdir -p $(BUILDDIR)/packages/$$d && cp -rf src/packages/$$d/build/* $(BUILDDIR)/packages/$$d/);done
	- for d in $(packages); do ( test -d src/packages/$$d/build && rm -r src/packages/$$d/build ); done
clean:
	rm -rf $(BUILDDIR)/*