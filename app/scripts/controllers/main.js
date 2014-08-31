'use strict';

/**
 * @ngdoc function
 * @name uonApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the uonApp
 */
angular.module('uonApp').controller('MainCtrl', function ($scope, $http) {
   $http.get('http://uon-timetable-api.jit.su/api/courses').then(function(res){
    	$scope.courses = res.data;
    });
});