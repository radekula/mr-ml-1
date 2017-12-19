var app = angular.module("ngDMS", ["ngRoute", "ngCookies"]);


function getNowDate() {
    nowDate = new Date();
    day = nowDate.getDate();
    day = day < 10 ? "0" + day : day;
    month = nowDate.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    year = nowDate.getFullYear();
    return year + "-" + month + "-" + day;
}


function getErrorMessage(status) {
    switch(status) {
        case 400:
            return "Błędne żądanie.";
        break;
        case 403:
            return "Nieprawidłowy lub wygasły token.";
        break;
        case 406:
            return "Użytkownik nie może wykonać tej akcji (nie jest przypisany do kroku).";
        break;
        case 500:
            return "Błąd wewnętrzny serwera.";
        break;
        default:
            return "Wystąpił nieoczekiwany błąd.";
        break;
    }
}


/*
 ** Routing
 */
app.config(function($routeProvider) {
    $routeProvider.when("/", {
        title: "Pulpit",
        templateUrl: "/www/angular/desktop.html",
        controller: "DesktopController"
    });
    
    $routeProvider.when("/user", {
        title: "Profil użytkownika",
        templateUrl: "/www/angular/user.html",
        controller: "UserController"
    });
    
    $routeProvider.when("/action/:step_type/:document_id/:step_id", {
        title: "Akcja na dokumencie",
        templateUrl: "/www/angular/action.html",
        controller: "ActionController"
    });
    
    $routeProvider.when("/documents", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    
    $routeProvider.when("/documents/:page", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    
    $routeProvider.when("/documents/:phrase/:page", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    
    $routeProvider.when("/document/:document_id", {
        title: "Dokument",
        templateUrl: "/www/angular/document.html",
        controller: "DocumentController"
    });
    
    $routeProvider.when("/flows", {
        title: "Przepływy",
        templateUrl: "/www/angular/flows.html",
        controller: "FlowsController"
    });
    
    $routeProvider.when("/flows/:page", {
        title: "Przepływy",
        templateUrl: "/www/angular/flows.html",
        controller: "FlowsController"
    });
    
    $routeProvider.when("/flows/:phrase/:page", {
        title: "Przepływy",
        templateUrl: "/www/angular/flows.html",
        controller: "FlowsController"
    });
    
    
    $routeProvider.when("/add", {
        title: "Dodaj dokument",
        templateUrl: "/www/angular/add.html",
    });
    
    $routeProvider.when("/flow/:page", {
        title: "Przepływ",
        templateUrl: "/www/angular/flow.html",
        controller: "FlowController"
    });
    
    $routeProvider.when("/status/:page", {
        title: "Status",
        templateUrl: "/www/angular/status.html",
        controller: "StatusController"
    });
    
    $routeProvider.when("/groups", {
        title: "Grupy użytkowników",
        templateUrl: "/www/angular/groups.html",
        controller: "GroupsController"
    });
    
    $routeProvider.when("/groups/:search", {
        title: "Grupy użytkowników",
        templateUrl: "/www/angular/groups.html",
        controller: "GroupsController"
    });
    
    $routeProvider.when("/members/:group", {
        title: "Grupa użytkowników",
        templateUrl: "/www/angular/members.html",
        controller: "MembersController"
    });
    
    $routeProvider.otherwise( {
        title: "Podana strona nie istnieje",
        templateUrl: "/www/angular/404.html",
    });
});


/*
 ** Set page title
 */
app.controller("ngDMSHead", ["$scope", function($scope) {
    $scope.$on("$routeChangeSuccess", function(event, data) {
        $scope.pageTitle = data.title;
    });
}]);


/*
 ** Set current path
 */
app.controller("menu", function($scope, $location) {
    $scope.path = $location.path();
});


/*
 ** Init app
 */
app.controller("ngDMSBody", ["$scope", "$cookies", "$location", function($scope, $cookies, $location) {
    $scope.login = $cookies.get("login");
    $scope.toggle = $cookies.get("menu-toggle") ? true : false;
    
    $scope.menuToggle = function() {
        if($cookies.get("menu-toggle")) {
            $cookies.remove("menu-toggle");
            $scope.toggle = false;
        } else {
            expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 60 * 60 * 24 * 365);
            $cookies.put("menu-toggle", "true", {
                expires: expireDate,
                path: '/'
            });
            $scope.toggle = true;
        }
    }
    
    // Set classes body
    $scope.$on("$routeChangeSuccess", function(event, data) {
        if($location.path() == '/') {
            $scope.body = "page page-desktop";
        } else if ($location.path().search("/user") != -1) {
            $scope.body = "page page-user";
        } else if ($location.path().search("/action") != -1) {
            $scope.body = "page page-action";
        } else if ($location.path().search("/documents") != -1) {
            $scope.body = "page page-documents";
        } else if ($location.path().search("/flows") != -1) {
            $scope.body = "page page-flow";
        } 
        
        else if ($location.path().search("/document") != -1) {
            $scope.body = "page page-document";
        } else if ($location.path().search("/groups") != -1) {
            $scope.body = "page page-groups";
        } else if ($location.path().search("/members") != -1) {
            $scope.body = "page page-members";
        }else if ($location.path().search("/flow") != -1) {
            $scope.body = "page page-flow";
        } else if ($location.path().search("/status") != -1) {
            $scope.body = "page page-status";
        } else if ($location.path().search("/add") != -1) {
            $scope.body = "page page-add";
        } else {
            $scope.body = "page-404";
        }
    });
}]);


/*
 ** Search engine in header
 */
app.controller("SearchController", function($scope, $location) {
    $scope.search = function($event) {
        $event.preventDefault();
        
        if( $scope.search_phrase && $scope.search_phrase !== "" ) {
            $location.path("/documents/" + encodeURI($scope.search_phrase) + "/1");
        } else {
            $location.path("/documents/1");
        }
    }
});


/*
 ** Desktop Controller
 */
app.controller("DesktopController", function($scope, $http) {
    $scope.data = {
        actions : {
            total : "0",
            result : []
        },
        comments : {
            total : "0",
            result : []
        },
        documents : [],
    }
    $scope.emptyActions = false;
    $scope.emptyComments = false;
    $scope.emptyDocuments = false;
    
    jQuery( document ).ready( function() {
        jQuery( ".js-box-more" ).on( "click", function() {
            thisObject = jQuery( this );
            thisObject.toggleClass( "on", "" );
            thisObject.prev( ".box-table-more" ).slideToggle( "slow" );
        } );
    } );
    
    $http.get( // Get user actions in current steps
        "/service/flows-documents/user/admin/current_actions"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.actions = response.data;
                }
            } else {
                alert(getErrorMessage(response.status));
            }
            
            $scope.emptyActions = $scope.data.actions.total > 0 ? false : true;
        },
        function(response) { // Error
            alert(getErrorMessage(response.status));
        }
    );
    
    $http.get( // Get list of comments
        "/service/desktop/comments"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.comments = response.data;
                }
            } else {
                alert(getErrorMessage(response.status));
            }
            
            $scope.emptyComments = $scope.data.comments.total > 0 ? false : true;
        },
        function(response) { // Error
            alert(getErrorMessage(response.status));
        }
    );
    
    $http.get( // Get list of user documents
        "/service/desktop/documents"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.documents = response.data;
                }
            } else {
                alert(getErrorMessage(response.status));
            }
            
            $scope.emptyDocuments = $scope.data.documents.total > 0 ? false : true;
        },
        function(response) { // Error
            alert(getErrorMessage(response.status));
        }
    );
} );


