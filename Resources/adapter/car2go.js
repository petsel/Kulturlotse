const π = Math.PI;

function getDist(lat1, lon1, lat2, lon2) {
    var radlat1 = π * lat1 / 180;
    var radlat2 = π * lat2 / 180;
    var radlon1 = π * lon1 / 180;
    var radlon2 = π * lon2 / 180;
    var radtheta = π * (lon1 - lon2) / 180;
    return Math.round(1000*Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)) * 180 / Math.PI * 60 * 1.1515 * 1.609344);
}

exports.load = function(args) {
    var xhr = Ti.Network.createHTTPClient({
        timeout : 30000,
        onload : function() {
            var end = new Date().getTime();
            Ti.App.Properties.setList('CAR2GO', JSON.parse(this.responseText).placemarks);
            args.done && args.done(JSON.parse(this.responseText).placemarks);
        }
    });
    xhr.open('GET', 'https://www.car2go.com/api/v2.1/vehicles?loc=hamburg&oauth_consumer_key=car2gowebsite&format=json');
    xhr.setRequestHeader('Accept', 'text/javascript, application/javascript');
    xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:37.0) Gecko/20100101 Firefox/37.0');
    xhr.send();
    var start = new Date().getTime();
};

exports.get = function(args) {
    var Geo = new (require('vendor/georoute'))();
    Geo.getLocation({
        done : function(_e) {
            var car2golist = Ti.App.Properties.getList('CAR2GO', []);
            for (var i = 0; i < car2golist.length; i++) {
                car2golist[i].dist = getDist(car2golist[i].coordinates[1], car2golist[i].coordinates[0], _e.coords.latitude, _e.coords.longitude);
            }
            car2golist.sort(function(a, b) {
                return parseFloat(a.dist) - parseFloat(b.dist);
            });
            args.done && args.done(car2golist);
        }
    });

};
