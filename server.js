'use strict';
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

// Hardcoded for now, much derp
var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

var url = 'http://uiwwwsci01.nottingham.ac.uk:8003/reporting/TextSpreadsheet;programme+of+study;id;0003193%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+TextSpreadsheet&height=100&week=100';
var Table = function(){
    var table = {}, tData, rowCount = 0, rows =[], $;

    table.init = function(cheerio, data){
        $ = cheerio;
        data = data.slice(1);
        data.each(function(k, v){
            if(k === 5)
                return;
            var day = Day();
            day.init($, v);
            day.setDayName(days[k]);
        });
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
            modules.push(module);
        });
        console.log(modules);
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
    return module;
};

app.get('/scrape', function(req, res){
	request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            var data = $('body > table');
            var table = Table();
            table.init($, data); // Init table module with data
            // console.log(table.getData());
            // for(var day = 0; day < table.getRowTotal(); day++){ // Loop through monday -> friday
            //     // Need to combine the rows that are in the same day
            //     var newRows = Combiner()
            // }
res.send('yep');
		}
	})
})

app.listen('80')
exports = module.exports = app;