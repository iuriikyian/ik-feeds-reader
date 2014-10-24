define(['underscore', 'templates'], function(_, templates){
	return {
		template : function(templateName){
			var templateFullName = ['templates/' + templateName + '.html'].join('');
			console.log('loading template: ' + templateFullName);
			return templates[templateFullName];
		}
	};
});