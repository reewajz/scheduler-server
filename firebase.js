// var firebase = require('firebase');

var config = {
    serviceAccount: require('./scheduling74-firebase-adminsdk.json'),
    databaseURL: 'https://scheduling74.firebaseio.com'
};

// if(!firebase.apps.length){
//     firebase.initializeApp(config);
// }

// module.exports = firebase;

module.exports = config;