'use strict';

var sendgrid = require('sendgrid')(process.env.SENDGRID_APIKEY);
var crypto = require('crypto');
var mongoose = require('mongoose');

var VerificationSchema = mongoose.Schema({
    username: String,
    code: String,
    time_stamp: {type: Date, default: Date.now}
});
var VerificationModel = mongoose.model('verification', VerificationSchema);

exports.sendVerificationCode = function(username, callback){
    var code = crypto.randomBytes(8).toString('hex');
    //TODO: If one exists resend
    VerificationModel.findOne({username: username}, function(err, vUser){
        if(vUser){
            exports._sendMail(username, vUser.code, callback);
        }else{
            new VerificationModel({
                username: username,
                code: code,
            }).save(function(err){
                if(err) return callback(err);
                exports._sendMail(username, code, callback);
            });
        }
    });
};

exports._sendMail = function(username, code, callback){
    var payload   = {
      to      : username + '@min.vc',
      from    : 'no-reply-uon-timetable@min.vc',
      subject : 'UoN Timetable verification email',
      text    : 'Please enter this code into the timetable application: ' + code
    }
    sendgrid.send(payload, callback);
}

exports.verifyUsername = function(username, code, ionicId, callback){
    VerificationModel.findOne({username: username, code: code}, function(err, vUser){
        if(err || !vUser)
            return callback('No user found');

        VerificationModel.remove();
        //TODO: Created verified user model.
        callback(null, vUser);
    })
};
