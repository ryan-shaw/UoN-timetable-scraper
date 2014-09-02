'use strict';
var express = require('express');
var app     = express();
var fs = require('fs');
var API = require('./api.js');
var logger = require('morgan')
var session = require('express-session')
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")
var methodOverride = require('method-override');
app.use(logger());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9001');
    next();
});

app.use(API.passport.initialize());
app.use(API.passport.session());
app.get('/api/', function(req, res){
    res.send('Please visit the <a href="https://github.com/ryanshawty/UoN-timetable-scraper">GitHub page</a>');
});

app.get('/auth/facebook', API.passport.authenticate('facebook'));

app.get('/auth/facebook/callback', API.passport.authenticate('facebook', { successRedirect: '/authtest', failureRedirect: '/fail' }));

app.get('/authtest', ensureAuthenticated, function(req, res){
    res.send('test');
});

app.get('/api/scrape/:id', function(req, res){
    var id = req.param('id');//0003193
    var course = API.CourseScraper().init(id);
    course.then(function(data){
        res.json(data);
    }, function(err){

    });
});

app.get('/api/courses/((\\d+))', function(req, res){
    API.getCourse(req.params[0], function(data){
        var courseData = {};
        courseData.name = data.name;
        var course = API.CourseScraper().init(req.params[0]);
        course.then(function(data){
            courseData.days = data;
            res.json(courseData);
        });
    });
});

app.get('/api/courses/((\\w+))', function(req, res){
    API.getCourses(req.params[0], function(data){
        res.send(data);
    })
});

app.use(express.static(__dirname + '/dist'));

app.listen('80');
exports = module.exports = app;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/noauth');
}