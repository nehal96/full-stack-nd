'use strict;'

// Initial data
var cafes = [
  {
    name: "Angelina",
    location: {lat: 48.8650885, lng: 2.3284701},
  },
  {
    name: "Café de la Paix",
    location: {lat: 48.870932, lng: 2.331663}
  },
  {
    name: "Le Select",
    location: {lat: 48.842614, lng: 2.328408},
  },
  {
    name: "Café de Flore",
    location: {lat: 48.8540539, lng: 2.3325598},
  },
  {
    name: "Café Tournon",
    location: {lat: 48.849529, lng: 2.337128},
  },
  {
    name: "Le Peloton Café",
    location: {lat: 48.855532, lng: 2.355934}
  },
  {
    name: "Carette",
    location: {lat: 48.863708, lng: 2.287209}
  },
  {
    name: "Café des Deux Moulins",
    location: {lat: 48.884921, lng: 2.333625}
  }
]

// Initialise global variables
var map,
    icon,
    bounds,
    infoWindow;

// Create Foursquare API URL variables
var baseUrl = 'https://api.foursquare.com/v2/venues/';
var clientId = '?client_id=3KYPCSQNTMV3HYRKX5V2TNNBXPIFNSLBXCSJSGT4A352TQHR';
var clientSecret = '&client_secret=01QBQEED02SFIDDTGEHMEYMSV4QTN1A2CCEXEMWLCM1GPKT5';
var version = '&v=20180101';


// Model for Cafe data
var Cafe = function(data) {
  this.name = data.name;
  this.id = data.id;
  this.location = data.location;
  this.summary = data.summary;
  this.marker = ko.observable();
  this.foursquareId = ko.observable();
  this.address = ko.observable();
  this.url = ko.observable();
  this.facebook = ko.observable();
  this.instagram = ko.observable();
}

var ViewModel = function() {
  var self = this;

  // Set up initial map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.8619068,lng: 2.3208371},
    styles: styles,
    zoom: 14
  });

  // Create up marker icon
  icon = 'img/tea-cup.png'

  // Initialise bounds object
  bounds = new google.maps.LatLngBounds();

  // Initialise info window
  infoWindow = new google.maps.InfoWindow();

  // Initialise observable array for cafes
  this.cafeList = ko.observableArray();
  this.markerList = ko.observableArray();

  // Iterate through the data and add object to obs. array
  cafes.forEach(function(cafeitem) {
    self.cafeList.push(new Cafe(cafeitem));
  });

  // Iterate through each cafe in obs. array and add Foursquare Data
  this.cafeList().forEach(function(cafe) {
    getFoursquareData(cafe);
  })

  // Iterate through the obs. array and add functionality to the map
  this.cafeList().forEach(function(cafe) {
    var marker = new google.maps.Marker({
      position: cafe.location,
      title: cafe.name,
      animation: google.maps.Animation.DROP,
      icon: icon,
      map: map
    });

    // Add the marker to the cafe model
    cafe.marker = marker;

    // Add the marker to the markers obs. array
    self.markerList.push(marker);

    // When the marker is clicked, open info window.
    marker.addListener('click', function() {
      toggleBounce(this);
      populateInfoWindow(cafe, this, infoWindow);
    })

    // Extend the bounds of the map if needed to display the marker
    bounds.extend(cafe.location);
  })

  // Apply the bounds to the map
  map.fitBounds(bounds);

  // Resizes map if browser window is resized
  window.onresize = function() {
    map.fitBounds(bounds);
  }

  // When the show/hide radio buttons are clicked, show/hide markers
  $('#show-hide-buttons :input').change(function() {
    if (this.value == "show") {
      showCafes(self.markerList());
    } else {
      hideCafes(self.markerList());
    }
  })

  // Click functionality - when the cafe item is clicked on the sidebar, the
  // infobox of that particular marker opens
  this.cafeClick = function(cafe) {
    google.maps.event.trigger(cafe.marker, 'click');
  }

  // Initialise a filter observable with an empty string
  this.filter = ko.observable("");

  // Create a computed observable that returns a filtered (or unfiltered) obs.
  // array based on the query typed.
  this.filteredCafes = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      // Show all markers
      showCafes(self.markerList());
      // Return full list
      return self.cafeList();
    } else {
      return ko.utils.arrayFilter(self.cafeList(), function(cafe) {
        if (ko.utils.stringStartsWith(cafe.name.toLowerCase(), filter)) {
          // Return only cafés that match the filter query string as it's
          // being typed
          cafe.marker.setMap(map);
          return ko.utils.stringStartsWith(cafe.name.toLowerCase(), filter);
        } else {
          // Hide all markers that do not match the filter query string.
          cafe.marker.setMap(null);
        }
      })
    }
  })
}

// Adds content to info window for a particular marker
function populateInfoWindow(cafe, marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('');

    // Resets marker info window so it can be clicked again
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    })

    // Content string with name, address, streetview div, and contact info
    // (Website, Facebook, Instagram)
    var content = '<div><h6>' + cafe.name + '</h6></div>' +
                  '<div>' + cafe.address + '</div>' +
                  '<div id="streetview"></div>' +
                  '<div id="cafe-contact">' +
                  '<div><a target="_blank" href="' + cafe.url +
                  '">Website</a></div>' + '</div>'

    if (cafe.facebook) {
      content += '<div><a target="_blank" href="https://www.facebook.com/' +
                 cafe.facebook + '">Facebook</a></div>'
    }

    if (cafe.instagram) {
      content += '<div><a target="_blank" href="https://www.instagram.com/' +
                 cafe.instagram + '">Instagram</a></div>'
    }

    // Initialise StreetView obj
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;

    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        infowindow.setContent(content);
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 10
          }
        }
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('streetview'), panoramaOptions);
      } else {
        infowindow.setContent(content);
        var div = document.createElement('h5');
        var text = document.createTextNode("Sorry, couldn't get StreetView")
        div.append(text)
        document.getElementById('streetview').append(div);
      }
    }

    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

    infowindow.open(map, marker);
  }

  infowindow.addListener('closeclick', function() {
    infowindow.marker = null;
    toggleBounce(marker);
  })
}

function getFoursquareData(cafe) {
  var lat = cafe.location.lat;
  var lng = cafe.location.lng;
  var query = cafe.name;

  var foursquareUrl = baseUrl + 'search' + clientId + clientSecret + version +
                      '&ll=' + lat + ',' + lng + '&query=' + query +
                      '&intent=match';

  // AJAX call to Foursquare API
  $.ajax({
    type: 'GET',
    url: foursquareUrl,
    dataType: 'json',
    success: function(data) {
      var venue = data.response.venues[0];
      cafe.foursquareId = venue.id;
      cafe.address = venue.location.address;
      cafe.url = venue.url;
      cafe.facebook = venue.contact.facebookUsername;
      cafe.instagram = venue.contact.instagram;
    }
  })
  .fail(function() {
    document.getElementById('cafe-contact').text('Could not get Foursquare data.')
  })
}

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

// Iterates through a list of markers and shows them on the map
function showCafes(markerList) {
  markerList.forEach(function(marker) {
    marker.setMap(map);
    bounds.extend(marker.position);
  })

  map.fitBounds(bounds);
}

// Iterates through a list of markers and hides them by setting them to null
function hideCafes(markerList) {
  markerList.forEach(function(marker) {
    marker.setMap(null);
  })
}

// Callback function to run web app
function runApp() {
  ko.applyBindings(new ViewModel());
}
