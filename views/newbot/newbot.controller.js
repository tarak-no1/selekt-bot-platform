(function () {
    'use strict';

    angular
        .module('app')
        .directive('fileModel', ['$parse', function ($parse) {
//        directive for file upload
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;
                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }])
        .controller('NewBot', NewBot);

    NewBot.$inject = ['UserService', '$rootScope', '$scope', '$interval', '$timeout', "$http", "ezfb", "$window", "$location", "$q", "fileUpload", '$ngConfirm'];

    function NewBot(UserService, $rootScope, $scope, $interval, $timeout, $http, ezfb, $window, $location, $q, fileUpload, $ngConfirm) {
        $scope.bot_name_selected = '';
        $rootScope.setup_page = 1;
        $scope.country_selected = '';
        $scope.connectedPages = [];
        $scope.newBotCreated = false;
        $scope.fb_pages = [];
        $scope.profilePic = $scope.profilePic;
        $scope.company_name = $rootScope.globals.clientData.company_name;
        $scope.fb_access_token = null;
        $scope.page_identifier = null;
        $scope.app_secret = null;
        $scope.app_id = null;
        getAllPages();

        if ($location.path().includes('/connect')) {
//            if url includes /connect , we are connect route , becoz this controller is used for connect-fb view also
            $scope.edit_bot = $location.path().split('/')[2]
        }

        $scope.disconnectPage = function (id) {
//            function to disconnect a fb page
            $ngConfirm({
                title: '',
                content: 'Are you sure to disconnect this page?',
                buttons: {
                    disconnect: function () {
                        // here the key 'something' will be used as the text.
                        var url = "https://www.prodx.in/chatbot-solution/disconnect-fb-page";
                        $http({
                            headers: {'content-type': 'application/json'},
                            method: "post",
                            url: url,
                            data: {
                                'page_identifier': id,
                                'client_id': $rootScope.globals.clientData.client_id
                            }
                        }).then(
                            function (resp) {
                                $ngConfirm('Your page is disconnected.');
                                console.log('resp disconnected page> ', resp)
                                $scope.get_all_bots();
                                getAllPages()
                            }, function (err) {
                                $ngConfirm(err);
                            }
                        )

                    },
                    somethingElse: {
                        text: 'Cancel', // Some Non-Alphanumeric characters
                        action: function () {
                        }
                    }
                }
            })
        }

        updateLoginStatus()
            .then(updateApiCall);

        /**
         * Subscribe to 'auth.statusChange' event to response to login/logout
         */
        ezfb.Event.subscribe('auth.statusChange', function (statusRes) {
            $scope.loginStatus = statusRes;

            updateMe();
        });

        function syncServerWithUserFacebookDetails() {
//        function to store fb page details in server
            var fb_pages = [];
            for (var i = 0; i < $scope.connectedPages.length; i++) {
                console.log("Sending page ", $scope.connectedPages.length);
                var pagesData = $scope.connectedPages[i];
                var page = {
                    "page_name": pagesData.data.name,
                    "access_token": pagesData.data.access_token,
                    "page_identifier": pagesData.data.id,
                    "page_image_url": pagesData.picture

                };
                console.log("Sending page ", page);
                fb_pages.push(page);
            }
            var url = "https://www.selekt.in/chatbot-solution/create-client-fb-details";
            console.log("Client data : ", $scope.client_data);
            var data = {
                client_id: $rootScope.globals.clientData.client_id,
                username: $scope.userName,
                fb_id: $scope.userId,
                profile_image: $scope.profilePic,
                fb_pages: fb_pages
            };
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: data
            }).then(
                function (resp) {
                    if (resp.status) {
                        console.log("Success sync : ", resp);
                        $scope.profilePic = resp.profile_image;
                        getAllPages();
                    }
                    else
                        console.log("Error sync : ", resp);
                }
            )
        }


        $scope.all_bots = [];
        $scope.get_all_bots = function () {
//        getting all created bots details
            var url = "https://www.selekt.in/chatbot-solution/get-all-bots";
            console.log("Clidata : ", $rootScope.globals.clientData.client_id);
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: {'client_id': $rootScope.globals.clientData.client_id}
            }).then(
                function (resp) {

                    console.log('resp all bots > ', resp.data)
                    $scope.all_bots = resp.data
                    updateApiCall();

                }, function (err) {
                    console.log(err);
                }
            )
        };
        $scope.get_all_bots();

