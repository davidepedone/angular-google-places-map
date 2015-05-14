# angular-google-places-map

Angular directive for Google Places Autocomplete created putting together code from [this package](https://github.com/kuhnza/angular-google-places-autocomplete) and [this sample code](https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete).

This directive provides the autocomplete function from Google Places Autocomplete library and shows picked location on a map.
## How to use
Install agular-google-places-map as a bower package, with:
```bash
bower install --save angular-google-places-map
```
and add libraries to your page:
```html
<!-- Google Places API -->
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places"></script>
<script src="../dist/js/ngplacesmap.min.js"></script>
<!-- Style (optional) -->
<link rel="stylesheet" href="../dist/ngplacesmap.min.css">
```
inject dependency inside your app:
```javascript
angular.module('myModule',['ngPlacesMap']);
```
finally place element inside your page:
```html
<places-map></places-map>
```
Without any attribute this plugin is pretty useless, it just shows a map (centered in Italy) with an input field for search place. Let's add
some fancy feature.
### Scope var
Add attribute to html element:
```html
<places-map picked="result"></places-map>
```
and then inside javascript:
```javascript
angular.module( 'myModule', ['ngPlacesMap'] )
.controller( 'myCtrl', function( $scope ){
	$scope.result = null;
});
```
Now when a place is picked from input the result will be available inside this scope var.<br/>
Full example page [here](sample/empty.html)
### Init with a place
Add attribute to html element:
```html
<places-map address="initAddress"></places-map>
```
and then inside javascript:
```javascript
angular.module( 'myModule', ['ngPlacesMap'] )
.controller( 'myCtrl', function( $scope ){
	$scope.initAddress = {
		place_id : "ChIJ31GTk67GhkcRPw6Nl8LeRdQ",
		geometry : {
			location : {
				A : 45.464679,
				F : 9.190770100000009
			}
		},
		zoom : 7 // optional, default value: 15
	};
});
```
The map will be initialized with a marker in the given location.<br/>
Full example page [here](sample/init.html)
### Init with a place and a fallback
Add attributes to html element:
```html
<places-map address="initAddress" fallback="fallbackAddress"></places-map>
```
and then inside javascript:
```javascript
angular.module( 'myModule', ['ngPlacesMap'] )
.controller( 'myCtrl', function( $scope ){

	/*
	 * We are trying to init map with an empty address object,
	 * for example something goes wrong retrieving stored address
	 */
	$scope.initAddress = {};

	$scope.fallbackAddress = {
		lat: 46.1355055,
		lng: 9.566074500000013,
		zoom: 10 // optional, default value: 5
	}
});
```
In this example map will be initialized without marker but centered in the fallback location.<br/>
Full example page [here](sample/fallback.html)
### Custom callback function
Add attribute to html element:
```html
<places-map custom-callback="customCallbackFunction( pickedPlace )"></places-map>
```
and then inside javascript:
```javascript
angular.module('sample', ['ngPlacesMap'])
.controller('MainCtrl', function ( $scope ) {  
	$scope.customCallbackFunction = function( pickedPlace ){
		console.log( pickedPlace );
	}
});
```
Now every time that a place is picked, our custom callback function will be invoked.<br/>
Full example page [here](sample/callback.html)