/*
 ** User controller
 */
app.controller("UserController", function($scope, $cookies, $http, $interval) {
    $scope.data = {
        user : {
            type : "",
            active : true,
            login: "",
            first_name: "",
            last_name: "",
            email: "",
            last_login: "",
            last_active: "",
            expiration_time: ""
        },
        keys : {
            public_key : "",
            private_key : ""
        },
        password : {
            old_password: "",
            new_password: "",
            repeat_password: "",
        },
        groups : []
    }
    
    $http.get( // Get basic information about user
        "/service/users/user"
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.user = response.data;
                }
            } else {
                alert(getErrorMessage(response.status));
            }
        },
        function(response) { // Error
            if(response.status == 404) {
                $location.path("/404");
            } else if(response.status == 403) {
                alert("Twoje konto nie może uzyskać danych użytkownika lub Twój token stracił ważność.");
            } else {
                alert(getErrorMessage(response.status));
            }
        }
    );
    
    $http.get( // Get user public key
        "/service/signing/user/" + $scope.login + "/keys"
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.keys.public_key = response.data.public_key;
                }
            } else {
                alert(getErrorMessage(response.status));
            }
        },
        function(response) { // Error
            if(response.status == "404") {
                alert("Nie znaleziono klucza lub użytkownika.");
            } else {
                alert(getErrorMessage(response.status));
            }
        }
    );
    
    $scope.saveUser = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        $scope.notice = [];
        
        if($scope.userForm.$valid) {
            $scope.loadPage = true;
            var steps = 0;
            
            $http.put( // Update user data
                "/service/users/user/" + $scope.login,
                JSON.stringify({
                    "type" : "normal",
                    "active" : true,
                    "first_name" : $scope.data.user.first_name,
                    "last_name" : $scope.data.user.last_name,
                    "email" : $scope.data.user.email
                })
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $scope.notice.push({
                            "content": "Profil został zaktualizowany.",
                            "class": "alert-success"
                        });
                    } else {
                        $scope.notice.push({
                            "content": getErrorMessage(response.status),
                            "class": "alert-success"
                        });
                    }
                    
                    steps++;
                },
                function(response) { // Error
                    if(response.status == "404") {
                        $scope.notice.push({
                            "content": "Użytkownik nie znaleziony.",
                            "class": "alert-danger"
                        });
                    } else {
                        $scope.notice.push({
                            "content": getErrorMessage(response.status),
                            "class": "alert-danger"
                        });
                    }
                    
                    steps++;
                }
            );
            
            $http.put( // Add or update user keys
                "/service/signing/user/" + $scope.login + "/keys",
                JSON.stringify($scope.data.keys)
            ).then(
                function(response) { // Success
                    steps++;
                },
                function(response) { // Error
                    if(response.status == "404") {
                        $scope.notice.push({
                            "content": "Użytkownik nie znaleziony.",
                            "class": "alert-danger"
                        });
                    } else {
                        $scope.notice.push({
                            "content": getErrorMessage(response.status),
                            "class": "alert-danger"
                        });
                    }
                    
                    steps++;
                }
            );
            
            $http.post( // Change user password
                "/service/users/change_password/" + $scope.login,
                JSON.stringify({
                    "old_password": $scope.data.password.old_password,
                    "new_password": $scope.data.password.new_password
                })
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $scope.notice.push({
                            "content": "Hasło zostało zmienione.",
                            "class": "alert-success"
                        });
                    } else {
                        $scope.notice.push({
                            "content": getErrorMessage(response.status),
                            "class": "alert-success"
                        });
                    }
                    
                    steps++;
                },
                function(response) { // Error
                    if(response.status == "404") {
                        $scope.notice.push({
                            "content": "Użytkownik nie znaleziony.",
                            "class": "alert-danger"
                        });
                    } else {
                        $scope.notice.push({
                            "content": getErrorMessage(response.status),
                            "class": "alert-danger"
                        });
                    }
                    
                    steps++;
                }
            );
            
            interval = $interval(
                function() {
                    if(steps == 3) {
                        $interval.cancel(interval);
                        $scope.loadPage = false;
                    }
                }, 1
            );
        } else {
            $scope.notice.push({
                "content": "Błędnie wypełniony formularz.",
                "class": "alert-danger"
            });
            
            $scope.loadPage = false;
        }
    }
});


/*
 ** Action Controller
 */
app.controller("ActionController", function($scope, $routeParams, $http, $location) {
    $scope.data = {
        document : {
            id : $routeParams.document_id,
            title : "",
            description : ""
        },
        step : {
            id : $routeParams.step_id,
            type : $routeParams.step_type
        }
    }
    
    $http.get( // Get document by id
        "/service/documents/document/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.document = response.data;
                }
            } else {
                alert(getErrorMessage(response.status));
            }
        },
        function(response) { // Error
            if(response.status == 404) {
                $location.path("/404");
            } else {
                alert(getErrorMessage(response.status));
            }
        }
    );
    
    $scope.doAction = function($event) {
        $event.preventDefault();
        
        $http.put( // Perform a user action for a step
            "/service/flows-documents/action/" + $scope.data.document.id + "/" + $scope.data.step.id
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    alert("Akcja została wykonana.");
                    $location.path("/");
                } else {
                    alert(getErrorMessage(response.status));
                }
            },
            function(response) { // Error
                if(response.status == 404) {
                    $location.path("/404");
                } else {
                    alert(getErrorMessage(response.status));
                }
            }
        );
    }
});


/*
 ** Documents controller
 */
