module.exports = function(args) {
    var xhr = Ti.Network.createHTTPClient({
        timeout :30000,
        onload : function() {
             var end = new Date().getTime();
            console.log('car2go=time=' + ((end - start) / 1000).toFixed(3) + 'sec.');
            args.done && args.done(JSON.parse(this.responseText).marker);
        }
    });
    xhr.open('GET', 'http://stadtrad.hamburg.de/kundenbuchung/hal2ajax_process.php');
    xhr.setRequestHeader('Accept', 'text/javascript, application/javascript');
    xhr.setRequestHeader('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:37.0) Gecko/20100101 Firefox/37.0');
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
        webfirma_id : '510'
    });
    var start = new Date().getTime();
};
