var express = require('express'),
  http = require('http'),
  path = require('path'),
  consolidate = require('consolidate'),
  swig = require('swig'),
  filters = require('./swig_filters')(swig),
  props = require('./config.json');

global.appRoot = path.resolve(__dirname);
    
var app = express();

app  
  .engine('html', swig.renderFile)
  .set('view engine', 'html')
  .set('views', __dirname + '/views')
  .set('view cache', false)
  .use(express.static(path.join(__dirname, 'public')))

/** Portada **/
  .get('/', index)
  .get('/blog', index)

/** diputados **/
  .use(require('./routes/diputados'))

/** nosotros **/
  .use(require('./routes/nosotros'))

/** ayuda **/
  .use(require('./routes/ayuda'))

/** search **/
  .use(require('./routes/search'))

/** Modules **/
  .use('/modules/portada', require('./routes/modules/portada'))
  .use('/modules/diputado', require('./routes/modules/diputado'))
  .use('/modules/grupo', require('./routes/modules/grupo'))
  .use('/modules', require('./routes/modules/index'))

  /** Errores **/
  .use(errorStatus, errorRequest);            // Redirecciona los módulos no encontrados a error 404

function index(req, res) {
  res.render('index', {
    'pageActive': "portada"
  });
}

function errorStatus(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

function errorRequest(err, req, res, next) { // Error handler
  res.status(err.status || 500);
  res.render('404', {
      message: err.message,
      error: (app.get('env') === 'development') ? err : {}
    });
}

/*******************************************************************/
/***********     Arrancar servidor HTTP       **********************/
/*******************************************************************/
var server = app.listen(props.nodePort, function() {
  console.log('Server testing listening on port ' + server.address().port);
});

module.exports = app;

