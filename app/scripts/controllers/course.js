'use strict';

/**
 * @ngdoc function
 * @name uonApp.controller:CourseCtrl
 * @description
 * # MainCtrl
 * Controller of the uonApp
 */
angular.module('uonApp').controller('CourseCtrl', function ($scope, $http, $routeParams) {
   	$http.get('http://uon-timetable-api.jit.su/api/courses/' + $routeParams.id).then(function(res){
    	$scope.course = res.data;
    	// Combine into module list
    	$scope.modules = {};
    	$scope.course.days.forEach(function(day){
    		day.modules.forEach(function(module){
    			if(typeof $scope.modules[module.code.split('/')[0]] === 'undefined'){
    				$scope.modules[module.code.split('/')[0]] = [];
    			}
    			$scope.modules[module.code.split('/')[0]].push({time: module.time, day: day.day_name, weeks: module.weeks, location: module.room, name: module.name, code: module.code});//jshint ignore:line
    		});
    	});
    });

    $scope.csv = function(){
    	var exclude = [];
    	for(var code in $scope.modules){
    		var module = $scope.modules[code];
    		if(!module[0].use){
    			exclude.push(module[0].code);
    		}
    	}
    	window.location.href = 'http://uon-timetable-api.jit.su/api/courses/' + $routeParams.id +'?type=csv&exclude=' + exclude.join(',');
    };
});