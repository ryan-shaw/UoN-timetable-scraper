var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var Q = require('q');
var updater = require('./updater.js');
var async = require('async');

require('dotenv').load();
// Mongo connect
var mongouri = process.env.MONGO_URI;
mongoose.connect(mongouri);

var ProgrammeSchema = mongoose.Schema({
    id: String,
    name: String,
    school: String
});
var ProgrammeModel = mongoose.model('Programme', ProgrammeSchema);

var CourseModulesSchema = mongoose.Schema({
    course_id: String,
    data: Object,
    time_stamp: {type: Date, default: Date.now}
});
var CourseModulesModel = mongoose.model('CourseModules', CourseModulesSchema);

var RoomSchema = mongoose.Schema({
    full_name: String,
    short_name: String
});
var RoomModel = mongoose.model('Rooms', RoomSchema);

var daysGlobal = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var url_base = 'http://uiwwwsci01.nottingham.ac.uk:8003/reporting/TextSpreadsheet;programme+of+study;id;';
var url_top = '%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+TextSpreadsheet&height=100&week=100';

exports.runUpdater = function(){
    console.log('Downloading filters.js...\n');
    updater.getFilter().then(function(data){
        console.log('Running series updates...\n');
        async.series([
            function(callback){
                console.log('Starting update of rooms...\n');
                RoomModel.remove({}, function(err){
                    if(!err){
                        data.rooms.forEach(function(room, k){
                            new RoomModel(room).save(function(err){
                                if(k === data.rooms.length - 1)
                                    callback(null, true);
                            });
                        });
                    }else{
                        callback(err);
                    }
                });
            },
            function(callback){
                console.log('Starting update of courses...\n');
                ProgrammeModel.remove({}, function(err){
                    if(!err){
                        data.courses.forEach(function(course, k){
                            new ProgrammeModel(course).save(function(err){
                                if(k === data.courses.length - 1)
                                    callback(null, true);
                            });
                        });
                    }else{
                        callback(err);
                    }
                });
            }
        ], function(err, results){
            if(!err){
                console.log('Completed updates successfully!\n');
            }
        });        
    }, function(err){
        console.log(err);
    });
};

exports.getCourse = function(id, callback){
    ProgrammeModel.findOne({id: id}, function(err, programme){
        callback(programme);
    });
};

exports.getCourses = function(search, callback){
    if(search.length < 3){
        return callback({
            error: 'Search term must be >= 3 characters'
        });
    }
    ProgrammeModel.find({name: {$regex: search, $options: 'i'}}, function(err, programmes){
        callback(programmes);
    });
};

exports.Table = function(){
    var table = {}, tData, rowCount = 0, rows =[], $, days = [];

    table.init = function(cheerio, data){
        $ = cheerio;
        data = data.slice(1, data.length-1);
        data.each(function(k, v){
            if(k === 5)
                return;
            var day = exports.Day();
            day.init($, v);
            day.setDayName(daysGlobal[k]);
            days[k] = day.getJSON();
        });
    };

    table.getJSON = function(){
        return days;
    };

    return table;
}

exports.Day = function(){
    var day = {}, $, modules = [], dayObject = {};
    dayObject.modules = [];
    day.init = function(cheerio, data){
        $ = cheerio;
        var rows = $(data).find('tr').slice(1);
        rows.each(function(k, v){
            var module = exports.Module();
            module.init($, v);
            dayObject.modules.push(module.getJSON());
        });
    };

    day.getJSON = function(){
        return dayObject;
    };

    day.setDayName = function(name){
        dayObject.day_name = name;
    };

    day.getDayName = function(){
        return dayObject.name;
    }
    return day;
};

exports.Module = function(){
    var module = {}, $, info = {};

    var getWeeks = function (cell){
        var matchArr = [], result;
        var result = cell.split(', ');
        for(var i = 0; i < result.length; i++){
            var result1 = result[i].split('-');
            if(result1.length === 2){
                for(var j = parseInt(result1[0]); j <= parseInt(result1[1]); j++){
                    matchArr.push(j);
                }
            }else{
                matchArr.push(result1[0]);
            }
        }
        
        return matchArr;
    };

    module.init = function(cheerio, data){
        $ = cheerio;
        var cells = $(data).find('td');

        info = {
            'code': $(cells[0]).text().split('/')[0],
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
                CourseModulesModel.find({course_id: id}).remove().exec();
                var newCourse = new CourseModulesModel({course_id: id, data: table.getJSON()});
                newCourse.save();
            }
        });
        return deferred.promise;
    };

    scraper.init = function(lId){
        id = lId;
        var deferred = Q.defer();
        url = url_base + id + url_top;
        CourseModulesModel.findOne({course_id: id}, function(err, course){
            if(err){
                return deferred.reject(new Error(err));
            }
            if(course){
                var now = Date.now();
                if(now - course.time_stamp.getTime() > 1000 * 60 * 60 * 24){ // 24 hour expiry
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