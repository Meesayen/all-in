/* globals define */

define([
	'lib/x'
], function(
	x
) {

	return x.Class({
		__name__: 'TableController',
		parent: x.DomHandler,
		_template: 'desktop.table',
		_model: [],
		init: function(socket) {
			this.super();
			this._socket = socket;
			this._initComms();
		},
		show: function() {
			this._root.classList.remove('hidden');
		},
		_initComms: function() {
		}
	});

});
