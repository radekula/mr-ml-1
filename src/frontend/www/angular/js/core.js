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
    
function split( val ) {
    return val.split( /,\s*/ );
}

function extractLast( term ) {
    return split( term ).pop();
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
    
    $routeProvider.when("/add", {
        title: "Dodaj dokument",
        templateUrl: "/www/angular/add.html",
        controller: "UploadController"
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
    
    $routeProvider.when("/flow/:page", {
        title: "Przepływ",
        templateUrl: "/www/angular/flow.html",
        controller: "FlowController"
    });
    
    $routeProvider.when("/groups", {
        title: "Grupy użytkowników",
        templateUrl: "/www/angular/groups.html",
        controller: "GroupsController"
    });
    
    $routeProvider.when("/groups/:phrase", {
        title: "Grupy użytkowników",
        templateUrl: "/www/angular/groups.html",
        controller: "GroupsController"
    });
    
    $routeProvider.when("/members/:group", {
        title: "Grupa użytkowników",
        templateUrl: "/www/angular/members.html",
        controller: "MembersController"
    });
    
    $routeProvider.when("/status/:document_id", {
        title: "Status",
        templateUrl: "/www/angular/status.html",
        controller: "StatusController"
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
    
    $scope.getMenuItemClass = function(path) {
        regex = new RegExp("^" + path);
        
        if(regex.test($scope.path)) {
            return "menu-current";
        } else {
            return "";
        }
    }
});


/*
 ** Init app
 */
app.controller("ngDMSBody", ["$scope", "$cookies", "$location", "$timeout", function($scope, $cookies, $location, $timeout) {
    $scope.login = $cookies.get("login");
    $scope.toggle = $cookies.get("menu-toggle") ? true : false;
    $scope.errors = [];
    $scope.load = 0;
    
    $scope.addErrors = function(class_, value_) {
        $scope.errors.push({
            class : class_,
            value : value_
        });
        
        $timeout(function(){
            $scope.errors.shift();
        }, 6000);
    }
    
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
        } else if ($location.path().search("/add") != -1) {
            $scope.body = "page page-add";
        } else if ($location.path().search("/documents") != -1) {
            $scope.body = "page page-documents";
        } else if ($location.path().search("/document") != -1) {
            $scope.body = "page page-document";
        } else if ($location.path().search("/status") != -1) {
            $scope.body = "page page-status";
        } else if ($location.path().search("/flows") != -1) {
            $scope.body = "page page-flow";
        } else if ($location.path().search("/flow") != -1) {
            $scope.body = "page page-flow";
        } else if ($location.path().search("/groups") != -1) {
            $scope.body = "page page-groups";
        } else if ($location.path().search("/members") != -1) {
            $scope.body = "page page-members";
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
 ** Statement Controller
 */
app.controller("StatementController", function($scope, $http) {
    $scope.data = {
        actions : {
            total : "0",
            result : []
        },
        comments : {
            total : "0",
            result : []
        }
    }
    
    $scope.load++;
    $http.get( // Get user actions in current steps
        "/service/flows-documents/user/" + $scope.login + "/current_actions"
    ).then(
        function(response) { // Success
            if (response.status == 200) { 
                if(typeof response.data == "object") {
                    $scope.data.actions = response.data;
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Get list of comments
        "/service/desktop/comments"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.comments = response.data;
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            $scope.load--;
        }
    );
});


/*
 ** Desktop Controller
 */
app.controller("DesktopController", function($scope, $http) {
    $scope.data = {
        actions : {
            total : 0,
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
    
    $scope.load++;
    $http.get( // Get user actions in current steps
        "/service/flows-documents/user/" + $scope.login + "/current_actions"
    ).then(
        function(response) { // Success
            if (response.status == 200) { 
                if(typeof response.data == "object") {
                    $scope.data.actions = response.data;
                }
            }
            $scope.emptyActions = $scope.data.actions.total > 0 ? false : true;
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy akcji.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy akcji (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy akcji.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy akcji.");
            }
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Get list of comments
        "/service/desktop/comments"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.comments = response.data;
                }
            }
            $scope.emptyComments = $scope.data.comments.total > 0 ? false : true;
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy komentarzy.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy komentarzy (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy komentarzy.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy komentarzy.");
            }
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Get list of user documents
        "/service/desktop/documents"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.documents = response.data;
                }
            }
            $scope.emptyDocuments = $scope.data.documents.total > 0 ? false : true;
            $scope.load--;
        },
        function(response) { // Error
            $scope.load--;
        }
    );
} );


/*
 ** User controller
 */
app.controller("UserController", function($scope, $cookies, $http, $interval, $location) {
    changeKey = false;
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
    $scope.emptyGroups = false;
    
    $scope.changeKey = function(){
        changeKey = true;
    };
    
    $scope.load++;
    $http.get( // Get basic information about user
        "/service/users/user"
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.user = response.data;
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 404) {
                $location.path("/404");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Odmowa dostępu do danych użytkownika lub Twój token stracił ważność.");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania danych użytkownika.");
            }
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Get user public key
        "/service/signing/user/" + $scope.login + "/keys"
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.keys.public_key = response.data.public_key;
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania klucza publicznego.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać klucza (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania klucza publicznego.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania klucza publicznego.");
            }
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Get user group list
        "/service/groups/user/" + $scope.login + "/groups"
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.groups = response.data;
                }
                
                if($scope.data.groups.length == 0) {
                    $scope.emptyGroups = true;
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy grup.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy grup (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy grup.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy grup.");
            }
            $scope.emptyGroups = true;
            $scope.load--;
        }
    );
    
    $scope.saveUser = function($event, userForm) {
        $event.preventDefault();
        
        if($scope.userForm.$valid) {
            $scope.load++;
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
                        userForm.$setPristine();
                        $scope.addErrors("success", "Profil został zaktualizowany.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby zaktualizowania profilu.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można zaktualizować profilu (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Użytkownik nieznaleziony podczas próby zaktualizowania profilu.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby zaktualizowania profilu.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby zaktualizowania profilu.");
                    }
                    $scope.load--;
                }
            );
            
            if(changeKey) {
                $scope.load++;
                $http.put( // Add or update user keys
                    "/service/signing/user/" + $scope.login + "/keys",
                    JSON.stringify($scope.data.keys)
                ).then(
                    function(response) { // Success
                        if (response.status == 200) {
                            userForm.$setPristine();
                            $scope.data.keys.private_key = "";
                            $scope.addErrors("success", "Klucz publiczny i prywatny zostały zaktualizowane.");
                        }
                        $scope.load--;
                    },
                    function(response) { // Error
                        if(response.status == 400) {
                            $scope.addErrors("error", "Błędne żądanie podczas próby zaktualizowania kluczy.");
                        } else if(response.status == 403) {
                            $scope.addErrors("error", "Nie można zaktualizować kluczy (nieprawidłowy lub wygasły token).");
                        } else if(response.status == 404) {
                            $scope.addErrors("error", "Użytkownik nieznaleziony podczas próby zaktualizowania kluczy.");
                        } else if(response.status == 500) {
                            $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby zaktualizowania kluczy.");
                        } else {
                            $scope.addErrors("error", "Nieoczekiwany błąd podczas próby zaktualizowania kluczy.");
                        }
                        $scope.load--;
                    }
                );
            }
            
            if($scope.data.password.new_password != "") {
                $scope.load++;
                $http.post( // Change user password
                    "/service/users/change_password/" + $scope.login,
                    JSON.stringify({
                        "old_password": $scope.data.password.old_password,
                        "new_password": $scope.data.password.new_password
                    })
                ).then(
                    function(response) { // Success
                        if (response.status == 200) {
                            userForm.$setPristine();
                            $scope.data.password.old_password = "";
                            $scope.data.password.new_password = "";
                            $scope.addErrors("success", "Hasło zostało zmienione.");
                        }
                        $scope.load--;
                    },
                    function(response) { // Error
                        if(response.status == 403) {
                            $scope.addErrors("error", "Nie można zmienić hasła (nieprawidłowy lub wygasły token).");
                        } else if(response.status == 404) {
                            $scope.addErrors("error", "Użytkownik nieznaleziony podczas próby zmiany hasła.");
                        } else if(response.status == 500) {
                            $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby zmiany hasła.");
                        } else {
                            $scope.addErrors("error", "Nieoczekiwany błąd podczas próby zmiany hasła.");
                        }
                        $scope.load--;
                    }
                );
            }
        } else {
            $scope.addErrors("error", "Błędnie wypełniony formularz.");
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
    
    $scope.load++;
    $http.get( // Get document by id
        "/service/documents/document/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.document = response.data;
                }
            } else {
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 404) {
                // $location.path("/404");
            } else {
            }
            $scope.load--;
        }
    );
    
    $scope.doAction = function($event) {
        $event.preventDefault();
        
        $scope.load++;
        $http.put( // Perform a user action for a step
            "/service/flows-documents/action/" + $scope.data.document.id + "/" + $scope.data.step.id
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    alert("Akcja została wykonana.");
                    $location.path("/");
                } else {
                }
                $scope.load--;
            },
            function(response) { // Error
                if(response.status == 404) {
                    // $location.path("/404");
                } else {
                }
                $scope.load--;
            }
        );
    }
});


