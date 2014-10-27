/*global require,define,console*/
/*jslint nomen: true*/  //<- allw _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
console.log('configuration started');
require.config({
	paths : {
        underscore              : 'libs/underscore/underscore',
        'underscore.deferred'   : 'libs/underscore.deferred/underscore.deferred',

		zepto                   : 'libs/zepto-full/zepto',
        backbone                : 'libs/backbone/backbone',

        hammer                  : 'libs/hammerjs/hammer',
        string                  : 'libs/string/string',

        templates				: 'jst.min'
    },
    shim   : {
        'zepto': {
            exports: '$'
        },

        'underscore': {
            exports: '_'
        },

        'underscore.deferred': {
            deps: ['underscore']
        },

        'backbone': {
            deps   : [ 'underscore', 'zepto', 'underscore.deferred' ],
            exports: 'Backbone'
        },

        'hammer': {
            exports: 'Hammer'
        }
    },
    map    : {
        '*': {
            jquery: 'zepto',
            $: 'zepto',
            _: 'underscore'
        }
    }

});
console.log('configuration finished');

var config = {
    server : 'https://script.google.com/macros/s/AKfycbwVyHBkZo_GRWewueRQkJlx2KRCnpKOZCa8PrJpgpyJNvTE02t4/exec'
};

require(['app'], function(app){
    'use strict';
	console.log('starting app');
	app.initialize(config);
});