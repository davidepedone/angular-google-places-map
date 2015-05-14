# angular-google-places-map

Angular directive for Google Places Autocomplete created putting together code from [this package](https://github.com/kuhnza/angular-google-places-autocomplete) and [this sample code](https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete).

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
Without any attribute this plugin is pretty useless, it just shows a map with an input field for search place. Let's add
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
Now when a place is picked from input the result will be available inside this scope var.
Sample page [here](sample/empty.html)
### Init with a place
Add attribute to html element:
```html
<places-map address="result"></places-map>
```
and then inside javascript:
```javascript
angular.module( 'myModule', ['ngPlacesMap'] )
.controller( 'myCtrl', function( $scope ){
	$scope.result = null;
});