/*
 ** Get users (multiple)
 */
app.controller("GetUsersController", function($scope, $http, $cookies, $location, $interval) {
    var result = [];
    
    $scope.load++;
    $http.get( // Get list of users
        "/service/users/users",
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    tmp = response.data.result;
                    tmp_length = tmp.length;
                    
                    for(i = 0; i < tmp_length; i++ ) {
                        result.push(tmp[i].login);
                    }
                    
                    jQuery(document).ready(function(){
                        jQuery("#owner").on("keydown", function(event) {
                            if(event.keyCode === $.ui.keyCode.TAB &&
                                jQuery(this).autocomplete("instance").menu.active
                            ) {
                                event.preventDefault();
                            }
                        }).autocomplete( {
                            minLength: 1,
                            source: function( request, response ) {
                                response(
                                    jQuery.ui.autocomplete.filter(
                                        result,
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
                    });
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy użytkowników.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy użytkowników (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy użytkowników.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy użytkowników.");
            }
            $scope.load--;
        }
    );
});


/*
 ** Get users (single)
 */
app.controller("GetUserController", function($scope, $http, $cookies, $location, $interval) {
    var result = [];
    
    $scope.load++;
    $http.get( // Get list of users
        "/service/users/users",
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    tmp = response.data.result;
                    tmp_length = tmp.length;
                    
                    for(i = 0; i < tmp_length; i++ ) {
                        result.push(tmp[i].login);
                    }
                    
                    jQuery(document).ready(function(){
                        jQuery( "#owner" ).autocomplete({
                            minLength: 1,
                            source: result
                        });
                    } );
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy użytkowników.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy użytkowników (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy użytkowników.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy użytkowników.");
            }
            $scope.load--;
        }
    );
});


/*
 ** Get flows
 */
app.controller("GetFlowsController", function($scope, $http, $cookies, $location, $interval) {
    var result = [];
    
    $scope.load++;
    $http.get( // Get list of flows
        "/service/flows/flows",
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    tmp = response.data.result;
                    tmp_length = tmp.length;
                    
                    for(i = 0; i < tmp_length; i++ ) {
                        result.push(tmp[i].name);
                    }
                    
                    jQuery(document).ready(function(){
                        jQuery( "#flow" ).autocomplete({
                            minLength: 1,
                            source: result
                        });
                    } );
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy przepływów.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy przepływów (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy przepływów.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy przepływów.");
            }
            $scope.load--;
        }
    );
});


/*
 ** Upload Controller
 */
app.controller("UploadController", function($scope, $routeParams, $http, $cookies, $location, $interval, $route) {
    $scope.submitted = false;
    
    openFile = function(event) {
        var input = event.target;
        files = input.files;
        if(files.length > 0) {
            document.getElementById("file-name").innerHTML = files[0].name;
        }
    }
    
    jQuery("#owner").on("keyup", function(){
        jQuery(this).removeClass("error").removeClass("success");
    });
    
    $scope.saveDocument = function($event) {
        $event.preventDefault();
        $scope.submitted = true;
        $scope.load++;
        file_done = 0;
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
        
        // Set file a document
        fileReader = new FileReader();
        files = document.getElementById("file").files;
        if(files.length > 0) {
            file = files[0];
            file_name = file.name;
            file_size = file.size;
            reg_name = new RegExp(".+\.pdf$");
            max_size = 50000000; // max 50MB
            
            if(reg_name.test(file_name) !== true) {
                $scope.uploadForm.$valid = false;
                $scope.addErrors("error", "Błędne rozszerzenie pliku " + file_name + ".");
                file_done++;
            } else if (file_size > max_size) {
                $scope.uploadForm.$valid = false;
                $scope.addErrors("error", "Wielkość pliku " + file_name + " przekracza " + (max_size / 1000000) + "MB.");
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
            
            if(file_base64 &&
               file_name_base64
            ) {
                _document.file_name = file_name_base64.value;
                _document.data = file_base64.value;
            } else {
                $scope.addErrors("error", "Nie wskazano żadnego pliku.");
                $scope.uploadForm.$valid = false;
            }
            
            file_done++;
        }
        
        interval = $interval(
            function() {
                if(file_done == 1) {
                    $interval.cancel(interval);
                    
                    // Set owners of a document
                    owners = jQuery("#owner").val() ? jQuery("#owner").val().split(", ") : [];
                    for(index in owners) {
                        owner = owners[index].trim();
                        if(owner != "") {
                            _document.owner.push(owner);
                        }
                    }
                    
                    check_users = false;
                    
                    if(_document.owner.length == 0) {
                        jQuery("#owner").addClass("error");
                        $scope.uploadForm.$valid = false;
                        
                        check_users = true;
                    } else {
                        $http.get( // Get list of users
                            "/service/users/users",
                        ).then(
                            function(response) { // Success
                                if (response.status == 200) {
                                    if(typeof response.data == "object") {
                                        _users = [];
                                        
                                        for(index in response.data.result) {
                                            _users.push(response.data.result[index].login);
                                        }
                                        
                                        jQuery("#owner").removeClass("error");
                                        
                                        for(index in _document.owner) {
                                            if(_users.indexOf(_document.owner[index]) == -1) {
                                                jQuery("#owner").addClass("error");
                                                $scope.addErrors("error", "Użytkownik o loginie " + _document.owner[index] + " nie istnieje." );
                                                $scope.uploadForm.$valid = false;
                                            }
                                        }
                                        
                                        if(!jQuery("#owner").hasClass("error")) {
                                            jQuery("#owner").addClass("success")
                                        }
                                    }
                                }
                                
                                check_users = true;
                                $scope.load--;
                            },
                            function(response) { // Error
                                if(response.status == 400) {
                                    $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy użytkowników.");
                                } else if(response.status == 403) {
                                    $scope.addErrors("error", "Nie można pobrać listy użytkowników (nieprawidłowy lub wygasły token).");
                                } else if(response.status == 500) {
                                    $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy użytkowników.");
                                } else {
                                    $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy użytkowników.");
                                }
                                
                                check_users = true;
                                $scope.load--;
                            }
                        );
                    }
                    
                    interval = $interval(
                        function() {
                            if(check_users == true) {
                                $interval.cancel(interval);
                                
                                if($scope.uploadForm.$valid) {
                                    // Set title of a document
                                    _document.title = $scope.title ? $scope.title : "";
                                    
                                    // Set date of a document
                                    _document.create_date = getNowDate();
                                    
                                    // Set description of a document
                                    _document.description = $scope.description ? $scope.description : "";
                                    
                                    if($location.path() === "/add") {
                                        $http.post(
                                            "/service/documents/document/generate",
                                            JSON.stringify(_document)
                                        ).then(
                                            function(response) { // Success
                                                if (response.status == 200) {
                                                    $route.reload();
                                                    $scope.addErrors("success", "Dokument został zapisany.");
                                                }
                                                
                                                _flow_document = {
                                                    "document": response.data.id,
                                                    "flow": ""
                                                }
                                                
                                                flow_name = document.getElementById("flow").value ? document.getElementById("flow").value : "";
                                                
                                                if(flow_name && flow_name != "") {
                                                    $scope.load++;
                                                    $http.get( // Get list of flows
                                                        "/service/flows/flows?limit=1&search=" + flow_name,
                                                    ).then(
                                                        function(response) { // Success
                                                            if(response.status == 200) {
                                                                for(index in response.data.result) {
                                                                    if(response.data.result[index].name == flow_name) {
                                                                        _flow_document["flow"] = response.data.result[index].id;
                                                                    }
                                                                }
                                                                
                                                                if(_flow_document["flow"] == "") {
                                                                    $scope.addErrors("error", "Przepływ o podanej nazwie nie istnieje. Podepnij przepływ edytując dokument.");
                                                                } else {
                                                                    // Start a flow for a document
                                                                    $scope.load++;
                                                                    $http.post(
                                                                        "/service/flows-documents/start",
                                                                        JSON.stringify(_flow_document)
                                                                    ).then(
                                                                        function(response) { // Success
                                                                            $scope.addErrors("success", "Dokument został podpięty pod przepływ.");
                                                                            $scope.load--;
                                                                        },
                                                                        function(response) { // Error
                                                                            $scope.load--;
                                                                        }
                                                                    );
                                                                }
                                                                
                                                                document.getElementById("flow").value = "";
                                                            }
                                                            $scope.load--;
                                                        },
                                                        function(response) { // Error
                                                            $scope.load--;
                                                        }
                                                    );
                                                }
                                                $scope.load--;
                                            },
                                            function(response) { // Error
                                                $scope.load--;
                                            }
                                        );
                                    } else {
                                        document_data = _document.data;
                                        _document = $scope.data.document;
                                        _document.data = document_data != "" ? document_data : _document.data;
                                        _document.owner = [];
                                        
                                        // Set owners of a document
                                        owners = jQuery("#owner").val() ? jQuery("#owner").val().split(", ") : [];
                                        for(index in owners) {
                                            owner = owners[index].trim();
                                            if(owner != "") {
                                                _document.owner.push(owner);
                                            }
                                        }
                                        
                                        $http.put( // Update document with given id
                                            "/service/documents/document/" + _document.id,
                                            JSON.stringify(_document)
                                        ).then(
                                            function(response) { // Success
                                                if (response.status == 200) {
                                                    $route.reload();
                                                    $scope.addErrors("success", "Dokument został zaktualizowany.");
                                                }
                                                $scope.load--;
                                            },
                                            function(response) { // Error
                                                if(response.status == 400) {
                                                    $scope.addErrors("error", "Błędne żądanie podczas próby pobrania zaktualizowania dokumentu.");
                                                } else if(response.status == 403) {
                                                    $scope.addErrors("error", "Nie można zaktualizować dokumentu (nieprawidłowy lub wygasły token).");
                                                } else if(response.status == 404) {
                                                    $scope.addErrors("error", "Dokument nieznaleziony.");
                                                } else if(response.status == 500) {
                                                    $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby zaktualiowania dokumentu.");
                                                } else {
                                                    $scope.addErrors("error", "Nieoczekiwany błąd podczas próby zaktualiowania dokumentu.");
                                                }
                                                $scope.load--;
                                            }
                                        );
                                    }
                                }
                                else {
                                    $scope.addErrors("error", "Nieprawidłowo wypełniony formularz.");
                                    $scope.load--;
                                }
                            }
                        }, 1
                    );
                }
            }, 1
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
                min = parseInt($scope.data.currentPage) - 2;
                max = min + 4;
                
                while(max > $scope.data.numberOfPages) {
                    min -= 1;
                    max -= 1;
                }
                
                while(min <= 0) {
                    min += 1;
                    max += 1;
                }
                
                for(min; min <= max; min++) {
                    if(min > $scope.data.numberOfPages) break;
                    $scope.data.pages.push(min);
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
        
        $scope.load++;
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
                    }
                }
                $scope.load--;
            },
            function(response) { // Error
                if(response.status == 403) {
                    $scope.addErrors("error", "Nie można pobrać listy dokumentów (nieprawidłowy lub wygasły token).");
                } else if(response.status == 404) {
                    $scope.notice.push({
                        "content": "Nie znaleziono dokumentów.",
                        "class": "alert-danger"
                    });
                } else if(response.status == 500) {
                    $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy dokumentów.");
                } else {
                    $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy dokumentów.");
                }
                $scope.load--;
            }
        );
    }
    
    $scope.downloadDocument = function($event) {
        $event.preventDefault();
        
        documentId = $event.currentTarget.getAttribute("data-id");
        dlnk = document.getElementById("js-download-" + documentId);
        
        if(!dlnk.getAttribute("href")) {
            $scope.load++;
            $http.get( // Get document by id
                "/service/documents/document/" + documentId
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        if(typeof response.data == "object" &&
                           response.data.data != ""
                        ) {
                            dlnk.href = response.data.data;
                            dlnk.click();
                        } else {
                            $scope.addErrors("info", "Brak zasobu do pobrania.");
                        }
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 403) {
                        $scope.addErrors("error", "Nie można pobrać danych dokumentu (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Dokument nie istnieje.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania danych dokumentu.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania danych dokumentu.");
                    }
                    $scope.load--;
                }
            );
        } else {
            dlnk.click();
        }
    }
    
    $scope.deleteDocument = function($event) {
        $event.preventDefault();
        
        if (confirm("Czy na pewno usunąć wskazany dokument?")) {
            documentId = $event.currentTarget.getAttribute("data-id");
            
            $scope.load++;
            $http.delete(
                "/service/documents/document/" + documentId
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $location.path("/documents");
                        $scope.addErrors("success", "Dokument został usunięty.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 403) {
                        $scope.addErrors("error", "Nie można usunąć dokumentu (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Dokument nieznaleziony.");
                    }  else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby usunięcia dokumentu.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby usunięcia dokumentu.");
                    }
                    $scope.load--;
                }
            );
        }
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
        sign : false
    }
    
    $scope.load++;
    $http.get( // Get document by id
        "/service/documents/document/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    $scope.data.document = response.data;
                    $scope.data.owner = response.data.owner.join(', ');
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać danych dokumentu (nieprawidłowy lub wygasły token).");
            } else if(response.status == 404) {
                $location.path("/404");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania danych dokumentu.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania danych dokumentu.");
            }
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Verify if document in signed by user
        "/service/signing/verify/" + $scope.data.document.id + "/" + $scope.login
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                $scope.data.sign = true;
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania informacji o podpisie.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać informacji o podpisie (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania informacji o podpisie.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania informacji o podpisie.");
            }
            $scope.load--;
        }
    );
    
    $scope.downloadDocument = function($event) {
        $event.preventDefault();
        
        var dlnk = document.getElementById("js-download");
        dlnk.href = $scope.data.document.data;
        dlnk.click();
    }
    
    $scope.deleteDocument = function($event) {
        $event.preventDefault();
        
        if (confirm("Czy na pewno usunąć wskazany dokument?")) {
            $scope.load++;
            $http.delete( // Delete document with given id
                "/service/documents/document/" + $scope.data.document.id
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $location.path("/documents/1");
                        $scope.addErrors("success", "Dokument został usunięty.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 403) {
                        $scope.addErrors("error", "Nie można usunąć dokumentu (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Dokument nieznaleziony.");
                    }  else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby usunięcia dokumentu.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby usunięcia dokumentu.");
                    }
                    $scope.load--;
                }
            );
        }
    }
});


