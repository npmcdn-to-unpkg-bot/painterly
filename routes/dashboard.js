var express = require('express');
var router = express.Router();
var passport = require('passport');
var pg = require('pg').native; // var pg = require)'pg') for Local database users:
var bcrypt = require('bcryptjs');

/* GET home page. */
router.get('/', function(req, res, next) {
  // connect DB and read table assignments
  pg.connect(process.env.DATABASE_URL + "?ssl=true", connectDB_showPosts(req,res,next));
  res.render('dashboard', { title: 'Painterly | a whole new art critique website', user: req.user});
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/'); // Successful. redirect to localhost:3000/exam
});


function runQuery_showPosts(req, res, client, done, next) {
  return function(err, result){
    if (err) {
      console.log("unable to query SELECT ");
      next(err); // throw error to error.hbs. only for test purpose
    }
    else {
      console.log(result);
      res.render('notAdmin', {usernamep: result.rows.username, post: result.rows.description} );
    }
  };
} // client.query

function connectDB_showPosts(req, res, next) {
  return function(err, client, done) {
    if (err){ // connection failed
      console.log("Unable to connect to database");
      return next(err);
    }
    client.query('SELECT * FROM posts', runQuery_notAdmin(req, res, client, done, next));
  };
}


module.exports = router;
