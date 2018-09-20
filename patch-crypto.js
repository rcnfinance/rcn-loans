var fs = require('fs')

function isComment(line) {
  var eval = line.replace(/\s/g, '').replace('\t', '');
  return eval.startsWith('*') || eval.startsWith('/*') || eval.startsWith('//');
}

function removeComments(path) {
  var array = fs.readFileSync(path).toString().split('\n');
  output = '';
  comments = 0;
  array.forEach(line => {
    if (!isComment(line)) output += line + '\n'; else comments++;
  });
  if (comments > 0) {
    console.log('Removed comments', comments, path);
    fs.writeFile(path, output, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  }
}

removeComments('./node_modules/crypto-js/cipher-core.js');
removeComments('./node_modules/crypto-js/core.js')