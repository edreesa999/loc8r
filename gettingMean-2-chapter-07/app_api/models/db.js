var mongoose = require('mongoose');
var host = process.env.DB_HOST || '127.0.0.1';
var dbURL = 'mongodb://${localhost}/Loc8r';
var readLine = require('readline');

mongoose.connect(dbURL, { useNewUrlParser: true, useCreateIndex: true });

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ${dbURI}');
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: ${err}');
  return connect();
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

if (process.platform === 'win32') {
  var rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ('SIGINT', () => {
    process.emit("SIGINT");
  });
}

var gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

connect();

require('./locations');
