const mongoose = require('mongoose');
const accesstoken = require('./models/access_token');
const rolemapping = require('./models/role_mapping');
const role = require('./models/role');


var host = "mongodb://localhost:27017/dashboard";
const options = {
    useNewUrlParser: true,
};
mongoose.connect(host, options).then(() => {
    console.log('connected to database!');
}).catch(err => {
    console.log(err);
})
var authCheck = (req, res, next) => {
    // accesstoken.aggregate([{ $lookup: { from: "RoleMapping", localField: "userId", foreignField: "principalId", as: "test" } }]).then(result=>{
    //     console.log(result);
    // })
    // rolemapping.find({}).then(result=>{
    //     console.log(result);
    // })
    if (req.headers.access_token) {
        var token = req.headers.access_token;

        if (typeof token !== 'undefined' && token.length > 10) {
            accesstoken.find({ _id: token }, { userId: 1, _id: 0 }).then(result => {
                if (result.length > 0) {
                    // console.log((result.toString().slice(10,34)));
                    const userid = result.toString().slice(10, 34);
                    rolemapping.find({ principalId: userid }, { roleId: 1, _id: 0 }).then(result => {
                        if (result.length > 0) {
                            // console.log((result.toString().slice(10,34)));
                            const roleid = result.toString().slice(10, 34);
                            role.find({ _id: roleid }).then(result => {
                                if (result.length > 0) {
                                    const role = result[0].name;
                                    if (role == 'admin' || role == 'manager') {
                                        next();
                                    } else {
                                        res.status(200).json({ result: false, message: 'you have no authority to access api' });

                                    }
                                }
                            })

                        }
                    })
                } else {
                    res.status(200).json({ result: false, message: 'Invalid Token' });
                }
            }).catch((err) => {
                console.log(err);
            });
        } else {
            res.json({
                result: false,
                message: 'Token is undefined!'
            })
        }
    } else {
        res.json({
            result: false,
            message: 'No Token Provided'
        });
    }


}

module.exports = authCheck;