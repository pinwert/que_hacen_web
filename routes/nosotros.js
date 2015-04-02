var props = require(appRoot+'/config.json'),
    express = require('express');

module.exports = express.Router()
  .get('/quienes-somos', nosotros)
  .get('/financiacion', como_nos_financiamos)
  .get('/agradecimientos', agradecimientos)
  .get('/politica-privacidad', politica_privacidad)
  .get('/condiciones-uso', condiciones_uso)
  .get('/donde-encontrarnos', donde_encontrarnos)
  .get('/agenda', agenda);

function nosotros(req, res) {
    res.render('nosotros', {
        'pageActive': "quienesSomos"
    });
};

function donde_encontrarnos(req, res) {
    res.render('donde-encontrarnos', {
        'pageActive': "donde-encontrarnos"
    });
};

function como_nos_financiamos(req, res) {
    res.render('financiacion', {
        'pageActive': "como-nos-financiamos"
    });
};

function agradecimientos(req, res) {
    res.render('agradecimientos', {
        'pageActive': "agradecimientos"
    });
};

function condiciones_uso(req, res) {
    res.render('condicionesUso', {
        'pageActive': "condiciones-uso"
    });
};

function politica_privacidad(req, res) {
    res.render('privacidad', {
        'pageActive': "politica-privacidad"
    });
};

function agenda(req, res) {
    res.render('agenda', {
        'pageActive': "agenda"
    });
};
