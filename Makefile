

BUILDDIR?=build/htdocs/os
BLUE=\033[1;34m
NC=\033[0m

GSED=sed
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
	GSED=gsed
endif


coffees= 	src/core/core.coffee \
        	src/core/api.coffee \
			src/core/settings.coffee \
        	src/core/handles/RemoteHandle.coffee \
			src/core/Announcerment.coffee \
        	src/core/vfs.coffee \
			src/core/vfs/GoogleDriveHandle.coffee \
			src/core/db.coffee \
			src/core/gui.coffee \
			src/core/BaseModel.coffee \
			src/core/BaseApplication.coffee \
			src/core/BaseService.coffee \
			src/core/BaseEvent.coffee \
			src/core/BaseDialog.coffee \
			src/core/tags/tag.coffee \
			src/core/tags/WindowTag.coffee \
			src/core/tags/TileLayoutTags.coffee \
			src/core/tags/ResizerTag.coffee \
			src/core/tags/LabelTag.coffee \
			src/core/tags/ButtonTag.coffee \
			src/core/tags/ListViewTag.coffee \
			src/core/tags/SwitchTag.coffee \
			src/core/tags/NSpinnerTag.coffee \
			src/core/tags/MenuTag.coffee \
			src/core/tags/GridViewTag.coffee \
			src/core/tags/TabBarTag.coffee \
			src/core/tags/TabContainerTag.coffee \
			src/core/tags/TreeViewTag.coffee \
			src/core/tags/SliderTag.coffee \
			src/core/tags/FloatListTag.coffee \
			src/core/tags/CalendarTag.coffee \
			src/core/tags/ColorPickerTag.coffee \
			src/core/tags/FileViewTag.coffee \
			src/core/tags/OverlayTag.coffee \
			src/core/tags/AppDockTag.coffee \
			src/core/tags/SystemPanelTag.coffee \
        	src/antos.coffee
 



packages = CoreServices Files Setting CodePad

main: initd build_coffees build_themes libs  build_packages languages
	- cp src/index.html $(BUILDDIR)/

initd:
	- mkdir -p $(BUILDDIR)

lite: build_coffees build_themes build_packages
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

testdata:
	@echo "$(BLUE)Copy JSON test files$(NC)"
	- mkdir -p $(BUILDDIR)/resources/jsons
	cp src/core/handlers/jsons/* $(BUILDDIR)/resources/jsons

languages:
	-mkdir -p $(BUILDDIR)/resources
	-mkdir -p $(BUILDDIR)/resources/languages
	cp src/core/languages/*.json $(BUILDDIR)/resources/languages/

genlang:
	read -r -p "Enter locale: " LOCAL;\
		./src/core/languages/gen.sh ./src ./src/core/languages/$$LOCAL.json
build_themes: antos_light antos_dark
	-rm -rf $(BUILDDIR)/resources/themes/system/*
	-mkdir -p $(BUILDDIR)/resources/themes/system
	cp -r src/themes/system/fonts $(BUILDDIR)/resources/themes/system
	cp -r src/themes/system/wp $(BUILDDIR)/resources/themes/system
	for f in src/themes/system/*.css; do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/themes/system/system.css;done

antos_light:
	@echo "$(BLUE)Building themes name: antos-light$(NC)"
	-rm -rf $(BUILDDIR)/resources/themes/antos_light/*
	-mkdir -p $(BUILDDIR)/resources/themes/antos_light
	for f in src/themes/antos_light/*.css; do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/themes/antos_light/antos_light.css;done


antos_dark:
	@echo "$(BLUE)Building themes name: antos-dark$(NC)"
	-rm -rf $(BUILDDIR)/resources/themes/antos_dark/*
	-mkdir -p $(BUILDDIR)/resources/themes/antos_dark
	for f in src/themes/antos_dark/*.css; do (cat "$${f}"; echo) >> $(BUILDDIR)/resources/themes/antos_dark/antos_dark.css;done


build_packages:
	- mkdir -p $(BUILDDIR)/packages
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
	cp -rfv src/packages/$$PKG/build/* $(BUILDDIR)/packages/$$PKG/;\
	test -d src/packages/$$PKG/build && rm -r src/packages/$$PKG/build;

pkgar:
	read -r -p "Enter package name: " PKG;\
	echo $$PKG | make package &&\
	test -f $(BUILDDIR)/packages/$$PKG/main.js  &&  uglifyjs $(BUILDDIR)/packages/$$PKG/main.js --compress --mangle --output $(BUILDDIR)/packages/$$PKG/main.js;\
	test -f $(BUILDDIR)/packages/$$PKG/main.css  &&  uglifycss --output $(BUILDDIR)/packages/$$PKG/main.css $(BUILDDIR)/packages/$$PKG/main.css;\
	cd $(BUILDDIR)/packages/$$PKG && zip -r "$$PKG.zip" ./ ; \
	cd ../../ && (test -d repo/$$PKG || mkdir repo/$$PKG) && mv packages/$$PKG/"$$PKG.zip" repo/$$PKG && touch repo/$$PKG/$$PKG.md && rm -r packages/$$PKG

uglify:
	# uglify antos.js
	# npm install uglify-es -g
	# npm install uglify-js -g
	uglifyjs $(BUILDDIR)/scripts/antos.js --compress --mangle --output $(BUILDDIR)/scripts/antos.js
	# uglify tags
	# npm install uglifycss -g
	# uglify the css
	uglifycss  --output $(BUILDDIR)/resources/themes/antos_light/antos_light.css $(BUILDDIR)/resources/themes/antos_light/antos_light.css
	uglifycss  --output $(BUILDDIR)/resources/themes/antos_dark/antos_dark.css $(BUILDDIR)/resources/themes/antos_dark/antos_dark.css
	uglifycss  --output $(BUILDDIR)/resources/themes/system/system.css $(BUILDDIR)/resources/themes/system/system.css
	#uglify each packages

	for d in $(packages); do\
		echo "Uglifying $$d";\
		test -f $(BUILDDIR)/packages/$$d/main.js  &&  uglifyjs $(BUILDDIR)/packages/$$d/main.js --compress --mangle --output $(BUILDDIR)/packages/$$d/main.js;\
		test -f $(BUILDDIR)/packages/$$d/main.css  &&  uglifycss --output $(BUILDDIR)/packages/$$d/main.css $(BUILDDIR)/packages/$$d/main.css;\
	done

release: main uglify

clean:
	rm -rf $(BUILDDIR)/resources
	rm -rf $(BUILDDIR)/scripts
	rm -rf $(BUILDDIR)/packages
	rm -rf $(BUILDDIR)/index.html
