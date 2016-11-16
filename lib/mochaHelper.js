'use strict';

require('babel-register')();
require('jsdom-global')();
var xmldom = require('xmldom');

global.localStorage = {};
global.XMLSerializer = xmldom.XMLSerializer;
global.DOMParser = xmldom.DOMParser;