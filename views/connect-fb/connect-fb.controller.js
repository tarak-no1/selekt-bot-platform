(function () {
    'use strict';

    angular
        .module('app')
        .controller('ConnectFbController',ConnectFbController);

    ConnectFbController.$inject = ['UserService', '$rootScope', '$scope', '$interval', '$timeout', '$http','$window','$ngConfirm','$location'];

    function ConnectFbController(UserService, $rootScope, $scope, $interval, $timeout, $http, $window,$ngConfirm,$location) {
        $timeout(function(){
            $scope.toggle = 0;
        },500)

         $scope.showModal = false;
    $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
    };
        if(JSON.parse($window.sessionStorage.getItem("client_data"))) {
            console.log('it is logged in dashboard');
        }
        else{
                $location.path('/');
        }
        $scope.all_bots = [];
        $scope.get_all_bots = function () {
            var url = "https://www.selekt.in/chatbot-solution/get-all-bots";
            console.log("Clidata : ",JSON.parse($window.sessionStorage.getItem("client_data")));
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: {'client_id': JSON.parse($window.sessionStorage.getItem("client_data")).client_id}
            }).then(
                function (resp) {
                    console.log('resp all bots > ', resp.data)
                    $scope.all_bots = resp.data
                }, function (err) {
                    console.log(err);
                }
            )
        };
        $scope.get_all_bots();

        $scope.deleteBot = function (botType) {


            $ngConfirm({

                     title: '',
                    content: 'Are you sure to delete bot?',
                buttons: {
                    delete: function(){
                        // here the key 'something' will be used as the text.
                         var url = "https://www.selekt.in/chatbot-solution/delete-bot";
                        $http({
                            headers: {'content-type': 'application/json'},
                            method: "post",
                            url: url,
                            data: {'client_id': JSON.parse($window.sessionStorage.getItem("client_data")).client_id,'bot_type': botType}
                        }).then(
                            function (resp) {
                                console.log('resp all bots > ', resp)
                                $scope.get_all_bots();
                            }, function (err) {
                                console.log(err);
                            }
                        )
                        $ngConfirm('Your bot is deleted.');
                    },
                    somethingElse: {
                        text: 'Cancel', // Some Non-Alphanumeric characters
                        action: function(){
                        }
                    }
                }
            })

        }

    }

})();