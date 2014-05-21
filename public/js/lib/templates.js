/* global define */

define([
	'lib/text!tpl/desktop/lobby.ect',
	'lib/text!tpl/desktop/table.ect',
	'lib/text!tpl/desktop/playerSlot.ect'
], function(
	desktopLobby,
	desktopTable,
	playerSlot
) {

	return {
		'desktop': {
			'lobby': desktopLobby,
			'table': desktopTable,
			'player': {
				'slot': playerSlot
			}
		}
	};
});
