/*global define*/
/*jslint nomen: true*/  //<- allw _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}

define(['underscore', 'zepto', 'views/HomeView'], function(_, $, HomeView){
    'use strict';
    var app = {
        // Application Constructor
        initialize: function() {
            this.bindEvents();
        },
        // Bind Event Listeners
        //
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            if(document.location && document.location.protocol !== 'file:'){
                $(_.bind(function(){ // browser hack for development
                    this.onDeviceReady();
                }, this));
            }
        },
        // deviceready Event Handler
        //
        // The scope of 'this' is the event. In order to call the 'receivedEvent'
        // function, we must explicitly call 'app.receivedEvent(...);'
        onDeviceReady: function() {
            //app.receivedEvent('deviceready');
            var view = new HomeView({});
            $('body').empty();
            $('body').append(view.render().el);
        }
    };
    return app;
});
