var express = require('express');
var mysql = require('mysql');

var app = express();
var port = process.env.PORT || 3000;

var connection = mysql.createConnection({
    host: 'localhost',
    port:'3306',
    user: 'root',
    password: 'qwerty1234',
    database: 'It_apps'
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

// connection.on('error',function(err){
//    console.log(err.message);
// });

// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results[0].solution);
// });

connection.end();

var Router = express.Router();
Router.route('/restApi')
    .get(function (req, res) {
        console.log('Dziala Rooter')
    });
app.get('/', function (req, res) {
    res.send("some Test ")
});

app.listen(port, function () {
    console.log("Listening on Port 3000")
});