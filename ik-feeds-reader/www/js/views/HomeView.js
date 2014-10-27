/*global define*/
/*jslint nomen: true*/  //<- allw _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
define(['underscore', 'zepto', 'backbone', 'utils'], 
function(_, $, Backbone, utils){
    'use strict';
	return Backbone.View.extend({
        className : 'home-view',
		template : utils.template('home-view'),

		initialize : function(options){
			this._channelsManager = options.channelsManager;
		},

		render : function(){
			var $el = $(this.el);
			$el.empty();
			$el.append(this.template(this._getContext()));
			return this;
		},

		_getContext : function(){
			var channels = this._channelsManager.getChannels();
			return {
				channels : channels
			};
		},

		_initHandlers : function(){
			//this.$('.menu')
		}
	});
});