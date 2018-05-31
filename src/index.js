var express = require('express'),
    mongose = require('mongoose');

var db = mongose.connect('mongodb://localhost/bookAPI');

var Book = require('../models/bookModel');

var app = express();
var port = process.env.PORT || 3000;

var bookRouter = express.Router();
bookRouter.route('/Books')
    .get(function (req,res) {
        // var respond = "HEllo THER FELLO KIDS";
        // res.json(respond);
        Book.find(function (err,books) {
            if(err){
                console.log("Wystapil blad");
            }else {
                res.json(books);
            }
        })
    });
app.use('/api',bookRouter);

app.get('/', function(req, res) {
    res.send("some Test ")
});

app.listen(port,function () {
    console.log("Listening on Port 3000")
});