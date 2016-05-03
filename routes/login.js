var express = require('express');
var router = express.Router();
var passport = require('passport');
var pg = require('pg').native; // var pg = require)'pg') for Local database users:
var bcrypt = require('bcryptjs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { error: req.flash('error')});
});

router.post('/',
  // depends on the fiels "isAdmin", redirect to the different path: admin or notAdmin
  passport.authenticate('local', { failureRedirect: '/', failureFlash:'Inhvalid username or password :('}),
  function(req, res,next) {
    // res.json(req.user);
    // res.redirect('/users/profile')
    console.log(req.user);
    res.redirect('/home'), {user: req.user};
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/'); // Successful. redirect to localhost:3000/exam
});

router.get('/changePassword', function(req, res){
    res.render('changePassword', {user: req.user});
});

function connectDB_changePWD(req, res, next) {
  return function(err, client, done) {
    if (err){ // connection failed
      console.log("Unable to connect to database");
      return next(err);
    }
    var pwd = encryptPWD(req.body.new1);
    client.query('UPDATE users set password = $1 where username=$2', [pwd, req.user.username], function(err, result) {
      done(); // done all queries
      if (err) {
        console.log("unable to query INSERT");
        return next(err); // throw error to error.hbs. only for test purpose
      }
      console.log("Password change is successful");
      res.render('changePassword', {user: req.user , success: "true" });
    });
  };
}

router.post('/changePassword', function(req, res,next){

  if(req.body.new1 != req.body.new2){
    console.log("new passwords don't match");
    res.render('changePassword', { invalid: "true" });
  }
  else if(req.body.new1 === req.body.current){
    res.render('changePassword', { exist: "true" });
  }
  else{
    pg.connect(process.env.DATABASE_URL + "?ssl=true", connectDB_changePWD(req,res,next));

  }
});

function loggedIn(req, res, next) {
  if (req.user) {
    res.redirect('/home');
  } else {
    res.redirect('/'); // user doesn't exisit
  }
}

///////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////

router.get('/signup',function(req, res) {
    console.log("student");
});

// check if username has spaces, DB will whine about that
function validUsername(username) {
  var login = username.trim(); // remove spaces
  return login !== '' && login.search(/ /) < 0;
}

function encryptPWD(password){
    var salt = bcrypt.genSaltSync(10);
    //console.log("hash passwords");
    return bcrypt.hashSync(password, salt);
}

///////////////////////////////////////////////////////////
function createUser(req, res, client, done, next){
  console.log("create account");
  var email = req.body.emailS;
  var usern = req.body.userS;
  var pwd = encryptPWD(req.body.passwS);
  var college = req.body.college;
  var location = req.body.location;
  var level = req.body.level;
  var medium = req.body.medium;

  client.query('INSERT INTO users (email, username, password,college,location,level,medium) VALUES($1, $2, $3, $4, $5, $6, $7)', [email, usern, pwd, college, location, level, medium], function(err, result) {
    done(); // done all queries
    if (err) {
      console.log("unable to query INSERT");
      return next(err); // throw error to error.hbs. only for test purpose
    }
    else{
      console.log("User creation is successful");
      res.redirect('/home'), {user: usern, success: true};
    }
  });
}

function runQuery(req, res, client, done, next) {
  return function(err, result){
    if (err) {
      console.log("unable to query SELECT ");
      next(err); // throw error to error.hbs. only for test purpose
    }
    else if (result.rows.length > 0) {
      console.log("user exists");
      res.render('login', { invalid: "user already exists"  });

    }
    else {
      console.log("no user with that name");
      createUser(req, res, client, done, next);
    }
  };
} // client.query

function connectDB(req, res, next) {
  return function(err, client, done) {
    if (err){ // connection failed
      console.log("Unable to connect to database");
      return next(err);
    }
    client.query('SELECT * FROM users WHERE username=$1',[req.body.userS], runQuery(req, res, client, done, next));
  };
}

router.post('/signup', function(req, res, next) {
    console.log(req.body);
    if (!validUsername(req.body.userS)) {
      return res.render('login', { invalid: "true" });
    } else {
    pg.connect(process.env.DATABASE_URL + "?ssl=true", connectDB(req,res,next));
    }
  });

module.exports = router;
