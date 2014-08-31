'use strict';
var express = require('express');
var app     = express();
var fs = require('fs');
var API = require('./api.js');

app.get('/api/', function(req, res){
    res.send('Please visit the <a href="https://github.com/ryanshawty/UoN-timetable-scraper">GitHub page</a>');
});

app.get('/api/scrape/:id', function(req, res){
    var id = req.param('id');//0003193
    var course = API.CourseScraper().init(id);
    course.then(function(data){
        res.json(data);
    }, function(err){

    });
});

app.get('/api/courses', function(req, res){
    API.getCourses(function(data){
        res.send(data);
    })
});

app.get('/api/courses/:id', function(req, res){
    API.getCourse(req.param('id'), function(data){
        var courseData = {};
        courseData.name = data.name;
        var course = API.CourseScraper().init(req.param('id'));
        course.then(function(data){
            courseData.modules = data;
            res.json(courseData);
        });
    });
});

app.listen('80');
exports = module.exports = app;