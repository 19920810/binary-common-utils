'use strict';
require('babel-register')();
require('jsdom-global')();
global.localStorage = {};
var xmldom = require('xmldom');
global.XMLSerializer = xmldom.XMLSerializer;
global.DOMParser = xmldom.DOMParser;
