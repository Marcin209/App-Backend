var express = require('express');

var app = express();
var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.send("some Test ")
});

app.listen(port,function () {
    console.log("Listening on Port 3000")
});