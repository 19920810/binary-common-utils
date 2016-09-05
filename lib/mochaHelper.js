'use strict';

require('babel-polyfill'); // eslint-disable-line import/no-extraneous-dependencies
require('babel-register')({
    sourceMaps: true
});
require('jsdom-global')();
var xmldom = require('xmldom');

global.localStorage = {};
global.XMLSerializer = xmldom.XMLSerializer;
global.DOMParser = xmldom.DOMParser;