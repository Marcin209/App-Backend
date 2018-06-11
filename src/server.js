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
  
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});


app.listen(8080, () => console.log('Example app listening on port 8080!'))


app.get('/', function(req, res){
    res.send('hello');
});

app.get('/login/:ident', function(req,res){
    var query = "SELECT * FROM ?? WHERE login = ?";
    var inserts = ["users", req.params.ident];
    connection.query(query,inserts,function(error,results,fields){
        if(results == 0){
            res.sendStatus(404);
        }
        else{
            var data = {
                ID: results[0].ID,
                type: results[0].type,
                login: results[0].login
            }
            res.status = 200;
            res.type('application/json');
            res.send(data);
        }

    });
});

app.post('/login', function (req, res) {
    var data = req.body;
    console.log(data);
    if(data.password == 0){
        var query1 = "SELECT User_ID FROM ?? WHERE ID = ?";
        var inserts1 = ["deliverypoints", data.login];

        connection.query(query1,inserts1,function(error,results,fields){
            res.status = 200;
            console.log(results[0].User_ID);
            res.send({
                text:'Success',
                delivererID: results[0].User_ID
            });
        });

    }
    else{
        console.log(data.login);
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
                    var cos = {
                        text:'Success',
                        type:results[0].type,
                        login: data.login
                    };
                    console.log(cos);
                    res.send(cos);
                }                
                else{//zle pass
                    res.sendStatus(401);
                }
            }
        });
    }
});

//dokonczyc funkcja symulownaiewyzarzania
app.get('/route/:ident/deliveryPoints',function(req,res){
    var query = "SELECT Longitude,Latitude,Delivered,ID FROM ?? WHERE User_ID = ?";
    var inserts = ["deliverypoints", req.params.ident];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
        console.log(results);
    });
});

app.get('/route/:ident/deliveryPointsWithAlgorithm',function(req,res){
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

app.post('/route',function(req,res){
    var data = req.body;
    var query = "INSERT INTO ?? (User_ID, Time, Accuracy, Longitude, Latitude) VALUES (?,?,?,?,?)";
    var inserts = ["locations",data.user_id,data.Time,data.Accuracy,data.Longitude,data.Latitude];
    connection.query(query,inserts,function(error,results,fields){
        console.log(this.sql);
        res.status = 200;
        res.type("application/json");
        res.send({
            text:"Success"
        });
    });
});

app.get('/allDeliveries', function (req, res) {
    var data = req.query;
    var query = "SELECT * FROM ??";
    var inserts = ["itapps.packages"];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
    });
});

app.get('/delivery/:deliveryid', function (req, res) {
    var query = "SELECT * FROM ?? WHERE User_ID = (SELECT User_ID FROM users.deliverypoints where ID=?) ORDER BY locations.Time ASC LIMIT 1";
    var inserts = ["locations", req.params.deliveryid];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
    });
});

app.get('/getAllDeliveryPoints/:userid', function (req, res) {
    var query = "SELECT * FROM ?? where User_ID=?";
    var inserts = ["deliverypoints", req.params.userid];
    connection.query(query,inserts,function(error,results,fields){
        res.send(results);
    });
});

app.get('/getAllEmployees', function (req, res) {
    var query = "SELECT * FROM ?? where type = 0";
    var inserts = ["users", req.params.userid];
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
