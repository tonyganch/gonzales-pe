var Benchmark = require('benchmark');
var fs = require('fs');

var gonzales = require('gonzales'),
    gonzales20 = require('gonzales-pe'),
    gonzales30 = require('./../lib/gonzales'),
    postcss = require('postcss')(),
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
    console.log('\n---\nProcessing test file: ' + test.title + '\n');

    var suite = new Benchmark.Suite;
    var css = test.css;

    suite.add('Gonzales 3.0 (objects)', function() {
        gonzales30.parse(css);
    })
    .add('Gonzales 3.0 (arrays)', function() {
        gonzales30.parse(css, {syntax: 'test'});
    })
    .add('Gonzales 2.0', function() {
        gonzales20.cssToAST(css);
    })
    .add('Gonzales', function() {
        gonzales.srcToCSSP(css);
    })
    .add('PostCSS', function() {
        postcss.process(css);
    })
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
        var sorted = this.sort(function(a, b) {
            a = a.stats; b = b.stats;
            return (a.mean + a.moe > b.mean + b.moe ? 1 : -1);
        });

        var times = sorted.map(function(test) {
            return ((test.stats.mean + test.stats.moe) * 1000).toFixed(2);
        });

        var table = sorted.pluck('name')
            .map(function(name, i) {
                return i + 1 + '. ' + name + ', ' + times[i] + ' ms';
            });

        console.log('');
        console.log(table.join('\n'));
    })
    .run();
}

