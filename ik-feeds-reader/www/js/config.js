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
            deps   : [ 'underscore', 'zepto' ],
            exports: 'Backbone'
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
//console.log(window.require);
require(['app'], function(app){
    'use strict';
	console.log('starting app');
	app.initialize();
});