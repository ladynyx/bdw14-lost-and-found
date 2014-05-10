var twitter  = require('twitter');
var util     = require('util');
var provider = require(__dirname + '/provider');

var twit = new twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

twit.stream('statuses/filter', {
    track: 'found a,found an,found some'
}, function(stream) {
    stream.on('data', function(data) {

        // Filter out retweets
        if (!data.retweeted_status) {
            var geoType    = null;
            var longitude  = null;
            var latitude   = null;
            if (data.coordinates && data.coordinates.coordinates) {
                geoType = 'coordinate';
                if (data.coordinates.coordinates[0]) {
                    longitude = data.coordinates.coordinates[0];
                }

                if (data.coordinates.coordinates[1]) {
                    latitude = data.coordinates.coordinates[1];
                }

            } else if (data.place && data.place.bounding_box && data.place.bounding_box.coordinates) {
                geoType = 'place';
                if (data.place.bounding_box.coordinates[0]) {
                    if (data.place.bounding_box.coordinates[0][0]) {
                        var longitudeSum = data.place.bounding_box.coordinates[0][0][0] + data.place.bounding_box.coordinates[0][3][0];
                        var longitude    = longitudeSum/2;
                    }

                    if (data.place.bounding_box.coordinates[0][3]) {
                        var latitudeSum = data.place.bounding_box.coordinates[0][0][1] + data.place.bounding_box.coordinates[0][3][1];
                        var latitude    = latitudeSum/2;
                    }

                }

            }

            // Filter out tweets without geo location
            if (geoType && latitude && longitude && data.id_str && data.created_at && data.user.screen_name && data.text) {
                provider.add(data.id_str, data.created_at, geoType, data.user.screen_name, data.text, longitude, latitude, data);
            }

        }

    });

});