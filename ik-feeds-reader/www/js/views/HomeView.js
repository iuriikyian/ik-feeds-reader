define(['underscore', 'zepto', 'backbone', 'utils'], function(_, $, Backbone, utils){
	return Backbone.View.extend({
		template : utils.template('home-view'),

		initialize : function(options){

		},

		render : function(){
			var $el = $(this.el);
			$el.empty();
			$el.append(this.template({}));
			return this;
		}
	});
});