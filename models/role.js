const mongoose = require('mongoose');
const Schema= mongoose.Schema;

var roleSchema = new Schema({
    name:{type:String},
    created:{type:Date},
    modified:{type: Date}
}); 

var role = mongoose.model('role',roleSchema,'Role');
module.exports = role;