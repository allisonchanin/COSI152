var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const layouts = require("express-ejs-layouts");
const axios = require('axios');
const auth = require('./routes/auth');
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);

// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require( 'mongoose' );
//const mongodb_URI = 'mongodb://localhost:27017/cs103a_todo'
const mongodb_URI = 'mongodb+srv://cs_sj:BrandeisSpr22@cluster0.kgugl.mongodb.net/allisonchanin?retryWrites=true&w=majority'

mongoose.connect( mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true } );
// fix deprecation warnings
//mongoose.set('useFindAndModify', false); 
//mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("we are connected!!!")});

// middleware to test is the user is logged in, and if not, send them to the login page
const isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  }
  else res.redirect('/login')
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var store = new MongoDBStore({
  uri: mongodb_URI,
  collection: 'mySessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(require('express-session')({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: true,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(layouts);
app.use(auth);
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/meals',
  (req,res,next) => {
    res.render('meals')
  }
);

app.post('/meals',
  async (req,res,next) =>{
    const {ingredient} = req.body;
    res.locals.ingredient = ingredient;
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/filter.php?i='+ ingredient +'')
    console.dir(response.data);
    res.locals.meals = response.data.meals;
    res.render('mealsResult');
  }
);

app.get('/practicestuff',
  (req,res,next) => {
    res.render('practicestuff')
  }
);

app.get('/pattern',
  async (req,res,next) =>{
    const response = await axios.get('https://dog.ceo/api/breeds/image/random')
    console.dir(response.data);
    res.locals.dogs = response.data;
    res.render('pattern');
  }
);

app.post('/pattern',
  async (req,res,next) =>{
    const {cocktail} = req.body;
    res.locals.cocktail = cocktail;
    const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + cocktail + '')
    console.dir(response.data);
    res.locals.drink = response.data.drinks;
    res.render('showCocktail');
  }
);

app.get('/simpleform',
  isLoggedIn,
  (req,res,next) => {
    res.render('simpleform')
  }
);

app.post('/simpleform',
  isLoggedIn,
  (req,res,next) =>{
    const {username,age,heightInches} = req.body;
    res.locals.username = username;
    res.locals.age = age;
    res.locals.heightInches = heightInches;
    res.locals.heightCentimeters = heightInches*2.54;
    res.locals.version = '1.0.0';
    res.render('simpleformresult');
  }
);

app.get('/BMI',
  (req,res,next) => {
    res.render('BMI')
  }
);

app.post('/BMI',
  (req,res,next) =>{
    const {height,weight} = req.body;
    res.locals.height = height;
    res.locals.weight = weight;
    res.locals.BMI = weight/(height * height)*703
    res.render('BMIresult');
  }
);

app.get('/dist',
  (req,res,next) => {
    res.render('dist')
  }
);

app.post('/dist',
  (req,res,next) =>{
    const {x,y,z} = req.body;
    res.locals.x = x;
    res.locals.y = y;
    res.locals.z = z;
    res.locals.distance = Math.sqrt(x*x+y*y+z*z)
    res.render('distresults');
  }
);

const family = [
  {name:'Steven',age:54},
  {name:'Allison',age:18},
  {name:'Jessie',age:54},
  {name:'Boba',age:4},
]

app.get('/showFamily',
  (req,res,next) => {
    res.locals.family = family;
    res.render('showFamily');
  }
);

app.get('/apidemo/:email',
  async (req,res,next) => {
    const email = req.params.email;
    const response = await axios.get('https://www.cs.brandeis.edu/~tim/cs103aSpr22/courses20-21.json')
    console.dir(response.data.length)
    res.locals.courses = response.data.filter((c) => c.instructor[2]==email+"@brandeis.edu")
    res.render('showCourses')
    //res.json(response.data.slice(100,105));
  }
);

app.get('/showRepos/:githubID',
  async (req,res,next) => {
    const id = req.params.githubID;
    const response = await axios.get('https://api.github.com/users/'+ id +'/repos')
    console.dir(response.data.length)
    res.locals.repos = response.data
    res.render('showRepos')
  }
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
