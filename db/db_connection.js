const mysql = require("mysql");

// var mysqlConnection = mysql.createConnection({
//     host: "localhost",
//     user: "",
//     password: "",
//     database: "",
//     multipleStatements: true
// });
var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "",
    password: "",
    database: "",
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if(!err) {
        console.log("DB connected.");
    } else {
        console.log("DB connection fail", JSON.stringify(err));
    }
});

module.exports = mysqlConnection;
