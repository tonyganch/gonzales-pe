var Mocha = require('mocha');
var mocha = new Mocha();
mocha.reporter('dot');

require('./parser')(mocha);
mocha.addFile('test/parsing-error');
mocha.addFile('test/node');
mocha.addFile('test/empty');

mocha.run(function(failures) {
    process.on('exit', function() {
        process.exit(failures);
    });
});
