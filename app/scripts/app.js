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
    'infinite-scroll',
    'ui.utils'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });