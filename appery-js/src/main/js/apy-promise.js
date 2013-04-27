/**
* Light implementation of promise pattern.
* @author "Valeriy Doroshenko"
*/
"use strict";
/**
 Definition of Promise class.
  @constructor
*/
A.Promise = A.Class.extend(function(){
	this.status = A.Promise.promise 
}).define(function(){

	/** 
	* Mark for object in state 'promise'.
	*  @const
	*  @type {string} 
	*/
	this.promise = 'p';
	/** 
	* Mark for object in state fulfilled.
	*  @const
	*  @type {string} 
	*/
        this.fulfill = 'f';
	/** 
	* Mark for object in state rejected.
	*  @const
	*  @type {string} 
	*/
        this.reject = 'r';

	/**
	* Produce Promise object which will be invoked deferred by timer.
	*  @param {number} delay The delay in miliseconds.
	*  @return {Object} The created object which represent deffered result.
	*/ 
	this.defer = function(delay){
		var _p = new A.Promise();
		var _args = Array.prototype.slice.apply(arguments, [1]);
		if (delay<0) {
			setTimeout(function(){
					_p.reject.apply(_p,_args)
					},-1*delay)
		} else {
			setTimeout(function(){
					_p.fulfill.apply(_p,_args)
					},delay)
		}
		return _p
	}

	/**
	* Join promises then create new one which will be invoked after all previoses. 
	* If one or more of joined promises have been failed, a new promise will be treated as failed too.
	*  @param {...Object} var_args The set of Promises which will be joined.
	*  @return {Object} The created Promise object.
	*/ 
	this.join = function(){
		return _join(arguments, false)
	};

	/**
	* Join promises then create new one which will be invoked after all previoses. 
	* If one or more of joined promises have been failed, a new promise will be treated as failed too.
	*  @param {Array.<Object>} array The set of Promises which will be joined.
	*  @return {Object} The created Promise object.
	*/ 		
	this.joinarray = function(array){
		return _join(array, true)
	};

	/**
	* Private old inheritance style.
	*  @param {Object} promise The
	*  @param {function()} fnOnFulfill The
	*  @param {function()} fnOnReject The
	*  @return {Object} The Promise object.
	*/ 
	this.when = function(promise, fnOnFulfill, fnOnReject){
		return promise.then(fnOnFulfill, fnOnReject)
	};

        /**
	* Async processing an array. This method will be helpful for processing a large arrays on UI.
	*  @param {Array} array The.
	*  @param {function()} fn The.
	*  @return {Object} The created Promise object.
	*/ 
	this.foreach = function(array,fn) {
		var todo = Array.prototype.slice.call(array)
			, promise = new A.Promise();
		setTimeout(function __self() {
				var start = +new Date();
				do {
					fn(todo.shift())
				} while (todo.length > 0 && (+new Date() - start < 50));
				if (todo.length > 0) {
					return setTimeout(__self, 25)
				} else {
					promise.fulfill();
				}
			}, 25);
		return promise
	}

	/**
	* Link functions which will be invoked when state of promise will have been changed.
	*  @param {function()} fnOnFulfill The function which will be called when promise's state changed on fulfill.
	*  @param {function()} fnOnReject The function which will be called when promise's state changed on reject.
	*  @return {Object} The created Promise object.
	*/ 
	this.method('then',function(fnOnFulfill,fnOnReject){		
		if (this.status === A.Promise.promise) {
			this.onFulfill = fnOnFulfill;
			this.onReject = fnOnReject;

			this.next = new A.Promise()
		} else if ((this.status === A.Promise.fulfill) && typeof fnOnFulfill === 'function') {
			var r = fnOnFulfill.apply(null,this.args);
			this.res = r;
			if (r instanceof A.Promise) {
				return r
			}
		} else if ((this.status === A.Promise.reject) && typeof fnOnReject === 'function') {
			var r = fnOnReject.apply(null,this.args);
			this.res = r;
			if (r instanceof A.Promise) {
				return r
			}
		}
		
		return this.next || this
	});	

	/**
	* Shift promise object to state fulfill.
	*  @param {...} var_args The arguments which will be transmited to the fulfill handler function.
	*/ 
	this.method('fulfill',function(){
		this.status = A.Promise.fulfill;
		if (this.onFulfill) {
			this.res = this.onFulfill.apply(this,arguments);
			if (this.next && (this.res instanceof A.Promise)) {
				_link(this.res, this.next)
			}			
		} else {
			this.args = Array.prototype.slice.call(arguments)
		}
	});

	/**
	* Shift promise object to state reject.
	*  @param {...} var_args The arguments which will be transmited to the reject handler function.
	*/ 
	this.method('reject',function(){
		this.status = A.Promise.reject;
		if (this.onReject) {
			this.res = this.onReject.apply(this,arguments);
			if (this.next && (this.res instanceof A.Promise)) {
				_link(this.res, this.next)
			}
		} else {
			this.args = Array.prototype.slice.call(arguments)
		}
	});

	/**
	* Join promises and create new one which will get status when all promises will be completed. 
	* If anyone promise get Reject status then result also will have status Reject.
	*  @param {...Object} var_args The any number of promises which will be joined.
	*  @return {Object} The promise object.
	*/ 		
	this.method('join',function(){
		var args = Array.prototype.slice.call(arguments);
		args.unshift(this);
		return _join(args, false)		
	});

	/**
	* Join promises and create new one which will get status when all promises will be completed. 
	* If anyone promise get Reject status then result also will have status Reject.
	*  @param {Array.<Object>} array The any number of promises which will be joined.
	*  @return {Object} The promise object.
	*/ 
	this.method('joinarray',function(array){
		var args = Array.prototype.slice.call(array);
		args.unshift(this);
		return _join(args, true)
	});

	/**
	* Link promises together.
	*  @param {Object} cur The current promise.
	*  @param {Object} next The next promise.
	*/ 
	var _link = function(cur, next) {
		var _next_fulfill = next.enclosure('fulfill');
		var _fulfill = cur.enclosure('fulfill');
		cur.fulfill = function() {
			_fulfill.apply(null,arguments);
			_next_fulfill.apply(null,arguments)
		};
		var _next_reject = next.enclosure('reject');
		var _reject = cur.enclosure('reject');
		cur.reject = function() {
			_reject.apply(null,arguments);
			_next_reject.apply(null,arguments)
		}
	}

	/**
	* Private function for joining promises. 
	* If anyone promise get Reject status then result also will have status Reject.
	*  @param {Array.<Object>} array The any number of promises which will be joined.
	*  @param {boolean} isArr The flag which says that we are processing an array rather than arguments.
	*  @return {Object} The promise object.
	*/ 
	var _join = function(args, isArr){
		var _promise_c = args.length
			, i = _promise_c
			, _reject_c = 0
			, _fulfill_c = 0
			, f = A.Promise.fulfill
			, r = A.Promise.reject
			, p = A.Promise.promise
			, _res = []
			, next = new A.Promise()
			, _next_fulfill = next.enclosure('fulfill')
			, _next_reject = next.enclosure('reject');
		while (i--) {
			var cur = args[i], s = cur.status;
			if(s === f) {
				_fulfill_c++;
				_res[i] = cur.args;
			} else if (s === r) {
				_reject_c++;
				_res[i] = cur.args;
			} else if (s === p) {		
				cur.fulfill = (function(_i,_fulfill,_reject) { return function() {
						_fulfill.apply(null,arguments);
						_res[_i] = Array.prototype.slice.call(arguments);
						_fulfill_c++;
						if (_promise_c <= _fulfill_c+_reject_c) {
							if (_reject_c > 0) {
								if (isArr) {_next_reject(_res)} else  {_next_reject.apply(null,_res)}
							} else {
								if (isArr) {_next_fulfill(_res)} else {_next_fulfill.apply(null,_res)}
							}
						}
					}}(i,cur.enclosure('fulfill'),cur.enclosure('reject')));
				cur.reject = (function(_i,_reject){ return function() {
						_reject.apply(null,arguments);
						_res[_i] = Array.prototype.slice.call(arguments);
						_reject_c++;
						if (_promise_c <= _fulfill_c+_reject_c) {
							if(isArr) {_next_reject(_res)} else {_next_reject.apply(null,_res)}
						}
					}}(i,cur.enclosure('reject')))
			}
		}
		if (_promise_c <= _fulfill_c+_reject_c) {
			next.status = _reject_c > 0 ? r : f;
			next.args = isArr ? [_res]: _res
		}
		return next
	}
});
