var Module=function(){return this.eventhandlers=[],this};Module.prototype={getLocation:function(){var e=this;Ti.Geolocation.locationServicesEnabled?(Ti.Geolocation.purpose="Deine Position für Routingberechnung",Ti.Geolocation.getCurrentPosition(function(a){a.error?Ti.API.error("Error: "+a.error):(e.coords=a.coords,e.fireEvent("position",{coords:a.coords}))})):console.log("locationServicesEnabled = false")},getLatLng:function(e){var a=this,n="https://maps.googleapis.com/maps/api/geocode/json?&sensor=true&address="+encodeURIComponent(e);console.log(n),xhr=Ti.Network.createHTTPClient(),xhr.onload=function(){var e=JSON.parse(this.responseText);"OK"==e.status&&a.fireEvent("latlng",e.results[0].geometry.location)},xhr.open("GET",n),xhr.send()},getAddress:function(e){var a="https://maps.googleapis.com/maps/api/geocode/json?&sensor=true&latlng="+e.latitude+","+e.longitude;xhr=Ti.Network.createHTTPClient(),xhr.onload=function(){try{var e=JSON.parse(this.responseText);e.results[0].address_components.forEach(function(){})}catch(a){console.log("Warning: problem with google geocoding")}},xhr.open("GET",a),xhr.send()},getRoute:function(e,a){var n=this,r="https://maps.googleapis.com/maps/api/directions/json?language=de&mode="+Ti.App.Properties.getString("MODE","walking")+"&origin="+e.latitude+","+e.longitude+"&destination="+a+"&sensor=false";xhr=Ti.Network.createHTTPClient(),xhr.onload=function(){try{var e=JSON.parse(this.responseText);n.fireEvent("route",{route:e.routes[0]})}catch(a){console.log(a),console.log("Warning: problem with google direction geocoding")}},xhr.open("GET",r.replace(/\s/g,"+")),xhr.setRequestHeader("Accept","application/json"),xhr.send()},fireEvent:function(e,a){if(this.eventhandlers[e])for(var n=0;n<this.eventhandlers[e].length;n++)this.eventhandlers[e][n].call(this,a)},addEventListener:function(e,a){this.eventhandlers[e]||(this.eventhandlers[e]=[]),this.eventhandlers[e].push(a)},removeEventListener:function(e,a){if(this.eventhandlers[e]){var n=this.eventhandlers[e].filter(function(e){return e!=a});this.eventhandlers[e]=n}}},module.exports=Module;