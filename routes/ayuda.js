var props = require(appRoot+'/config.json'),
    express = require('express');

module.exports = express.Router()
  .get('/sigue-diputado', sigue_diputado)
  .get('/colaboradores', colaboradores)
  .get('/mas-informacion-diputados', mas_informacion_diputados);

function sigue_diputado(req, res) {
    res.render('sigue-diputado', {
        'pageActive': "sigue-diputado"
    });
};

function colaboradores(req, res) {
    res.render('colaboradores', {
        'pageActive': "colaboradores"
    });
};

function mas_informacion_diputados(req, res) {
    res.render('mas-informacion-diputados', {
        'pageActive': "mas-informacion-diputados"
    });
};