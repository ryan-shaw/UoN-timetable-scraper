var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var Q = require('q');
require('dotenv').load();
// Mongo connect
var mongouri = process.env.MONGO_URI;
mongoose.connect(mongouri);

var ProgrammeSchema = mongoose.Schema({
    id: String,
    name: String
});
var ProgrammeModel = mongoose.model('Programme', ProgrammeSchema);

var CourseModulesSchema = mongoose.Schema({
    course_id: String,
    data: Object,
    time_stamp: {type: Date, default: Date.now}
});
var CourseModulesModel = mongoose.model('CourseModules', CourseModulesSchema);

// var programmes = require('./programme').getProgrammes();

// // For populating the database with programmes
// for(var i = 0; i < programmes.length; i++){
//     var temp = programmes[i];
//     var name = temp[0];
//     var id = temp[2];
//     var newProgramme = new ProgrammeModel({id: id, name: name});
//     newProgramme.save();
// }

var daysGlobal = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var url_base = 'http://uiwwwsci01.nottingham.ac.uk:8003/reporting/TextSpreadsheet;programme+of+study;id;';
var url_top = '%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+TextSpreadsheet&height=100&week=100';

exports.Table = function(){
    var table = {}, tData, rowCount = 0, rows =[], $, days = {};

    table.init = function(cheerio, data){
        $ = cheerio;
        data = data.slice(1, data.length-1);
        data.each(function(k, v){
            if(k === 5)
                return;
            var day = exports.Day();
            day.init($, v);
            day.setDayName(days[k]);
            days[daysGlobal[k]] = day.getJSON();
        });
    };

    table.getJSON = function(){
        return days;
    };

    return table;
}

exports.Day = function(){
    var day = {}, $, modules = [], dayName;
    day.init = function(cheerio, data){
        $ = cheerio;
        var rows = $(data).find('tr').slice(1);
        rows.each(function(k, v){
            var module = exports.Module();
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

exports.Module = function(){
    var module = {}, $, info = {};

    var getWeeks = function (cell){
        var regex = /(\d+-?\d*)/g;
        var matchArr = [], result;
        while ( (result = regex.exec(cell)) ) {
            matchArr.push(result[1]);
        }
        return matchArr;
    };

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
            },
            'room': $(cells[8]).text(),
            'weeks': getWeeks($(cells[12]).text())
        };
    };

    module.getJSON = function(){
        return info;
    };

    return module;
};

exports.CourseScraper = function(){
    var scraper = {}, id, url;

    var refresh = function(){
        var deferred = Q.defer();
        request(url, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                var data = $('body > table');
                var table = exports.Table();
                table.init($, data); // Init table module with data
                deferred.resolve(table.getJSON());
                var newCourse = new CourseModulesModel({course_id: id, data: table.getJSON()});
                newCourse.save();
            }
        });
        return deferred.promise;
    };

    scraper.init = function(lId){
        // Create promise
        id = lId;

        var deferred = Q.defer();
        url = url_base + id + url_top;
        // Add promise here
        CourseModulesModel.findOne({course_id: id}, function(err, course){
            if(err){
                return deferred.reject(new Error(err));
            }
            if(course){
                var now = Date.now();
                if(now - course.time_stamp.getTime() > 10){ // 24 hour expiry
                    // Data is stale
                    refresh(url).then(function(data){
                        deferred.resolve(data);
                    });
                }else{
                    // Data is fresh
                    deferred.resolve(course.data);
                }
            }else{
                // No data exists
                refresh(url).then(function(data){
                    deferred.resolve(data);
                });
            }
        });
        return deferred.promise;
    };
    return scraper;
};

exports.close = function(done){
    mongoose.disconnect(function(err){
        done();
    });
};