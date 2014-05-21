/* global requirejs */


requirejs.config({
	baseUrl: 'js/desktop',
	paths: {
		tpl: '../../templates',
		lib: '../lib'
	}
});

requirejs([
	'lib/x',
	'lib/templates',
	'client',
], function(
	x,
	templates,
	Client
) {

	x.setTemplates(templates);

	var main = function() {
		var client = new Client(window.location.origin);
		client.run();
	};

	main();
});
