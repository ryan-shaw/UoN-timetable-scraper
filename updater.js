var http = require('http');
var fs = require('fs');
var Q = require('q');
var readline = require('readline');
var spawn = require('child_process').spawn;

var updateURL = 'uiwwwsci01.nottingham.ac.uk:8003/js/filter.js';

var Updater = function(url){
	var updater = {};

	var getParts = function(){
		var parts = [];
		parts[0] = url.substring(0, url.indexOf(':'));
		parts[1] = url.substring(parts[0].length + 1, url.indexOf('/'));
		parts[2] = url.substring(parts[0].length + parts[1].length + 1, url.length);
		parts[3] = url.substring(url.lastIndexOf('/'), url.length);
		return parts;
	};

	updater.get = function(){
		var parts = getParts(url);
		var deferred = Q.defer();

		var out = fs.createWriteStream(__dirname + "/downloads/" + parts[3]);
		var curl = spawn('curl', [url]);
		curl.stdout.on('data', function(data){
			out.write(data);
		});

		curl.stdout.on('end', function(data){
			out.end();
			var content;
	    	var rooms = [];
	    	var courses = [];
			fs.readFile(__dirname + "/downloads/" + parts[3], function read(err, data) {
				content = data.toString();
			 	var roomRegex = RegExp('roomarray\\[\\d+\\]\\s\\[\\d\\]\\s+\=\\s+\"(.*)\"\;\\s+.*\"(.*)\"\;\\s+.*\"(.*)\"\;', 'g');
			 	var match;
			    while (match = roomRegex.exec(content)) {
			        rooms.push({full_name: match[1], short_name: match[3]});
			    }

			 	var programmeRegex = RegExp('programmearray\\[\\d+\\]\\s\\[\\d\\]\\s+\=\\s+\"(.*)\"\;\\s+.*\"(.*)\"\;\\s+.*\"(.*)\"\;', 'g');
			 	match = null;
			    while (match = programmeRegex.exec(content)) {
			        courses.push({name: match[1], school: match[2], id: match[3]});
			    }
			    deferred.resolve({rooms: rooms, courses: courses});
			});
		});
		return deferred.promise;
	}


	return updater;
};

exports.getFilter = function(){
	return Updater(updateURL).get();
}