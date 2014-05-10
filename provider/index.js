var elasticsearch = require('elasticsearch');
var client        = new elasticsearch.Client({
    host      : process.env.ELASTICSEARCH_HOST + ':' + process.env.ELASTICSEARCH_PORT,
    log       : process.env.ELASTICSEARCH_LOG,
    apiVersion: '1.1'
});

function ping() {
    client.ping({
        requestTimeout: 1000
    }, function(err, res) {
        console.log('pong');
    });
}

function add(postId, postDate, geoType, userHandle, postText, longitude, latitude, data) {
    client.create({
        index: 'found',
        type : 'tweet',
        id   : postId,
        body : {
            postId    : postId,
            postDate  : postDate,
            postText  : postText,
            userHandle: userHandle,
            longitude : longitude,
            latitude  : latitude,
            geoType   : geoType,
            data      : data
        }
    }, function (error, response) {
        if (!error) {
            console.log('[SUCCESS] Provider.add ' + response._id + ' [' + geoType + ' on ' + postDate + ' @' + userHandle + ' ' + longitude + ',' + latitude + '] ' + postText);
        } else {
            console.log('[ERROR]   Provider.add ' + error.toString() + ' [' + geoType + ' on ' + postDate + ' @' + userHandle + ' ' + longitude + ',' + latitude + '] ' + postText);
        }

    });

}

function search(keyword, minLongitude, maxLongitude, minLatitude, maxLatitude, callback) {
    client.search({
        index: 'found',
        body: {
            fields : ['postId', 'longitude', 'latitude'],
            query  : {
                simple_query_string : {
                    query           : keyword,
                    fields          : ['postText'],
                    default_operator: 'and'
                }
            },
            filter : {
                and : [{
                    "numeric_range": {
                        "longitude": {
                            "gte": minLongitude,
                            "lte": maxLongitude
                        }
                    }
                },
                {
                    "numeric_range": {
                        "latitude" : {
                            "gte": minLatitude,
                            "lte": maxLatitude
                        }
                    }
                }]
            },
            sort: {postId: 'desc'}
        }

    }, function (error, response) {
        if (!error) {
            console.log('[SUCCESS] Provider.search ' + response.hits.total + ' hit(s) for query "' + keyword + '"');
        } else {
            console.log('[ERROR]   Provider.search ' + error);
        }
        callback(error, response);
    });

}

module.exports.ping   = ping;
module.exports.add    = add;
module.exports.search = search;