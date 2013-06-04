
/*
 * GET home page.
 */

exports.index = function(req, res) {
	var ua = req.header('user-agent');
	if(/mobile/i.test(ua)) {
		res.render('index', { title: 'All In', message: 'mobile page' });
	} else {
		res.render('index', { title: 'All In', message: 'desktop page' });
	}
};
