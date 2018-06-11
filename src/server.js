var mysql = require("mysql");
var express = require("express");
var bodyParser = require('body-parser')

var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'qwerty1234',
    database : 'users'
});

// connection.connect(function(err) {
//     if (err) {
//         console.error('error connecting: ' + err.stack);
//         return;
//     }
//     console.log('connected as id ' + connection.threadId);
// });


app.listen(8080, () => console.log('Example app listening on port 8080!'))


app.get('/', function(req, res){
    res.send('hello');
});

app.get('/login/:ident', function(req,res){
    var query = "SELECT * FROM ?? WHERE login = ?";
    var inserts = ["users", req.params.ident];
    connection.query(query,inserts,function(error,results,fields){
        var data = {
            ID: results[0].ID,
            login: results[0].login
        }
        res.status = 200;
        res.type('application/json');
        res.send(data);
    });
});

app.post('/login', function (req, res) {
    var data = req.body;
    console.log(req.body);
    var query = "SELECT * FROM ?? WHERE login = ?";
    var inserts = ["users", data.login];
    connection.query(query,inserts,function(error,results,fields){
        if(results.length == 0){
            res.sendStatus(404);//nie znaleziono uzytkownika
        }
        else if(results.length == 1){//znaleziono
            if(data.password == results[0].password){//pass sie zgadza
                res.status=200;
                res.type('application/json');
                res.send({
                    text:'Success',
                    mode:results[0].TYPE,
                    login: data.login
                });
            }
            else{//zle pass
                res.sendStatus(401);
            }
        }
    });
});

//dokonczyc funkcja symulownaiewyzarzania
app.get('/route/:ident/deliverypoints',function(req,res){
    var query = "SELECT Longitude,Latitude,Delivered FROM ?? WHERE User_ID = ?";
    var inserts = ["deliverypoints", req.params.ident];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
        console.log(results);
    });
});

app.post('/delivered',function(req,res){
    var data = req.body;
    var query = "UPDATE ?? SET Delivered=? WHERE Longitude=? AND Latitude=?";
    var inserts = ["deliverypoints", data.Delivered, data.Longitude, data.Latitude];
    connection.query(query,inserts,function(error,results,fields){
        console.log(results);
        res.status = 200;
        res.type("application/json");
        res.send({
            text:"Success"
        });
    });

});

app.get('/route/:ident',function(req,res){
    var query = "SELECT * FROM ?? WHERE User_ID= ?";
    var inserts = ["locations",req.params.ident];
    connection.query(query,inserts,function(error,results,fields){
        res.status = 200;
        res.type("application/json");
        res.send(results);
    });
});

app.post('/route/:ident',function(req,res){
    var data = req.body;
    var query = "INSERT INTO ?? (User_ID, Time, Accurancy, Longitude, Latitude) VALUES (?,?,?,?,?)";
    var inserts = ["locations",data.User_ID,data.Time,data.Accurancy,data.Longitutde,data.Latitude];
    connection.query(query,inserts,function(error,results,fields){
        res.status = 200;
        res.type("application/json");
        res.send({
            text:"Success"
        });
    });
});

app.get('/alldeliveries', function (req, res) {
    var data = req.query;
    var query = "SELECT * FROM ??";
    var inserts = ["itapps.packages"];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
    });
});

app.get('/delivery/:deliveryid', function (req, res) {
    var query = "SELECT * FROM locations WHERE User_ID = (SELECT User_ID FROM users.deliverypoints where ID=?) ORDER BY locations.Time ASC LIMIT 1";
    var inserts = ["users", req.params.deliveryid];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
    });
});

app.get('/get/:deliveryid', function (req, res) {
    var query = "SELECT * FROM locations WHERE User_ID = (SELECT User_ID FROM users.deliverypoints where ID=?) ORDER BY locations.Time ASC LIMIT 1";
    var inserts = ["users", req.params.deliveryid];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
    });
});

app.get('/user/:id', function (req, res) {
    var query = "SELECT * FROM ?? WHERE ID = ?";
    var inserts = ["users", req.params.id];
    // query = mysql.format(query,inserts);
    connection.query(query,inserts,function(error,results,fields){
        // console.log(this.sql); 
        res.send(results);
    });
});