app.controller("DocumentsController", function($scope, $routeParams, $http, $location) {
    if(isNaN($routeParams.page)) {
        if($location.path() == "/documents") {
            $location.path("/documents/1");
        }
    } else {
        $scope.loadPage = true;
        $scope.notice = [];
        $scope.data = {
            limit : 5,
            currentPage : $routeParams.page,
            numberOfPages : 0,
            phrase : $routeParams.phrase ? decodeURI($routeParams.phrase) : "",
            pages : [],
            documents : {
                total : "0",
                result : []
            }
        }
        $scope.data.offset = 5 * ( $scope.data.currentPage - 1 );
        
        function getPagination() {
            if($scope.data.currentPage - 1 < $scope.data.numberOfPages) {
                i = $scope.data.currentPage;
                max = i + 3;
                diff = max - $scope.data.numberOfPages;
                
                if(diff > 0) {
                    i = ( i - diff ) > 1 ? ( i - diff ) : 1;
                }
                
                for(i; i <= max; i++) {
                    if (i > $scope.data.numberOfPages) break;
                    $scope.data.pages.push(i);
                }
            }
        }
        
        $scope.filter = function($event) {
            $event.preventDefault();
            
            if( $scope.data.phrase !== "" ) {
                $location.path("/documents/" + encodeURI($scope.data.phrase) + "/1");
            } else {
                $location.path("/documents/1");
            }
        }
        
        $http.get( // Get all documents
            "/service/documents/documents?limit=" + $scope.data.limit + "&offset=" + $scope.data.offset + "&search=" + $scope.data.phrase
        ).then(
            function(response) { // Success
                if(response.status == 200) {
                    if(typeof response.data == "object") {
                        $scope.data.documents = response.data;
                        $scope.data.numberOfPages = Math.ceil($scope.data.documents.total / $scope.data.limit);
                        getPagination();
                        
                        if($scope.data.documents.total == 0) {
                            $scope.notice.push({
                                "content": "Nie znaleziono dokumentów.",
                                "class": "alert-danger"
                            });
                        }
                    } else {
                        $scope.notice.push({
                            "content": getErrorMessage(response.status),
                            "class": "alert-danger"
                        });
                    }
                    
                    $scope.loadPage = false;
                }
            },
            function(response) { // Error
                if(response.status == 404) {
                    $scope.notice.push({
                        "content": "Nie znaleziono dokumentów.",
                        "class": "alert-danger"
                    });
                } else {
                    $scope.notice.push({
                        "content": getErrorMessage(response.status),
                        "class": "alert-danger"
                    });
                }
                
                $scope.loadPage = false;
            }
        );
    }
});


/*
 ** Document controller
 */
app.controller("DocumentController", function($scope, $routeParams, $http, $cookies, $location) {
    $scope.data = {
        document : {
            "id": $routeParams.document_id,
            "title": "",
            "file_name": "",
            "create_date": "",
            "description": "",
            "owner": [],
            "metadata": [],
            "thumbnail": "",
            "data": ""
        },
        owner : "",
        flow : "",
        sign : false
    }
    
    $http.get( // Get document
        "/service/documents/document/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.document = response.data;
                    $scope.data.owner = response.data.owner.join(', ');
                }
            } else {
                alert(getErrorMessage(response.status));
            }
        },
        function(response) { // Error
            if(response.status == 404) {
                $location.path("/404");
            } else if(response.status == 500) {
                alert(getErrorMessage(response.status));
            }
        }
    );
    
    $http.get( // Verify if document in signed by user
        "/service/signing/verify/" + $scope.data.document.id + "/" + $scope.login
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                $scope.data.sign = true;
            } else {
                alert(getErrorMessage(response.status));
            }
        },
        function(response) { // Error
            if(response.status != 404) {
                alert(getErrorMessage(response.status));
            }
        }
    );
    
    $http.get( // Get information about document status in flow
        "/service/flows-documents/status/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $http.get( // Get basic information about flow
                        "/service/flows/flow/" + response.data.flow
                    ).then(
                        function(response) { // Success
                            if(response.status == 200) {
                                if(typeof response.data == "object") {
                                    $scope.data.flow = response.data.name;
                                }
                            } else {
                                alert(getErrorMessage(response.status));
                            }
                        },
                        function(response) { // Error
                            if(response.status == 403) {
                                alert("Nie możesz uzyskać danych przepływu lub wygasł Twój token.");
                            } else if(response.status != 404) {
                                alert(getErrorMessage(response.status));
                            }
                        }
                    );
                }
            }
        },
        function(response) { // Error
            if(response.status != 404) {
                alert(getErrorMessage(response.status));
            }
        }
    );
});


/*
 ** Flows Controller
 */
app.controller("FlowsController", function($scope, $route, $routeParams, $http, $location) {
    if(isNaN($routeParams.page)) {
        if($location.path() == "/flows") {
            $location.path("/flows/1");
        }
    } else {
        $scope.loadPage = true;
        $scope.notice = [];
        $scope.data = {
            limit : 5,
            currentPage : $routeParams.page,
            numberOfPages : 0,
            phrase : $routeParams.phrase ? decodeURI($routeParams.phrase) : "",
            pages : [],
            flows : {
                total : "0",
                result : []
            }
        }
        $scope.data.offset = 5 * ( $scope.data.currentPage - 1 );
        
        function getPagination() {
            if($scope.data.currentPage - 1 < $scope.data.numberOfPages) {
                i = $scope.data.currentPage;
                max = i + 3;
                diff = max - $scope.data.numberOfPages;
                
                if(diff > 0) {
                    i = ( i - diff ) > 1 ? ( i - diff ) : 1;
                }
                
                for(i; i <= max; i++) {
                    if (i > $scope.data.numberOfPages) break;
                    $scope.data.pages.push(i);
                }
            }
        }
        
        $scope.filter = function($event) {
            $event.preventDefault();
            
            if( $scope.data.phrase !== "" ) {
                $location.path("/flows/" + encodeURI($scope.data.phrase) + "/1");
            } else {
                $location.path("/flows/1");
            }
        }
        
        $http.get( // Get list of flows
            "/service/flows/flows?limit=" + $scope.data.limit + "&offset=" + $scope.data.offset + "&search=" + $scope.data.phrase
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    if(typeof response.data == "object") {
                        $scope.data.flows = response.data;
                        $scope.data.numberOfPages = Math.ceil($scope.data.flows.total / $scope.data.limit);
                        getPagination();
                        
                        if($scope.data.flows.total == 0) {
                            $scope.notice.push({
                                "content": "Nie znaleziono przepływów.",
                                "class": "alert-danger"
                            });
                        }
                    } else {
                        $scope.notice.push({
                            "content": getErrorMessage(response.status),
                            "class": "alert-danger"
                        });
                    }
                    
                    $scope.loadPage = false;
                }
            },
            function(response) { // Error
                if(response.status == 404) {
                    $scope.notice.push({
                        "content": "Nie znaleziono przepływów.",
                        "class": "alert-danger"
                    });
                } else {
                    $scope.notice.push({
                        "content": getErrorMessage(response.status),
                        "class": "alert-danger"
                    });
                }
                
                $scope.loadPage = false;
            }
        );
        
        $scope.addFlow = function($event) {
            $event.preventDefault();
            
            flow_data = {
			  "name" : $scope.name,
			  "active" : true,
			  "owner" : $scope.login,
			  "create_date" : getNowDate(),
			  "description" : $scope.description
			}
            
            if(!flow_data.name ||
               flow_data.name == ""
            ) {
                alert( "Błędna nazwa przepływu." );
            } else {
                $http.post( // Create new flow
                    "/service/flows/flow/generate",
                    JSON.stringify(flow_data)
                ).then(
                    function(response) { // Success
                        if(response.status == 200) {
                            alert("Przepływ został dodany.");
                            $route.reload();
                        } else {
                            alert(getErrorMessage(response.status));
                        }
                        
                        $scope.loadPage = false;
                    },
					function(response) { // Error
                        if(response.status == 409) {
                            alert("Istnieje przepływ o podanym identyfikatorze.");
                        } else {
                            alert(getErrorMessage(response.status));
                        }
                        
                        $scope.loadPage = false;
                    }
                );
            }
        }
        
        $scope.deleteFlow = function($event) {
            $event.preventDefault();
            
            if(confirm("Czy na pewno usunąć wskazany przepływ?")) {
                $scope.loadPage = true;
                flowId = $event.currentTarget.getAttribute("data-id");
                
                $http.delete( // Delete flow
                    "/service/flows/flow/" + flowId
                ).then(
                    function(response) { // Success
                        if(response.status == 200) {
							alert("Przepływ został usunięty.");
                            $route.reload();
                        }
                        
                        $scope.loadPage = false;
                    },
                    function(response) { // Error
                        if (response.status == 404) {
							alert("Nie znaleziono przepływu.");
						} else if (response.status == 403) {
							alert(getErrorMessage(response.status));
                        }
                        
                        $scope.loadPage = false;
                    }
                );
            }
        }
    }
});























