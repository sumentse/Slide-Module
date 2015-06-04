angular.module("setup",[])
	.controller("setupCtrl", function($scope, $http, $location, initializer, spService, imageStorage, configurationList){
		

		var config = null;
		$scope.folderURL = "";



		$scope.save = function(){

			//the list database should be setup with these names
			var data = {
				PageURL: initializer.Url.main,
				SlideFolder: ($scope.folderURL).replace(/(^[^A-Za-z0-9]+|[^A-Za-z0-9]+$)/g,""),
				encodeURL: initializer.encodeURL,
				options: JSON.stringify({
					headline: $scope.options.headline,
					labelheadline: $scope.options.labelheadline
				})
			};

			//check if slide Folder exists and if it contains images
			$http({
				url:"https://" + initializer.Url.host + initializer.Url.base + "/_api/web/getFolderByServerRelativeUrl('" + initializer.Url.base + data.SlideFolder + "')/Files?$select=Title,Name,TimeCreated,TimeLastModified,ListItemAllFields/Description0, ListItemAllFields/OData__Author&$expand=Author,ListItemAllFields",
		        method: "GET",
		        headers: { "Accept": "application/json; odata=verbose"}
			}).then(function(response){

				//obtaining json structure of images
				imageStorage.add(response.data.d.results);
				imageStorage.setFolderLocation(data.SlideFolder);
				

				//If there's no images then it will not save the data on to the configuration because the folder does not exist or it doesn't have any images at all
				if(imageStorage.get().length === 0){
					console.log("Do not add or update because there is no images");
				}else{
					console.log("good to post");
					
					console.log("https://" + initializer.Url.host + initializer.Url.base )

					//check slideshow configuration to see if it needs to be added or updated
					spService.getListItems("https://" + initializer.Url.host + initializer.Url.base, configurationList, "?$select=ID, PageURL, SlideFolder, encodeURL, options&$filter=encodeURL eq '" + initializer.encodeURL + "'",
						function(response){
							
							config = response.data.d.results;
							
							//the condition for adding or updating

							if( config.length > 0 ){
								console.log("updating the item for " + config[0].ID)
								spService.updateListItem("https://" + initializer.Url.host + initializer.Url.base, configurationList, config[0].ID, data,
									function(response){

										imageStorage.setIndex(1);
										imageStorage.setOptions(JSON.parse(data.options));
										$location.path("/slide/1");

									}, function(response){
										//fail to update the item on the slideshow configuration list
									}
								);

							}else{

								spService.addListItem("https://" + initializer.Url.host + initializer.Url.base, configurationList, data,
									function(response){


										imageStorage.setIndex(1);
										imageStorage.setOptions(JSON.parse(data.options));
										$location.path("/slide/1");
										
									},
									function(response){
										//fail to add the item onto the slideshow configuration list
									}
								);
								
							}

						},
						function(response){
							//fail to get the slideshow configuration list
						}
					);


				}

			}, function(response){

			})


			
		}

	})