'use strict';
require('babel-polyfill');
require('babel-register');
require('jsdom-global')();
global.localStorage = {};
let xmldom = require('xmldom');
global.XMLSerializer = xmldom.XMLSerializer;
global.DOMParser = xmldom.DOMParser;
