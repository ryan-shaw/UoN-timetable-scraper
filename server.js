'use strict';
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

// Hardcoded for now, much derp
var url = 'http://uiwwwsci01.nottingham.ac.uk:8003/reporting/TextSpreadsheet;programme+of+study;id;0003193%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+TextSpreadsheet&height=100&week=100';

var Table = function(){
    var table = {}, tData, rowCount = 0, rows =[], $;

    table.init = function(cheerio, data){
        tData = data;
        $ = cheerio;
        var firstRow = true;
        data.each(function(k, v){
            // These are our TRs
            if(firstRow){
                firstRow = false;
                return;
            }
            rows[rowCount++] = $(v);
        });
        rowCount = 0; // Rest counter to 0
    };

    table.getRowTotal = function(){
        return rows.length;
    };

    table.getCurrentRowCount = function(){
        return rowCount;
    };

    table.getNextRow = function(){
        return rows[rowCount++];
    };

    return table;
}

// Extract columns into array mainly
var Row = function(){
    var row = {}, rowData = [], column = 0;
    row.init = function(data){
        rowData = data;
        return rowData;
    };

    row.getNextColumn = function(){

    };
    return row;
};

var Combiner = function($, table){
    // Take the > 5 rows and return 5 rows with combined table 
    var dayCount = 0;
    var saveNext = 0, saveWhere = 0;
    var newRows = [];
    for(var i = 0; i < table.getRowTotal(); i++){
        var row = table.getNextRow();
        var firstCol = row.children().first();
        if(saveNext){
            newRows[saveWhere].push(Row().init(row));
            saveNext--;
            continue;
        }
        var rowspan = firstCol.attr('rowspan');
        if(rowspan > 1){
            newRows[i] = [];
            newRows[i].push(Row().init(row));
            saveWhere = i;
            saveNext = rowspan-1; // We've already saved 1 so -1
        }
        else{
            console.log('We shouldn\'t get here, if we have there is an error with the data or formatting has changed');
        }
    }
    return newRows;
};

var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
// app.get('/scrape', function(req, res){
	request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            var data = $('body').children().eq(1).children();
            var table = Table();
            table.init($, data); // Init table module with data

            var newRows = Combiner($, table); // Combiner should return a useable data array :)
            console.log(newRows);
            // for(var day = 0; day < table.getRowTotal(); day++){ // Loop through monday -> friday
            //     // Need to combine the rows that are in the same day
            //     var newRows = Combiner()
            // }

		}
	})
// })

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;