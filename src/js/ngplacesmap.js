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
				responsive: '@?'
			},
			controller: ['$scope', function ($scope) {}],
			template: '<div class="dp-places-map-wrapper"><input type="text" class="dp-places-map-input"><div class="dp-places-map-canvas"></div></div>',
			
			link: function( $scope, element, attrs, controller ){

				var mapOptions = {
					zoom : 5
				};

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
					mapOptions.zoom = $scope.fallback.zoom || 5;
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

				var placeMarker = function( place ){

					// # Get geometry
					if( !place.geometry ){
						alert('Pick a valid location');
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
					// # Place marker
					marker.setPosition( place.geometry.location );
					// # Show marker
					marker.setVisible( true );

					var address = '';
					if( place.address_components ) {
						address = [
							(place.address_components[0] && place.address_components[0].short_name || ''),
							(place.address_components[1] && place.address_components[1].short_name || ''),
							(place.address_components[2] && place.address_components[2].short_name || '')
						].join(' ');
					}

					if( address !== '' ){
						infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address + '</div>');
						infowindow.open( map, marker );
					}

					// # Update scope var (if any)
					$scope.picked = place;

					// # Execute callback function (if any)
					$scope.customCallback( { pickedPlace : place } );

					// # Apply
					$scope.$apply();
				};

				var locationChange = function(){
					// # Reset window
					infowindow.close();
					marker.setVisible( false );

					// # Get place from autocomplete
					var place = autocomplete.getPlace();
					placeMarker( place );

				};

				// # Create marker for saved position

				// # Init place service
				var placeService = new google.maps.places.PlacesService( map );

				// # If providedAddress has a place_id, use placeService to retrieve information
				if( providedAddress.place_id ){
					// # Ajax request to API
					placeService.getDetails({placeId: providedAddress.place_id},function( place, status ){
						if( status === google.maps.places.PlacesServiceStatus.OK ){
							// # Place marker
							placeMarker( place );
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
			}
		};
	});

}());