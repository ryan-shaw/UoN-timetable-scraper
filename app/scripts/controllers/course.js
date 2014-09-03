'use strict';

/**
 * @ngdoc function
 * @name uonApp.controller:CourseCtrl
 * @description
 * # MainCtrl
 * Controller of the uonApp
 */
angular.module('uonApp').controller('CourseCtrl', function ($scope, $http, $routeParams, $timeout) {
   	$http.get('http://uon-timetable-api.jit.su/api/courses/' + $routeParams.id).then(function(res){
    	$scope.course = res.data;
    	$timeout(filterEvents, 50);
    });
    var startWeek = new Date(2014, 8, 22);
   	$scope.events = [];
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
    $scope.eventSources = [$scope.events];
    var filterEvents = function(){
    	$scope.course.days.forEach(function(value, k){
    		value.modules.forEach(function(module){
    			if(!module.use){
    				return;
    			}
    			module.weeks.forEach(function(week){
    				var startTime, endTime;
    				
					var singleObject = {
    					title: module.name,
    					allDay: false
    				};
					// Insert 1
					startTime = module.time.start.split(':');
					endTime = module.time.end.split(':');
					singleObject.start = new Date(startWeek);
					singleObject.start.setDate(singleObject.start.getDate() + week * 7 + k);
					singleObject.start.setHours(startTime[0]);
					singleObject.start.setMinutes(startTime[1]);

					singleObject.end = new Date(startWeek);
					singleObject.end.setDate(singleObject.end.getDate() + week * 7 + k);
					singleObject.end.setHours(endTime[0]);
					singleObject.end.setMinutes(endTime[1]);

					insertEvent(singleObject);
				
    			});
    		});
    	});
    };
    $scope.filterModules = function(){
    	console.log($scope.eventSources);
    	$scope.eventSources[0] = [];
    	$timeout(filterEvents, 50);
    };

    function insertEvent(data){
    	$scope.eventSources[0].push(data);
    }
});