/*
 ** Actions Controller
 */
app.controller("ActionsController", function($scope, $http, $location, $route) {
    // Download the document
    $scope.downloadDocument = function($event) {
        $event.preventDefault();

        if ($scope.file_name &&
            $scope.data
        ) {
            downloadLink = document.getElementById("js-download");
            downloadLink.setAttribute("download", $scope.file_name);
            downloadLink.setAttribute("href", $scope.data);
            downloadLink.click();
        } else {
            $scope.loadPage = true;
            documentId = $event.currentTarget.getAttribute("data-id");
            downloadLink = document.getElementById("js-download-" + documentId);

            if (!downloadLink.getAttribute("download") &&
                !downloadLink.getAttribute("href")
            ) {
                $http.get( // Get document
                    "/service/documents/document/" + documentId
                ).then(
                    function(response) { // Success
                        if (response.status == 200) {
                            if (response.data.file_name &&
                                response.data.data
                            ) {
                                downloadLink.setAttribute("download", response.data.file_name);
                                downloadLink.setAttribute("href", response.data.data);
                                downloadLink.click();
                            } else {
                                alert("Brak zasobu do pobrania.");
                            }
                        }

                        $scope.loadPage = false;
                    },
                    function(response) { // Error
                        if (response.status == 404) {
                            alert("Nie znaleziono dokumentu.");
                        } else if (response.status == 500) {
                            alert("Wewnętrzny błąd serwera.");
                        }

                        $scope.loadPage = false;
                    }
                );
            } else {
                downloadLink.click();
            }
        }
    }

    // Redirect to the document
    $scope.redirectToDocument = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        documentId = $event.currentTarget.getAttribute("data-id");
        $location.path("/document/" + documentId);
    }

    // Delete the document
    $scope.deleteDocument = function($event) {
        $event.preventDefault();

        if (confirm("Czy na pewno usunąć wskazany zasób?")) {
            $scope.loadPage = true;
            documentId = $event.currentTarget.getAttribute("data-id");

            $http.delete(
                "/service/documents/document/" + documentId
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $route.reload();
                        alert("Dokument został usunięty.");
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 404) {
                        alert("Nie znaleziono dokumentu.");
                    } else if (response.status == 500) {
                        alert("Wewnętrzny błąd serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }
});

/*
 ** FlowController
 */
app.controller("FlowController", function($scope, $route, $routeParams, $http, $timeout, $cookies, $location) {
    if ( !$routeParams.page ) {
        $location.path("/404");
    } else {
        $scope.data = {};
        $scope.steps = [];
        $scope.id = $routeParams.page;
        $scope.step_type = "accept_single";
        $scope.step_participants = [];
        $scope.step_description = "";
        $scope.step_edit_id = null;
        $scope.step_edit_participants = [];
        $scope.step_edit_description = "";
        
        // Get all steps
        function getSteps() {
            $http.get(
                "/service/flows/flow/" + $scope.id + "/steps"
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        data_length = response.data.length;
                        $scope.steps= [];
                        $scope.steps.push(response.data[0]);
                        id = response.data[0].id;
                        
                        i = data_length - 1;
                        while( $scope.steps.length != data_length ) {
                            if( response.data[i].prev == id ) {
                                $scope.steps.push(response.data[i]);
                                id = response.data[i].id;
                            }
                            i--;
                            if( i == 0 ) {
                                i = data_length - 1;
                            }
                        }
                    }
                },
                function(response) { // Error
                    if (response.status == 400) {
                        $scope.notice.push({
                            "content": "Błędne żądanie.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 403) {
                        $scope.notice.push({
                            "content": "Nieprawidłowy lub wygasły token.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 500) {
                        $scope.notice.push({
                            "content": "Błąd wewnętrzny serwera.",
                            "class": "alert-danger"
                        });
                    }
                }
            );
        }
        getSteps();
        
        // Add step
        $scope.addStep = function($event) {
            $event.preventDefault();
            prev_id = $scope.steps[0].id;
            participants = $scope.step_participants ? [$scope.step_participants] : [];
            step_data = {
                "type": $scope.step_type ? $scope.step_type : "",
                "prev": [prev_id],
                "participants": participants ,
                "description": $scope.step_description ? $scope.step_description : ""
            }
            
            $http.post(
                "/service/flows/flow/" + $scope.id + "/step/generate",
                JSON.stringify(step_data)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        getSteps();
                        $scope.step_type = "accept_single";
                        $scope.step_participants = [];
                        $scope.step_description = "";
                        alert("Krok został dodany.");
                    }
                },
                function(response) { // Error
                    if (response.status == 400) {
                        $scope.notice.push({
                            "content": "Błędne żądanie.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 403) {
                        $scope.notice.push({
                            "content": "Nieprawidłowy lub wygasły token.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 409) {
                        $scope.notice.push({
                            "content": "Operation cannot be performed (invalid operation). Step ID already exists or invalid previous steps or change to invalid type.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 500) {
                        $scope.notice.push({
                            "content": "Błąd wewnętrzny serwera.",
                            "class": "alert-danger"
                        });
                    }
                    $scope.loadPage = false;
                }
            );
        }
        
        // Get step by id
        function getStepById(prev_id, self_id) {
            $http.get(
                "/service/flows/flow/" + $scope.id + "/step/" + self_id
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        updateOrderSteps(prev_id, self_id, response.data);
                    }
                },
                function(response) { // Error
                    alert(response.status);
                }
            );
        }
        
        jQuery( document ).ready( function($scope) {
            dialog = $( "#dialog-create" ).dialog( {
                autoOpen: false,
                height: 472,
                width: 500
            } );
            
            jQuery( "#create-step" ).button().on( "click", function() {
                dialog.dialog( "open" );
            });
            
            jQuery( "#dialog-create-close" ).button().on( "click", function() {
                dialog.dialog( "close" );
            } );
                    
			dialog_edit = jQuery( "#dialog-edit" ).dialog( {
				autoOpen: false,
				height: 403,
				width: 500
			} );
            
            jQuery("#sortable").on( "click", ".edit-step", function() {
                dialog_edit.dialog( "open" );
            });
            
            jQuery("#dialog-edit-close").button().on( "click", function() {
                dialog_edit.dialog( "close" );
            } );
            
            jQuery( "#sortable" ).sortable( {
                stop: function (event, ui) {
                    ui_item = jQuery(ui.item);
                    self_type = ui_item.find( ".steps-inner" ).data( "type" );
                    prev_type = ui_item.prev().find( ".steps-inner" ).data( "type" );
                    prev_id = ui_item.prev().find( ".steps-inner" ).data( "id" );
                    
                    if( self_type == "start"   ||
                        self_type == "archive" ||
                        prev_type == "archive" ||
                        prev_id == undefined
                    ) {
                        getSteps();
                        alert("Operacja niedozwolona.");
                    } else {
                        if( prev_id ) {
                            self_id = jQuery( ui.item ).find( ".steps-inner" ).data( "id" );
                            getStepById(prev_id, self_id);
                        }
                    }
				}
			} );
		} );
        
        // Update order step
        function updateOrderSteps(prev_id, self_id, step_data) {
            step_data.prev = [prev_id];
            
            $http.put(
                "/service/flows/flow/" + $scope.id + "/step/" + self_id,
                JSON.stringify(step_data)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        alert("Kolejność kroków została zaktualizowana");
                    }
                },
                function(response) { // Error
                    if (response.status == 409) {
                        alert("Operacja niedozwolona.");
                    }
                }
            );
        }
        
        // Edit step
        $scope.editStep = function($event) {
            $event.preventDefault();
            $scope.step_edit_id = $event.currentTarget.getAttribute("data-id");
            
            if($scope.step_edit_id) {
                $http.get(
                    "/service/flows/flow/" + $scope.id + "/step/" + $scope.step_edit_id
                ).then(
                    function(response) { // Success
                        if (response.status == 200) {
                            $scope.step_edit_participants = response.data.participants;
                            $scope.step_edit_description = response.data.description;
                        }
                    },
                    function(response) { // Error
                        alert(response.status);
                    }
                );
            }
		}
        
        // Update step
        $scope.updateStep = function($event) {
            $event.preventDefault();
            
            if($scope.step_edit_id) {
                // Get edit step
                $http.get(
                    "/service/flows/flow/" + $scope.id + "/step/" + $scope.step_edit_id
                ).then(
                    function(response) { // Success
                        if (response.status == 200) {
                            step_data = response.data;
                            participants = $scope.step_edit_participants ? [$scope.step_edit_participants] : [];
                            step_data.participants = participants;
                            step_data.description = $scope.step_edit_description;
                            
                            $http.put(
                                "/service/flows/flow/" + $scope.id + "/step/" + $scope.step_edit_id,
                                JSON.stringify(step_data)
                            ).then(
                                function(response) { // Success
                                    if (response.status == 200) {
                                        alert("Krok został zaktualizowany.");
                                    }
                                },
                                function(response) { // Error
                                    if (response.status == 409) {
                                        alert("Operacja niedozwolona.");
                                    }
                                }
                            );
                        }
                    },
                    function(response) { // Error
                        alert(response.status);
                    }
                );
            }
		}
        
        // Delete step
        $scope.deleteStep = function($event) {
            $event.preventDefault();
            step_id = $event.currentTarget.getAttribute("data-id");
            
            $http.delete(
                "/service/flows/flow/" + $scope.id + "/step/" + step_id
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        getSteps();
                        alert("Krok został usunięty.");
                    }
                },
                function(response) { // Error
                    alert( response.status );
                }
            );
        }
        
        
        
        
        
		

		

		
		$http.get(
			"/service/flows/flow/" + $scope.id
		).then(
			function(response) { // Success
				if (response.status == 200) {
					$scope.data = response.data;
				}
			},
			function(response) { // Error
				if (response.status == 403) {
					$scope.notice.push({
						"content": "Your not allowed to get flow data or your token expired",
						"class": "alert-danger"
					});
				} else if (response.status == 403) {
					$scope.notice.push({
						"content": "Flow not found",
						"class": "alert-danger"
					});
				} else if (response.status == 500) {
					$scope.notice.push({
						"content": "Błąd wewnętrzny serwera.",
						"class": "alert-danger"
					});
				}
			}
		);
		
		$scope.updateFlow = function($event) {
			$event.preventDefault();
			$scope.load = true;
			$scope.notice = [];
			$scope.login = $cookies.get("login");
			name = document.getElementById("js-flow-name").value;
			description = document.getElementById("js-flow-description").value;
			
			// Set date
			nowDate = new Date();
			day = nowDate.getDate();
			day = day < 10 ? "0" + day : day;
			month = nowDate.getMonth() + 1;
			month = month < 10 ? "0" + month : month;
			year = nowDate.getFullYear();
			$scope.date = year + "-" + month + "-" + day;
			
			flow_data = {
			 "name": name ? name : "",
			  "active": true,
			  "owner": $scope.login,
			  "create_date": $scope.date,
			  "description": description ? description : ""
			}
			
			if( flow_data["name"] == "" ) {
				alert( "Błędna nazwa przepływu." );
			} else {
				$http.put(
					"/service/flows/flow/" + $scope.id,
					JSON.stringify(flow_data)
				).then(
					function(response) { // Success
						if (response.status == 200) {
							$route.reload();
							alert("Przepływ został zaktualizownay.");
						}
					},
					function(response) { // Error
						if (response.status == 400) {
							$scope.notice.push({
								"content": "Błędne żądanie.",
								"class": "alert-danger"
							});
						} else if (response.status == 403) {
							$scope.notice.push({
								"content": "Nieprawidłowy lub wygasły token.",
								"class": "alert-danger"
							});
						} else if (response.status == 404) {
							$scope.notice.push({
								"content": "Nie znaleziono przepływu.",
								"class": "alert-danger"
							});
						} else if (response.status == 500) {
							$scope.notice.push({
								"content": "Błąd wewnętrzny serwera.",
								"class": "alert-danger"
							});
						}

						$scope.loadPage = false;
					}
				);
			}
		}
	}
});





/*
 ** Status Controller
 */
app.controller("StatusController", function($scope, $routeParams, $http, $cookies, $location) {
    if ($routeParams.page) {
        documentId = $routeParams.page;
        $scope.flow_info = true;
        $scope.notice = false;
        $scope.steps = {};
        $scope.document_name = "";
        
        $http.get( // Get document by id
            "/service/documents/document/" + documentId
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    $scope.document_name = response.data.title;
                }
            },
            function(response) { // Error
                if(response.status == 404) {
                    $scope.document_name = "Nie znaleziono dokumentu";
                }
            }
        );
        
        // _document_id = "c17ae9b7-bd07-40f3-b496-d934d27073b2";
        // _step_id = "832b77f4-5ef1-4654-a34d-96dbfd61d5ef";
        
        // $http.put( // Get flow steps by flow ID
            // "/service/flows-documents/action/" + _document_id + "/" + _step_id
        // ).then(
            // function(response) { // Success
                // if (response.status == 200) {
                    // alert(response.status);
                // }
            // },
            // function(response) { // Error
                // alert(response.status);
            // }
        // );
        
        
        $http.get( // Get information about document status in flow
            "/service/flows-documents/status/" + documentId
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    $scope.flow_info = response.data;
                    $scope.flow_info_flow = response.data.flow;
                    
                    $http.get( // Get flow steps by flow ID
                        "/service/flows/flow/" + $scope.flow_info_flow + "/steps"
                    ).then(
                        function(response) { // Success
                            if (response.status == 200) {
                                steps_length = response.data.length;
                                
                                for(i = 0; i < steps_length; i++) {
                                    id = response.data[i].id;
                                    type = response.data[i].type;
                                    $scope.steps[id] = type;
                                }
                                
                                // alert(JSON.stringify($scope.steps["a9c96553-3ab3-4d73-8bfe-3b2a89b9bb4a"]));
                            }
                        },
                        function(response) { // Error
                        }
                    );
                }
            },
            function(response) { // Error
                $scope.notice = true;
            }
        );
    } else {
        $location.path("/404");
    }
});

