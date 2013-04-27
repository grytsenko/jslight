/**
* Light implementation of OOP on prototypes.
* Fast cloning and copy object features implementation.
* @author "Valeriy Doroshenko"
*/
(function(ns) {
"use strict";
	/**
	* Private old inheritance style.
	*  @param {Object} o The object or prototype object which will be used as pattern for new one.
	*  @return {Object} The created object.
	*/ 
	function _create(o) {
	        function F() {};
	        F.prototype = o;
	        return new F()
	};

	/**
	* Mixin methods into class.
	*  @param {Array.<Function>|Object.<string, Function>} The array with classes for mixing or object with functions which will be mixed in current class.
	*  @return {Function} The current class for cascading call.
	*  @private
	*/
	function _mixin() {
		for(var i = arguments.length; i--;) {
			var clazz = arguments[i], type = typeof clazz;
			if (type === 'function') {
				var src = clazz.prototype;
				for (var k in src) {
					var prop = src[k];
		   			if (!prop || (this.prototype[k] && !src.hasOwnProperty(k))) continue;				
					_method.apply(this,[k, prop])
				}
			} else if (type === 'object') {
				for (var k in clazz) {
					var prop = clazz[k];
		   			if (!clazz.hasOwnProperty(k) || typeof prop !== 'function') continue;				
					_method.apply(this,[k, prop])
				}
			}
		}
		return this
	}

	/**
	* Add method to the class. There is possible to use this._super(args) to call overrided function.
	*  @param {string} The method name.
	*  @param {Function} The method body.
	*  @return {Function} The current class for cascading call.
	*  @private
	*/
	function _method(name, fn) {
		var __super = this.prototype[name];
		if(__super) {
			this.prototype[name] = function() {
				var tmp = this._super;          
				this._super = __super;
				var ret = fn.apply(this, arguments);       
				this._super = tmp;
				return ret 
			};
			return this
		}
		this.prototype[name] = fn;
		return this
	}

	/**
	* Copy content from one object to another one recursively with cloning. Overwrite existing properties. 
	*  @param {?} src The source object or primitive which will be deep clonned into destination.
	*  @param {?} dest The destination object or primitive.
	*  @return {?} The destinate object or prmitive.
	*/	
	ns.copy = function _copy(src,dest) {
		if (typeof src === 'object') {
			if (src === src.valueOf() && RegExp != src.constructor) {
				if (src.length) {
					var len = src.length, it = len % 8, i = len-1, p;
					dest = src.constructor ? new src.constructor() : [];
					while(it) {
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						it--
					}
					it = Math.floor(len / 8);
					while(it) {
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;
						p = src[i];
						dest[i] = typeof p === 'object' ? _copy(p,dest[i]) : p;
						i--;			
						it--
					}
				} else {
					if (!dest && (src instanceof ns.Class)) {
						dest = src.clone()
					} else {
						dest = dest || {};
						for (var k in src) {			
							var p = src[k];
							dest[k] = typeof p === 'object' ? _copy(p,dest[k]) : p
						}
					}
				}
			} else {
				dest = src.constructor ? new src.constructor(src) : src
			}
		} else {
			dest = src
		}
		return dest
	}

	/**
	* Shallow copy content from one object to another one recursively withot cloning. Overwrite existing properties. 
	*  @param {?} src The source object or primitive which will be copied.
	*  @param {?} dest The destination object or primitive.
	*  @return {?} The destinate object or prmitive.
	*/	
	ns.shallowCopy = function(src,dest) {
		if (typeof src === 'object') {
			if (src === src.valueOf() && RegExp != src.constructor) {
				if (src.length) {
					dest = Array.prototype.slice.call(src);
				} else {
					if (!dest && (src instanceof ns.Class)) {
						dest = src.shallow()
					} else {
						dest = dest || {};
						for (var k in src) {			
							var p = src[k];
							dest[k] = p
						}
					}
				}
			} else {
				dest = src
			}
		} else {
			dest = src
		}
		return dest
	}

	/**
	* Produce proxy of function which tied to the specified context.
	*  @param {Object} ctx The context.
	*  @param {Function} fn The function which will be associated with specified context.
	*/
	ns.proxy = function(ctx,fn) {
		return function() {fn.apply(ctx,arguments)}
	}

	/**
	* Empty constructor.
	*  @constructor
	*/
	ns.Class = function(){};
	
	/**
	* Define new class wich extending current.
	*  @param {Function} constructor The constructor function of new class.
	*  @return {Function} The new class.
	*/
	ns.Class.extend = function _self(constructor) {
		var __super = this;
		var clazz = function _constructor() {
			var tmp = this._super;          
			this._super = __super;
			var ret = constructor.apply(this, arguments);       
			this._super = tmp;
			return ret 
		}
		clazz.extend = _self;
		clazz.mixin = _mixin;
		clazz.method = _method;
		clazz.define = function(_clazz){
				return function(fn) {
					fn.apply(_clazz, Array.prototype.slice.apply(arguments, [1]));
					return _clazz
					}
				}(clazz);
		clazz.prototype = Object.create ? Object.create(this.prototype) : _create(this.prototype);
		clazz.prototype.constructor = clazz;
		return clazz
	}

	/**
	* Deep clone the current object.
	*  @return {Object} The new cloned object.
	*/
	ns.Class.prototype.clone = function () {
		var o = Object.create ? Object.create(this) : _create(this);
		for (var k in o) {
			var p = o[k];
			if (typeof p == 'object') {
				if (p instanceof ns.Class) {
					o[k] = p.clone()
				} else {
					o[k] = ns.copy(p)
				}
			} else {
				o[k] = p
			}
		}
		return o
	}
	
	/**
	* Make shallow clone of current object.
	*  @return {Object} The new cloned object.
	*/
	ns.Class.prototype.shallow = function () {
		var o = Object.create ? Object.create(this) : _create(this);
		for (var k in o) {
			if (typeof o[k] !== 'object') continue;
			var t = o[k];
			o[k] = t
		}
		return o
	}

	/**
	* Invoke external function in context of current object.
	*  @param {Function} fn The external function (may be from other classes) which will be invoked in context of current object.
	*  @return {?} The result of function call.
	*/
	ns.Class.prototype.invoke = function (fn) {
		return fn.apply(this, Array.prototype.slice.apply(arguments, [1]))
	}

	/**
	* Enclosure method with current object.
	*  @param {string} method The name of method which will be enclosured.
	*  @return {Function} The proxy function which enclosure defined method with current object.
	*/
	ns.Class.prototype.enclosure = function (method) {
		var m = this[method];
		return m.bind ?  m.bind(this) : ns.proxy(this, m)
	}
}(this.A = this.A || {}));