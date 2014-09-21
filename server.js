'use strict';
var express = require('express');
var app     = express();
var fs = require('fs');
var API = require('./api.js');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
// API.runUpdater();
app.use(logger());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

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

// E.g. ?name=Wilson%20M%20Dr&department=Computer Science
app.get('/api/staff', function(req, res){
    API.getStaffByShort(req.query.name, req.query.department, function(data){
        res.send(data);
    });
});

app.get('/api/room/:room', function(req, res){
    // Return further room info, including staff details, room is the room code
    API.getRoomInfo(req.params.room, function(data){
        res.send(data);
    });
});

app.get('/api/courses/modules/username/:username', function(req, res){
    API.getCourseByUsername(req.params.username, function(data){
        res.send(data);
    });
});

app.get('/api/courses/modules/((\\d+))', function(req, res){
    API.getCourse(req.params[0], function(data){
        var courseData = {};
        courseData.name = data.name;
        var course = API.CourseScraper().init(req.params[0]);
        course.then(function(course){
            courseData.department = course.department;
            if(typeof req.query.exclude !== 'undefined'){
                if(req.query.exclude.length > 0){
                    
                    for(var i = 0; i < course.data.length; i++){
                        var newModules = [];
                        var modules = course.data[i].modules;
                        for(var j = 0; j < modules.length; j++){
                            var module = modules[j];
                            if(req.query.exclude.indexOf(module.code) === -1){
                                newModules.push(module);
                            }
                        }
                        course.data[i].modules = newModules;
                    }                
                }
            }
            if(req.query.type === 'csv'){
                var startWeek = new Date(2014, 8, 15);
                var csv = 'Subject,Start Date,Start Time,End Date,End Time,Location\n';
                course.data.forEach(function(day, k){
                    day.modules.forEach(function(module){
                        module.weeks.forEach(function(week){        
                            var weekDate = new Date(startWeek);
                            weekDate.setDate(weekDate.getDate() + (week * 7) + k);
                            weekDate = weekDate.getDate() + '/' + (weekDate.getMonth()+1) + '/' + weekDate.getFullYear();            
                            csv += module.name + ',' + weekDate + ',' + module.time.start + ',' + weekDate + ',' + module.time.end + ',' + module.room + '\n';
                        });
                    });
                });
                res.set({'Content-Disposition':'attachment; filename=\'timetable.csv\''});
                return res.send(csv);
            }
            courseData.days = course.data;
            res.json(courseData);
        }, function(err){
            console.log(err);
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