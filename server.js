var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){

	url = 'http://uiwwwsci01.nottingham.ac.uk:8003/reporting/Individual;programme+of+study;id;0003193%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+Individual&height=100&week=100';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

	request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

			var title, release, rating;
			var json = { title : "", release : "", rating : ""};

            var data = $('body').children().eq(1).children().children();
            data.first().remove();
            // If data.child has rowspan = 2 then is day col
            res.send(data);

		}
	})
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;