/*
 ** Upload Controller
 */
app.controller("UploadController", function($scope, $http, $cookies, $location, $interval) {
    $scope.token = $cookies.get("token");
    var availableTags = [];
    var availableTags2 = [];
    var flows_id = [];
    
    openFile = function(event) {
        var input = event.target;
        files = input.files;
        if (files.length > 0) {
            document.getElementById("file-name").innerHTML = files[0].name;
        }
    }
    
    function split( val ) {
        return val.split( /,\s*/ );
    }
    
    function extractLast( term ) {
        return split( term ).pop();
    }
    
    // Get list of users
    $http.get(
        "/service/users/users",
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                tmp = response.data.result;
                tmp_length = tmp.length;
                
                for(i = 0; i < tmp_length; i++ ) {
                    availableTags.push(tmp[i].login);
                }
                
                jQuery(document).ready(function(){
                    jQuery( "#owner" ).on( "keydown", function(event) {
                        if( event.keyCode === $.ui.keyCode.TAB &&
                            jQuery( this ).autocomplete( "instance" ).menu.active
                        ) {
                            event.preventDefault();
                        }
                    } ).autocomplete( {
                        minLength: 3,
                        source: function( request, response ) {
                            response(
                                jQuery.ui.autocomplete.filter(
                                    availableTags,
                                    extractLast(request.term)
                                )
                            );
                        },
                        focus: function() {
                            return false;
                        },
                        select: function(event,ui) {
                            var terms = split( this.value );
                            terms.pop();
                            terms.push( ui.item.value );
                            terms.push( "" );
                            this.value = terms.join( ", " );
                            return false;
                        }
                    } );
                    
                    var ui_id_1 = jQuery("#ui-id-1").detach();
                    jQuery("#owner-container").append(ui_id_1);
                } );
            }
        },
        function(response) { // Error
        }
    );
    
    // Get list of flows
    $http.get(
        "/service/flows/flows",
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                tmp = response.data.result;
                tmp_length = tmp.length;
                
                for(i = 0; i < tmp_length; i++ ) {
                    availableTags2.push(tmp[i].name);
                }
                
                jQuery(document).ready(function(){
                    jQuery( "#flow" ).autocomplete({
                      source: availableTags2
                    });
                } );
            }
        },
        function(response) { // Error
        }
    );

    // Save a document
    $scope.saveDocument = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        $scope.notice = [];
        _document = {
            "id": "generate",
            "title": "",
            "file_name": "",
            "create_date": "",
            "description": "",
            "owner": [],
            "metadata": [],
            "thumbnail": "",
            "data": ""
        }
        file_done = 0;

        // Set file a document
        fileReader = new FileReader();
        files = document.getElementById("file").files;
        if (files.length > 0) {
            file = files[0];
            file_name = file.name;
            file_size = file.size;
            reg_name = new RegExp(".+\.pdf$");
            max_size = 50000000; // max 50MB

            if (reg_name.test(file_name) !== true) {
                $scope.uploadForm.$valid = false;
                $scope.notice.push({
                    "content": "Błędne rozszerzenie pliku " + file_name + ".",
                    "class": "alert-danger"
                });
                file_done++;
            } else if (file_size > max_size) {
                $scope.uploadForm.$valid = false;
                $scope.notice.push({
                    "content": "Wielkość pliku " + file_name + " przekracza " + (max_size / 1000000) + "MB.",
                    "class": "alert-danger"
                });
                file_done++;
            } else {
                fileReader.onloadend = function(fileLoadedEvent) {
                    file_base64 = fileLoadedEvent.target.result;
                    _document.file_name = file_name; // Set file_name of a document
                    _document.data = file_base64; // Set data of a document
                    file_done++;
                }

                fileReader.readAsDataURL(file);
            }
        } else {
            file_base64 = document.getElementById("file_base64");
            file_name_base64 = document.getElementById("file_name_base64");

            if (file_base64 &&
                file_name_base64
            ) {
                _document.file_name = file_name_base64.value;
                _document.data = file_base64.value;
            } else {
                $scope.uploadForm.$valid = false;
            }

            file_done++;
        }

        interval = $interval(
            function() {
                if (file_done == 1) {
                    $interval.cancel(interval);

                    if ($scope.uploadForm.$valid) {
                        // Set title of a document
                        _document.title = $scope.title ? $scope.title : "";

                        // Set date of a document
                        nowDate = new Date();
                        day = nowDate.getDate();
                        day = day < 10 ? "0" + day : day;
                        month = nowDate.getMonth() + 1;
                        month = month < 10 ? "0" + month : month;
                        year = nowDate.getFullYear();
                        _document.create_date = year + "-" + month + "-" + day;

                        // Set description of a document
                        _document.description = $scope.description ? $scope.description : "";

                        // Set owners of a document
                        i = 0;
                        owners = $scope.owner ? $scope.owner.split(", ") : [];
                        countOwners = owners.length;
                        for (i; i < countOwners; i++) {
                            owner = owners[i].trim();
                            if (owner != "") {
                                _document.owner.push(owner);
                            }
                        }
                        
                        if ($location.path() === "/add") {
                           $http.post(
                                "/service/documents/document/generate",
                                JSON.stringify(_document)
                            ).then(
                                function(response) { // Success
                                    if (response.status == 200) {
                                        // Reset data
                                        document.getElementById("file-name").innerHTML = "Upuść plik tutaj <br>lub";
                                        document.getElementById("file").value = "";
                                        $scope.owner = "";
                                        $scope.title = "";
                                        $scope.description = "";
                                        $scope.uploadForm.$setPristine();
                                        $scope.notice.push({
                                            "content": "Dokument został zapisany.",
                                            "class": "alert-success"
                                        });
                                    }
                                    
                                    _flow_document = {
                                        "document": response.data.id,
                                        "flow": ""
                                    }
                                    
                                    flow_name = document.getElementById("flow").value ? document.getElementById("flow").value : "";
                                    
                                    // Get list of flows
                                    $http.get(
                                        "/service/flows/flows?limit=1&search=" + flow_name,
                                    ).then(
                                        function(response) { // Success
                                            if (response.status == 200) {
                                                _flow_document["flow"] = response.data.result[0].id;
                                                
                                                // Start a flow for a document
                                                $http.post(
                                                    "/service/flows-documents/start",
                                                    JSON.stringify(_flow_document)
                                                ).then(
                                                    function(response) { // Success
                                                        if (response.status == 200) {
                                                        }
                                                    },
                                                    function(response) { // Error
                                                    }
                                                );
                                            }
                                        },
                                        function(response) { // Error
                                        }
                                    );

                                    $scope.loadPage = false;
                                },
                                function(response) { // Error
                                    if (response.status == 400) {
                                        $scope.notice.push({
                                            "content": "Błędne żądanie.",
                                            "class": "alert-danger"
                                        });
                                    } else if (response.status == 500) {
                                        $scope.notice.push({
                                            "content": "Wewnętrzny błąd serwera.",
                                            "class": "alert-danger"
                                        });
                                    }

                                    $scope.loadPage = false;
                                }
                            );
                        } else {
                            var documentId = $scope.id;
                            _document.id = documentId;

                            $http.put(
                                "/service/documents/document/" + documentId,
                                JSON.stringify(_document)
                            ).then(
                                function(response) { // Success
                                    if (response.status == 200) {
                                        $scope.file_name = _document.file_name;
                                        document.getElementById("file_name_base64").value = _document.file_name;
                                        document.getElementById("file_base64").value = _document.data;
                                        document.getElementById("document").setAttribute("data", _document.data);
                                        $scope.notice.push({
                                            "content": "Dokument został zaktualizowany.",
                                            "class": "alert-success"
                                        });
                                    }

                                    $scope.loadPage = false;
                                },
                                function(response) { // Error
                                    if (response.status == 400) {
                                        $scope.notice.push({
                                            "content": "Błędne żądanie.",
                                            "class": "alert-danger"
                                        });
                                    } else if (response.status == 404) {
                                        $scope.notice.push({
                                            "content": "Nie znaleziono dokumentu.",
                                            "class": "alert-danger"
                                        });
                                    } else if (response.status == 500) {
                                        $scope.notice.push({
                                            "content": "Wewnętrzny błąd serwera.",
                                            "class": "alert-danger"
                                        });
                                    }

                                    $scope.loadPage = false;
                                }
                            );
                        }
                    } else {
                        $scope.notice.push({
                            "content": "Nieprawidłowo wypełniony formularz.",
                            "class": "alert-danger"
                        });
                        $scope.loadPage = false;
                    }
                }
            }, 1
        );
    }
});


