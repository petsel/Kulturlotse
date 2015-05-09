module.exports = function(args) {
   var xhr = Ti.Network.createHTTPClient({
       onload : function() {
          args.done && args.done(JSON.parse(this.responseText).placemarks);
       }
   });
   xhr.open('GET','https://www.car2go.com/api/v2.1/vehicles?loc=hamburg&oauth_consumer_key=car2gowebsite&format=json');
   xhr.send();
 
};
