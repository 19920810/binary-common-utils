'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var parseQueryString = exports.parseQueryString = function parseQueryString() {
  if (typeof window === 'undefined') {
    return {};
  }
  var str = window.location.search;
  var objURL = {};
  str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function (a0, a1, a2, a3) {
    objURL[a1] = a3;
  });
  return objURL;
};

var getObjectValue = exports.getObjectValue = function getObjectValue(obj) {
  return obj[Object.keys(obj)[0]];
};

var getUTCTime = exports.getUTCTime = function getUTCTime(date) {
  var dateObject = new Date(date);
  return ('0' + dateObject.getUTCHours()).slice(-2) + ':' + ('0' + dateObject.getUTCMinutes()).slice(-2) + ':' + ('0' + dateObject.getUTCSeconds()).slice(-2);
};

var strToXml = exports.strToXml = function strToXml(str) {
  var xmlDoc = void 0;
  var parser = void 0;
  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(str, 'text/xml');
  } else if (window.ActiveXObject) {
    xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
    xmlDoc.async = false;
    xmlDoc.loadXML(str);
  }
  return xmlDoc;
};