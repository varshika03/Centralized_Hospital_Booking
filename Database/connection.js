var mysql = require("mysql");

var pool = mysql.createPool({
        connectionLimit : 100,
        database : 'db',
        host: "localhost",
        user: "root",
        password: "0305",
        port: process.env.port
    });

module.exports.getConnection = function(callback) {
  pool.getConnection(function(err, conn) {
    if(err) {
      return callback(err);
    }
    callback(err, conn);
  });
};