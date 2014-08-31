var API = require('./api.js');
require('dotenv').load();

exports['check for 5 days'] = function(test){
	var course = API.CourseScraper().init('0003193');
	test.expect(1);
	course.then(function(data){
		var count = 0;
		var i;
		for (i in data) {
		    if (data.hasOwnProperty(i)) {
		        count++;
		    }
		}
		test.equal(count, 5);		
		test.done();
    }, function(err){
    	console.log(err);
    });
};