var express          = require('express'),
    path             = require('path'),
    favicon          = require('serve-favicon'),
    logger           = require('morgan'),
    cookieParser     = require('cookie-parser'),
    expressValidator = require('express-validator'),
    session          = require('express-session'),
    passport         = require('passport'),
    LocalStrategy    = require('passport-local').Strategy,
    bodyParser       = require('body-parser'),
    flash            = require('connect-flash'),
    mongo            = require('mongodb'),
    mongoose         = require('mongoose'),
    mysql            = require('mysql'),
    db = mongoose.connection,
    clients = require('./clients/index')
    app = express();

// view engine setup
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// handle file uploads

//multer delted

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// handle express sessions
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
        root      = namespace.shift(),
        formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg  : msg,
      value: value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// flash
app.use(flash());

// express messages
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use('/', clients);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//Express server
var http = require('http');
var server = http.createServer(app);

app.get('/bots', function(req, res) {
    res.sendFile("home.html");
});

server.listen(4545, 'localhost');
server.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});

module.exports = app;