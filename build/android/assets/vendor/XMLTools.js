var XMLTools=function(e){"string"==typeof e&&(this.doc=Ti.XML.parseString(e).documentElement),"object"==typeof e&&(this.doc=e.documentElement)};XMLTools.prototype.getDocument=function(){return this.doc};var addToObject=function(e,t,o){if(null==e[t])e[t]=o;else if(e[t]instanceof Array)e[t].push(o);else{var i=e[t],r=[i,o];e[t]=r}return e},traverseTree=function(e){var t=!0,o={};if(e.hasChildNodes()){for(var i=0;i<e.childNodes.length;i++){var r=e.childNodes.item(i);if("#text"!=r.nodeName||""!=r.textContent.replace(/\n/g,"").replace(/ /g,""))if(3===r.nodeType||r.nodeType===r.CDATA_SECTION_NODE){if(1===e.childNodes.length&&!e.hasAttributes())return r.textContent;o.text=r.textContent}else o=addToObject(o,r.tagName,traverseTree(r))}t=!1}if(e.hasAttributes()){for(var n=0;n<e.attributes.length;n++){var a=e.attributes.item(n);o[a.nodeName]=a.nodeValue}t=!1}return o};XMLTools.prototype.toObject=function(){return null==this.doc?null:(this.obj=traverseTree(this.doc),this.obj)},XMLTools.prototype.toJSON=function(){return null==this.doc?null:(null==this.obj&&(this.obj=traverseTree(this.doc)),JSON.stringify(this.obj))},module.exports=XMLTools;