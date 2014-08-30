'use strict';
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var mongoose = require('mongoose');

// Mongo connect
var mongouri = process.env.MONGO_URI;
mongoose.connect(mongouri);

var ProgrammeSchema = mongoose.Schema({
    id: String,
    name: String
});
var ProgrammeModel = mongoose.model('Programme', ProgrammeSchema);

// var programmes = require('./programme').getProgrammes();

// For populating the database with programmes
// for(var i = 0; i < programmes.length; i++){
//     var temp = programmes[i];
//     var name = temp[0];
//     var id = temp[1];
//     var newProgramme = new ProgrammeModel({id: id, name: name});
//     newProgramme.save();
// }

var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

var url = 'http://uiwwwsci01.nottingham.ac.uk:8003/reporting/TextSpreadsheet;programme+of+study;id;0003193%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+TextSpreadsheet&height=100&week=100';
var Table = function(){
    var table = {}, tData, rowCount = 0, rows =[], $, days = [];

    table.init = function(cheerio, data){
        $ = cheerio;
        data = data.slice(1);
        data.each(function(k, v){
            if(k === 5)
                return;
            var day = Day();
            day.init($, v);
            day.setDayName(days[k]);
            days.push(day.getJSON());
        });
    };

    table.getJSON = function(){
        return days;
    };

    return table;
}

var Day = function(){
    var day = {}, $, modules = [], dayName;
    day.init = function(cheerio, data){
        $ = cheerio;
        var rows = $(data).find('tr').slice(1);
        rows.each(function(k, v){
            var module = Module();
            module.init($, v);
            modules.push(module.getJSON());
        });
    };

    day.getJSON = function(){
        return modules;
    };

    day.setDayName = function(name){
        dayName = name;
    };

    day.getDayName = function(){
        return dayName;
    }
    return day;
};

var Module = function(){
    var module = {}, $, info = {};
    module.init = function(cheerio, data){
        $ = cheerio;
        var cells = $(data).find('td');

        info = {
            'code': $(cells[0]).text(),
            'name': $(cells[1]).text(),
            'type': $(cells[2]).text(),
            'time': {
                'start': $(cells[5]).text(),
                'end': $(cells[6]).text()
            }
        };
    };

    module.getJSON = function(){
        return info;
    };

    return module;
};

app.get('/scrape', function(req, res){
	request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var data = $('body > table');
            var table = Table();
            table.init($, data); // Init table module with data
            res.json(table.getJSON());
		}
	})
});

app.get('/courses', function(req, res){
    ProgrammeModel.find({}, function(err, programmes){
        res.send(programmes);
    });
});

app.get('/courses/:id', function(req, res){
    var check = new RegExp("^[0-9a-fA-F]{24}$");
    var filter = check.test(req.param('id')) ? {_id: req.param('id')} : {id: req.param('id')};
    ProgrammeModel.findOne(filter, function(err, programmes){
        res.send(programmes);
    });
});

app.listen('80')
exports = module.exports = app;