/*global define,console*/
/*jslint nomen: true*/  //<- allw _ in the begining and at the end
/*jslint white: true*/ //<- now additional whitespaces in function(){}
define(['underscore', 'templates'], function(_, templates){
    'use strict';
	return {
		template : function(templateName){
			var templateFullName = ['templates/' + templateName + '.html'].join('');
			console.log('loading template: ' + templateFullName);
			return templates[templateFullName];
		}
	};
});