/*
 ** Groups Controller
 */
app.controller("GroupsController", function($route, $scope, $http, $routeParams, $cookies, $location) {
	$scope.groups = [];
	$scope.notice = [];
    $scope.login = $cookies.get("login");
    $scope.token = $cookies.get("token");
    $scope.loadPage = true;
	$scope.search = $routeParams.search && $routeParams.search != "null" ? decodeURI($routeParams.search) : "";
    var groupsName = null;
    var groupsDescription = null;
	$scope.readonly_bool = true;

    // Set date
    nowDate = new Date();
    day = nowDate.getDate();
    day = day < 10 ? "0" + day : day;
    month = nowDate.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    year = nowDate.getFullYear();
    $scope.date = year + "-" + month + "-" + day;
	
	$scope.filter = function($event) {
		$event.preventDefault();
		search = document.getElementsByClassName( "documents-phrase" )[0].value;
		
		if( search !== "" ) {
			$location.path("/groups/" + search);
		} else {
			$location.path("/groups/");
		}
	}

    // Get all group
    $http.get(
        "/service/groups/groups?" + "search=" + $scope.search
    ).then(
        function(response) { // Success
            if (response.status == 200) {
				if( response.data.result === null ) {
					$scope.notice.push( {
						"content": "Brak zdefiniowanych grup.",
						"class": "alert-danger"
					} );
				} else {
					$scope.groups = response.data.result;
				}
            }

            $scope.loadPage = false;
        },
        function(response) { // Error
            if (response.status == 400) {
                alert("Błędne żądanie.");
            } else if (response.status == 403) {
                alert("Nieprawidłowy lub wygasły token.");
            } else if (response.status == 500) {
                alert("Błąd wewnętrzny serwera.");
            }

            $scope.loadPage = false;
        }
    );
	
    // Click edit group
    $scope.editGroup = function($event) {
        $event.preventDefault();
		data_id = $event.currentTarget.getAttribute("data-id");
		$scope['readonly_bool_'+data_id] = true;
    }

    // Update group
    $scope.saveGroup = function($event) {
        $event.preventDefault();
		$scope.loadPage = true;
		currentTarget = $event.currentTarget;
		data_id = currentTarget.getAttribute("data-id");
		$scope['readonly_bool_'+data_id] = false;
		name = currentTarget.getAttribute("data-name");
		description = jQuery("#js-groups-description-"+data_id).val();
        group_data = {
			"active": true,
			"create_date": $scope.date,
			"creator": $scope.login,
			"description": description ? description : ""
		}
		
        if (name != "") {
            $http.put(
                "/service/groups/group/" + name,
                JSON.stringify(group_data)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        alert("Grupa została zaktualizowana.");
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }

    // Delete group
    $scope.deleteGroup = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        dataID = $event.currentTarget.getAttribute("data-id");
        groupsName = document.getElementById("js-groups-name-" + dataID).value;
		
        if (confirm("Czy na pewno usunąć wskazaną pozycję?")) {
            $http.delete(
                "/service/groups/group/" + groupsName
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        if (dataID - 1 == 0) {
                            left = [];
                            right = $scope.groups.splice(dataID, $scope.groups.length);
                        } else {
                            left = $scope.groups.splice(0, dataID - 1);
                            right = $scope.groups.splice(dataID - 1, $scope.groups.length);
                        }

                        $scope.groups = left.concat(right);
                        alert("Grupa została usunięta.");
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }

    // Create group
    $scope.addGroup = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        name = document.getElementById("js-groups-name").value;
        description = document.getElementById("js-groups-description").value;
        group_data = {
            "active": true,
            "create_date": $scope.date,
            "creator": $scope.login,
            "description": description ? description : ""
        }
		
        if (name != "") {
            $http.post(
                "/service/groups/group/" + encodeURIComponent(name),
                JSON.stringify(group_data)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        group_data.name = name;
                        $scope.groups.push(group_data);

                        document.getElementById("js-groups-name").value = "";
                        document.getElementById("js-groups-description").value = "";
                        alert("Grupa została dodana.");
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 409) {
                        alert("Istnieje grupa o podanej nazwie.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        } else {
            alert("Nieprawidłowa nazwa grupy.");
            $scope.loadPage = false;
        }
    }

    // Redirect to users list
    $scope.showGroup = function($event) {
        $event.preventDefault();
        name = $event.currentTarget.getAttribute("data-name");
        $location.path("/members/" + name);
    }
});

/*
 ** MembersController
 */
app.controller("MembersController", function($route, $scope, $http, $routeParams, $cookies, $location) {
    if (isNaN($routeParams.group) &&
        $routeParams.group != undefined
    ) {
        $scope.group = $routeParams.group;
    }

	$scope.notice = [];
    $scope.users = [];
	$scope.users_prompt = [];
    $scope.loadPage = true;
    $scope.token = $cookies.get("token");
	
    // Get all users
    $http.get(
        "/service/groups/members/get/" + $scope.group
    ).then(
        function(response) { // Success
            if (response.status == 200) {
				if( response.data === "null" ) {
					$scope.notice.push( {
						"content": "Brak użytkowników przypisanych do grupy.",
						"class": "alert-danger"
					} );
				} else {
					$scope.users = response.data;
				}
            }

            $scope.loadPage = false;
        },
        function(response) { // Error
            if (response.status == 403) {
                alert("Nieprawidłowy lub wygasły token.");
            }

            if (response.status == 404) {
                alert("Grupa nieznaleziona.");
            } else if (response.status == 500) {
                alert("Błąd wewnętrzny serwera.");
            }

            $scope.loadPage = false;
        }
    );
	
    // Add user to group
    $scope.addUser = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        login = document.getElementById("js-members-login").value;
		users = [login];

        if (users[0] != "") {
            $http.post(
                "/service/groups/members/add/" + $scope.group,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        count_users = users.length;

                        if (count_users > 1) {
                            alert("Użytkownicy zostali dodani do grupy.");
                        } else {
                            alert("Użytkownik został dodany do grupy.");
                        }

                        document.getElementById("js-members-login").value = "";
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        } else {
            alert("Nieprawidłowa nazwa użytkownika.");
            $scope.loadPage = false;
        }
    }

    // Delete user to group
    $scope.deleteUser = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        dataID = $event.currentTarget.getAttribute("data-id");
        dataLogin = $event.currentTarget.getAttribute("data-name");
        users = [dataLogin];

        if (confirm("Czy na pewno usunąć użytkownika z grupy?")) {
            $http.post(
                "/service/groups/members/remove/" + $scope.group,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        if (dataID - 1 == 0) {
                            left = [];
                            right = $scope.users.splice(dataID, $scope.users.length);
                        } else {
                            left = $scope.users.splice(0, dataID - 1);
                            right = $scope.users.splice(dataID - 1, $scope.users.length);
                        }

                        $scope.users = left.concat(right);
                        alert("Użytkownik został usunięty z grupy.");
						
						$route.reload();
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 404) {
                        alert("Nie znaleziono grupy.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }
});

/*
 ** SearchUserController
 */
app.controller("SearchUserController", function($route, $scope, $http, $routeParams, $cookies, $location) {
	// Search of user
	$scope.searchUser = function($event) {
		$event.preventDefault();
		limit = 4;
		user = $event.currentTarget.value;
		
		if( user.length > 2 ) {
			$scope.loadPage = true;
			
            $http.get(
                "/service/users/users?limit=" + limit + "&search=" + user
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
						$scope.users_prompt = response.data.result;
						document.getElementById("js-users-prompt").style.display = "block";
                    }

                    $scope.loadPage = false;
                },
                function(response) { // Error
                    if (response.status == 400) {
                        alert("Błędne żądanie.");
                    } else if (response.status == 403) {
                        alert("Nieprawidłowy lub wygasły token.");
                    } else if (response.status == 500) {
                        alert("Błąd wewnętrzny serwera.");
                    }

                    $scope.loadPage = false;
                }
            );
		} else {
			$scope.users_prompt = [];
			document.getElementById("js-users-prompt").style.display = "none";
		}
	}
	
	// Select of user
	$scope.selectUser = function($event) {
		$event.preventDefault();
		user = $event.currentTarget.getAttribute("data-name");
		document.getElementsByClassName("js-get-login")[0].value = user;
		document.getElementById("js-users-prompt").style.display = "none";
	}
});
