var mainApp = angular.module('mainApp', [
  'ui.router',
  'bookApp',
  'ngCookies',
  'adminApp',
  'userApp'
]);

mainApp.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/books/all');

  $stateProvider
    .state('main', {
      url: '',
      templateUrl: 'views/book/main.html',
      controller: 'MainBooksCtrl'
    })
    .state('main.all', {
      url: '/books/all',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.frontend', {
      url: '/books/frontend',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.backend', {
      url: '/books/backend',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.database', {
      url: '/books/database',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.bigdata', {
      url: '/books/bigdata',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.ios', {
      url: '/books/ios&android',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.ui', {
      url: '/books/ui',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.other', {
      url: '/books/other',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.liked', {
      url: '/books/liked',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.borrowed', {
      url: '/books/borrowed',
      templateUrl: 'views/book/allbooks.html',
      controller: 'AllBooksCtrl'
    })
    .state('main.detail', {
      url: '/book/:bookId',
      templateUrl: 'views/book/detailbook.html',
      controller: 'DetailBookCtrl'
    })
    .state('main.home', {
      url: '/home',
      templateUrl: 'views/user/home.html',
      controller: 'UserHomeCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'views/user/login.html',
      controller: 'LoginCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'views/user/register.html',
      controller: 'RegCtrl'
    })
    .state('manage', {
      url: '',
      templateUrl: 'views/admin/admin-main.html',
      controller: 'ManageCtrl'
    })
    .state('manage.books', {
      url: '/manage/books',
      templateUrl: 'views/admin/admin-books.html',
      controller: 'ManageBooksCtrl'
    })
    .state('manage.events', {
      url: '/manage/events',
      templateUrl: 'views/admin/admin-events.html',
      controller: 'ManageEventsCtrl'
    })
    .state('manage.logs', {
      url: '/manage/logs',
      templateUrl: 'views/admin/admin-logs.html',
      controller: 'ManageLogsCtrl'
    })
    .state('manage.newBook', {
      url: '/manage/newBook',
      templateUrl: 'views/admin/admin-new.html',
      controller: 'NewBookCtrl'
    })
    .state('manage.detail', {
      url: '/manage/book/:bookId',
      templateUrl: 'views/admin/admin-item.html',
      controller: 'ManageBookCtrl'
    })
    .state('adminLogin', {
      url: '/adminLogin',
      templateUrl: 'views/admin/adminlogin.html',
      controller: 'AdminLoginCtrl'
    });
});

mainApp.run(function($rootScope, $window, $cookies, $http, $location) {
  var user = $cookies.getObject('user');
  console.log('$cookies User=', user);

  $rootScope.logInUser = {
    'name': user ? user.name : '',
    'intrID': user ? user.intrID : '',
    'phoneNum': user ? user.phoneNum : '',
    'image': user ? user.image : ''
  };
  $rootScope.logOut = function () {
    $http.post('/user/logOut').success(function(res){
      $rootScope.logInUser = {};
      $cookies.remove('user');
      $cookies.remove('connect.sid');
    }).error(function(res){
      console.log('Logout Failed!');
    });
  };

  $rootScope.adminLogOut = function () {
    $http.post('/admin/logOut').success(function(res){
      $location.path('/adminLogin');
    }).error(function(res){
      console.log('Admin Logout Failed!');
    });
  };
});

mainApp.factory('authInterceptor', function($rootScope, $q, $window, $location) {
  return {
    responseError: function(rejection) {
      console.log('rejection', rejection);
      if (rejection.status === 401 && rejection.data === 'User') {
        // handle the case where the user is not authenticated
        console.log("[responseError]session timeout");
        $location.path('/login');
      } else if (rejection.status === 401 && rejection.data === 'Admin'){
        $location.path('/adminLogin');
      };
      return $q.reject(rejection);
    }
  };
});

mainApp.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