//        $scope.isConnected = function(id){
//            for(var i in $scope.all_bots){
//                if($scope.all_bots[i].page_identifier == id)
//                {
//                    return $scope.all_bots[i].bot_type.toUpperCase();
//                    break;
//                }
//
//            }
//            return 0;
//
//        }
        $scope.uploadFile = function () {
//            upload inventory file along with other data
            var data = {
                client_id: $rootScope.globals.clientData.client_id,
                myFile: $scope.myFile,
                bot_type: 'fashion',
                filename: $scope.myFile.name,
                deals_status: $scope.deals_status,
                contact_number: $scope.contact_number
            };
            console.log('file is ', data);
            console.dir($scope.myFile);
            var uploadUrl = "https://www.selekt.in/chatbot-solution/update-inventory";
            fileUpload.uploadFileToUrl(data, uploadUrl, function (response) {
                if (response.error_code === false) {
                    console.log(response);
                    $location.path('#!/dashboard');
                } else {
                    console.log(response);
                }
            }, function (progress) {
                $scope.currentProgress = Math.min(progress, 100) / 100 * 300;
            });


        };

        $scope.login = function () {
            /**
             * Calling FB.login with required permissions specified
             * https://developers.facebook.com/docs/reference/javascript/FB.login/v2.0
             */
            // ezfb.login(null, {scope: 'manage_pages',});
            ezfb.login(function (res) {
                console.log("Fb status : ", res);
                // Executes 1
            }, {scope: 'user_location, email, manage_pages, pages_show_list, pages_messaging, public_profile'})
                .then(function (res) {
                    // Executes 2
                    //alert(JSON.stringify(res));
                    //updateApiCall()
                    console.log("Facebook status : ", res);
                    $scope.userName = res.name;
                    $scope.userId = res.id;
                    if (res.status == 'connected') {
                        updateApiCall(function (dataLen, pagesLen) {
                            console.log("Data len",dataLen,"pagesLen",pagesLen);
                            if (pagesLen === dataLen) {
                                syncServerWithUserFacebookDetails();
                            }
                        });
                    }
                });
            /**
             * In the case you need to use the callback
             *

             *
             * Note that the `res` result is shared.
             * Changing the `res` in 1 will also change the one in 2
             */
        };


        $scope.logout = function () {
            /**
             * Calling FB.logout
             * https://developers.facebook.com/docs/reference/javascript/FB.logout
             */
            logoutFromFaceBook();
            /**
             * In the case you need to use the callback
             *
             * ezfb.logout(function (res) {
     *   // Executes 1
     * })
             * .then(function (res) {
     *   // Executes 2
     * })
             */
        };

        // $scope.share = function () {
        //     var no = 1,
        //         callback = function (res) {
        //             console.log('FB.ui callback execution', no++);
        //             console.log('response:', res);
        //         };
        //
        //     ezfb.ui(
        //         {
        //             method: 'feed',
        //             name: 'angular-easyfb API demo',
        //             picture: 'http://plnkr.co/img/plunker.png',
        //             link: 'http://plnkr.co/edit/qclqht?p=preview',
        //             description: 'angular-easyfb is an AngularJS module wrapping Facebook SDK.' +
        //             ' Facebook integration in AngularJS made easy!' +
        //             ' Please try it and feel free to give feedbacks.'
        //         },
        //         callback
        //     )
        //         .then(callback);
        // };

        /**
         * For generating better looking JSON results
         */
        var autoToJSON = ['loginStatus', 'apiRes'];
        angular.forEach(autoToJSON, function (varName) {
            $scope.$watch(varName, function (val) {
                $scope[varName + 'JSON'] = JSON.stringify(val, null, 2);
            }, true);
        });

        /**
         * Update api('/me') result
         */
        function updateMe() {
            ezfb.getLoginStatus()
                .then(function (res) {
                    // res: FB.getLoginStatus response
                    // https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
                    return ezfb.api('/me');
                })
                .then(function (me) {
                    // me: FB.api('/me') response
                    // https://developers.facebook.com/docs/javascript/reference/FB.api
                    $scope.me = me;
                    console.log("Facebook status : ", me);

                });
        }

        /**
         * Update loginStatus result
         */
        function updateLoginStatus() {
            return ezfb.getLoginStatus()
                .then(function (res) {
                    // res: FB.getLoginStatus response
                    // https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
                    $scope.loginStatus = res;
                });
        }

        /**
         * Update demostration api calls result
         */
        function updateApiCall(callback) {
//          a function to call required fb api's  in a queue
            return $q.all([
                ezfb.api('/me/accounts'),
                ezfb.api('/me?fields=id,name,picture')
            ])
                .then(function (resList) {
                    // Runs after both api calls are done
                    // resList[0]: FB.api('/me') response
                    // resList[1]: FB.api('/me/likes') response
                    $scope.connectedPages = [];
                    console.log("User response", resList);
                    for (var i = 0; i < resList[0].data.length; i++) {
                        const index = i;
                        console.log("Reslist", resList[0].data[i]);
                        console.log("Login status : ",ezfb.getLoginStatus());
                        ezfb.api('/' + resList[0].data[i].id + '/?fields=picture',function(response){
                            console.log("Page Data",response);
                            var pageData = {
                                "data": resList[0].data[index],
                                "picture": response.picture.data.url
                            };
                            $scope.connectedPages.push(pageData);
                            callback(resList[0].data.length, $scope.connectedPages.length);
                        })
                    }
                    $scope.userName = resList[1].name;
                    $scope.userId = resList[1].id;
                    $scope.profilePic = resList[1].picture.data.url;
                });
        }

        function logoutFromFaceBook() {
//         logout from facebook server and setting facebook login status false in our backend
            ezfb.logout();
            var url = "https://www.selekt.in/chatbot-solution/fb-logout";
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: {
                    client_id: $rootScope.globals.clientData.client_id
                }
            }).then(
                function (resp) {
                    if (resp.status) {
                        console.log("Account disconnected from facebook : ", resp);
                        $scope.loggedInWithFacebook = false;
                    }
                    else
                        console.log("Error disconnecting account from facebook : ", resp);

                }
            )
        }

        function getAllPages() {
//    get all fb pages data from our server as we have already stored in our server
            var url = "https://www.selekt.in/chatbot-solution/get-fb-pages";
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: {
                    client_id: $rootScope.globals.clientData.client_id
                }
            }).then(
                function (resp) {
                    console.log("Getting all pages : ", resp);
                    /*status: true, username: "Amit Kumar Karn", fb_pages: Array(3)*/
                    $scope.loggedInWithFacebook = resp.data.status;
                    $scope.displayUserName = resp.data.username;
                    $scope.fb_pages = resp.data.fb_pages;
                    $scope.profilePic = resp.data.profile_image;
                    console.log("Getting all pages : ", $scope.loggedInWithFacebook, $scope.displayUserName, $scope.fb_pages);
                }, function (err) {
                    console.log("Error sync : ", err);
                }
            )
        }

        $scope.connect = function (fb_access_token, page_identifier) {
            $scope.fb_access_token = fb_access_token;
            $scope.page_identifier = page_identifier;
//            creating a new bot
            
        };

        $scope.connectPageToBot = function(){

            var url = "https://www.selekt.in/chatbot-solution/create-bot";
            var data = {
                client_id: $rootScope.globals.clientData.client_id,
                bot_type: $scope.bot_name_selected,
                country: $scope.country_selected,
                fb_access_token: $scope.fb_access_token,
                page_identifier: $scope.page_identifier,
                app_id : $scope.app_id,
                app_secret : $scope.app_secret
            }

            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: data
            }).then(
                function (resp) {
                    console.log('create bot ', resp)
                    if (!resp.data.status) {
                        $ngConfirm(resp.data.message)
                    } else {

                        $ngConfirm("Your bot is created")
                        getAllPages();
                        $scope.newBotCreated = true;
                        $scope.get_all_bots();
                    }
                    console.log("bot >" + JSON.stringify(resp));

                }, function (err) {
                    console.log(err);
                }
            )
        };

        $scope.showClipboardMessage = function () {
//        copying the text to clipboard automatically
            var x = document.getElementById("snackbar");
            x.className = "show";
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 2000);
        };
        $scope.connect_fb = function ($fb_access_token, $page_identifier) {
//        changing the fb page to another for a bot
            var url = "https://www.selekt.in/chatbot-solution/update-bot";
            var bot_id = 0;
            for (var x in $scope.all_bots) {
                if ($scope.all_bots[x].bot_type == $scope.edit_bot) {
                    bot_id = $scope.all_bots[x].bot_id;
                    break;
                }
            }
            var data = {
                client_id: $rootScope.globals.clientData.client_id,
                bot_id: bot_id,
                fb_access_token: $fb_access_token,
                page_identifier: $page_identifier
            };
            console.log('re connect fb page data sent : ', data)
            $http({
                headers: {'content-type': 'application/json'},
                method: "post",
                url: url,
                data: data
            }).then(
                function (resp) {

                    console.log('update bot ', resp)
                    if (!resp.data.status) {
                        $ngConfirm(resp.data.message)
                    } else {
                        $ngConfirm(resp.data.message)
                        $scope.get_all_bots();
                        getAllPages()

                    }
                    console.log("bot >" + JSON.stringify(resp));

                }, function (err) {
                    console.log(err);
                }
            )
        };
    }
})();