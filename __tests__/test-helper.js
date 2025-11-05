const fs = require('fs');
const path = require('path');

/**
 * Helper to load and execute JavaScript files for testing
 * Makes functions and variables available globally
 */
function loadModule(modulePath) {
  let code = fs.readFileSync(modulePath, 'utf8');

  // Replace const/let declarations at the top level to make them both local and global
  // This allows internal references to work while also being accessible from tests
  code = code.replace(/^const (\w+) = /gm, 'var $1 = global.$1 = ');
  code = code.replace(/^let (\w+) = /gm, 'var $1 = global.$1 = ');

  // For const/let without initialization
  code = code.replace(/^const (\w+);/gm, 'var $1; global.$1 = $1;');
  code = code.replace(/^let (\w+);/gm, 'var $1; global.$1 = $1;');

  // Replace function declarations to make them global (including async)
  code = code.replace(/^async function (\w+)/gm, 'var $1 = global.$1 = async function');
  code = code.replace(/^function (\w+)/gm, 'var $1 = global.$1 = function');
  code = code.replace(/^class (\w+)/gm, 'var $1 = global.$1 = class');

  // Execute the modified code using eval in global context
  eval(code);
}

module.exports = { loadModule };
