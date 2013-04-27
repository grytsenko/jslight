if(this.A && A.Promise)(function(ns) {
"use strict";
          var _loadScript = function(url) {
		var script = document.createElement('script')
			, promise = new A.Promise();
		script.type = 'text/javascript';
		if(script.readyState) {
			script.onreadystatechange = function() {
				if(script.readyState == 'loaded' || script.readyState == 'complete') {
					script.onreadystatechange = null;
					promise.fulfill()
				}
			}
		} else {
			script.onload = function() {
				script.onload = null;
				promise.fulfill()
			}
		}
		script.src = url;
		document.getElementsByTagName('head')[0].appendChild(script);
		return promise
	  }

	ns.Core = A.Class.extend(function(id,config){
		this.id = id;
		this.modules = {};
	});
	ns.Core.method('register',function(moduleId,fnInstance){
		this.modules[moduleId] = fnInstance;
	});
	ns.Core.method('require',function(moduleId){
	});

}(this.A.mod = this.A.mod || {} ));