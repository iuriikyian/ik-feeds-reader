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
	console.log('starting app');
	app.initialize();
});