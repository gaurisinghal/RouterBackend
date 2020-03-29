var mysql = require('mysql');
//var config = require("./config");
var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "QAWSedrf@2" ,
    database: "escproject",
    connectionLimit: 50
  });
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "QAWSedrf@2",
    database: "escproject"
  });

module.exports = {pool, con, mysql}