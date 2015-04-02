var props = require(appRoot+'/config.json'),
    request = require('request'),
    express = require('express');

module.exports = express.Router()
  .get('/:id/tags', diputado_web_tags)
  .get('/:id/bienes', diputado_bienes)
  .get('/:id/actividad', diputado_actividad)
  .get('/:id/vida-laboral', diputado_vida_laboral)
  .get('/:id/cargos-congreso', diputado_cargos_congreso)
  .get('/:id/salario', diputado_salario)
  .get('/:id/iniciativas/:limit', iniciativas_diputado)
  .get('/:id/votaciones', diputado_votaciones);
 
function diputado_web_tags(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id, function(error, response, body) {
        var data = JSON.parse(body);
        var dipURL = _String.slugify(data.nombre + ' ' + data.apellidos);
        rsj.r2j(BLOGUrl + '/tag/' + dipURL + '/feed/', function(err, json) {
            //res.send(JSON.parse(json));
            if (err) {
                res.end();
            }
            res.render('modules/diputado-tags', {
                'tags': JSON.parse(json)
            });
        });
    });
}

function diputado_bienes(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id + '/bienes?order={"tipo":1,"tipoBIU":1,"concepto":1}', function(error, response, body) {
        var grouped = _.groupBy(JSON.parse(body), function(bien) {
            return bien.tipo;
        });
        res.render('modules/diputado-bienes', {
            'bienes': grouped
        });
    });
}

function diputado_actividad(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id + '?only=["actividad","id","nombre","apellidos"]', function(error, response, body) {
        var respData = JSON.parse(body);
        res.render('modules/diputado-actividad-parlamentaria', {
            'actividad': respData.actividad,
            'votaciones': respData.actividad.votaciones,
            'diputado': {
                id: respData.id,
                nombre: respData.nombre,
                apellidos: respData.apellidos
            }
        });
    });
}

function diputado_vida_laboral(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id + '?only=["trayectoria","legislaturas","estudios","cargos_partido","cargos_gobierno","id","nombre","apellidos"]', function(error, response, body) {
        var respData = JSON.parse(body);
        res.render('modules/diputado-vida-laboral', {
            'estudios': respData.estudios,
            'trayectoria': respData.trayectoria,
            'cargos_partido': respData.cargos_partido,
            'cargos_gobierno': respData.cargos_gobierno,
            'legislaturas': respData.legislaturas,
            'diputado': {
                id: respData.id,
                nombre: respData.nombre,
                apellidos: respData.apellidos
            }
        });
    });
}

function diputado_cargos_congreso(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id + '?q={"cargos_congreso.baja":{"$exists":true}}&only=["cargos_congreso","id","nombre","apellidos","sexo"]', function(error, response, body) {
        request(props.APIUrl + '/diputados?q={"id":' + req.params.id + ',"cargos_congreso.baja" :{"$exists":false}}&only=["cargos_congreso"]', function(error2, response2, body2) {
            request(props.APIUrl + '/organos', function(error3, response3, body3) {
                var respData = JSON.parse(body);
                var respData2 = JSON.parse(body2);
                var respData3 = JSON.parse(body3);
                res.render('modules/diputado-cargos-congreso', {
                    'cargos_act': respData.cargos_congreso,
                    'cargos_hist': respData2.cargos_congreso,
                    'organos': respData3,
                    'diputado': {
                        id: respData.id,
                        nombre: respData.nombre,
                        apellidos: respData.apellidos,
                        sexo: respData.sexo
                    }
                });
            });
        });
    });
}

function diputado_salario(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id + '?only=["sueldo","url_nomina","id","nombre","apellidos"]', function(error, response, body) {
        var respData = JSON.parse(body);
        res.render('modules/diputado-salario', {
            'salario': respData.sueldo,
            'url_nomina': respData.url_nomina,
            'diputado': {
                id: respData.id,
                nombre: respData.nombre,
                apellidos: respData.apellidos
            }
        });
    });
}

function diputado_votaciones(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id + '/votaciones?limit=5', function(error, response, body) {
        //console.log(JSON.parse(body));
        res.render('modules/diputado-votaciones', {
            'votaciones': JSON.parse(body)
        });
    });
}

function iniciativas_diputado(req, res) {
    request(props.APIUrl + '/diputado/' + req.params.id + '/iniciativas?limit=' + req.params.limit + '&order={"presentadoJS2":"-1"}', function(error, response, body) {
        res.render('modules/ultimas-iniciativas', {
            'iniciativas': JSON.parse(body)
        });
    });
}
