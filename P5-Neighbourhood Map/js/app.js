'use strict;'

// Initial data
var cafes = [
  {name: "Angelina", location: {lat: 48.8650885, lng: 2.3284701}},
  {name: "Café de la Paix", location: {lat: 48.870932, lng: 2.331663}},
  {name: "Le Select", location: {lat: 48.842614, lng: 2.328408}}
]

// Initialise global variables
var map;

// Model for Cafe data
var Cafe = function(data) {
    this.name = data.name;
    this.lat = data.location.lat;
    this.lng = data.location.lng;
}

// The main VM function
var ViewModel = function() {
    var self = this;

    // Set up initial map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 48.8619068,lng: 2.3208371},
        styles: styles,
        zoom: 15
    });

    // Initialise observable array for lists of cafes and markers
    this.cafeList = ko.observableArray();
    this.markerList = ko.observableArray();

    // Iterate through the data and add to the obs. array
    cafes.forEach(function(cafeitem) {
        self.cafeList.push(new Cafe(cafeitem));
    });

    // Initialise info window
    this.infoWindow = new google.maps.InfoWindow();

    // Initialise bounds object
    this.bounds = new google.maps.LatLngBounds();

    // Iterate through obs. array and add functionality on map
    for (i = 0; i < this.cafeList().length; i++) {
        // Add each marker
        this.marker = new google.maps.Marker({
            position: {lat: self.cafeList()[i].lat, lng: self.cafeList()[i].lng},
            title: self.cafeList()[i].name,
            animation: google.maps.Animation.DROP,
            map: map
        });

        // Add marker into array of markers
        self.markerList.push(this.marker);

        // When marker is clicked, open info window
        this.marker.addListener('click', function() {
            populateInfoWindow(this, self.infoWindow)
        });

        // Extend the bounds of the map if needed to display the marker
        self.bounds.extend(self.markerList()[i].position);
    }

    // Apply the bounds to the map
    map.fitBounds(this.bounds);

    //
    $('#show-hide-buttons :input').change(function() {
      if (this.value == "show") {
        showCafes(self.markerList());
      } else {
        hideCafes(self.markerList());
      }
    })
  }

// Adds content to info window for a particular marker
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>')
        infowindow.open(map, marker);
    }
    infowindow.addListener('closeclick', function() {
        infowindow.setMarker = null;
    })
}

// Iterates through a list of markers and shows them on the map
function showCafes(markerList) {
  var bounds = new google.maps.LatLngBounds();

  for (i = 0; i < markerList.length; i++) {
    markerList[i].setMap(map);
    bounds.extend(markerList[i].position);
  }
  map.fitBounds(bounds);;
}

// Iterates through a list of markers and hides them by setting them to null
function hideCafes(markerList) {
  for (i = 0; i < markerList.length; i++) {
    markerList[i].setMap(null);
  }
}

/*
function openNav() {
    document.getElementById('menu').style.width = "20%";
};

function closeNav() {
    document.getElementById('menu').style.width = "0";
};
*/

// Callback function to run web app
function runApp() {
    ko.applyBindings(new ViewModel());
};
