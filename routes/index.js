const express = require('express');
const router = express.Router();
const debug = require('debug')('brandwatch-test:index');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { development: req.app.get('env') === 'development' });
});

module.exports = router;
