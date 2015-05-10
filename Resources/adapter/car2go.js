module.exports = function(args) {
    var xhr = Ti.Network.createHTTPClient({
        timeout :30000,
        onload : function() {
            var end = new Date().getTime();
            console.log('car2go=time=' + ((end - start) / 1000).toFixed(3) + 'sec.');
            args.done && args.done(JSON.parse(this.responseText).placemarks);
        }
    });
    xhr.open('GET', 'https://www.car2go.com/api/v2.1/vehicles?loc=hamburg&oauth_consumer_key=car2gowebsite&format=json');
    xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
    xhr.setRequestHeader('Accept', 'text/javascript, application/javascript');
    xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:37.0) Gecko/20100101 Firefox/37.0');
    xhr.send();
    var start = new Date().getTime();
};
