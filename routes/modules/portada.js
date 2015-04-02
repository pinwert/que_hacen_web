var props = require(appRoot+'/config.json'),
    express = require('express');

module.exports = express.Router()
  .get('/ultimos-posts/:posts', ultimos_posts)
  .get('/ultimas-iniciativas/:limit', ultimas_iniciativas)
  .get('/ultimas-votaciones/:limit', ultimas_votaciones)
  .get('/actividad/mas-iniciativas/:limit', mas_iniciativas)
  .get('/actividad/menos-iniciativas/:limit', menos_iniciativas);
 
function ultimas_iniciativas(req, res) {
    if (!req.params.limit || isNaN(req.params.limit)) {
        req.params.limit = 2;
    }
    request(props.APIUrl + "/iniciativas?limit=" + parseInt(req.params.limit) + '&order={"presentadoJS2":-1}', function(error, response, body) {
        res.render('modules/ultimas-iniciativas-portada', {
            'iniciativas': JSON.parse(body).result
        });
    });
};

function ultimas_votaciones(req, res) {
    if (!req.params.limit || isNaN(req.params.limit)) {
        req.params.limit = 2;
    }
    request(props.APIUrl + "/votaciones?limit=" + parseInt(req.params.limit), function(error, response, body) {
        res.render('modules/ultimas-votaciones-portada', {
            'votaciones': JSON.parse(body).result
        });
    });
};

function ultimos_posts(req, res) {
    rsj.r2j(BLOGUrl+'/feed/', function(err, json) {
        //res.send(JSON.parse(json));
        if (err) {
            res.send('POSTS error\n'+err);
        }
        var posts = JSON.parse(json);
        var postCollection = [];
        var totalPosts = (parseInt(req.params.posts)) ? parseInt(req.params.posts) : posts.length;
        for (var i = 0, last = totalPosts; i < last; i++) {
            postCollection.push(posts[i]);
        }
        res.render('modules/ultimos-posts', {
            'posts': postCollection
        });
    });
}

function mas_iniciativas(req, res) {
    if (!req.params.limit || isNaN(req.params.limit)) {
        req.params.limit = 10;
    }
    request(props.APIUrl + '/diputados?limit=' + parseInt(req.params.limit) + '&order={"actividad.iniciativas.total":-1}&only=["id","nombre","apellidos","partido","actividad.iniciativas.total"]', function(error, response, body) {
        res.render('modules/mas-iniciativas', {
            'diputados': JSON.parse(body)
        });
    });
}

function menos_iniciativas(req, res) {
    if (!req.params.limit || isNaN(req.params.limit)) {
        req.params.limit = 10;
    }
    request(props.APIUrl + '/diputados?limit=' + parseInt(req.params.limit) + '&order={"actividad.iniciativas.total":1}&only=["id","nombre","apellidos","partido","actividad.iniciativas.total"]', function(error, response, body) {
        res.render('modules/menos-iniciativas', {
            'diputados': JSON.parse(body)
        });
    });
}
