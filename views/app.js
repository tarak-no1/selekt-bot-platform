(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngCookies', 'ezfb', 'cp.ngConfirm', 'ngclipboard'])
        .config(function (ezfbProvider) {
//        FB api setup
            ezfbProvider.setInitParams({
                appId: '171588376820567'
            });
        })
        .config(config)
        .run(run);

    config.$inject = ['$routeProvider', '$locationProvider', '$httpProvider'];
//    routing
    function config($routeProvider, $locationProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
        $routeProvider
            .when('/', {
                controller: 'HomeController',
                templateUrl: '/chatbot-solution/home/home.view.html',
                controllerAs: 'vm',
                access: {allowAnonymous: true}
            })

            .when('/login', {
                controller: 'LoginController',
                templateUrl: '/chatbot-solution/login/login.view.html',
                controllerAs: 'vm',
                access: {allowAnonymous: true}
            })

            .when('/update-inventory', {
                controller: 'UpdateInventory',
                templateUrl: '/chatbot-solution/update-inventory/update.view.html',
                controllerAs: 'vm',
            })

            .when('/forgot', {
                controller: 'ForgotController',
                templateUrl: '/chatbot-solution/forgot-password/forgot.view.html',
                controllerAs: 'vm',
                access: {allowAnonymous: true}
            })
            .when('/connect/:edit_bot', {
                controller: 'NewBot',
                templateUrl: '/chatbot-solution/connect-fb/connect-fb.view.html',
                controllerAs: 'vm',
                access: {allowAnonymous: true}
            })

            .when('/signup', {
                controller: 'RegisterController',
                templateUrl: '/chatbot-solution/register/register.view.html',
                controllerAs: 'vm',
                access: {allowAnonymous: false}
            })
            .when('/dashboard', {
                controller: 'DashboardController',
                templateUrl: '/chatbot-solution/dashboard/dashboard.view.html',
                controllerAs: 'vm',
                access: {allowAnonymous: false}
            })
            .when('/newbot', {
                controller: 'NewBot',
                templateUrl: '/chatbot-solution/newbot/newbot.view.html',
                controllerAs: 'vm',
                access: {allowAnonymous: false}
            })
            .when('/logout', {
                controller: 'LogoutController',
                template: '',
                controllerAs: 'vm'
            });
    }

    run.$inject = ['$rootScope', 'AuthenticationService', '$location', '$cookies', '$http', '$window'];

    function run($rootScope, $AuthenticationService, $location, $cookies, $http, $window) {
        // keep user logged in after page refresh

        $rootScope.path = function (path) {
            return ($location.path().substr(0, path.length) === path) ? 'active' : '';
        };

        $rootScope.globals = $cookies.getObject('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
            $rootScope.userLogged = true;
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {

            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/dashboard', '/newbot', '/connect', '/update-inventory']) > -1;
            console.log("Restricted ", restrictedPage);
            var loggedIn = $rootScope.globals.currentUser;
            $rootScope.route = ($location.path());
            console.log('path:', $rootScope.route)
            //console.log('glonblas ',$rootScope.globals)
            if (!loggedIn && restrictedPage) {
                $location.path('/');
            }
        });
    }

})();