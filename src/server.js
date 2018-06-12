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
    console.log(req.params.ident);
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

app.get('/route/:ident/deliveryPoints',function(req,res){
    var query = "SELECT Longitude,Latitude,Delivered,ID FROM ?? WHERE User_ID = ?";
    var inserts = ["deliverypoints", req.params.ident];
    connection.query(query,inserts,function(error,results,fields){
        // var ids = symulowaneWyzarzanie(results);
        res.send(results);
        console.log(results);
    });
});

app.get('/route/:ident/deliveryPointsWithAlgorithm',function(req,res){
    var query = "SELECT Longitude,Latitude,Delivered FROM ?? WHERE User_ID = ?";
    var inserts = ["deliverypoints", req.params.ident];
    var points;
    connection.query(query,inserts,function(error,results,fields){
        points = results;
        // console.log(results);
    }).on('end',function(){
        points = symulowaneWyzarzanie(points);
        res.send(points);
        console.log(points);
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

app.get('/userlist', function (req, res) {
    var query = "SELECT ID from ?? where type = 1";
    var inserts = ["users"];
    var result_;
    connection.query(query,inserts,function(error,results,fields){
        result_ = results;
        console.log(results.length);
    }).on('end',function(){
        var list = [];
        for(var i = 0; i<result_.length; i++){
            var query1 = "Select Latitude, Longitude, users.ID, users.login, users.password, users.type from locations left join(users) on (locations.User_ID = users.ID) WHERE User_ID =? ORDER BY locations.Time desc LIMIT 1";
            var inserts1 = [result_[i].ID];
            connection.query(query1,inserts1,function(error,results,fields){
                list.push(results[0]);
            }).on('end',function(){
                if(list.length == result_.length) res.send(list);
            });
        }
    });
});


function getDistance(ids) {
    var startPoint={"Longitude":17.085052,"Latitude":51.103548};
    var distance= Math.sqrt(((ids[0]["Longitude"]-startPoint['Longitude'])**2+(ids[0]["Latitude"]-startPoint['Latitude'])**2));
    var l=ids.length;
    for (var i=0 ;i<ids.length;i++){
        if (i<(l-1)){
            let distanceSmall = Math.sqrt((ids[i]["Longitude"]-ids[i+1]["Longitude"])**2+(ids[i]["Latitude"]-ids[i+1]["Latitude"])**2);
            distance += distanceSmall;
        }
        else{
            distance += Math.sqrt((ids[i]["Longitude"]-startPoint["Longitude"])**2+(ids[i]["Latitude"]-startPoint["Latitude"])**2)
        }
    }
    return distance;
}
//
// function dict_factory(cursor, row){
//     var  d = {};
//     for (idx, col in enumerate(cursor.description)){
//         d[col[0]] = row[idx];
//     }
//     return d;
// }

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function symulowaneWyzarzanie(ids){
    var T=1000000;
    var distance = getDistance(ids);
    var  bestRoute = ids;
    var  bestDistance = distance;
    console.log("\n\nbefore algorithm:\n", ids, "\ndistance before: ", distance, "\n");
    var  swap2Old=0;
    var  swap1Old=0;
    var  powtorzenia=0;
    while (T>0.001){
        powtorzenia+=1;
        var  idsNew=[];
        var swap1=getRandomInt(0,ids.length);
        var  swap2=swap1;
        while (swap2==swap1 || (swap2==swap2Old && swap1==swap1Old))
        {   swap2=getRandomInt(0,ids.length );}
        for (var i=0 ; i< ids.length;i++){
            if (i!=swap1 && i!=swap2)
            { idsNew.push(ids[i]);} }
             if(swap1>swap2){
                idsNew.push(ids[swap1]);
                idsNew.push(ids[swap2]);
            }
             else {
                 idsNew.push(ids[swap2]);
                 idsNew.push(ids[swap1]);
             }

        var newDistance = getDistance(idsNew);
        var  delta=newDistance-distance;
        if (delta<0){
            ids=idsNew;
            if (newDistance<bestDistance){
                bestDistance=newDistance;
                bestRoute=ids
            }
        }
        else{
           var x=Math.random();
            if (x<Math.exp(-delta/T))
                ids=idsNew;
        }
        swap2Old=swap2;
        swap1Old=swap1;
        T=T*0.999;
    }
    console.log("after algorithm: distance: \n", bestRoute, "\ndistance: ", getDistance(bestRoute), "\n\npowtorzylem kod ",powtorzenia,"razy\n");
    return bestRoute;
}
