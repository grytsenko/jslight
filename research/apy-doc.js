if(this.A)(function(ns){
	ns.byId = function(id) {
		return document.getElementById(id);
	}
	ns.byTagName = function(name) {
		return document.getElementsByTagName(name);
	}
}(this.A = this.A || {}));