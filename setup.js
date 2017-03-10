'user strict';
var fs = require('fs');
fs.createReadStream('.bot-env')
    .pipe(fs.createWriteStream('.env'));