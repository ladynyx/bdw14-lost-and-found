var util     = require('util');
var express  = require('express');
var provider = require(__dirname + '/provider');
var service  = express();

service.all('/*', function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});

service.get('/search', function(request, response) {
    var queryString  = request.query.queryString;
    var minLongitude = request.query.minLongitude || -180;
    var maxLongitude = request.query.maxLongitude || 180;
    var minLatitude  = request.query.minLatitude  || -90;
    var maxLatitude  = request.query.maxLatitude  || 90;
    provider.search(queryString, minLongitude, maxLongitude, minLatitude, maxLatitude, function(error, results) {
        var responseData = [];
        if (results.hits && results.hits.hits) {
            for (resultKey in results.hits.hits) {
                var result = results.hits.hits[resultKey];
                if (result.fields && result.fields.postId) {
                    responseData.push({
                        'id'       : result.fields.postId[0],
                        'longitude': result.fields.longitude[0],
                        'latitude' : result.fields.latitude[0]
                    });
                }

            }
        }

        response.send(responseData);
    });

});

service.listen(80);