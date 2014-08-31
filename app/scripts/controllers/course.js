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
    	filterEvents();
    });
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    var startWeek = new Date(2014, 8, 22);
   	var events = [{title: 'All Day Event', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false}];
   	$scope.uiConfig = {
      	calendar:{
	        // height: 450,
	        editable: false,
	        header:{
	          left: 'title',
	          center: '',
	          right: 'today prev,next'
	        },
        	eventClick: $scope.alertOnEventClick,
        	eventDrop: $scope.alertOnDrop,
        	eventResize: $scope.alertOnResize,
        	defaultView: 'agendaWeek'
     	}
    };
    $scope.eventSources = [events];

    var filterEvents = function(){
    	$scope.course.days.forEach(function(value, k){
    		value.modules.forEach(function(module){
    			module.weeks.forEach(function(week){
    				week = week.split('-');
    				var startTime, endTime;
    				
    				if(week.length > 1){
    					// We have a range here
    					for(var i = parseInt(week[0]); i < parseInt(week[1]); i ++){
    						var multiObject = {
		    					title: module.name,
		    					allDay: false
		    				};
    						// Insert at this week
    						startTime = module.time.start.split(':');
	    					endTime = module.time.end.split(':');
	    					multiObject.start = new Date(startWeek);
	    					multiObject.start.setDate(multiObject.start.getDate() + (i * 7) + k);
	    					multiObject.start.setHours(startTime[0]);
	    					multiObject.start.setMinutes(startTime[1]);

	    					multiObject.end = new Date(startWeek);
	    					multiObject.end.setDate(multiObject.end.getDate() + (i * 7) + k);
	    					multiObject.end.setHours(endTime[0]);
	    					multiObject.end.setMinutes(endTime[1]);

	    					insertEvent(multiObject);
    					}
    				}else{
    					var singleObject = {
	    					title: module.name,
	    					allDay: false
	    				};
    					// Insert 1
    					startTime = module.time.start.split(':');
    					endTime = module.time.end.split(':');
    					singleObject.start = new Date(startWeek);
    					singleObject.start.setDate(singleObject.start.getDate() + week[0] * 7 + k);
    					singleObject.start.setHours(startTime[0]);
    					singleObject.start.setMinutes(startTime[1]);

    					singleObject.end = new Date(startWeek);
    					singleObject.end.setDate(singleObject.end.getDate() + week[0] * 7 + k);
    					singleObject.end.setHours(endTime[0]);
    					singleObject.end.setMinutes(endTime[1]);

    					insertEvent(singleObject);
    				}
    			});
    		});
    	});
    };
    function insertEvent(data){
    	events.push(data);
    	$scope.eventSources = [events];
    }
});