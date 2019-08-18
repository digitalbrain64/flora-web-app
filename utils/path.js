const path = require('path');

// gives us the root file from where the app starts (app.js)
module.exports = path.dirname(process.mainModule.filename);