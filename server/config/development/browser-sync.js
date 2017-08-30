module.exports = function (app, config) {
  var browserSync = require('browser-sync');
  var bs = browserSync({
    files: [
      "public/**/*"
    ],
    proxy: "localhost:" + (process.env.PORT || "3000"),
    watchOptions: {
      debounceDelay: 1000
    },
    browser: ["google chrome", "firefox", "safari"],
    //browser: ["google chrome", "safari"],
    //browser: ["google chrome"],
    open: false
  });

  app.use(require('connect-browser-sync')(bs));
};
