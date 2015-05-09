const RASTER=25;var Module=function(){var e=arguments[0]||{};return this.DB=e.databasename||console.log("Error: database is missing for markermanager."),this.map=e.map||console.log("Error: map is missing for markermanager."),this.tablename=e.tablename,this.eventhandlers={},this.map.addEventListener("regionchanged",this.updateMap).bind(this),this};Module.prototype={updateMap:function(){for(var e=arguments[0]||{},a=Ti.Database.open(this.DB),n=a.execute("SELECT * FROM `"+this.tablename+"` WHERE lat>? AND lat<? AND lng>? AND lng<?",e.latitude-e.latitudeDelta,e.latitude+e.latitudeDelta,e.longitude-e.longitudeDelta,e.longitude+e.longitudeDelta),r=[];n.isValidRow();)r.push({lat:parseFloat(n.getFieldByName("lat")),lng:parseFloat(n.getFieldByName("lng")),name:n.getFieldByName("name"),id:n.getFieldByName("rowid")}),n.next();n.close(),a.close();var i=(e.longitudeDelta/RASTER,e.latitudeDelta/RASTER,{});r.forEach(function(a){var n=Math.floor((a.lng-e.longitude-e.longitudeDelta/2)/RASTER),r=Math.floor((a.lat+e.latitude-e.latitudeDelta/2)/RASTER),t=""+n+r;i[t]?i[t].push(a):i[t]=[a]})},fireEvent:function(e,a){if(this.eventhandlers[e])for(var n=0;n<this.eventhandlers[e].length;n++)this.eventhandlers[e][n].call(this,a)},addEventListener:function(e,a){this.eventhandlers[e]||(this.eventhandlers[e]=[]),this.eventhandlers[e].push(a)},removeEventListener:function(e,a){if(this.eventhandlers[e]){var n=this.eventhandlers[e].filter(function(e){return e!=a});this.eventhandlers[e]=n}}},module.exports=Module;