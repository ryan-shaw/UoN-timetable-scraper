var API = require('./api.js');
require('dotenv').load();

// exports['check course scraper'] = function(test){
// 	var course = API.CourseScraper().init('0003193');
// 	test.expect(1);
// 	course.then(function(data){
// 		var count = 0;
// 		var i;
// 		for (i in data) {
// 		    if (data.hasOwnProperty(i)) {
// 		        count++;
// 		    }
// 		}
// 		test.ok(count === 5, '5 days');		
// 		test.done();
//     }, function(err){
//     	console.log(err);
//     });
// };

exports.tearDown = function(done){
	API.close(done);
};