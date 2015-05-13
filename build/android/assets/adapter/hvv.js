var Module=function(){var e=Ti.Database.open(Ti.App.Properties.getString("DATABASE"));e.execute("CREATE TABLE IF NOT EXISTS hvv (name TEXT UNIQUE,lat NUMBER, lng NUMBER)");var t=e.execute("SELECT count(*) FROM hvv");if(t.isValidRow()&&0==t.field(0)){var o=Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory,"model","hvv.csv").read().text,a=require("vendor/parseCSV")(o),i=[];a.forEach(function(e){var t=require("vendor/gk2geo")({rw:e[1],hw:e[2]});i.push({name:e[0],lat:t.lat-.00154,lng:t.lng-.001206})}),e.execute("BEGIN"),i.forEach(function(t){e.execute("INSERT OR REPLACE INTO hvv VALUES (?,?,?)",t.name,t.lat,t.lng)}),e.execute("COMMIT")}return t.close(),e.close(),this};Module.prototype={getStations:function(){for(var e=arguments[0]||{},t=.6*e.longitudeDelta,o=.6*e.latitudeDelta,a=Ti.Database.open(Ti.App.Properties.getString("DATABASE")),i=a.execute("SELECT rowid,lat,lng,name FROM `hvv` WHERE lat>? AND lat<? AND lng>? AND lng<? LIMIT ?",e.latitude-o,e.latitude+o,e.longitude-t,e.longitude+t,e.limit||120),n=[];i.isValidRow();)n.push({lat:parseFloat(i.getFieldByName("lat")).toFixed(6),lng:parseFloat(i.getFieldByName("lng")).toFixed(6),name:i.getFieldByName("name"),id:i.getFieldByName("rowid")}),i.next();return i.close(),a.close(),n}},module.exports=Module;