var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var Q = require('q');
var updater = require('./updater.js');
var async = require('async');
var _ = require('underscore');

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
    department: String,
    data: Object,
    time_stamp: {type: Date, default: Date.now}
});
var CourseModulesModel = mongoose.model('CourseModules', CourseModulesSchema);

var RoomSchema = mongoose.Schema({
    full_name: String,
    short_name: String
});
var RoomModel = mongoose.model('Rooms', RoomSchema);

var StudentSchema = mongoose.Schema({
    first_name: String,
    surname: String,
    email: String,
    username: String,
    course_id: String,
    course_year: Number,
    course_raw: Object,
    time_stamp: {type: Date, default: Date.now}
});
var StudentModel = mongoose.model('Students', StudentSchema);

var DepartmentSchema = mongoose.Schema({
    department_id: String,
    name: String
});
var DepartmentModel = mongoose.model('Departments', DepartmentSchema);

var StaffSchema = mongoose.Schema({
    department: String,
    givenName: String,
    surename: String,
    email: String,
    username: String,
    short: String
});
var StaffModel = mongoose.model('Staff', StaffSchema);

var ZoneSchema = mongoose.Schema({
    name: String,
    code: String
});
var ZoneModel = mongoose.model('Zones', ZoneSchema);

var ModuleSchema = mongoose.Schema({
    code: String,
    id: String,
    school: String
});
var ModuleModel = mongoose.model('Modules', ModuleSchema);

var IndividualModulesSchema = mongoose.Schema({
    id: String,
    days: Object,
    time_stamp: {type: Date, default: Date.now}
});
var IndividualModulesModel = mongoose.model('individualmodules', IndividualModulesSchema);

var daysGlobal = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var url_base = 'http://uiwwwsci01.nottingham.ac.uk:8004/reporting/TextSpreadsheet;programme+of+study;id;';
var url_top = '%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+programme+of+study+TextSpreadsheet&height=100&week=100';

var request = require('request');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var getJson = function (url, callback) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var jsonpData = body;
            var json;
            try
            {
                json = JSON.parse(jsonpData);
            }
            catch(e)
            {
                callback(e);
            }
            callback(null, json);
        } else {
            callback(error);
        }
    });
};

var ZoneParser = function(){
    var parser = {};
    parser.init = function(callback){
        request('http://www.nottingham.ac.uk/academicservices/timetabling/furtherinformation/buildingcodes.aspx', function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                var data = $('table').splice(0, $('table').length-2);
                _.each(data, function(table){
                    _.each($(table).find('tr'), function(row, k){
                        if(k === 0){
                            return;
                        }
                        cells = $(row).find('td');
                        var code = $(cells[0]).text().trim();
                        var name = $(cells[1]).text().trim();
                        new ZoneModel({
                            code: code,
                            name: name
                        }).save();
                    });
                });
                callback();
            }
        });
    };
    return parser;
};

