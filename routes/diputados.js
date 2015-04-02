var props = require(global.appRoot+'/config.json'),
    express = require('express'),
    request = require('request');

module.exports = express.Router()
  .get('/diputados', diputados)
  .get('/exdiputados', exdiputados)
  .get('/diputado/:id', diputado)
  .get('/diputado/:id/:tipo', diputado)
  .get('/grupos-parlamentarios', grupos)
  .get('/grupo-parlamentario/:id', grupo)
  .get('/votaciones/:page?', votaciones)
  .get('/votacion/sesion/:sesion/votacion/:votacion', votacion)
  .get('/circunscripciones', circunscripciones)
  .get('/circunscripcion/:id', circunscripcion)
  .get('/organos', organos)
  .get('/organo/:id', organo)
  .get('/comisiones', comisiones)
  .get('/subcomisiones', subcomisiones)
  .get('/iniciativas', iniciativas)
  .get('/iniciativas_', iniciativas_)
  .get('/intervenciones', intervenciones);

function diputados(req, res) {
    console.log('Diputados');
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "diputados"
    };
    request(props.APIUrl + '/diputados?only=["id","nombre","apellidos","normalized","grupo","partido"]', function(error, response, body) {
        request(props.APIUrl + '/grupos?&only=["nombre"]', function(error2, response2, body2) {
            request(props.APIUrl + '/circunscripciones?only=["nombre"]', function(error3, response3, body3) {
                viewObject.diputados = JSON.parse(body);
                viewObject.grupos = JSON.parse(body2);
                viewObject.circunscripciones = JSON.parse(body3);
                res.render('diputados', viewObject);
            });
        });
    });
}

function exdiputados(req, res) {
    console.log('Exdiputados');
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "diputados"
    };
    request(props.APIUrl + '/diputados?q={"activo":0}&only=["id","nombre","apellidos","normalized","grupo","partido","fecha_baja"]', function(error, response, body) {
        viewObject.diputados = JSON.parse(body);
        res.render('exdiputados', viewObject);
    });
}

function diputado(req, res) {
    console.log('Diputado', req.params);
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "diputados"
    };
    var subPageActive = req.params.tipo || "actividad";

    switch (subPageActive) {
        case 'actividad':
            viewObject.subPageActive = 'actividad';
            break;
        case 'vida-laboral':
            viewObject.subPageActive = 'vida-laboral';
            break;
        case 'cargos-congreso':
            viewObject.subPageActive = 'cargos-congreso';
            break;
        case 'declaracion-de-bienes':
            viewObject.subPageActive = 'declaracion-de-bienes';
            break;
        case 'salario':
            viewObject.subPageActive = 'salario';
            break;
        default:
            viewObject.subPageActive = 'actividad';
    }
    //console.log(props.APIUrl+'/diputados?q={"normalized.url":"'+req.params.id+'"}');
    if (!isNaN(req.params.id)) {
        // es por id
        request(props.APIUrl + '/diputado/' + req.params.id, function(error, response, body) {
            viewObject.diputado = JSON.parse(body);
            res.redirect('/diputado/' + viewObject.diputado.normalized.url);
            //res.render('diputado', viewObject );
        });
    } else {
        // es por url
        request(props.APIUrl + '/diputados?q={"normalized.url":"' + req.params.id + '"}', function(error, response, body) {
            viewObject.diputado = JSON.parse(body)[0];
            if (viewObject.diputado.id_sustituto || viewObject.diputado.id_sustituido) {
                if (viewObject.diputado.id_sustituto && viewObject.diputado.id_sustituido) {
                    request(props.APIUrl + '/diputado/' + viewObject.diputado.id_sustituto, function(error, response, body2) {
                        request(props.APIUrl + '/diputado/' + viewObject.diputado.id_sustituido, function(error, response, body3) {
                            viewObject.diputado.diputado_sustituto = JSON.parse(body2);
                            viewObject.diputado.diputado_sustituido = JSON.parse(body3);
                            renderView(viewObject);
                        });
                    });
                } else if (viewObject.diputado.id_sustituto) {
                    request(props.APIUrl + '/diputado/' + viewObject.diputado.id_sustituto, function(error, response, body4) {
                        viewObject.diputado.diputado_sustituto = JSON.parse(body4);
                        renderView(viewObject);
                    });
                } else {
                    request(props.APIUrl + '/diputado/' + viewObject.diputado.id_sustituido, function(error, response, body5) {
                        viewObject.diputado.diputado_sustituido = JSON.parse(body5);
                        renderView(viewObject);
                    });
                }
            } else {
                renderView(viewObject);
            }
            //res.render('diputado',viewObject);
        });

    }

    function renderView(result) {
        res.render('diputado', result);
    }
}

