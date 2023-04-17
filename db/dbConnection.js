const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "e_commerce",
  port: "3306",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("DB CONNECTED");
});

module.exports = connection;
