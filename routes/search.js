var props = require(global.appRoot+'/config.json'),
    express = require('express'),
    async = require('async'),
    request_vendor = require('request'),
    _ = require('lodash');;

module.exports = express.Router()
    .get('/search', search)
    .get('/autocomplete', autocomplete);

function request(url, callback) {
    var ts = new Date().getTime();
    request_vendor(url, function(error, response, body) {
    console.log('Peticion HTTP: '+ url +' Status: '+(response ? response.statusCode : '500')+' Tiempo: '+(new Date().getTime() - ts));
        if (error){
          return callback(error, response);
        }
        else if(response.statusCode > 399) {
          var err = new Error(response.statusCode, url);
          return callback(err, response);
        }
        return callback(null, response, body);
    });
} 

function search(req, res) {
    var _query =  JSON.stringify(req.query.q);

    async.parallel([
        //diputados
        function(callback) {
            request(props.APIUrl + '/diputados?q=[{"nombre":' + _query + '},{"apellidos":' + _query + '}]&only=["id","nombre","apellidos","normalized", "grupo", "partido"]&limit=20', function(err, response, body) {
                var _res = JSON.parse(body);
                callback(err, (_res.length) ? {
                    "diputados": _res
                } : null);
            });
        },
        //votaciones
        function(callback) {
            request(props.APIUrl + '/votaciones?q=[{"xml.resultado.informacion.textoexpediente":' + _query + '},{"xml.resultado.informacion.titulo":' + _query + '}]&not=["xml.resultado.votaciones"]&limit=20&count=1', function(err, response, body) {
                var _res = JSON.parse(body);
                callback(err, (_res && _res.result.length) ? {
                    "votaciones": _res
                } : null);
            });
        },
        //iniciativas
        function(callback) {
            request(props.APIUrl + '/iniciativas?q=[{"titulo":' + _query + '}]&count=1&limit=20', function(err, response, body) {
                var _res = JSON.parse(body);
                callback(err, (_res && _res.result.length) ? {
                    "iniciativas": _res
                } : null);
            });
        },
        //circunscripciones
        function(callback) {
            request(props.APIUrl + '/circunscripciones?q=[{"nombre":' + _query + '}]&not=["totales_votacion","desglose_votacion"]', function(err, response, body) {
                var _res = JSON.parse(body);
                callback(err, (_res.length) ? {
                    "circunscripciones": _res
                } : null);
            });
        },
        //grupos
        function(callback) {
            request(props.APIUrl + '/grupos?q=[{"nombre":' + _query + '}]&not=["formaciones","iniciativas"]&limit=20', function(err, response, body) {
                var _res = JSON.parse(body);
                callback(err, (_res.length) ? {
                    "grupos": _res
                } : null);
            });
        },
        //organos
        function(callback) {
            request(props.APIUrl + '/organos?q=[{"nombre":' + _query + '}]&only=["nombre","normalized"]', function(err, response, body) {
                var _res = JSON.parse(body);
                callback(err, (_res.length) ? {
                    "organos": _res
                } : null);
            });
        }

    ], function(err, _results) {
        if(err){
            res.send(err);
            return;
        }
        _results = _.compact(_results);
        var totalObjects = _.reduce(_results, function(memo, result, key) {
            var _res = (_.isArray(result[_.keys(result)[0]])) ? result[_.keys(result)[0]] : result[_.keys(result)[0]].result
            return memo + _res.length;
        }, 0);
        res.render('search', {
            'search': {
                totalResults: totalObjects,
                query: _query.replace(/"/g, ''), //req.query.q,
                results: _results,
                error: err
            }
        });
    });
}

function autocomplete(req, res) {
    var _query =  JSON.stringify(req.query.q);

    async.parallel([
        //diputados
        function(callback) {
            request(props.APIUrl + '/diputados?q=[{"normalized.url":"'+ _query.replace(/[^-A-Za-z0-9]+/g, '-').toLowerCase().substring(1,_query.length-2)+'"}]&only=["id","nombre","apellidos","normalized", "grupo", "partido"]&limit=5', function(err, response, body) {
                var _res = JSON.parse(body);
                var aux = {text: "diputados", children: []}
                if(_res.length){
                    _res.forEach(function(a,i){
                        aux.children.push({
                            text: a.nombre+' '+a.apellidos,
                            partido: a.grupo,
                            id:'/diputado/'+a.normalized.url       
                        });                      
                    });
                }
                callback(err, (_res.length) ? aux : null);
            });
        },
        //votaciones
        function(callback) {
            request(props.APIUrl + '/votaciones?q=[{"xml.resultado.informacion.textoexpediente":' + _query + '},{"xml.resultado.informacion.titulo":' + _query + '}]&not=["xml.resultado.votaciones"]&limit=5&count=1', function(err, response, body) {
                var _res = JSON.parse(body);
                var aux = {text: "votaciones", children: []}
                if(_res && _res.result.length){
                    _res.result.forEach(function(a,i){
                        aux.children.push({
                            text: a.xml.resultado.informacion.titulo,
                            id: '/votacion/sesion/'+a.xml.resultado.informacion.sesion+'/votacion/'+a.xml.resultado.informacion.numerovotacion
                        });                      
                    });
                }
                callback(err, (_res && _res.result.length) ? aux : null);
            });
        },
        //iniciativas
        function(callback) {
            request(props.APIUrl + '/iniciativas?q=[{"titulo":' + _query + '}]&count=1&limit=5', function(err, response, body) {
                var _res = JSON.parse(body);
                var aux = {text: "iniciativas", children: []}
                if(_res && _res.result.length){
                    _res.result.forEach(function(a,i){
                        aux.children.push({
                            text: a.titulo,
                            id:'/iniciativas/'+a.num_expediente       
                        });                      
                    });
                }
                callback(err, (_res && _res.result.length) ? aux : null);
            });
        },
        //circunscripciones
        function(callback) {
            request(props.APIUrl + '/circunscripciones?q=[{"nombre":' + _query + '}]&not=["totales_votacion","desglose_votacion"]&limit=5', function(err, response, body) {
                var _res = JSON.parse(body);
                var aux = {text: "circunscripciones", children: []}
                if(_res.length){
                    _res.forEach(function(a,i){
                        aux.children.push({
                            text: a.nombre,
                            id:'/circunscripcion/'+a.normalized.url  
                        });                      
                    });
                }
                callback(err, (_res.length) ? aux : null);
            });
        },
        //grupos
        function(callback) {
            request(props.APIUrl + '/grupos?q=[{"nombre":' + _query + '}]&not=["formaciones","iniciativas"]&limit=5', function(err, response, body) {
                var _res = JSON.parse(body);
                var aux = {text: "grupos", children: []}
                if(_res.length){
                    _res.forEach(function(a,i){
                        aux.children.push({
                            text: a.nombre,
                            id:'/grupo-parlamentario/'+a.normalized.url       
                        });                      
                    });
                }
                callback(err, (_res.length) ? aux : null);
            });
        },
        //organos
        function(callback) {
            request(props.APIUrl + '/organos?q=[{"nombre":' + _query + '}]&only=["nombre","normalized"]&limit=5', function(err, response, body) {
                var _res = JSON.parse(body);
                var aux = {text: "organos", children: []}
                if(_res.length){
                    _res.forEach(function(a,i){
                        aux.children.push({
                            text: a.nombre,
                            id:'/organos/'+a.normalized.url
                        });                      
                    });
                }
                callback(err, (_res.length) ? aux : null);
            });
        }

    ], function(err, _results) {
        if(err){
            console.log(err);
            res.send(err);
            return;
        }
        res.send(_.compact(_results));
    });
}