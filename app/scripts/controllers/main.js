'use strict';

/**
 * @ngdoc function
 * @name uonApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the uonApp
 */
angular.module('uonApp').controller('MainCtrl', function ($scope, $http) {
    $scope.updateCourses = function(){
    	if($scope.search.length < 3)
    		return;
    	$http.get('http://uon-timetable-api.jit.su/api/courses/'+$scope.search).then(function(res){
	    	$scope.courses = res.data;
	    });
    };
});