/*
 ** Status Controller
 */
app.controller("StatusController", function($scope, $routeParams, $http, $cookies, $location) {
    $scope.data = {
        document : {
            id : $routeParams.document_id ? $routeParams.document_id : "",
            title : ""
        },
        document_name : "",
        current_steps : [],
        steps : [],
        history : [],
    }
    
    $scope.findCurrent = function(step_id) {
        return $scope.data.current_steps.indexOf(step_id) == -1 ? false : true;
    }
    
    $scope.findHistory = function(step_id) {
        for(index in $scope.data.history) {
            if($scope.data.history[index].step == step_id) {
                return true;
            }
        }
        return false;
    }
    
    $scope.load++;
    $http.get( // Get document by id
        "/service/documents/document/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object" &&
                   response.data.title != ""
                ) {
                    $scope.data.document.title = response.data.title;
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać danych dokumentu (nieprawidłowy lub wygasły token).");
            } else if(response.status == 404) {
                $scope.addErrors("error", "Dokument nie istnieje.");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania danych dokumentu.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania danych dokumentu.");
            }
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Get information about document status in flow
        "/service/flows-documents/status/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    flowID = response.data.flow;
                    $scope.data.current_steps = response.data.current_steps;
                    $scope.data.history = response.data.history;
                    
                    $scope.load++;
                    $http.get( // Get flow steps by flow ID
                        "/service/flows/flow/" + flowID + "/steps"
                    ).then(
                        function(response) { // Success
                            if(response.status == 200) {
                                if(typeof response.data == "object") {
                                    data_length = response.data.length;
                                    $scope.data.steps= [];
                                    $scope.data.steps.push(response.data[0]);
                                    id = response.data[0].id;
                                    
                                    i = data_length - 1;
                                    while($scope.data.steps.length != data_length) {
                                        if(response.data[i].prev == id) {
                                            $scope.data.steps.push(response.data[i]);
                                            id = response.data[i].id;
                                        }
                                        i--;
                                        if(i == 0) {
                                            i = data_length - 1;
                                        }
                                    }
                                }
                            }
                            $scope.load--;
                        },
                        function(response) { // Error
                            if(response.status == 403) {
                                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania kroków przepływu.");
                            } else if(response.status == 403) {
                                $scope.addErrors("error", "Nie można pobrać kroków przepływu (nieprawidłowy lub wygasły token).");
                            } else if(response.status == 500) {
                                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania kroków przepływu.");
                            } else {
                                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania kroków przepływu.");
                            }
                            $scope.load--;
                        }
                    );
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać statusu przepływu (nieprawidłowy lub wygasły token).");
            } else if(response.status == 404) {
                $location.path("/404");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania statusu przepływu.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania statusu przepływu.");
            }
            $scope.load--;
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
        $scope.notice = [];
        $scope.data = {
            limit : 5,
            currentPage : $routeParams.page,
            numberOfPages : 0,
            phrase : $routeParams.phrase ? $routeParams.phrase : "",
            pages : [],
            flows : {
                total : "0",
                result : []
            }
        }
        $scope.data.offset = 5 * ( $scope.data.currentPage - 1 );
        
        function getPagination() {
            if($scope.data.currentPage - 1 < $scope.data.numberOfPages) {
                min = parseInt($scope.data.currentPage) - 2;
                max = min + 4;
                
                while(max > $scope.data.numberOfPages) {
                    min -= 1;
                    max -= 1;
                }
                
                while(min <= 0) {
                    min += 1;
                    max += 1;
                }
                
                for(min; min <= max; min++) {
                    if(min > $scope.data.numberOfPages) break;
                    $scope.data.pages.push(min);
                }
            }
        }
        
        $scope.filter = function($event) {
            $event.preventDefault();
            
            if( $scope.data.phrase !== "" ) {
                $location.path("/flows/" + $scope.data.phrase + "/1");
            } else {
                $location.path("/flows/1");
            }
        }
        
        $scope.load++;
        if($scope.data.phrase.search(" ") > -1) {
            $scope.data.flows = [];
            $scope.notice.push({
                "content": "Nie znaleziono przepływów.",
                "class": "alert-danger"
            });
            $scope.load--;
        } else {
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
                        }
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy przepływów.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można pobrać listy przepływów (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy przepływów.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy przepływów.");
                    }
                    $scope.load--;
                }
            );
        }
        
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
                $scope.addErrors("error", "Błędna nazwa przepływu.");
            } else {
                $scope.load++;
                $http.post( // Create new flow
                    "/service/flows/flow/generate",
                    JSON.stringify(flow_data)
                ).then(
                    function(response) { // Success
                        if(response.status == 200) {
                            $route.reload();
                            $scope.addErrors("success", "Przepływ został dodany.");
                        }
                        $scope.load--;
                    },
					function(response) { // Error
                        if(response.status == 400) {
                            $scope.addErrors("error", "Błędne żądanie podczas próby dodania przepływu.");
                        } else if(response.status == 403) {
                            $scope.addErrors("error", "Nie można dodać przepływu (nieprawidłowy lub wygasły token).");
                        }  else if(response.status == 409) {
                            $scope.addErrors("error", "Istnieje przepływ o podanym identyfikatorze.");
                        } else if(response.status == 500) {
                            $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby dodania przepływu.");
                        } else {
                            $scope.addErrors("error", "Nieoczekiwany błąd podczas próby dodania przepływu.");
                        }
                        $scope.load--;
                    }
                );
            }
        }
        
        $scope.deleteFlow = function($event) {
            $event.preventDefault();
            
            if(confirm("Czy na pewno usunąć wskazany przepływ?")) {
                flowId = $event.currentTarget.getAttribute("data-id");
                
                $scope.load++;
                $http.delete( // Delete flow
                    "/service/flows/flow/" + flowId
                ).then(
                    function(response) { // Success
                        if(response.status == 200) {
                            $route.reload();
                            $scope.addErrors("success", "Przepływ został usunięty.");
                        }
                        $scope.load--;
                    },
                    function(response) { // Error
                        if(response.status == 403) {
                            $scope.addErrors("error", "Nie można usunąć przepływu (nieprawidłowy lub wygasły token).");
                        }  else if(response.status == 404) {
                            $scope.addErrors("error", "Przepływ nie istnieje.");
                        } else if(response.status == 500) {
                            $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby usunięcia przepływu.");
                        } else {
                            $scope.addErrors("error", "Nieoczekiwany błąd podczas próby usunięcia przepływu.");
                        }
                        $scope.load--;
                    }
                );
            }
        }
    }
});


/*
 ** FlowController
 */
app.controller("FlowController", function($scope, $route, $routeParams, $http, $timeout, $interval, $cookies, $location) {
    $scope.result = [];
    $scope.result_done = 0;
    $scope.step_type = "accept_single";
    $scope.step_participants = [];
    $scope.step_description = "";
    $scope.step_edit = null;
    
    $scope.data = {
        flow : {
            id : $routeParams.page ? $routeParams.page : ""
        },
        steps : []
    }
    
    $scope.load++;
    $http.get( // Get list of users
        "/service/users/users"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    for(index in response.data.result) {
                        $scope.result.push(response.data.result[index].login);
                    }
                }
            }
            $scope.result_done++;
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy użytkowników.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy użytkowników (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy użytkowników.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy użytkowników.");
            }
            $scope.result_done++;
            $scope.load--;
        }
    );
    
    $scope.load++;
    $http.get( // Get list of groups
        "/service/groups/groups"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    for(index in response.data.result) {
                        $scope.result.push(response.data.result[index].name);
                    }
                }
            }
            $scope.result_done++;
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 400) {
                $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy grup.");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy grup (nieprawidłowy lub wygasły token).");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy grup.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy grup.");
            }
            $scope.result_done++;
            $scope.load--;
        }
    );
    
    interval = $interval(
        function() {
            if($scope.result_done == 2) {
                $interval.cancel(interval);
                jQuery(document).ready(function(){
                    jQuery(".owner").autocomplete({
                        minLength: 1,
                        source: $scope.result
                    });
                } );
            }
        }, 1
    );
    
    $scope.load++;
    $http.get( // Get basic information about flow
        "/service/flows/flow/" + $scope.data.flow.id
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                $scope.data.flow = response.data;
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać przepływu (nieprawidłowy lub wygasły token).");
            }  else if(response.status == 404) {
                $location.path("/404");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania przepływu.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania przepływu.");
            }
            $scope.load--;
        }
    );
    
    $scope.updateFlow = function($event, uploadForm) {
        $scope.data.flow.owner = $scope.login;
        $scope.data.flow.create_date = getNowDate();
        
        if(!$scope.data.flow.name) {
            $scope.addErrors("error", "Błędna nazwa przepływu.");
        } else {
            $scope.load++;
            $http.put( // Update flow data
                "/service/flows/flow/" + $scope.data.flow.id,
                JSON.stringify($scope.data.flow)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        uploadForm.$setPristine();
                        $scope.addErrors("success", "Przepływ został zaktualizownay.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby zaktualiowania przepływu.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można zaktualizować przepływu (nieprawidłowy lub wygasły token).");
                    }  else if(response.status == 404) {
                        $scope.addErrors("error", "Przepływ nie istnieje.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby usunięcia przepływu.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby zaktualizowania przepływu.");
                    }
                    $scope.load--;
                }
            );
        }
    }
    
    function getStepById(prev_id, self_id) {
        $scope.load++;
        $http.get( // Get step by ID
            "/service/flows/flow/" + $scope.data.flow.id + "/step/" + self_id
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    updateOrderSteps(prev_id, self_id, response.data);
                }
                $scope.load--;
            },
            function(response) { // Error
                if(response.status == 403) {
                    $scope.addErrors("error", "Nie można pobrać kroku (nieprawidłowy lub wygasły token).");
                }  else if(response.status == 404) {
                    $scope.addErrors("error", "Krok nie istnieje.");
                } else if(response.status == 500) {
                    $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania kroku.");
                } else {
                    $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania kroku.");
                }
                $scope.load--;
            }
        );
    }
    
    jQuery(document).ready(function($scope) {
        dialog = $("#dialog-create").dialog({
            autoOpen: false,
            height: 472,
            width: 500
        });
        
        jQuery( "#create-step" ).button().on("click", function() {
            dialog.dialog( "open" );
        });
        
        jQuery("#dialog-create-close").button().on( "click", function() {
            dialog.dialog("close");
        } );
        
        dialog_edit = jQuery("#dialog-edit").dialog( {
            autoOpen: false,
            height: 403,
            width: 500
        });
        
        jQuery("#sortable").on("click", ".edit-step", function() {
            dialog_edit.dialog("open");
        });
        
        jQuery("#dialog-edit-close").button().on("click", function() {
            dialog_edit.dialog("close");
        });
        
        jQuery("#sortable").sortable({
            stop: function (event, ui, $scope) {
                ui_item = jQuery(ui.item);
                self_step = ui_item.find(".steps-nav").data("step");
                prev_step = ui_item.prev().find(".steps-nav").data("step");
                
                if(!prev_step                  ||
                   self_step.type == "start"   ||
                   self_step.type == "archive" ||
                   prev_step.type == "archive"
                ) {
                    getSteps();
                    getError("error", "Operacja niedozwolona.");
                } else {
                    prev_id = prev_step.id;
                    self_id = self_step.id;
                    getStepById(prev_id, self_id);
                }
            }
        });
    });
    
    function getError(class_, value) {
        $scope.addErrors(class_, value);
    }
    
    function getSteps() {
        $scope.load++;
        $http.get( // Get flow steps by flow ID
            "/service/flows/flow/" + $scope.data.flow.id + "/steps"
        ).then(
            function(response) { // Success
                if(response.status == 200) {
                    data_length = response.data.length;
                    $scope.data.steps= [];
                    $scope.data.steps.push(response.data[0]);
                    id = response.data[0].id;
                    
                    i = data_length - 1;
                    while($scope.data.steps.length != data_length) {
                        if(response.data[i].prev == id) {
                            $scope.data.steps.push(response.data[i]);
                            id = response.data[i].id;
                        }
                        i--;
                        if(i == 0) {
                            i = data_length - 1;
                        }
                    }
                }
                $scope.load--;
            },
            function(response) { // Error
                if(response.status == 400) {
                    $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy kroków.");
                } else if(response.status == 403) {
                    $scope.addErrors("error", "Nie można pobrać listy kroków (nieprawidłowy lub wygasły token).");
                } else if(response.status == 500) {
                    $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy kroków.");
                } else {
                    $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy kroków.");
                }
                $scope.load--;
            }
        );
    }
    getSteps();
    
    $scope.addStep = function($event) {
        steps_prev_index = $scope.data.steps.length - 2;
        prev_id = $scope.data.steps[steps_prev_index].id;
        
        if($scope.result.indexOf($scope.step_participants) != -1) {
            $scope.load++;
            $http.post( // Create new step in flow
                "/service/flows/flow/" + $scope.data.flow.id + "/step/generate",
                JSON.stringify({
                    "type": $scope.step_type ? $scope.step_type : "",
                    "prev": [prev_id],
                    "participants": [$scope.step_participants],
                    "description": $scope.step_description ? $scope.step_description : ""
                })
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $route.reload();
                        $scope.addErrors("success", "Krok został dodany.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby dodania kroku.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można dodać kroku (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 409) {
                        $scope.addErrors("error", "Nie można dodać kroku. Nieprawidłowy typ lub poprzednik lub krok o podanym identyfikatorze już istnieje.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby dodania kroku.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby dodania kroku.");
                    }
                    $scope.load--;
                }
            );
        } else {
            $scope.addErrors("error", "Nie istnieje użytkownik lub grupa o podanej nazwie.");
        }
    }
    
    function updateOrderSteps(prev_id, self_id, step_data) {
        step_data.prev = [prev_id];
        
        $scope.load++;
        $http.put( // Update step data
            "/service/flows/flow/" + $scope.data.flow.id + "/step/" + self_id,
            JSON.stringify(step_data)
        ).then(
            function(response) { // Success
                if(response.status == 200) {
                    $scope.addErrors("success", "Kolejność kroków została zaktualizowana");
                }
                $scope.load--;
            },
            function(response) { // Error
                if(response.status == 400) {
                    $scope.addErrors("error", "Błędne żądanie podczas próby przeniesienia kroku.");
                } else if(response.status == 403) {
                    $scope.addErrors("error", "Nie można przenieść kroku (nieprawidłowy lub wygasły token).");
                } else if(response.status == 404) {
                    $scope.addErrors("error", "Nie znaleziono kroku.");
                } else if(response.status == 409) {
                    $scope.addErrors("error", "Nie można przenieść kroku.");
                } else if(response.status == 500) {
                    $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby przeniesienia kroku.");
                } else {
                    $scope.addErrors("error", "Nieoczekiwany błąd podczas próby przeniesienia kroku.");
                }
                $scope.load--;
            }
        );
    }
    
    $scope.editStep = function($event) {
        $scope.step_edit = JSON.parse($event.currentTarget.parentElement.getAttribute("data-step"));
    }
    
    $scope.updateStep = function($event) {
        if($scope.step_edit) {
            $scope.load++;
            $http.put( // Update step data
                "/service/flows/flow/" + $scope.data.flow.id + "/step/" + $scope.step_edit.id,
                JSON.stringify($scope.step_edit)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $route.reload();
                        $scope.addErrors("success", "Krok został zaktualizowany.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby zaktualizowania kroku.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można zaktualizować kroku (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Nie znaleziono kroku.");
                    } else if(response.status == 409) {
                        $scope.addErrors("error", "Nie można zaktualizować kroku.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby zaktualizowania kroku.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby zaktualizowania kroku.");
                    }
                    $scope.load--;
                }
            );
        }
    }
    
    $scope.deleteStep = function($event) {
        step = JSON.parse($event.currentTarget.parentElement.getAttribute("data-step"));
        
        if(confirm("Czy na pewno usunąć wskazany krok?")) {
            $scope.load++;
            $http.delete(
                "/service/flows/flow/" + $scope.data.flow.id + "/step/" + step.id
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $route.reload();
                        $scope.addErrors("success", "Krok został usunięty.");
                        $scope.load--;
                    }
                },
                function(response) { // Error
                    if(response.status == 403) {
                        $scope.addErrors("error", "Nie można usunąć kroku (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Krok nie istnieje.");
                    } else if(response.status == 409) {
                        $scope.addErrors("error", "Nie można wykonać operacji usunięcia kroku.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby usunięcia kroku.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby usunięcia kroku.");
                    }
                    $scope.load--;
                }
            );
        }
    }
});


