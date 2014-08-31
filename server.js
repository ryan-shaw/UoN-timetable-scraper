'use strict';
var express = require('express');
var app     = express();
var fs = require('fs');
var API = require('./api.js');

app.get('/', function(req, res){
    res.send('Please visit the <a href="https://github.com/ryanshawty/UoN-timetable-scraper">GitHub page</a>');
});

app.get('/scrape/:id', function(req, res){
    var id = req.param('id');//0003193
    var course = API.CourseScraper().init(id);
    course.then(function(data){
        res.json(data);
    }, function(err){

    });
});

app.get('/courses', function(req, res){
    API.ProgrammeModel.find({}, function(err, programmes){
        res.send(programmes);
    });
});

app.get('/courses/:id', function(req, res){
    var check = new RegExp("^[0-9a-fA-F]{24}$");
    var filter = check.test(req.param('id')) ? {_id: req.param('id')} : {id: req.param('id')};
    API.ProgrammeModel.findOne(filter, function(err, programmes){
        res.send(programmes);
    });
});

app.listen('80');
exports = module.exports = app;