(function() {
  var input = document.getElementById('input');
  var output = document.getElementById('output');

  function handleInput(event) {
    var css = input.value;
    var parseTree = {};
    try {
      parseTree = gonzales.parse(css, {syntax: 'scss'});
    } catch(e) {
    }
    var whitelist = ['type', 'content'];
    output.value = JSON.stringify(parseTree, whitelist, 2);
  }

  input.addEventListener('input', handleInput);
})();
