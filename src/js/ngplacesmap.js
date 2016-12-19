/*
 * angular-google-places-map
 *
 * Copyright (c) 2015 Davide Pedone
 * Licensed under the MIT license.
 * https://github.com/davidepedone/angular-google-places-map
 */

(function(){

	'use strict';

	var getLocation = function( addressObj, fallback, callback ){

		// # Get location coords
		try{
			var lat = addressObj.geometry.location.A;
			var lng = addressObj.geometry.location.F;
			return new google.maps.LatLng( lat, lng );

		}catch(e){
			return new google.maps.LatLng( fallback.lat, fallback.lng );
		}
	};


 	angular.module('ngPlacesMap', [])
	.filter('gps', function() {
		return function(input,field) {
			var json;
			try{
				json = JSON.parse(input);
			}catch(e){
				json = false;
			}
			return json && json[field] ? json[field] : '';
		};
	})
	.directive( 'placesMap', function(){
		return {
			restrict:'E',
			replace: true,
			scope:{
				customCallback: '&?',
				picked: '=?',
				address: '=?',
				fallback: '=?',
				mapType: '@?',
				readonly: '@?',
				responsive: '@?',
				draggable: '@?',
				toggleMapDraggable: '=?',
				placeNotFound: '=?',
				updateMarkerLabel: '=?',
				redrawMap: '=?',
				mapOptions: '=?',
				static: '@'
			},
			controller: ['$scope', function ($scope) {}],
			template: '<div class="dp-places-map-wrapper"><input type="text" class="dp-places-map-input"><div class="dp-places-map-canvas"></div></div>',

			link: function( $scope, element, attrs, controller ){

				var isCurrentlyDraggable = $scope.draggable == 'true';

				$scope.toggleMapDraggable = function( draggable ){
					isCurrentlyDraggable = draggable;
					map.setOptions({draggable:isCurrentlyDraggable,scrollwheel:isCurrentlyDraggable});
				};

				$scope.updateMarkerLabel = function( label ){
					infowindow.setContent( label );
				};

				if( $scope.redrawMap ){
					$scope.redrawMap.updateMap = function( address ){
						var latlng = new google.maps.LatLng( address.lat, address.lng );
						placeMarker( latlng, false, false);
						map.setCenter( latlng );
					};
				}

				var defaultMapOptions;
				if ($scope.static && $scope.static == 'true') {
					defaultMapOptions = {
						zoom: 5,
						draggable: false,
						panControl: false,
						zoomControl: false,
						scrollwheel: false,
						mapTypeControl: false,
						streetViewControl: false,
						clickableIcons: false
					};
				} else {
					defaultMapOptions = {zoom: 5};
				}


				var mapOptions = angular.extend(defaultMapOptions, $scope.mapOptions);

				var providedAddress = {};
				if( $scope.address ){
					providedAddress = $scope.address;
					mapOptions.zoom = $scope.address.zoom || 15;
				}

				var fallbackAddress = {};
				// # If fallback is not provided use this coords
				fallbackAddress.lat = 41.87194;
				fallbackAddress.lng = 12.567379999999957;

				if( $scope.fallback ){
					fallbackAddress = $scope.fallback;
					mapOptions.zoom = $scope.fallback.zoom || mapOptions.zoom;
				}

				if( $scope.draggable && $scope.draggable == 'false'){
					mapOptions.draggable = false;
					mapOptions.scrollwheel = false;
				}

				// # Set map type if provided
				if( $scope.mapType && google.maps.MapTypeId[$scope.mapType] ){
					mapOptions.mapTypeId = google.maps.MapTypeId[$scope.mapType];
				}

				// # Get place from coords and Set map center
				mapOptions.center = getLocation( providedAddress, fallbackAddress );

				var canvas = element.find('div')[0];
				var input = element.find('input')[0];

				if( $scope.responsive && $scope.responsive == 'true' ){
					canvas.className += ' responsive';
				}

				// # Create map
				var map = new google.maps.Map( canvas, mapOptions );

				// # Init place service
				var placeService = new google.maps.places.PlacesService( map );

				// # Init geocoder service
				var geocoder = new google.maps.Geocoder();

				// # Prepare Marker
				var marker = new google.maps.Marker({
					map: map,
					anchorPoint: new google.maps.Point(0, -29)
				});
				// # Prepare InfoWindow
				var infowindow = new google.maps.InfoWindow();

				// # Place input field
				if( !$scope.readonly ){
					map.controls[ google.maps.ControlPosition.TOP_LEFT ].push( input );
				}else{
					input.style.display = 'none';
				}

				// # Add autocomplete
				var autocomplete = new google.maps.places.Autocomplete( input );
				autocomplete.bindTo('bounds', map);

				var placeAutocompleteMarker = function( place, customAddress, executeCallback ){

					// # Get geometry
					if( !place.geometry ){
						if(typeof $scope.placeNotFound == 'function'){
							$scope.placeNotFound();
						}else{
							alert('Pick a valid location');
						}
						return;
					}

					// # If the place has a geometry, then present it on a map.
					if( place.geometry.viewport ){
						map.fitBounds( place.geometry.viewport );
					}else{
						map.setCenter( place.geometry.location  );
						map.setZoom( ( $scope.address && $scope.address.zoom ) ? $scope.address.zoom : 15 );
					}
					// # Update marker
					marker.setIcon({
						url: place.icon,
						size: new google.maps.Size( 71, 71 ),
						origin: new google.maps.Point( 0, 0 ),
						anchor: new google.maps.Point( 17, 34 ),
						scaledSize: new google.maps.Size( 35, 35 )
					});

					var address = '';
					var infoWindowContent = '';

					if( !customAddress ){

						if( place.address_components ) {
							address = [
								(place.address_components[0] && place.address_components[0].short_name || ''),
								(place.address_components[1] && place.address_components[1].short_name || ''),
								(place.address_components[2] && place.address_components[2].short_name || '')
							].join(' ');
						}

						if( address !== '' ){
							infoWindowContent = '<div><strong>' + place.name + '</strong><br>' + address + '</div>';
						}

					}else{

						infoWindowContent = customAddress;
						place.geometry.address = providedAddress;
						place.formatted_address = providedAddress;

					}

					updateMapAndScope( place.geometry.location, infoWindowContent, place, executeCallback );
				};

				var placeMarker = function( location, customAddress, executeCallback ){
					// # Build LatLng
					var latlng = new google.maps.LatLng(location.lat(), location.lng());

					// # Close info window
					infowindow.close();

					// # Build place object
					var place = {};
					place.place_id = null;
					place.geometry = {};
					place.geometry.location = {
						A : location.lat(),
						F : location.lng()
					};
					var infoWindowContent = '';

					// # If customAddress is not provided query API, else just show
					// # provided information
					if( !customAddress ){

						// # Query maps api
						geocoder.geocode( {'location' : latlng}, function( result, status ){

							var address = '';

							if( status === google.maps.GeocoderStatus.OK && result[0]){
								if( result[0].address_components ) {
									address = [
										(result[0].address_components[0] && result[0].address_components[0].short_name || ''),
										(result[0].address_components[1] && result[0].address_components[1].short_name || ''),
										(result[0].address_components[2] && result[0].address_components[2].short_name || '')
									].join(' ');
								}
							}

							if( address !== '' ){
								infoWindowContent = '<div><strong>' + address + '</strong></div>';
							}else{
								address = location.lat() + ', ' + location.lng();
							}

							place.geometry.address = address;
							place.formatted_address = address;

							marker.setPosition( location );
							marker.setVisible( true );

							updateMapAndScope( location, infoWindowContent, place, executeCallback );

						});

					}else{
						infoWindowContent = customAddress;
						place.geometry.address = providedAddress;
						place.formatted_address = providedAddress;

						updateMapAndScope( location, infoWindowContent, place, executeCallback );
					}

				};

				var updateMapAndScope = function( location, infoWindowContent, place, executeCallback ){

					// # Hide marker and info window
					infowindow.close();
					marker.setVisible( false );

					// # Update and show info window if has content
					if( infoWindowContent !== '' ){
						infowindow.setContent( infoWindowContent );
						infowindow.open( map, marker );
					}

					// # Update and show marker
					marker.setPosition( location );
					marker.setVisible( true );

					// # Update scope var (if any)
					$scope.picked = place;

					if (!place.geometry.location.lat || typeof place.geometry.location.lat !== 'function'){
						place.geometry.location.lat = function(){
							return place.geometry.location.A;
						};
					}

					if (!place.geometry.location.lng || typeof place.geometry.location.lng !== 'function'){
						place.geometry.location.lng = function(){
							return place.geometry.location.F;
						};
					}

					if( executeCallback ){
						// # Execute callback function (if any)
						$scope.customCallback( { pickedPlace : place } );
					}

					// # Apply
					$scope.$apply();

				};

				var locationChange = function(){
					// # Reset window
					infowindow.close();
					marker.setVisible( false );

					// # Get place from autocomplete
					var place = autocomplete.getPlace();
					placeAutocompleteMarker( place, null, true );

				};

				// # Create marker for saved position

				// # If providedAddress has a place_id, use placeService to retrieve information
				if( providedAddress.place_id ){
					// # Ajax request to API
					placeService.getDetails({placeId: providedAddress.place_id},function( place, status ){
						if( status === google.maps.places.PlacesServiceStatus.OK ){
							// # Place marker
							placeAutocompleteMarker( place, providedAddress.address, false );
						}
					});
				}else if(providedAddress.hasOwnProperty('geometry')){
					// # Just place a pin
					var latlng = new google.maps.LatLng(providedAddress.geometry.location.A, providedAddress.geometry.location.F);
					geocoder.geocode({'location':latlng}, function( result, status ){
						if( status === google.maps.GeocoderStatus.OK ){
							placeMarker( result[0].geometry.location, providedAddress.address, false );
						}
					});

				}

				// # Autocomplete listener
				google.maps.event.addListener( autocomplete, 'place_changed', locationChange );

				// # Responsive utils listener
				google.maps.event.addDomListener(window, "resize", function() {
					var center = map.getCenter();
					google.maps.event.trigger(map, "resize");
					map.setCenter(center);
				});

				google.maps.event.addListener(map, 'click', function(evt) {
					if(isCurrentlyDraggable){
						placeMarker( evt.latLng, null, true );
					}
				});
			}
		};
	});

}());