/*
 ** Groups Controller
 */
app.controller("GroupsController", function($route, $scope, $http, $routeParams, $cookies, $location) {
	var dialog_new = null;
	var dialog_edit = null;
    $scope.notice = [];
    $scope.data = {
        new_group : {
            name : "",
            description : ""
        },
        edit_group : {
            name : "",
            description : ""
        },
        date : getNowDate(),
        phrase : $.trim($routeParams.phrase) ? $.trim($routeParams.phrase) : "",
        groups : []
    }
    
    jQuery(document).ready(function(){
        dialog_new = jQuery( "#js-dialog-new" ).dialog({
            autoOpen: false,
            height: 402,
            width: 500
        } );
        
        dialog_edit = jQuery("#js-dialog-edit").dialog({
            autoOpen: false,
            height: 332,
            width: 500
        });
    });
    
    $scope.filter = function($event) {
        $event.preventDefault();
        
        if( $scope.data.phrase !== "" ) {
            $location.path("/groups/" + $.trim($scope.data.phrase));
        } else {
            $location.path("/groups/");
        }
    }
    
    if($scope.data.phrase.search(" ") > -1) {
        $scope.data.groups = [];
        $scope.notice.push({
            "content": "Nie znaleziono grup.",
            "class": "alert-danger"
        });
    } else {
        $scope.load++;
        $http.get( // Get list of groups
            "/service/groups/groups?" + "search=" + $scope.data.phrase
        ).then(
            function(response) { // Success
                if(response.status == 200) {
                    if(typeof response.data == "object") {
                        $scope.data.groups = response.data;
                        
                        if($scope.data.groups.total == 0) {
                            $scope.notice.push({
                                "content": "Nie znaleziono grup.",
                                "class": "alert-danger"
                            });
                        }
                    }
                }
                $scope.load--;
            },
            function(response) { // Error
                if(response.status == 400) {
                    $scope.addErrors("error", "Błędne żądanie podczas próby pobrania listy grup.");
                }  else if(response.status == 403) {
                    $scope.addErrors("error", "Nie można pobrać listy grup (nieprawidłowy lub wygasły token).");
                } else if(response.status == 500) {
                    $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy grup.");
                } else {
                    $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy grup.");
                }
                $scope.load--;
            }
        );
    }
    
    $scope.createGroup = function($event) {
        $event.preventDefault();
        
        dialog_new.dialog("open");
    }
    
    $scope.addGroup = function($event) {
        $event.preventDefault();
        
        if( $scope.data.new_group.name.search(" ") > -1) {
            $scope.addErrors("error", "Nazwa grupy zawiera niedozwolone znaki.");
        } else if($scope.data.new_group.name != "") {
            $scope.load++;
            $http.post(
                "/service/groups/group/" + encodeURIComponent($scope.data.new_group.name),
                JSON.stringify({
                    "active": true,
                    "create_date": $scope.data.date,
                    "creator": $scope.login,
                    "description": $scope.data.new_group.description ? $scope.data.new_group.description : ""
                })
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $route.reload();
                        $scope.addErrors("success", "Grupa została dodana.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby dodania grupy.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można dodać grupy (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 409) {
                        $scope.addErrors("error", "Istnieje grupa o podanej nazwie.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby dodania grupy.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby dodania grupy.");
                    }
                    $scope.load--;
                }
            );
        } else {
            $scope.addErrors("error", "Nieprawidłowa nazwa grupy.");
        }
    }
    
    $scope.editGroup = function($event) {
        $event.preventDefault();
        
        $scope.data.edit_group.name = $event.currentTarget.getAttribute("data-name");
        $scope.data.edit_group.description = $event.currentTarget.getAttribute("data-description");
        dialog_edit.dialog("open");
    }
    
    $scope.saveGroup = function($event) {
        $event.preventDefault();
        
        if($scope.data.edit_group.name != "") {
            $scope.load++;
            $http.put(
                "/service/groups/group/" + $scope.data.edit_group.name,
                JSON.stringify({
                    "active": true,
                    "create_date": $scope.data.date,
                    "creator": $scope.login,
                    "description": $scope.data.edit_group.description ? $scope.data.edit_group.description : ""
                })
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $route.reload();
                        $scope.addErrors("success", "Grupa została zaktualizowana.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby zaktualizowania grupy.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można zaktualizować grupy (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Grupa nie istnieje.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby zaktualizowania grupy.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby zaktualizowania grupy.");
                    }
                    $scope.load--;
                }
            );
        }
    }
    
    $scope.deleteGroup = function($event) {
        $event.preventDefault();
        
        groupName = $event.currentTarget.getAttribute("data-name");
        
        if(confirm("Czy na pewno usunąć wskazaną grupę?")) {
            $scope.load++;
            $http.delete( // Delete group
                "/service/groups/group/" + groupName
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $route.reload();
                        $scope.addErrors("success", "Grupa została usunięta.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 403) {
                        $scope.addErrors("error", "Nie można usunąć grupy (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Grupa nieznaleziona.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby usunięcia grupy.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby usunięcia grupy.");
                    }
                    $scope.load--;
                }
            );
        }
    }
});


