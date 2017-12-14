var app = angular.module("ngDMS", ["ngRoute", "ngCookies"]);

/*
 ** Routing
 */
app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when("/", {
		title: "Pulpit",
		templateUrl: "/www/angular/desktop.html"
    });
    $routeProvider.when("/add", {
        title: "Dodaj dokument",
        templateUrl: "/www/angular/add.html",
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
    $routeProvider.when("/flows/:phrase", {
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
    $routeProvider.when("/status", {
        title: "Status",
        templateUrl: "/www/angular/status.html",
    });
    $routeProvider.when("/action", {
        title: "Akcja na dokumencie",
        templateUrl: "/www/angular/action.html",
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
    $routeProvider.when("/documents/:phrase/:date", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    $routeProvider.when("/documents/:phrase/:date/:page", {
        title: "Lista dokumentów",
        templateUrl: "/www/angular/documents.html",
        controller: "DocumentsController"
    });
    $routeProvider.when("/document/:page", {
        title: "Dokument",
        templateUrl: "/www/angular/document.html",
        controller: "DocumentController"
    });
    $routeProvider.when("/user", {
        title: "Profil użytkownika",
        templateUrl: "/www/angular/user.html",
        controller: "UserController"
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
    $routeProvider.otherwise({
        title: "Podana strona nie istnieje",
        templateUrl: "/www/angular/404.html",
    });
});

/*
 ** Set title of document
 */
app.controller("ngDMSHead", ["$scope", "$location", function($scope, $location) {
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
 ** Init of app
 */
app.controller("ngDMSBody", ["$scope", "$cookies", "$location", function($scope, $cookies, $location) {
    // Toggle of menu
    $scope.toggle = $cookies.get("menu-toggle") ? true : false;
    $scope.menuToggle = function() {
        if ($cookies.get("menu-toggle")) {
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

    // Set classess of css
    $scope.$on("$routeChangeSuccess", function(event, data) {
        switch ($location.path()) {
            case "/":
                $scope.body = "page page-desktop";
                break;
            case "/add":
                $scope.body = "page page-add";
                break;
            case "/user":
                $scope.body = "page page-user";
                break;
            default:
                $scope.body = "page-404";
                break;
        }

        if ($location.path().search("/documents") != -1) {
            $scope.body = "page page-documents";
        } else if ($location.path().search("/document") != -1) {
            $scope.body = "page page-document";
        } else if ($location.path().search("/groups") != -1) {
            $scope.body = "page page-groups";
        } else if ($location.path().search("/members") != -1) {
            $scope.body = "page page-members";
        } else if ($location.path().search("/flows") != -1) {
            $scope.body = "page page-flow";
        } else if ($location.path().search("/flow") != -1) {
            $scope.body = "page page-flow";
        } else if ($location.path().search("/status") != -1) {
            $scope.body = "page page-status";
        } else if ($location.path().search("/action") != -1) {
            $scope.body = "page page-action";
        }
    });
}]);

/*
 ** Search engine in header
 */
app.controller("SearchController", function($scope, $http, $location) {
    $scope.search = function($event) {
        $event.preventDefault();
		
		if( $scope.search_phrase && $scope.search_phrase !== "" ) {
			$location.path("/documents/" + encodeURI($scope.search_phrase) + "/1");
		} else {
			$location.path("/documents");
		}
    }
});

/*
 ** Nav in header
 */
app.controller("NavController", function($scope, $http, $location) {
	$scope.number_messages = 0;
	$scope.number_actions = 0;
	
	$http.get(
		"/service/desktop/comments"
	).then(
		function(response) { // Success
			if (response.status == 200) {
				if( response.data.total ) {
					$scope.number_messages = response.data.total;
				}
				else {
					$scope.number_messages = 0;
				}
			}
		},
		function(response) { // Error
			if (response.status == 400) {
				alert("Błędne żądanie.");
			} else if (response.status == 403) {
				alert("Nieprawidłowy lub wygasły token.");
			} else if (response.status == 500) {
				alert("Wewnętrzny błąd serwera.");
			}
		}
	);
	
	$http.get(
		"/service/desktop/actions"
	).then(
		function(response) { // Success
			if (response.status == 200) {
				if( response.data.total ) {
					$scope.number_actions = response.data.total;
				}
				else {
					$scope.number_actions = 0;
				}
			}
		},
		function(response) { // Error
			if (response.status == 400) {
				alert("Błędne żądanie.");
			} else if (response.status == 403) {
				alert("Nieprawidłowy lub wygasły token.");
			} else if (response.status == 500) {
				alert("Wewnętrzny błąd serwera.");
			}
		}
	);
});

app.controller("PulpitController", function($scope, $http, $location) {
	$scope.documents = [];
	$scope.actions = [];
	$scope.comments = [];
	$scope.notice = [];
	$scope.emptyActions = false;
	$scope.emptyDocuments = false;
	$scope.emptyComments = false;
	
	jQuery( document ).ready( function() {
		jQuery( ".js-box-more" ).on( "click", function() {
			thisObject = jQuery( this );
			thisObject.toggleClass( "on", "" );
			thisObject.prev( ".box-table-more" ).slideToggle( "slow" );
		} );
	} );
	
	$http.get(
		"/service/desktop/actions"
	).then(
		function(response) { // Success
			if (response.status == 200) {
				if( !response.data.total || response.data.total == 0 ) {
					$scope.emptyActions = true;
				}
				if( response.data ) {
					$scope.actions = response.data;
				}
			}
		},
		function(response) { // Error
			if (response.status == 400) {
				alert("Błędne żądanie.");
			} else if (response.status == 403) {
				alert("Nieprawidłowy lub wygasły token.");
			} else if (response.status == 500) {
				alert("Wewnętrzny błąd serwera.");
			}
		}
	);
	
	$http.get(
		"/service/desktop/documents"
	).then(
		function(response) { // Success
			if (response.status == 200) {
				if( !response.data.total || response.data.total == 0 ) {
					$scope.emptyDocuments = true;
				}
				if( response.data ) {
					$scope.documents = response.data;
				}
			}
		},
		function(response) { // Error
			if (response.status == 400) {
				alert("Błędne żądanie.");
			} else if (response.status == 403) {
				alert("Nieprawidłowy lub wygasły token.");
			} else if (response.status == 500) {
				alert("Wewnętrzny błąd serwera.");
			}
		}
	);
	
	$http.get(
		"/service/desktop/comments"
	).then(
		function(response) { // Success
			if (response.status == 200) {
				if( !response.data.total || response.data.total == 0 ) {
					$scope.emptyComments = true;
				}
				if( response.data ) {
					$scope.comments = response.data;
				}
			}
		},
		function(response) { // Error
			if (response.status == 400) {
				alert("Błędne żądanie.");
			} else if (response.status == 403) {
				alert("Nieprawidłowy lub wygasły token.");
			} else if (response.status == 500) {
				alert("Wewnętrzny błąd serwera.");
			}
		}
	);
});

/*
 ** Datepicker - jQuery UI
 */
app.directive("datepicker", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elem, attrs, ngModelCtrl) {
            var updateModel = function(dateText) {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(dateText);
                });
            }
            var options = {
                dateFormat: "yy-mm-dd",
                onSelect: function(dateText) {
                    updateModel(dateText);
                }
            }
            elem.datepicker(options);
        }
    }
});

/*
 ** Actions Controller
 */
app.controller("ActionsController", function($scope, $http, $location, $route) {
    $scope.documentOver = function($event) {
        $scope.loadPage = true;
        var documentId = $event.currentTarget.getAttribute("data-id");
        var thumbnail = document.getElementById("thumbnail_" + documentId);

        if (thumbnail.src != '') {
            $scope.loadPage = false;
            thumbnail.className = "thumbnail-show";
        } else {
            $http.get( // Get document
                "/service/documents/document/" + documentId
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        if (response.data.thumbnail != '') {
                            thumbnail.src = response.data.thumbnail;
                            thumbnail.className = "thumbnail-show";
                        }
                    }

                    $scope.loadPage = false;
                }
            );
        }
    }

    $scope.documentLeave = function($event) {
        thumbnailCurrent = document.getElementsByClassName("thumbnail-show");
        thumbnailCurrentLength = thumbnailCurrent.length;
        if (thumbnailCurrentLength > 0) {
            for (i = 0; i < thumbnailCurrentLength; i++) {
                document.getElementsByClassName("thumbnail-show")[i].className = "thumbnail";
            }
        }
    }

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
 ** FlowsController
 */
app.controller("FlowsController", function($scope, $route, $routeParams, $http, $timeout, $cookies, $location) {
    if (isNaN($routeParams.page) &&
        $routeParams.page != undefined
    ) {
        if ($routeParams.phrase) {
            if ($location.path() !== "/flows/" + $routeParams.phrase + "/") {
                $location.path("/flows/" + $routeParams.phrase + "/");
            }
        } else if ($location.path() !== "/flows") {
            $location.path("/flows");
        }
    } else {
		$scope.currentPage = !isNaN($routeParams.page) ? parseInt($routeParams.page) : 1;
		$scope.offset = 5 * ( $scope.currentPage - 1 );
		$scope.limit = 5;
		$scope.numberOfPages = 0;
		$scope.notice = [];
		$scope.flows = [];
		$scope.pages = [];
		$scope.loadPage = true;
        $scope.phrase = $routeParams.phrase && $routeParams.phrase != "null" ? decodeURI($routeParams.phrase) : "";
		
        if ( $scope.phrase !== "" ) {
			$scope.loc = "/#!flows/" + $routeParams.phrase + "/";
        } else {
			$scope.loc = "/#!flows/";
		}
		
		$scope.filter = function($event) {
			$event.preventDefault();
			phrase = document.getElementsByClassName( "flows-phrase" )[0].value;
			
			if( phrase !== "" ) {
				$location.path("/flows/" + phrase + "/1");
			} else {
				$location.path("/flows/");
			}
		}
		
        function getPagination() {
            $scope.pages = [];

            if ($scope.currentPage - 1 < $scope.numberOfPages) {
				i = $scope.currentPage;
                max = i + 3;
				diff = max - $scope.numberOfPages;
				
				if( diff > 0 ) {
					i = ( i - diff ) > 1 ? ( i - diff ) : 1;
				}
				
                for (i; i <= max; i++) {
                    if (i > $scope.numberOfPages) break;
                    $scope.pages.push(i);
                }
            }
        }
		
        $http.get(
            "/service/flows/flows?limit=" + $scope.limit + "&offset=" + $scope.offset + "&search=" + $scope.phrase
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    if( response.data.result !== null ) {
						$scope.flows = response.data.result;
						$scope.numberOfPages = Math.ceil( response.data.total / $scope.limit );
						getPagination();
					} else {
						$scope.notice.push( {
							"content": "Nie znaleziono przepływów.",
							"class": "alert-danger"
						} );
					}
					
                    $scope.loadPage = false;
                }
            },
            function(response) { // Error
                if (response.status == 404) {
                    $scope.notice.push = {
                        "content": "Nie znaleziono przepływów.",
                        "class": "alert-danger"
                    };
                } else if (response.status == 500) {
                    $scope.notice.push = {
                        "content": "Błąd wewnętrzny serwera.",
                        "class": "alert-danger"
                    };
                }

                $scope.loadPage = false;
            }
        );
		
		// Delete the flow
		$scope.deleteFlow = function($event) {
			$event.preventDefault();

			if (confirm("Czy na pewno usunąć wskazany przepływ?")) {
				$scope.loadPage = true;
				flowId = $event.currentTarget.getAttribute("data-id");

				$http.delete(
					"/service/flows/flow/" + flowId
				).then(
					function(response) { // Success
						if (response.status == 200) {
							$route.reload();
							alert("Przepływ został usunięty.");
						}

						$scope.loadPage = false;
					},
					function(response) { // Error
						if (response.status == 404) {
							alert("Nie znaleziono przepływu.");
						} else if (response.status == 403) {
							alert("Nieprawidłowy lub wygasły token.");
						} else if (response.status == 500) {
							alert("Wewnętrzny błąd serwera.");
						}

						$scope.loadPage = false;
					}
				);
			}
		}
		
		$scope.addFlow = function($event) {
			$event.preventDefault();
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
				$http.post(
					"/service/flows/flow/generate",
					JSON.stringify(flow_data)
				).then(
					function(response) { // Success
						if (response.status == 200) {
							$route.reload();
							alert("Przepływ został dodany.");
						}
					},
					function(response) { // Error
						alert( response.status );
						if (response.status == 400) {
							$scope.notice.push = {
								"content": "Błędne żądanie.",
								"class": "alert-danger"
							};
						} else if (response.status == 403) {
							$scope.notice.push = {
								"content": "Nieprawidłowy lub wygasły token.",
								"class": "alert-danger"
							};
						} else if (response.status == 409) {
							$scope.notice.push = {
								"content": "Istnieje przepływ o podanej nazwie.",
								"class": "alert-danger"
							};
						} else if (response.status == 500) {
							$scope.notice.push = {
								"content": "Błąd wewnętrzny serwera.",
								"class": "alert-danger"
							};
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
		
		jQuery( document ).ready( function($scope) {
			jQuery( "#sortable" ).sortable( {
				stop: function (event, ui) {
					prev_id = jQuery( ui.item ).prev().find( ".steps-inner" ).data( "id" );
					if( prev_id ) {
						self_id = jQuery( ui.item ).find( ".steps-inner" ).data( "id" );
						type = jQuery( ui.item ).find( ".steps-inner" ).data( "type" );
						updateOrderSteps(self_id, prev_id, type);
					} else {
						$route.reload();
					}
				}
			} );
					
			dialog_edit = jQuery( "#dialog-edit" ).dialog( {
				autoOpen: false,
				height: 472,
				width: 500
			} );
			
			jQuery( ".steps" ).on( "click", ".edit-step", function() {
				step_id = jQuery( this ).data( "id" );
				updateStep( step_id );
			});
		} );
		
		function updateStep(step_id) {
			$http.get(
				"/service/flows/flow/" + $scope.id + "/step/" + step_id
			).then(
				function(response) { // Success
					if (response.status == 200) {
						document.getElementById("js-step-type").value = response.data.type;
						document.getElementById("js-step-description").value = response.data.description;
						dialog_edit.dialog( "open" );
					}
				},
				function(response) { // Error
					alert( response.status );
					if (response.status == 403) {
						$scope.notice.push = {
							"content": "Your not allowed to get flow data or your token expired",
							"class": "alert-danger"
						};
					} else if (response.status == 403) {
						$scope.notice.push = {
							"content": "Flow not found",
							"class": "alert-danger"
						};
					} else if (response.status == 500) {
						$scope.notice.push = {
							"content": "Błąd wewnętrzny serwera.",
							"class": "alert-danger"
						};
					}
				}
			);
		}
		
		function updateOrderSteps(self_id, prev_id, type) {
			step_data = {
			  "type": type,
			  "prev": [prev_id],
			  "participants": [
				"string"
			  ],
			  "description": "string"
			}
			
			$http.put(
				"/service/flows/flow/" + $scope.id + "/step/" + self_id,
				JSON.stringify(step_data)
			).then(
				function(response) { // Success
					if (response.status == 200) {
						$route.reload();
						alert("Kolejność kroków została zaktualizowana");
						
						// $scope.loadPage = false;
					}
				},
				function(response) { // Error
					alert( response.status );
					if (response.status == 403) {
						$scope.notice.push = {
							"content": "Your not allowed to get flow data or your token expired",
							"class": "alert-danger"
						};
					} else if (response.status == 403) {
						$scope.notice.push = {
							"content": "Flow not found",
							"class": "alert-danger"
						};
					} else if (response.status == 500) {
						$scope.notice.push = {
							"content": "Błąd wewnętrzny serwera.",
							"class": "alert-danger"
						};
					}

					// $scope.loadPage = false;
				}
			);
		}
		
		$http.get(
			"/service/flows/flow/" + $scope.id
		).then(
			function(response) { // Success
				if (response.status == 200) {
					$scope.data = response.data;
					
					// $scope.loadPage = false;
				}
			},
			function(response) { // Error
				if (response.status == 403) {
					$scope.notice.push = {
						"content": "Your not allowed to get flow data or your token expired",
						"class": "alert-danger"
					};
				} else if (response.status == 403) {
					$scope.notice.push = {
						"content": "Flow not found",
						"class": "alert-danger"
					};
				} else if (response.status == 500) {
					$scope.notice.push = {
						"content": "Błąd wewnętrzny serwera.",
						"class": "alert-danger"
					};
				}

				// $scope.loadPage = false;
			}
		);
		
		// Get steps by id
		$http.get(
			"/service/flows/flow/" + $scope.id + "/steps"
		).then(
			function(response) { // Success
				if (response.status == 200) {
					$scope.steps = response.data;
					
					// $scope.loadPage = false;
				}
			},
			function(response) { // Error
				if (response.status == 400) {
					$scope.notice.push = {
						"content": "Błędne żądanie.",
						"class": "alert-danger"
					};
				} else if (response.status == 403) {
					$scope.notice.push = {
						"content": "Nieprawidłowy lub wygasły token.",
						"class": "alert-danger"
					};
				} else if (response.status == 500) {
					$scope.notice.push = {
						"content": "Błąd wewnętrzny serwera.",
						"class": "alert-danger"
					};
				}

				// $scope.loadPage = false;
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
					alert( response.status );
						if (response.status == 200) {
							$route.reload();
							alert("Przepływ został zaktualizownay.");
						}
					},
					function(response) { // Error
						alert( response.status );
						if (response.status == 400) {
							$scope.notice.push = {
								"content": "Błędne żądanie.",
								"class": "alert-danger"
							};
						} else if (response.status == 403) {
							$scope.notice.push = {
								"content": "Nieprawidłowy lub wygasły token.",
								"class": "alert-danger"
							};
						} else if (response.status == 404) {
							$scope.notice.push = {
								"content": "Nie znaleziono przepływu.",
								"class": "alert-danger"
							};
						} else if (response.status == 500) {
							$scope.notice.push = {
								"content": "Błąd wewnętrzny serwera.",
								"class": "alert-danger"
							};
						}

						$scope.loadPage = false;
					}
				);
			}
		}
		
		$scope.addStep = function($event) {
			$event.preventDefault();
			
			step_data = {
			  "type": "testowy",
			  "prev": [
				"064bd64e-975f-4cb1-ba3a-07fd2e05f372"
			  ],
			  "participants": [],
			  "description": "opis"
			}
			
			$http.post(
				"/service/flows/flow/" + $scope.id + "/step/generate",
				JSON.stringify(step_data)
			).then(
				function(response) { // Success
					if (response.status == 200) {
						$route.reload();
						alert("Krok został dodany.");
					}
				},
				function(response) { // Error
					alert( response.status );
					if (response.status == 400) {
						$scope.notice.push = {
							"content": "Błędne żądanie.",
							"class": "alert-danger"
						};
					} else if (response.status == 403) {
						$scope.notice.push = {
							"content": "Nieprawidłowy lub wygasły token.",
							"class": "alert-danger"
						};
					} else if (response.status == 409) {
						$scope.notice.push = {
							"content": "Operation cannot be performed (invalid operation). Step ID already exists or invalid previous steps or change to invalid type.",
							"class": "alert-danger"
						};
					} else if (response.status == 500) {
						$scope.notice.push = {
							"content": "Błąd wewnętrzny serwera.",
							"class": "alert-danger"
						};
					}

					$scope.loadPage = false;
				}
			);
		}
		
		$scope.deleteStep = function($event) {
			$event.preventDefault();
			step_id = $event.currentTarget.getAttribute("data-id");
			$scope.notice = [];
			
			$http.delete(
				"/service/flows/flow/" + $scope.id + "/step/" + step_id	
			).then(
				function(response) { // Success
					if (response.status == 200) {
						$route.reload();
						alert("Krok został usunięty.");
					}
				},
				function(response) { // Error
					alert( response.status );
					if (response.status == 400) {
						$scope.notice.push = {
							"content": "Błędne żądanie.",
							"class": "alert-danger"
						};
					} else if (response.status == 403) {
						$scope.notice.push = {
							"content": "Nieprawidłowy lub wygasły token.",
							"class": "alert-danger"
						};
					} else if (response.status == 409) {
						$scope.notice.push = {
							"content": "Operation cannot be performed (invalid operation). Step ID already exists or invalid previous steps or change to invalid type.",
							"class": "alert-danger"
						};
					} else if (response.status == 500) {
						$scope.notice.push = {
							"content": "Błąd wewnętrzny serwera.",
							"class": "alert-danger"
						};
					}

					// $scope.loadPage = false;
				}
			);
		}
	}
});

/*
 ** Documents controller
 */
app.controller("DocumentsController", function($scope, $routeParams, $http, $timeout, $cookies, $location) {
    if (isNaN($routeParams.page) &&
        $routeParams.page != undefined
    ) {
        if ($routeParams.phrase ||
            $routeParams.date
        ) {
            if ($location.path() !== "/documents/" + $routeParams.phrase + "/" + $routeParams.date + "/") {
                $location.path("/documents/" + $routeParams.phrase + "/" + $routeParams.date + "/");
            }
        } else if ($location.path() !== "/documents") {
            $location.path("/documents");
        }
    } else {
		$scope.currentPage = !isNaN($routeParams.page) ? parseInt($routeParams.page) : 1;
		$scope.offset = 5 * ( $scope.currentPage - 1 );
		$scope.limit = 5;
		$scope.numberOfPages = 0;
		$scope.notice = [];
		$scope.documents = [];
		$scope.pages = [];
		$scope.loadPage = true;
        $scope.phrase = $routeParams.phrase && $routeParams.phrase != "null" ? decodeURI($routeParams.phrase) : "";
		
        if ( $scope.phrase !== "" ) {
			$scope.loc = "/#!documents/" + $routeParams.phrase + "/";
        } else {
			$scope.loc = "/#!documents/";
		}
		
		$scope.filter = function($event) {
			$event.preventDefault();
			phrase = document.getElementsByClassName( "documents-phrase" )[0].value;
			
			if( phrase !== "" ) {
				$location.path("/documents/" + phrase + "/1");
			} else {
				$location.path("/documents/");
			}
		}
		
        function getPagination() {
            $scope.pages = [];

            if ($scope.currentPage - 1 < $scope.numberOfPages) {
				i = $scope.currentPage;
                max = i + 3;
				diff = max - $scope.numberOfPages;
				
				if( diff > 0 ) {
					i = ( i - diff ) > 1 ? ( i - diff ) : 1;
				}
				
                for (i; i <= max; i++) {
                    if (i > $scope.numberOfPages) break;
                    $scope.pages.push(i);
                }
            }
        }
		
        $http.get(
            "/service/documents/documents?limit=" + $scope.limit + "&offset=" + $scope.offset + "&search=" + $scope.phrase
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    if( response.data.result !== null ) {
						$scope.documents = response.data.result;
						$scope.numberOfPages = Math.ceil( response.data.total / $scope.limit );
						getPagination();
					} else {
						$scope.notice.push( {
							"content": "Nie znaleziono dokumentów.",
							"class": "alert-danger"
						} );
					}
					
                    $scope.loadPage = false;
                }
            },
            function(response) { // Error
                if (response.status == 404) {
                    $scope.notice.push = {
                        "content": "Nie znaleziono dokumentów.",
                        "class": "alert-danger"
                    };
                } else if (response.status == 500) {
                    $scope.notice.push = {
                        "content": "Błąd wewnętrzny serwera.",
                        "class": "alert-danger"
                    };
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
    if ($routeParams.page) {
        documentId = $routeParams.page;

        $http.get( // Get document
            "/service/documents/document/" + documentId
        ).then(
            function(response) { // Success
                if (response.status == 200) {
                    $scope.id = response.data.id;
                    $scope.file_name = response.data.file_name;
                    $scope.title = response.data.title;
                    $scope.create_date = response.data.create_date;
                    $scope.owner = response.data.owner.join(";");
                    $scope.description = response.data.description;
                    $scope.thumbnail = response.data.thumbnail;
                    $scope.data = response.data.data;
                    document.getElementById("file-name").innerHTML = response.data.file_name;
                    document.getElementById("file_base64").value = response.data.data;
                    document.getElementById("file_name_base64").value = response.data.file_name;

                    thumbnail = response.data.thumbnail;
                    document.getElementById("thumbnail_base64").value = thumbnail;

                    if (thumbnail != '') {
                        document.getElementById("thumbnail_img").src = thumbnail;
                    } else {
                        thumbnail = document.getElementById("thumbnail_container");
                        thumbnail.parentElement.removeChild(thumbnail);
                    }
                }
            },
            function(response) { // Error
                if (response.status == 404) {
					alert("Dokument nieznaleziony");
					// $location.path("/404");
                } else if (response.status == 500) {
                    alert("Wewnętrzny błąd serwera.");
                }
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
    
    openFile = function(event) {
        var input = event.target;
        files = input.files;
        if (files.length > 0) {
            document.getElementById("file-name").innerHTML = files[0].name;
        }
    }

    // Save a document
    $scope.saveDocument = function($event) {
        $event.preventDefault();
        $scope.loadPage = true;
        $scope.notice = [];
        _document = {
            "id": "",
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

        // Set thumbnail of a document
        fileReader2 = new FileReader();
        files = document.getElementById("thumbnail").files;
        if (files.length > 0) {
            file = files[0];
            file_name = file.name;
            file_size = file.size;
            reg_name = new RegExp(".+\.(jpg|JPG|jpeg|JPEG|png|PNG)$");
            max_size = 10000000; // max 10MB

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
                fileReader2.onloadend = function(fileLoadedEvent) {
                    file_base64 = fileLoadedEvent.target.result;
                    _document.thumbnail = file_base64; // Set thumbnail of a document
                    file_done++;
                }

                fileReader2.readAsDataURL(file);
            }
        } else {
            thumbnail_base64 = document.getElementById("thumbnail_base64");

            if (thumbnail_base64) {
                _document.thumbnail = thumbnail_base64.value;
            }

            file_done++;
        }

        interval = $interval(
            function() {
                if (file_done == 2) {
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
                        owners = $scope.owner ? $scope.owner.split(";") : [];
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
                                        document.getElementById("thumbnail").value = "";
                                        $scope.owner = "";
                                        $scope.title = "";
                                        $scope.description = "";
                                        $scope.uploadForm.$setPristine();
                                        $scope.notice.push({
                                            "content": "Dokument został zapisany.",
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
 ** User controller
 */
app.controller("UserController", function($scope, $cookies, $http, $routeParams) {
    $scope.notice = [];
    $scope.groups = [];
    $scope.login = $cookies.get("login");
    $scope.token = $cookies.get("token");
    $scope.type = "";
    $scope.active = "";
    $scope.last_login = "";
    $scope.last_active = "";
    $scope.first_name = "";
    $scope.last_name = "";
    $scope.email = "";

    var login = $cookies.get("login");
    var token = $cookies.get("token");

    // Get information about of the user
    $http.get(
        "/service/users/user"
    ).then(
        function(response) { // Success
            if (response.status == 200) {
                $scope.login = response.data.login;
                $scope.type = response.data.type;
                $scope.active = response.data.active ? "Aktywny" : "Nieaktywny";
                $scope.last_login = response.data.last_login;
                $scope.last_active = response.data.last_active;
                $scope.first_name = response.data.first_name;
                $scope.last_name = response.data.last_name;
                $scope.email = response.data.email;
            }
        },
        function(response) { // Error
            if (response.status == 403) {
                $scope.notice.push({
                    "content": "Twoje konto nie może uzyskać danych użytkownika lub Twój token stracił ważność.",
                    "class": "alert-danger"
                });
            } else if (response.status == 404) {
                $scope.notice.push({
                    "content": "Użytkownik nie znaleziony.",
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

    // Get information about of the groups
    $http.get(
        "/service/documents/user/groups"
    ).then(
        function(response) { // Success
            // $scope.groups = response.data;
            $scope.groups = response.data.result;
        }
    );

    $scope.saveUser = function($event) {
        $event.preventDefault();
        $scope.notice = [];
        $scope.loadPage = true;
        _user = {
            "type": "normal",
            "active": true,
            "first_name": $scope.first_name,
            "last_name": $scope.last_name,
            "email": $scope.email
        }

        var login = $cookies.get("login");
        var token = $cookies.get("token");

        if ($scope.userForm.$valid) {
            // Update information about of the user
            $http.put(
                "/service/users/user",
                JSON.stringify(_user)
            ).then(
                function(response) { // Success
                    if (response.status == 200) {
                        $scope.notice.push({
                            "content": "Zmiany zostały zapisane.",
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
                    } else if (response.status == 403) {
                        $scope.notice.push({
                            "content": "Nieprawidłowy lub wygasły token.",
                            "class": "alert-danger"
                        });
                    } else if (response.status == 404) {
                        $scope.notice.push({
                            "content": "Użytkownik nie znaleziony.",
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
