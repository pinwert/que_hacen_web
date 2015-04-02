var props = require(appRoot+'/config.json'),
    request = require('request'),
    express = require('express');

module.exports = express.Router()
  .get('/:id/diputados', diputados)
  .get('/:id/iniciativas/:limit', iniciativas);

function diputados(req, res) {
    request(props.APIUrl + '/grupo/' + req.params.id + '/diputados', function(error, response, body) {
        res.render('modules/diputadosGP', {
            'diputados': JSON.parse(body)
        });
    });
}

function iniciativas(req, res) {
    request(props.APIUrl + '/grupo/' + req.params.id + '/iniciativas?limit=' + req.params.limit + '&order={"presentadoJS2":"-1"}', function(error, response, body) {
        res.render('modules/ultimas-iniciativas', {
            'iniciativas': JSON.parse(body)
        });
    });
}