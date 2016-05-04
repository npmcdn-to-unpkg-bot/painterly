var express = require('express');
var router = express.Router();
var passport = require('passport');
var pg = require('pg').native; // var pg = require)'pg') for Local database users:
var bcrypt = require('bcryptjs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard', { title: 'Painterly | a whole new art critique website', user: req.user});
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/'); // Successful. redirect to localhost:3000/exam
});

module.exports = router;
