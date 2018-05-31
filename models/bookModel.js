var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookModel = new Schema({
    title: {type: String},
    author: {type: String},
    gener: {type: String},
    read: {type: Boolean}
});

module.exports =mongoose.model('Book',bookModel);