function grupos(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "grupos"
    };
    /* Descomentar cuando haya una portada de grupos parlamentarios
    request( APIUrl+"/grupos", function(error, response, body) {
    viewObject.grupos = JSON.parse(body);
    res.render('gruposParlamentarios', viewObject ); 
  });*/
    request(props.APIUrl + '/grupos?q={"nombre":"Popular"}', function(error, response, body) {
        viewObject.grupo = JSON.parse(body)[0];
        res.render('grupoParlamentario', viewObject);
    });
}

function grupo(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "grupos"
    };
    if (!isNaN(req.params.id)) {
        // es por id
        request(props.APIUrl + "/grupo/" + req.params.id, function(error, response, body) {
            viewObject.grupo = JSON.parse(body);
            res.render('grupoParlamentario', viewObject);
        });
    } else {
        // es por nombre
        request(props.APIUrl + '/grupos?q={"nombre":"' + req.params.id + '"}', function(error, response, body) {
            viewObject.grupo = JSON.parse(body)[0];
            res.render('grupoParlamentario', viewObject);
        });
    }
}

function votaciones(req, res) {
    var pageCount = 30;
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "votaciones"
    };
    request(props.APIUrl + '/votaciones?count=1&limit=' + pageCount + '&skip=' + (pageCount * (req.params.page || 0)), function(error, response, body) {
        var resultBody = JSON.parse(body)
        viewObject.votaciones = resultBody.result;
        viewObject.totalVotaciones = resultBody.totalObjects;
        viewObject.currentPage = req.params.page;

        res.render('votaciones', viewObject);
    });
}

function votacion(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "votaciones"
    };
    request(props.APIUrl + '/votacion/' + req.params.sesion + '/' + req.params.votacion, function(error, response, body) {
        viewObject.votacion = JSON.parse(body)[0];
        res.render('votacion', viewObject);
    });
}

function circunscripciones(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "circunscripciones"
    };
    request(props.APIUrl + "/circunscripciones", function(error, response, body) {
        viewObject.circunscripciones = JSON.parse(body);
        res.render('circunscripciones', viewObject);
    });
}

function circunscripcion(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "circunscripciones"
    };
    if (!isNaN(req.params.id)) {
        // es por id
        request(props.APIUrl + "/circunscripcion/" + req.params.id, function(error, response, body) {
            viewObject.circunscripcion = JSON.parse(body);
            res.render('circunscripcion', viewObject);
        });
    } else {
        // es por nombre
        request(props.APIUrl + '/circunscripciones?q={"normalized.url":"' + req.params.id + '"}', function(error, response, body) {
            viewObject.circunscripcion = JSON.parse(body)[0];
            res.render('circunscripcion', viewObject);
        });
    }
}

function organos(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    var ahora = new Date(Date.now()).toISOString();
    var idorg = 100;
    request(props.APIUrl + '/organos?q={"id":100}', function(error, response, body) {
        request(props.APIUrl + '/organos', function(error2, response2, body2) {
            /*var organo = JSON.parse(body)[0];
            var idorg = organo.id;*/
            request(props.APIUrl + '/diputados?q={"cargos_congreso.idOrgano":' + idorg + '}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
                request(props.APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahoraJS":{"$gte":"' + ahora + '"}}&order={"fechahoraJS":1}&limit=5', function(error4, response4, body4) {
                    request(props.APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahoraJS":{"$lt":"' + ahora + '"}}&order={"fechahoraJS":-1}&limit=5', function(error5, response5, body5) {
                        viewObject.organo = JSON.parse(body)[0];
                        viewObject.organos = JSON.parse(body2);
                        viewObject.diputados = JSON.parse(body3);
                        viewObject.proximos = JSON.parse(body4);
                        viewObject.siguientes = JSON.parse(body5);
                        res.render('organo', viewObject);
                    });
                });
            });
        });
    });
}

