'use strict';

/**
 * @ngdoc overview
 * @name uonApp
 * @description
 * # uonApp
 *
 * Main module of the application.
 */
angular
  .module('uonApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.calendar' 
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/course/:id', {
        templateUrl: 'views/course.html',
        controller: 'CourseCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });