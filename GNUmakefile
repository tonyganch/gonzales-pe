.PHONY: build

build:
	@echo 'Creating temp files...'
	@mkdir -p tmp
	@cat src/css-to-ast.header.js > tmp/.css-to-ast.js
	@cat src/tokenizer.js >> tmp/.css-to-ast.js
	@cat src/css-to-ast.js >> tmp/.css-to-ast.js
	@cat src/rules-css.js >> tmp/.css-to-ast.js
	@cat src/rules-scss.js >> tmp/.css-to-ast.js
	@cat src/rules-sass.js >> tmp/.css-to-ast.js
	@cat src/rules-less.js >> tmp/.css-to-ast.js
	@cat src/css-to-ast.footer.js >> tmp/.css-to-ast.js
	@cp src/ast-to-css.js tmp/.ast-to-css.js

	@echo 'Removing comments...'
	@sed -i '' -e 's/ *\/\/.*//' -e ':t' -e 's|^ */\*.*\*/||' -e 'tt' -e '/^ *\/\*/!b' -e 'N' -e 'bt' tmp/.css-to-ast.js
	@sed -i '' -e 's/ *\/\/.*//' -e ':t' -e 's|^ */\*.*\*/||' -e 'tt' -e '/^ *\/\*/!b' -e 'N' -e 'bt' tmp/.ast-to-css.js
	@sed -i '' '/^$$/d' tmp/.css-to-ast.js
	@sed -i '' '/^$$/d' tmp/.ast-to-css.js

	@echo 'Building lib files...'
	@cp tmp/.css-to-ast.js lib/gonzales.css-to-ast.js
	@cat src/css-to-ast.node.js >> lib/gonzales.css-to-ast.js
	@cp tmp/.ast-to-css.js lib/gonzales.ast-to-css.js
	@cat src/ast-to-css.node.js >> lib/gonzales.ast-to-css.js

	@echo 'Building web files...'
	@mkdir -p web
	@cp tmp/.css-to-ast.js web/gonzales.css-to-ast.js
	@cp tmp/.ast-to-css.js web/gonzales.ast-to-css.js

	@echo 'Cleaning up...'
	@rm -rf tmp

	@echo 'Done!'
