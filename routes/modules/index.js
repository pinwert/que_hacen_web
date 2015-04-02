var props = require(appRoot+'/config.json'),
    request = require('request'),
    express = require('express');

module.exports = express.Router()
  .get('/exdiputados', exdiputados)
  .get('/circunscripcion/:id/diputados', diputados_circunscripcion)
  .get('/grupos/list', grupos_list)
  .get('/formaciones', formaciones_grupo)
  .get('/organo/:id/diputados', diputados_organo)
  .get('/organos/list', organos_list);

//var rsj = require('rsj');
//var _ = require('lodash');
//var _String = require('underscore.string');

function diputados(req, res) {
    request(props.APIUrl + '/diputados', function(error, response, body) {
        res.render('modules/diputados', {
            'diputados': JSON.parse(body)
        });
    });
}

function exdiputados(req, res) {
    request(props.APIUrl + '/diputados', function(error, response, body) {
        res.render('modules/exdiputados', {
            'diputados': JSON.parse(body)
        });
    });
}

function diputados_circunscripcion(req, res) {
    request(props.APIUrl + '/circunscripcion/' + req.params.id + '/diputados', function(error, response, body) {
        res.render('modules/diputados', {
            'diputados': JSON.parse(body)
        });
    });
}

function organos_list(req, res) {
    request(props.APIUrl + '/organos', function(error, response, body) {
        res.render('modules/organosList', {
            'organos': JSON.parse(body),
            'active': req.query.active
        });
    });
}

function grupos_list(req, res) {
    request(props.APIUrl + '/grupos', function(error, response, body) {
        res.render('modules/gruposList', {
            'grupos': JSON.parse(body),
            'active': req.query.active
        });
    });
}

function formaciones_grupo(req, res) {

    var formaciones = req.query.formaciones.split(',');

    function arrayString(arr) {
        var r = [];
        arr.forEach(function(i) {
            r.push('"' + i + '"');
        });
        return r.toString();
    }

    request(props.APIUrl + '/formaciones?q={"nombre":{"$in":[' + arrayString(formaciones) + ']}}', function(error, response, body) {
        res.render('modules/grupo-formaciones', {
            'formaciones': JSON.parse(body)
        });
    });
}

function diputados_organo(req, res) {
    request(props.APIUrl + '/diputados?q={"cargos_congreso.idOrgano":' + req.params.id + '}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso","partido","normalized"]', function(error, response, body) {
        res.render('modules/diputadosOrg', {
            'diputados': JSON.parse(body),
            "idorgano": req.params.id
        });
    });
}
