var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

var index = require('./routes/index');
var organization = require('./routes/organization');
var resources = require('./routes/resources');


// var swaggerUi = require('swagger-ui-express');
// var swaggerDocument = require('./swagger.json');


var admin = require('firebase-admin');
var serviceAccount = require('./scheduling74-firebase-adminsdk.json');
var config = require('./firebase');

admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount),
    databaseURL: config.databaseURL
});

var db = admin.database();
var events = require('./routes/events')(db);

var app = express();

// view engine setup
app.engine('.hbs', exphbs({
    defaultLayout: 'index',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views')
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
})
app.use(require('./check'));
app.use('/', index);
app.use('/events', events);
app.use('/organization', organization);
app.use('/resources', resources);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.status(404);
    res.json(err);
    // next(err);
});

module.exports = app;