'use strict';

module.exports = {
	asyncChain: function asyncChain(){
		return {
			asyncCallChain: [],
			pipe: function pipe(fun){
				this.asyncCallChain.push(fun);
				return this;
			},
			exec: function exec() {
				var wrap = function (call, callback) {
					return function () {
						call(callback);
					};
				};
				for (var i = this.asyncCallChain.length-1; i > -1; i--) {
					this.asyncCallChain[i] = wrap(this.asyncCallChain[i], i < this.asyncCallChain.length - 1 ? this.asyncCallChain[i + 1] : function(){});
				}
				this.asyncCallChain[0]();
			},
		};
	},
	asyncForEach: function asyncForEach(list, func, callback, index) {
		var callbackCalled = false;
		if ( typeof index === 'undefined' ) {
			index = 0;
		} else if ( index === list.length ) {
			if (callback) {
				callback();
			}
			return;
		}
		var toolScope = this;
		func(list[index], index, function(){
			if ( !callbackCalled ) {
				callbackCalled = true;
				toolScope.asyncForEach(list, func, callback, index+1);
			}
		});
	},
	parseQueryString: function parseQueryString() {
		if ( typeof window === 'undefined' ){
			return {};
		}
		var str = window.location.search;
		var objURL = {};
		str.replace(
			new RegExp("([^?=&]+)(=([^&]*))?", "g"),
			function (_0, _1, _2, _3) {
				objURL[_1] = _3;
			}
		);
		return objURL;
	},
	getObjectValue: function getObjectValue(obj) {
		return obj[Object.keys(obj)[0]];
	},
	getUTCTime: function getUTCTime(date) {
		var dateObject = new Date(date);
		return ('0' + dateObject.getUTCHours())
		.slice(-2) + ':' + ('0' + dateObject.getUTCMinutes())
		.slice(-2) + ':' + ('0' + dateObject.getUTCSeconds())
		.slice(-2);
	},
	strToXml: function strToXml(str) {
		var xmlDoc;
		var parser;
		if (window.DOMParser) {
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(str, "text/xml");
		} else if (window.ActiveXObject){
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = false;
			xmlDoc.loadXML(str);
		}
		return xmlDoc;
	},
	expandDuration: function expandDuration(duration){
		return duration.replace(/t/g, ' tick').replace(/s/g, ' second').replace(/m/g, ' minute').replace(/h/g, ' hour').replace(/d/g, ' day')+'(s)';
	},
	durationToSecond: function durationToSecond(duration){
		var durationInt = parseInt(duration),
			durationType = duration.replace(durationInt.toString(), '');
		if ( durationType === 's' ){
			return durationInt;
		}
		if ( durationType === 't' ){
			return durationInt * 2;
		}
		if ( durationType === 'm' ){
			return durationInt * 60;
		}
		if ( durationType === 'h' ){
			return durationInt * 60 * 60;
		}
		if ( durationType === 'd' ){
			return durationInt * 60 * 60 * 24;
		}
		throw({message: 'Duration type not accepted'});
	},
	durationAccepted: function durationAccepted(duration, min) {
		return this.durationToSecond(duration) >= this.durationToSecond(min);
	}
};
