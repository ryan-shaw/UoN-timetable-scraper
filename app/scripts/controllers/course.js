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
    	console.log($scope.modules);
    });
    //var startWeek = new Date(2014, 8, 22);
   	//$scope.events = [];
   	$scope.uiConfig = {
      	calendar:{
	        // height: 450,
	        editable: false,
	        header:{
	          left: 'title',
	          center: '',
	          right: 'today prev,next'
	        },
        	// eventClick: $scope.alertOnEventClick,
        	// eventDrop: $scope.alertOnDrop,
        	// eventResize: $scope.alertOnResize,
        	defaultView: 'agendaWeek'
     	}
    };

    $scope.csv = function(){
    	var exclude = [];
    	for(var code in $scope.modules){
    		var module = $scope.modules[code];
    		if(!module[0].use){
    			exclude.push(module[0].code);
    		}
    	}
    	// $scope.course.days.forEach(function(day){
	    // 	day.modules.forEach(function(module){
	    // 		if(!module.use){
	    // 			exclude.push(module.code.split('/')[0]);
	    // 		}
	    // 	});
    	// });
    	window.location.href = 'http://uon-timetable-api.jit.su/api/courses/' + $routeParams.id +'?type=csv&exclude=' + exclude.join(',');
    };

    // $scope.eventSources = [$scope.events];
    // var filterEvents = function(){
    // 	$scope.course.days.forEach(function(value, k){
    // 		value.modules.forEach(function(module){
    // 			if(!module.use){
    // 				return;
    // 			}
    // 			module.weeks.forEach(function(week){
    // 				var startTime, endTime;
    				
				// 	var singleObject = {
    // 					title: module.name,
    // 					allDay: false
    // 				};
				// 	// Insert 1
				// 	startTime = module.time.start.split(':');
				// 	endTime = module.time.end.split(':');
				// 	singleObject.start = new Date(startWeek);
				// 	singleObject.start.setDate(singleObject.start.getDate() + week * 7 + k);
				// 	singleObject.start.setHours(startTime[0]);
				// 	singleObject.start.setMinutes(startTime[1]);

				// 	singleObject.end = new Date(startWeek);
				// 	singleObject.end.setDate(singleObject.end.getDate() + week * 7 + k);
				// 	singleObject.end.setHours(endTime[0]);
				// 	singleObject.end.setMinutes(endTime[1]);

				// 	insertEvent(singleObject);
				
    // 			});
    // 		});
    // 	});
    // };
    // $scope.filterModules = function(){
    // 	// console.log($scope.eventSources);
    // 	// $scope.eventSources[0] = [];
    // 	// $timeout(filterEvents, 50);
    // };

    // function insertEvent(data){
    // 	$scope.eventSources[0].push(data);
    // }
});