function organo(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    var ahora = new Date(Date.now()).toISOString();
    if (!isNaN(req.params.id)) {
        // es por id
        request(props.APIUrl + '/organos?q={"id":' + req.params.id + '}', function(error, response, body) {
            request(props.APIUrl + '/organos', function(error2, response2, body2) {
                request(props.APIUrl + '/diputados?q={"cargos_congreso.idOrgano":' + req.params.id + '}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
                    request(props.APIUrl + '/eventos?q={"organo.id":' + req.params.id + ',"fechahoraJS":{"$gte":"' + ahora + '"}}&order={"fechahoraJS":1}&limit=5', function(error4, response4, body4) {
                        request(props.APIUrl + '/eventos?q={"organo.id":' + req.params.id + ',"fechahoraJS":{"$lt":"' + ahora + '"}}&order={"fechahoraJS":-1}&limit=5', function(error5, response5, body5) {
                            viewObject.organo = JSON.parse(body)[0];
                            viewObject.organos = JSON.parse(body2);
                            viewObject.diputados = JSON.parse(body3);
                            viewObject.proximos = JSON.parse(body4);
                            viewObject.siguientes = JSON.parse(body5);
                            res.render('organo', viewObject);
                        });
                    });
                });
            });
        });
    } else {
        // es por url
        request(props.APIUrl + '/organos?q={"normalized.url":"' + req.params.id + '"}', function(error, response, body) {
            request(props.APIUrl + '/organos', function(error2, response2, body2) {
                var organo = JSON.parse(body)[0];
                var idorg = organo.id;
                request(props.APIUrl + '/diputados?q={"cargos_congreso.idOrgano":' + idorg + '}&only=["id","nombre","apellidos","grupo","sexo","cargos_congreso"]', function(error3, response3, body3) {
                    request(props.APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahoraJS":{"$gte":"' + ahora + '"}}&order={"fechahoraJS":1}&limit=5', function(error4, response4, body4) {
                        request(props.APIUrl + '/eventos?q={"organo.id":' + idorg + ',"fechahoraJS":{"$lt":"' + ahora + '"}}&order={"fechahoraJS":-1}&limit=5', function(error5, response5, body5) {
                            viewObject.organo = JSON.parse(body)[0];
                            viewObject.organos = JSON.parse(body2);
                            viewObject.diputados = JSON.parse(body3);
                            viewObject.proximos = JSON.parse(body4);
                            viewObject.siguientes = JSON.parse(body5);
                            res.render('organo', viewObject);
                        });
                    });
                });
            });
        });
    }
}

function comisiones(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    request(props.APIUrl + '/organos?q={"tipo":"^C"}&order={"nombre":1}', function(error, response, body) {
        viewObject.comisiones = JSON.parse(body);
        res.render('comisiones', viewObject);
    });
}

function subcomisiones(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "organos"
    };
    request(props.APIUrl + '/organos?q={"tipo":"^S"}&order={"nombre":1}', function(error, response, body) {
        viewObject.subcomisiones = JSON.parse(body);
        res.render('subcomisiones', viewObject);
    });
}

function iniciativas(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "iniciativas"
    };
    request(props.APIUrl + '/iniciativas?limit=30&order={"presentadoJS2":"-1"}&count=1', function(error, response, body) {
        request(props.APIUrl + '/diputados?q={"activo":{"$in":[0,1]}}&only=["id","nombre","apellidos"]', function(error2, response2, body2) {
            request(props.APIUrl + '/grupos?only=["nombre","id"]', function(error3, response3, body3) {
                viewObject.iniciativas = JSON.parse(body).result;
                viewObject.numIniciativas = parseInt(JSON.parse(body).totalObjects);
                viewObject.diputados = JSON.parse(body2);
                viewObject.grupos = JSON.parse(body3);
                res.render('iniciativas', viewObject);
            });
        });
    });
}

function iniciativas_(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "iniciativas"
    };
    request(props.APIUrl + '/iniciativas?limit=30&order={"presentadoJS2":"-1"}&count=1', function(error, response, body) {
        request(props.APIUrl + '/diputados?q={"activo":{"$in":[0,1]}}&only=["id","nombre","apellidos"]', function(error2, response2, body2) {
            request(props.APIUrl + '/grupos?only=["nombre","id"]', function(error3, response3, body3) {
                viewObject.iniciativas = JSON.parse(body).result;
                viewObject.numIniciativas = parseInt(JSON.parse(body).totalObjects);
                viewObject.diputados = JSON.parse(body2);
                viewObject.grupos = JSON.parse(body3);
                res.render('iniciativas_', viewObject);
            });
        });
    });
}

function intervenciones(req, res) {
    var viewObject = {
        "originalURL": req.originalUrl,
        'pageActive': "intervenciones"
    };
    request(props.APIUrl + '/intervenciones?limit=30&order={"fechahora":"-1"}&count=1', function(error, response, body) {
        request(props.APIUrl + '/diputados?q={"activo":{"$in":[0,1]}}&only=["id","nombre","apellidos"]', function(error2, response2, body2) {
            request(props.APIUrl + '/organos?q={"tipo":"^C"}&only=["pre","nombre","id"]', function(error3, response3, body3) {
                viewObject.intervenciones = JSON.parse(body).result;
                viewObject.numIntervenciones = parseInt(JSON.parse(body).totalObjects);
                viewObject.diputados = JSON.parse(body2);
                viewObject.comisiones = JSON.parse(body3);
                res.render('intervenciones', viewObject);
            });
        });
    });
}

