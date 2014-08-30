var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

// 

var url = 'http://uiwwwsci01.nottingham.ac.uk:8003/reporting/Individual;programme+of+study;id;0003193%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+Individual&height=100&week=100';

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
            // $(v).children().each(function(k, v1){ // In here we have the columns
            //     if(next > 0){

            //         next--;
            //     }
            //     var row = $(v1).attr('rowspan');
            //     if(typeof row !== 'undefined'){
            //         whichDay++;
            //         var next = row;
            //     }else{
            //         day.time++;
            //     }
            // })
        });
        rowCount = 0; // Rest counter to 0
    }

    table.getRowCount = function(){
        return rowCount;
    }

    table.getNextRow = function(){
        return rows[rowCount++];
    }

    return table;
}

var Row = function(){
    var row = {}, rowData = [], column = 0;
    row.init = function(data){
        firstCol = true;
        data.each(function(k,v){
            if(firstCol){
                // Check if day col rowspan will be defined.
            }
        });
    };

    row.getNextColumn = function(){

    };
    return row;
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
            // console.log('Day: ', days[table.getRowCount()], table.getNextRow());  // Get next data row

            for(var day = 0; day < 5; day++){ // Loop through monday -> friday
                console.log(days[table.getRowCount()], table.getNextRow());
            }

		}
	})
// })

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;