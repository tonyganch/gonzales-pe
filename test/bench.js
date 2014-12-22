var fs = require('fs'),
    gonzales = require('gonzales'),
    gonzales20 = require('gonzales-pe'),
    gonzales30 = require('./../lib/gonzales'),
    postcss = require('postcss')(),
    Table = require('cli-table'),
    tests = [{
        title: '3pane.css, 16 KB',
        css: fs.readFileSync('./test/bench/3pane.css', 'utf8')
    }, {
        title: 'github.css, 218 KB',
        css: fs.readFileSync('./test/bench/github.css', 'utf8')
    }, {
        title: '5-githubs.css, 1.1 MB',
        css: fs.readFileSync('./test/bench/5-githubs.css', 'utf8')
    }];

tests.forEach(runTest);

function runTest(test) {
    console.log('\nProcessing test file: ' + test.title);

    var css = test.css,
        table = new Table({head: ['', 'Average time', 'Min time', 'Max time']});

    table.push(bench('Gonzales 3.0 (objects)',
                     gonzales30.parse.bind(null, {src: css})));
    table.push(bench('Gonzales 3.0 (arrays)',
                     gonzales30.parse.bind(null, {src: css, syntax: 'test'})));
    table.push(bench('Gonzales 2.0',
                     gonzales20.cssToAST.bind(null, css)));
    table.push(bench('Gonzales',
                     gonzales.srcToCSSP.bind(null, css)));
    table.push(bench('PostCSS',
                     postcss.process.bind(postcss, css)));

    console.log('\n' + table.toString());
}

function bench(title, callback) {
    var sum = 0,
        min = Infinity,
        max = 0,
        now = 0,
        i = x = 10;

    for (; i--;) {
        process.stdout.write('.');
        now = Date.now();
        callback();
        time = Date.now() - now;
        sum += time;
        if (time < min) min = time;
        if (time > max) max = time;
    }

    return [title, sum/x + ' ms', min + ' ms', max + ' ms'];
}
