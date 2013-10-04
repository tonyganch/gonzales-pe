.PHONY: cssp

cssp:
	@echo 'Creating temp files...'
	@mkdir -p tmp
	@cat src/gonzales.cssp.header.js > tmp/.gonzales.cssp.js
	@cat src/tokenizer.shared.js >> tmp/.gonzales.cssp.js
	@cat src/cssp.ast.shared.js >> tmp/.gonzales.cssp.js
	@cat src/gonzales.cssp.footer.js >> tmp/.gonzales.cssp.js
	@cp src/cssp.translator.shared.js tmp/.cssp.translator.js

	@echo 'Removing comments...'
	@sed -i '' -e 's/ *\/\/.*//' -e ':t' -e 's|^ */\*.*\*/||' -e 'tt' -e '/^ *\/\*/!b' -e 'N' -e 'bt' tmp/.gonzales.cssp.js
	@sed -i '' -e 's/ *\/\/.*//' -e ':t' -e 's|^ */\*.*\*/||' -e 'tt' -e '/^ *\/\*/!b' -e 'N' -e 'bt' tmp/.cssp.translator.js
	@sed -i '' '/^$$/d' tmp/.gonzales.cssp.js
	@sed -i '' '/^$$/d' tmp/.cssp.translator.js

	@echo 'Building lib files...'
	@cp tmp/.gonzales.cssp.js lib/gonzales.cssp.node.js
	@cat src/gonzales.cssp.node.js >> lib/gonzales.cssp.node.js
	@cp tmp/.cssp.translator.js lib/cssp.translator.node.js
	@cat src/cssp.translator.node.js >> lib/cssp.translator.node.js

	@echo 'Building web files...'
	@cp tmp/.gonzales.cssp.js web/gonzales.cssp.web.js
	@cp tmp/.cssp.translator.js web/cssp.translator.js

	@echo 'Cleaning up...'
	@rm -rf tmp

	@echo 'Done!'

cssptest:
	@node test/cssp/test.js
