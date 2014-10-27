define(["underscore", "backbone", "utils"], function(_, Backbone, utils){
    'use strict';
	return Backbone.View.extend({
        className : 'updates-loading-view',
		template : utils.template('updates-loading-view'),

		initialize : function(options){
			this.templateContext = {
				message : options.message || 'Loading...'
			};
		},

		render : function(){
			var $el = $(this.el);
			$el.empty();
			$el.append(this.template(this.templateContext));
			return this;
		},

		setMessage : function(message){
			this.templateContext.message = message;
			this.$('.message').text(message);
		},

		_initHandlers : function(){
			//this.$('.menu')
		}
	});
});