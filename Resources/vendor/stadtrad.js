var Module = function() {
    var self = Ti.Network.createHTTPClient();
    xhr.open('GET', 'http://stadtrad.hamburg.de/kundenbuchung/hal2ajax_process.php');
    xhr.send({
        zoom : 10,
        lng1 : '',
        lat1 : '',
        lng2 : '',
        lat2 : '',
        stadtCache : '',
        mapstation_id : '',
        mapstadt_id : 75,
        verwaltungfirma : '',
        centerLng : 9.986872299999959,
        centerLat : 53.56661530000001,
        searchmode : 'default',
        with_staedte : 'N',
        buchungsanfrage : 'N',
        bereich : 2,
        stoinput : '',
        before : '',
        after : '',
        ajxmod : 'hal2map',
        callee : 'getMarker',
        requester : 'index',
        key : '',
        webfirma_id : 510
    });

};

module.exports =Module;