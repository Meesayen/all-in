import express from 'express';

export let router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  let ua = req.header('user-agent');
  if(/mobile|nexus\s7/i.test(ua)) {
    res.render('mobile', { title: 'All In', message: 'mobile page' });
  } else {
    res.render('desktop', { title: 'All In', message: 'desktop page' });
  }
});
