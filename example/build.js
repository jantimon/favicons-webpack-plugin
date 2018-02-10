require('webpack')(require('./webpack.config.js'), function(error, stats) {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toJson().errors);
    process.exit(-1);
  }

  console.log(stats.toString());
});
