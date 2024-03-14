const mongoose = require('mongoose');
const Schema= mongoose.Schema;

var rolemappingSchema = new Schema({
    principalType:{type:String},
    principalId:{type:String},
    roleId:Schema.Types.ObjectId
}); 

var rolemapping = mongoose.model('rolemapping',rolemappingSchema,'RoleMapping');
module.exports = rolemapping;