exports.runUpdater = function(done){
    console.log('Downloading filters.js...\n');
    updater.getFilter().then(function(data){
        console.log('Running series updates...\n');
        async.series([
            function(callback){
                console.log('Starting update of zones...');
                ZoneModel.remove({}, function(err){
                    var parser = new ZoneParser();
                    parser.init(function(){
                        callback();
                    });
                });
            },
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
            },
            function(callback){
                console.log('Starting update of departments...\n');
                DepartmentModel.remove({}, function(err){
                    if(!err){
                        data.departments.forEach(function(department, k){
                            new DepartmentModel(department).save(function(err){
                                if(k === data.departments.length - 1)
                                    callback(null, true);
                            });
                        });
                    }else{
                        callback(err);
                    }
                });
            },
            function(callback){
                console.log('Starting update of modules...\n');
                ModuleModel.remove({}, function(err){
                    if(!err){
                        data.modules.forEach(function(module, k){
                            new ModuleModel(module).save(function(err){
                                if(k === data.departments.length - 1)
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
            if(done)
                done(err);
        });
    }, function(err){
        console.log(err);
    });
};

exports.getStaffByShort = function(short, department, callback){
    var short = short.split(' ');
    StaffModel.findOne({short: short.join(' '), department: department}, function(err, staff){
        if(!staff){
            getJson('https://ws.nottingham.ac.uk/person-search/v1.0/staff/' + short[0], function(err, data){

                if(err || !data || typeof data.error !== 'undefined') return callback(null);
                if(data.meta.noResults !== 1){
                    data.results = _.filter(data.results, function(person){
                        return person._givenName.match(new RegExp('^' + short[1])) && person._department == department;
                    });
                }
                if(data.results.length === 0)
                    return callback(null);
                var person = data.results[0];
                // console.log(short);
                person = new StaffModel({short: short.join(' '), department: person._department, first_name: person._givenName, surname: person._surname, email: person._email, username: person._username});
                person.save();
                callback(person);
            });
        }else{
            callback(staff);
        }
    });
};

var ModuleScraper = function(){
    var scraper = {}, id, url;

    var refresh = function(){
        var deferred = Q.defer();
        request(url, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);
                var data = $('body > table');
                var table = exports.Table();
                table.init($, data, true); // Init table module with data
                deferred.resolve(table.getJSON());
                IndividualModulesModel.find({id: id}).remove().exec();
                var newModule = new IndividualModulesModel({id: id, days: table.getJSON()});
                newModule.save();
                // ProgrammeModel.findOne({id: id}, function(err, course){
                //     DepartmentModel.findOne({department_id: course.school}, function(err, department){
                //         deferred.resolve({department: department.name, course_id: id, data: table.getJSON()});
                //         var newCourse = new CourseModulesModel({department: department.name, course_id: id, data: table.getJSON()});
                //         newCourse.save();
                //     });
                // });
            }
        });
        return deferred.promise;
    };

    scraper.init = function(lId, lurl){
        id = lId;
        var deferred = Q.defer();
        url = url_base + id + url_top;
        if(lurl){
            url = lurl;
        }
        IndividualModulesModel.findOne({id: id}, function(err, course){
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
                    deferred.resolve(course.days);
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

exports.getModule = function(code, callback){
    ModuleModel.findOne({code: new RegExp('^'+code+'$', 'i')}, function(err, module){
        if(module){
            var module = ModuleScraper().init(module.id, 'http://uiwwwsci01.nottingham.ac.uk:8004/reporting/TextSpreadsheet;module;id;'+module.id+'%0D%0A?days=1-5&weeks=1-52&periods=3-20&template=SWSCUST+module+TextSpreadsheet&height=100&week=100');
            module.then(function(data){
                callback(data);
            });
        }else{
            callback(null);
        }
    });
};

exports.getRoomInfo = function(room, callback){
    var zonesCampus = {
        'JC': 'Jubilee Campus',
        'SB': 'Sutton Bonnington',
        'UP': 'University Park',
        'KMC': 'Kings Meadow Campus',
        'QMC': 'Queens Medical Centre',
        'NMS': 'Nottingham Medical School'
    };
    var splitRoom = room.split('-');
    var campus = zonesCampus[splitRoom[0]];
    var actualRoom = room.substring(room.lastIndexOf('-')+1);
    room = room.substring(0, room.lastIndexOf('-'));
    ZoneModel.findOne({code: room}, function(err, zone){
        if(!zone || err)
            return callback(null);
        zone.name = campus + ' ' + zone.name + ' ' + actualRoom;
        callback(zone);
    });
};

exports.getCourseByUsername = function(username, callback){
    username = username.toLowerCase();
    StudentModel.findOne({username: username, time_stamp: {$gte: (Date.now() - (1000 * 60 * 60 * 24))} }, function(err, student){
        if(!student){
            getJson('https://ws.nottingham.ac.uk/person-search/v1.0/student/'+username, function(err, studentData){
                if(err || studentData.results.length === 0) return callback(null);
                exports.getCourseByName(studentData.results[0]._courseName, studentData.results[0]._yearOfStudy, function(data){
                    if(!data)
                        return callback(null);
                    StudentModel.remove({username: username});
                    student = new StudentModel({
                        first_name: studentData.results[0]._givenName,
                        surname: studentData.results[0]._surname,
                        course_year: studentData.results[0]._yearOfStudy,
                        course_id: data.id,
                        username: studentData.results[0]._username,
                        email: studentData.results[0]._email,
                        course_raw: data
                    });
                    student.save();
                    callback(data);
                });
            });
        }else{
            callback(student.course_raw);
        }
    });

};

exports.getCourseByName = function(name, year, callback){
    var search = new RegExp('^'+name+' \\d year.*\/'+year+'.*\(Hons\)', 'i');
    ProgrammeModel.findOne({name: search}, function(err, data){
        callback(data);
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

    table.init = function(cheerio, data, lmodule){
        $ = cheerio;
        data = data.slice(1, data.length-1);
        data.each(function(k, v){
            if(k === 5)
                return;
            var day = exports.Day();
            day.init($, v, lmodule);
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
    day.init = function(cheerio, data, lmodule){
        $ = cheerio;
        var rows = $(data).find('tr').slice(1);
        rows.each(function(k, v){
            var module = exports.Module();
            module.init($, v, lmodule);
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
                matchArr.push(parseInt(result1[0]));
            }
        }

        return matchArr;
    };

    module.init = function(cheerio, data, lmodule){
        $ = cheerio;
        var cells = $(data).find('td');
        if(lmodule){
            info = {
                'code': $(cells[0]).text().split('/')[0],
                'name': $(cells[3]).text(),
                'type': $(cells[1]).text(),
                'time': {
                    'start': $(cells[5]).text(),
                    'end': $(cells[6]).text()
                },
                'room': $(cells[8]).text(),
                'staff': $(cells[11]).text(),
                'weeks': getWeeks($(cells[12]).text())
            };
        }else{
            info = {
                'code': $(cells[0]).text().split('/')[0],
                'name': $(cells[1]).text(),
                'type': $(cells[2]).text(),
                'time': {
                    'start': $(cells[5]).text(),
                    'end': $(cells[6]).text()
                },
                'room': $(cells[8]).text(),
                'staff': $(cells[11]).text(),
                'weeks': getWeeks($(cells[12]).text())
            };
        }
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

                CourseModulesModel.find({course_id: id}).remove().exec();

                ProgrammeModel.findOne({id: id}, function(err, course){
                    DepartmentModel.findOne({department_id: course.school}, function(err, department){
                        deferred.resolve({department: department.name, course_id: id, data: table.getJSON()});
                        var newCourse = new CourseModulesModel({department: department.name, course_id: id, data: table.getJSON()});
                        newCourse.save();
                    });
                });
            }
        });
        return deferred.promise;
    };

    scraper.init = function(lId, lurl){
        id = lId;
        var deferred = Q.defer();
        url = url_base + id + url_top;
        if(lurl){
            url = lurl;
        }
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
                    deferred.resolve(course);
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
