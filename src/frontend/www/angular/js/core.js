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
    
    $routeProvider.when("/add", {
        title: "Dodaj dokument",
        templateUrl: "/www/angular/add.html",
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
});


/*
 ** Init app
 */
app.controller("ngDMSBody", ["$scope", "$cookies", "$location", "$timeout", function($scope, $cookies, $location, $timeout) {
    $scope.login = $cookies.get("login");
    $scope.toggle = $cookies.get("menu-toggle") ? true : false;
    $scope.errors = [];
    
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
app.controller("UserController", function($scope, $cookies, $http, $interval, $location) {
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
            }
        },
        function(response) { // Error
            if(response.status == 404) {
                $location.path("/404");
            } else if(response.status == 403) {
                $scope.addErrors("error", "Odmowa dostępu do danych użytkownika lub Twój token stracił ważność.");
            } else if(response.status == 500) {
                $scope.addErrors("error", "Błąd wewnętrzny serwera podczas próby pobrania danych użytkownika.");
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
            }
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
        }
    );
    
    $scope.saveUser = function($event) {
        $event.preventDefault();
        $scope.notice = [];
        
        if($scope.userForm.$valid) {
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
                        $scope.addErrors("success", "Profil został zaktualizowany.");
                    }
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
                }
            );
            
            $http.put( // Add or update user keys
                "/service/signing/user/" + $scope.login + "/keys",
                JSON.stringify($scope.data.keys)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $scope.addErrors("success", "Klucz publiczny lub prywatny zostały zaktualizowane.");
                    }
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
                        $scope.addErrors("success", "Hasło zostało zmienione.");
                    }
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
                }
            );
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
                // $location.path("/404");
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
                    // $location.path("/404");
                } else {
                    alert(getErrorMessage(response.status));
                }
            }
        );
    }
});


/*
 ** Get users
 */
app.controller("GetUsersController", function($scope, $http, $cookies, $location, $interval) {
    var result = [];
    
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
                            minLength: 3,
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
        }
    );
});


/*
 ** Get flows
 */
app.controller("GetFlowsController", function($scope, $http, $cookies, $location, $interval) {
    var result = [];
    
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
                            minLength: 3,
                            source: result
                        });
                    } );
                }
            }
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
        }
    );
});


/*
 ** Upload Controller
 */
app.controller("UploadController", function($scope, $http, $cookies, $location, $interval) {
    var flows_id = [];
    
    openFile = function(event) {
        var input = event.target;
        files = input.files;
        if(files.length > 0) {
            document.getElementById("file-name").innerHTML = files[0].name;
        }
    }
    
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
                $scope.uploadForm.$valid = false;
            }
            
            file_done++;
        }
        
        interval = $interval(
            function() {
                if(file_done == 1) {
                    $interval.cancel(interval);
                    
                    if ($scope.uploadForm.$valid) {
                        // Set title of a document
                        _document.title = $scope.title ? $scope.title : "";
                        
                        // Set date of a document
                        _document.create_date = getNowDate();
                        
                        // Set description of a document
                        _document.description = $scope.description ? $scope.description : "";
                        
                        // Set owners of a document
                        i = 0;
                        owners = $scope.owner ? $scope.owner.split(", ") : [];
                        countOwners = owners.length;
                        for(i; i < countOwners; i++) {
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
                                        $scope.addErrors("success", "Dokument został zapisany.");
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
                                            if(response.status == 200) {
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
                        $scope.addErrors("error", "Nieprawidłowo wypełniony formularz.");
                        $scope.loadPage = false;
                    }
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
                    }
                    
                    $scope.loadPage = false;
                }
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
                
                $scope.loadPage = false;
            }
        );
    }
    
    $scope.downloadDocument = function($event) {
        $event.preventDefault();
        
        $scope.loadPage = true;
        documentId = $event.currentTarget.getAttribute("data-id");
        dlnk = document.getElementById("js-download-" + documentId);
        
        if(!dlnk.getAttribute("href")) {
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
                    
                    $scope.loadPage = false;
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

                    $scope.loadPage = false;
                }
            );
        } else {
            dlnk.click();
        }
    }
    
    $scope.deleteDocument = function($event) {
        $event.preventDefault();
        
        if (confirm("Czy na pewno usunąć wskazany dokument?")) {
            $scope.loadPage = true;
            documentId = $event.currentTarget.getAttribute("data-id");
            
            $http.delete(
                "/service/documents/document/" + documentId
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $location.path("/documents");
                        $scope.addErrors("success", "Dokument został usunięty.");
                    }
                    
                    $scope.loadPage = false;
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
                    
                    $scope.loadPage = false;
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
        }
    );
    
    $http.get( // Verify if document in signed by user
        "/service/signing/verify/" + $scope.data.document.id + "/" + $scope.login
    ).then(
        function(response) { // Success
            if(response.status == 200) {
                $scope.data.sign = true;
            }
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
            $http.delete( // Delete document with given id
                "/service/documents/document/" + $scope.data.document.id
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $location.path("/documents/1");
                        $scope.addErrors("success", "Dokument został usunięty.");
                    }
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
    }
    
    $scope.findCurrent = function(step_id) {
        return $scope.data.current_steps.indexOf(step_id) == -1 ? true : false;
    }
    
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
        }
    );
    
    $http.get( // Get information about document status in flow
        "/service/flows-documents/status/" + $scope.data.document.id
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                if(typeof response.data == "object") {
                    flowID = response.data.flow;
                    $scope.data.current_steps = response.data.current_steps;
                    
                    $http.get( // Get flow steps by flow ID
                        "/service/flows/flow/" + flowID + "/steps"
                    ).then(
                        function(response) { // Success
                            if(response.status == 200) {
                                if(typeof response.data == "object") {
                                    $scope.data.steps = response.data;
                                }
                            }
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
                        }
                    );
                }
            }
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
                    }
                    
                    $scope.loadPage = false;
                }
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
                $scope.addErrors("error", "Błędna nazwa przepływu.");
            } else {
                $http.post( // Create new flow
                    "/service/flows/flow/generate",
                    JSON.stringify(flow_data)
                ).then(
                    function(response) { // Success
                        if(response.status == 200) {
                            $scope.addErrors("success", "Przepływ został dodany.");
                            $route.reload();
                        }
                        
                        $scope.loadPage = false;
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
                            $scope.addErrors("success", "Przepływ został usunięty.");
                            $route.reload();
                        }
                        
                        $scope.loadPage = false;
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
                        
                        $scope.loadPage = false;
                    }
                );
            }
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
 ** Groups Controller
 */
