const mongoose = require('mongoose');
const Schema= mongoose.Schema;

var accesstokenSchema = new Schema({
    _id:{type:String},
    ttl:{type:Number},
    created:{type:Date},
    userId:Schema.Types.ObjectId
}); 

var accesstoken = mongoose.model('accesstoken',accesstokenSchema,'AccessToken');
module.exports = accesstoken;