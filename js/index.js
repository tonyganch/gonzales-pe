(function() {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var settings = document.getElementById('settings');

  var syntax = 'css';

  function handleInput() {
    var css = input.value;
    var parseTree = {};
    try {
      parseTree = gonzales.parse(css, {syntax: syntax});
    } catch(e) {
    }
    var whitelist = ['type', 'content'];
    output.value = JSON.stringify(parseTree, whitelist, 2);
  }

  function handleSettingsChange(event) {
    var target = event.target;
    var name = target.name;

    if (name === 'syntax') {
      syntax = target.value;
      handleInput();
    }
  }

  input.addEventListener('input', handleInput);
  settings.addEventListener('change', handleSettingsChange);
})();