app.controller("GroupsController", function($route, $scope, $http, $routeParams, $cookies, $location) {
    $scope.loadPage = true;
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
        phrase : $routeParams.search ? $routeParams.search : "",
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
            $location.path("/groups/" + encodeURI($scope.data.phrase));
        } else {
            $location.path("/groups/");
        }
    }
    
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
            
            $scope.loadPage = false;
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
            
            $scope.loadPage = false;
        }
    );
    
    $scope.createGroup = function($event) {
        $event.preventDefault();
        
        dialog_new.dialog("open");
    }
    
    $scope.addGroup = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        
        if($scope.data.new_group.name != "") {
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
                        $scope.addErrors("success", "Grupa została dodana.");
                        $route.reload();
                    }
                    
                    $scope.loadPage = false;
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
                    
                    $scope.loadPage = false;
                }
            );
        } else {
            $scope.addErrors("error", "Nieprawidłowa nazwa grupy.");
            $scope.loadPage = false;
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
        $scope.loadPage = true;
        
        if($scope.data.edit_group.name != "") {
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
                        $scope.addErrors("success", "Grupa została zaktualizowana.");
                        $route.reload();
                    }
                    
                    $scope.loadPage = false;
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

                    $scope.loadPage = false;
                }
            );
        }
    }
    
    $scope.deleteGroup = function($event) {
        $event.preventDefault();
        
        $scope.loadPage = true;
        groupName = $event.currentTarget.getAttribute("data-name");
        
        if(confirm("Czy na pewno usunąć wskazaną grupę?")) {
            $http.delete( // Delete group
                "/service/groups/group/" + groupName
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $scope.addErrors("success", "Grupa została usunięta.");
                        $route.reload();
                    }
                    
                    $scope.loadPage = false;
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
                    
                    $scope.loadPage = false;
                }
            );
        }
    }
});


/*
 ** Members Controller
 */
app.controller("MembersController", function($route, $scope, $http, $routeParams, $cookies, $location) {
    $scope.loadPage = true;
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
            
            $scope.loadPage = false;
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
            
            $scope.loadPage = false;
        }
    );
    
    $scope.addUser = function($event) {
        $event.preventDefault();
        
        dialog_new.dialog("open");
    }
    
    $scope.saveUser = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        users = [$scope.data.new_user];
        
        if (users[0] != "") {
            $http.post( // Add users to group
                "/service/groups/members/add/" + $scope.data.group_name,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $scope.addErrors("success", "Użytkownik został dodany do grupy.");
                        $scope.data.new_user = "";
						$route.reload();
                    }
                    
                    $scope.loadPage = false;
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
                    
                    $scope.loadPage = false;
                }
            );
        } else {
            $scope.addErrors("success", "Nieprawidłowa nazwa użytkownika.");
            $scope.loadPage = false;
        }
    }
    
    $scope.deleteUser = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        userLogin = $event.currentTarget.getAttribute("data-name");
        users = [userLogin];
        
        if (confirm("Czy na pewno usunąć użytkownika z grupy?")) {
            $http.post( // Remove user from group
                "/service/groups/members/remove/" + $scope.data.group_name,
                JSON.stringify(users)
            ).then(
                function(response) { // Success
                    if(response.status == 200) {
                        $scope.addErrors("success", "Użytkownik został usunięty z grupy.");
                        $route.reload();
                    }
                    
                    $scope.loadPage = false;
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
                    
                    $scope.loadPage = false;
                }
            );
        }
    }
});
