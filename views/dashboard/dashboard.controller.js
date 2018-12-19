(function () {
    'use strict';

    angular
        .module('app').directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function (value) {
                    if (value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    })
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = [ '$rootScope', '$scope', '$interval', '$timeout', '$http', '$window', '$ngConfirm', '$location', 'ezfb', '$q'];

    function DashboardController( $rootScope, $scope, $interval, $timeout, $http, $window, $ngConfirm, $location, ezfb, $q) {
        $timeout(function () {
            $scope.toggle = 0;
        }, 500);

    $scope.contact_us_email=''
    $scope.contact_us_message=''
        $scope.showModal = false;
        $scope.toggleModal = function () {
            $scope.showModal = !$scope.showModal;
        };
//    if not logged in , we are redirecting to home page

        $scope.all_bots = [];
        $scope.contact_us = 0;

        $scope.get_all_bots = function () {
//        function for getting all created bots details
            var url = "https://www.selekt.in/chatbot-solution/get-all-bots";
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: {'client_id': $rootScope.globals.clientData.client_id}
            }).then(
                function (resp) {
                    console.log('resp all bots > ', resp.data);
                    $scope.all_bots = resp.data;
                }, function (err) {
                    console.log(err);
                }
            )
        };

        $scope.openContactUs =  function(bot_id){
            $scope.contact_us_bot_id = bot_id;
            $scope.contact_us = 1;
        };

        $scope.sendMail = function(){
//            function for getting all created bots details
            var data = {'client_id': $rootScope.globals.clientData.client_id, 'bot_id': $scope.contact_us_bot_id,'email':$scope.contact_us_email,'message': $scope.contact_us_message}
            var url = "https://www.selekt.in/chatbot-solution/contact-us";
            console.log('data contact-us ', data)
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: data
            }).then(
                function (resp) {
                    console.log('contact us resp > ', resp.data);
                    $ngConfirm('Message sent')
                    $scope.contact_us = 0;

                }, function (err) {
                    console.log(err);
                }
            )
        }

        $scope.get_all_bots();

        $scope.changeBotWorkingStatus = function(bot_id,status){
                 var data = {'bot_id': bot_id,'bot_status':status}
            var url = "https://www.selekt.in/chatbot-solution/update-bot-status";
            console.log('data bot working status ', data)
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: data
            }).then(
                function (resp) {
                    console.log('bot working status resp > ', resp.data);
                    $scope.get_all_bots();

                }, function (err) {
                    console.log(err);
                }
            )
        }

        function updateApiCall() {
//            to call the different FB api's at once
            return $q.all([
                ezfb.api('/me/accounts'),
                ezfb.api('/me/')
            ])
                .then(function (resList) {
                    // Runs after both api calls are done
                    // resList[0]: FB.api('/me') response
                    // resList[1]: FB.api('/me/likes') response
                    console.log('accounts and me : ', resList);
                    for (var i = 0; i < resList[0].data.length; i++) {
                        const index = i;
                        console.log("Pages : ", i, resList[0].data[i].id);
                        $q.all([
                            ezfb.api('/' + resList[0].data[i].id + '/picture')
                        ]).then(function (response) {
                            console.log('response of all apis :', response)
                            var pageData;
                            pageData = {
                                "data": resList[0].data[index],
                                "picture": response[0].data.url
                            };
                            $rootScope.connectedPages.push(pageData);

                            console.log("Page Response : ", $rootScope.connectedPages);
                        })
                    }
                });

        }

        updateApiCall()

        $scope.deleteBot = function (botType) {
//        function to deleting a bot
//            ngConfirm is a library for displaying confirm alerts
            $ngConfirm({

                title: '',
                content: 'Are you sure to delete bot?',
                buttons: {
                    delete: function () {
                        // here the key 'something' will be used as the text.
                        var url = "https://www.selekt.in/chatbot-solution/delete-bot";
                        $http({
                            headers: {'content-type': 'application/json'},
                            method: "post",
                            url: url,
                            data: {
                                'client_id': $rootScope.globals.clientData.client_id,
                                'bot_type': botType
                            }
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
                        action: function () {
                        }
                    }
                }
            })
        }
    }
})();