/*
 ** Members Controller
 */
app.controller("MembersController", function($route, $scope, $http, $routeParams, $cookies, $location) {
    $scope.notice = [];
    $scope.data = {
        new_user : "",
        group_name : $routeParams.group ? $routeParams.group : "",
        members : []
    }
    
    jQuery(document).ready(function(){
        dialog_new = jQuery( "#js-dialog-new" ).dialog({
            autoOpen: false,
            height: 206,
            width: 500
        } );
    });
    
    $scope.load++;
    $http.get( // Get group members
        "/service/groups/members/get/" + $scope.data.group_name
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(response.data &&
                   response.data != "null"
                ) {
                    $scope.data.members = response.data;
                    
                    if($scope.data.members.length == 0) {
                        $scope.notice.push({
                            "content": "Brak użytkowników przypisanych do grupy.",
                            "class": "alert-danger"
                        });
                    }
                } else {
                    $scope.notice.push({
                        "content": "Brak użytkowników przypisanych do grupy.",
                        "class": "alert-danger"
                    });
                }
            }
            $scope.load--;
        },
        function(response) { // Error
            if(response.status == 403) {
                $scope.addErrors("error", "Nie można pobrać listy użytkowników (nieprawidłowy lub wygasły token).");
            } else if(response.status == 404) {
                $scope.addErrors("error", "Grupa nieznaleziona.");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania listy użytkowników.");
            } else {
                $scope.addErrors("error", "Nieoczekiwany błąd podczas próby pobrania listy użytkowników.");
            }
            $scope.load--;
        }
    );
    
    $scope.addUser = function($event) {
        $event.preventDefault();
        
        dialog_new.dialog("open");
    }
    
    $scope.saveUser = function($event) {
        $event.preventDefault();
        users = [$scope.data.new_user];
        
        if (users[0] != "") {
            $scope.load++;
            $http.post( // Add users to group
                "/service/groups/members/add/" + $scope.data.group_name,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
						$route.reload();
                        $scope.addErrors("success", "Użytkownik został dodany do grupy.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby dodania użytkownika do grupy.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można dodać użytkownika do grupy (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Grupa nieznaleziona.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby dodania użytkownika do grupy.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby dodania użytkownika do grupy.");
                    }
                    $scope.load--;
                }
            );
        } else {
            $scope.addErrors("success", "Nieprawidłowa nazwa użytkownika.");
        }
    }
    
    $scope.deleteUser = function($event) {
        $event.preventDefault();
        userLogin = $event.currentTarget.getAttribute("data-name");
        users = [userLogin];
        
        if (confirm("Czy na pewno usunąć użytkownika z grupy?")) {
            $scope.load++;
            $http.post( // Remove user from group
                "/service/groups/members/remove/" + $scope.data.group_name,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $route.reload();
                        $scope.addErrors("success", "Użytkownik został usunięty z grupy.");
                    }
                    $scope.load--;
                },
                function(response) { // Error
                    if(response.status == 400) {
                        $scope.addErrors("error", "Błędne żądanie podczas próby usunięcia użytkownika do grupy.");
                    } else if(response.status == 403) {
                        $scope.addErrors("error", "Nie można usunąć użytkownika do grupy (nieprawidłowy lub wygasły token).");
                    } else if(response.status == 404) {
                        $scope.addErrors("error", "Grupa nieznaleziona.");
                    } else if(response.status == 500) {
                        $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby usunięcia użytkownika do grupy.");
                    } else {
                        $scope.addErrors("error", "Nieoczekiwany błąd podczas próby usunięcia użytkownika do grupy.");
                    }
                    $scope.load--;
                }
            );
        }
    }
});

