var geocoder;
var map;
var marker;
var state;
var town;
var lat;
var lng;

/*The tool tip windows that shows above the marker with the location information*/
var infowindow = new google.maps.InfoWindow();

// function to swap the center map div and the left div when user resizes width under 720px
function resize() {
    if (document.body.clientWidth <= 720) {
        $('#left').insertAfter('#inner-wrap');
        $('#left').css("width", "49%");
        $('#right').css("width", "49%");
        $('#left').css("margin-top", "120px");
        $('#right').css("margin-top", "120px");

        $('#inner-wrap').css("float", "none");
        $('#inner-wrap').css("text-align", "center");

        $('#inner-wrap').css("width", "100%");
        $('#inner-wrap').css("height", "81%");

    } else if (document.body.clientWidth > 720) {
        $('#left').insertBefore('#inner-wrap');
        $('#left').css("width", "");
        $('#right').css("width", "");
        $('#left').css("margin-top", "");
        $('#right').css("margin-top", "");

        $('#inner-wrap').css("float", "");
        $('#inner-wrap').css("width", "");
        $('#inner-wrap').css("height", "");
    }
}

function daynight() {



}

/*initialize function initializes the map and sets the location to United States*/
function initialize() {
    geocoder = new google.maps.Geocoder();
    var unitedstates = new google.maps.LatLng(37.09024, -95.7128);
    var newyork = new google.maps.LatLng(40.6984703, -73.951);
    var mapOptions = {
        zoom: 4,
        center: unitedstates,
        mapTypeId: google.maps.MapTypeId.ROADMAP, //what is maptypeid?
        mapTypeControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
        },
        streetViewControl: false,
        styles: [{ "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "color": "#f7f1df" }] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#d0e3b4" }] }, { "featureType": "landscape.natural.terrain", "elementType": "geometry", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.business", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.medical", "elementType": "geometry", "stylers": [{ "color": "#fbd3da" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#bde6ab" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffe15f" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#efd151" }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "black" }] }, { "featureType": "transit.station.airport", "elementType": "geometry.fill", "stylers": [{ "color": "#cfb2db" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#a2daf2" }] }]

    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
    });

    seekAddress();

    //DISABLE ENTER KEY FROM REFRESHING, BUT THEN ENTER DOES NOT SUBMIT ANYMORE
    $('#search').on('keyup keypress', function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13 && document.getElementById('address').value != '') {
            e.preventDefault();
            //geocodeLatLng();
            return false;
        }
    });
}

//reverse geocode using lat long to find nearest address
function geocodeLatLng() {
    var latlngStr = marker.getPosition().toUrlValue(6);
    var latlng = { lat: Number(latlngStr.split(",")[0]), lng: Number(latlngStr.split(",")[1]) };
    geocoder.geocode({ 'location': latlng }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                var str = results[1].formatted_address; ///
                var split = str.split(","); ///
                var town = split[1]; ///
                var state = split[2].split(" ")[1]; ///

                seekInfo(state, town, latlngStr);
            } else {
                console.log("geocodelatlng fail");
                window.alert('No results found');
            }
        } else {
            console.log("geocodelatlng fail");
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}


//seekAddress function puts the marker at the location which was set in the initialize function above
function seekAddress() {

    var address = document.getElementById('address').value;
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            if (marker) {
                marker.setMap(null);
                if (infowindow) infowindow.close();
            }
            marker = new google.maps.Marker({
                map: map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: results[0].geometry.location
            });
            google.maps.event.addListener(marker, 'dragend', function() {
                geocodePosition(marker.getPosition());
                map.setCenter(marker.getPosition());

            });
            google.maps.event.addListener(marker, 'click', function() {
                if (marker.formatted_address) {
                    infowindow.setContent(marker.formatted_address + "<br>coordinates: " + marker.getPosition().toUrlValue(2));
                } else {
                    infowindow.setContent(address + "<br>coordinates: " + marker.getPosition().toUrlValue(2));
                }
                infowindow.open(map, marker);
            });
            google.maps.event.trigger(marker, 'click');
            geocodeLatLng();
        }
    });

    return false;
}

/*geocodePosition function gets the adress of the marker
then splits it into its components and also shows the address
in the tool tip info window on top of the marker
*/
function geocodePosition(pos) {

    geocoder.geocode({
        latLng: pos
    }, function(responses) {
        console.log(responses);
        var str = responses[0].formatted_address; ///
        var split = str.split(","); ///

        var town = split[1]; ///
        var state = split[2].split(" ")[1]; ///
        var longlat = marker.getPosition().toUrlValue(2);

        if (responses && responses.length > 0) {
            marker.formatted_address = responses[0].formatted_address;
            seekInfo(state, town, longlat);
        } else {
            marker.formatted_address = 'Cannot determine address at this location.';
        }
        infowindow.setContent(marker.formatted_address + "<br>coordinates: " + marker.getPosition().toUrlValue(2));
        infowindow.open(map, marker);
    });
}

/*seekInfo function uses the location obtained from the previous functions and
calls two api's to find the weather and interseting places around that location*/
function seekInfo(state, town, longlat) {
    var lat = longlat.split(",")[0];
    var long = longlat.split(",")[1];

    //get weather from yahoo based on town and state --- could potentially switch to lat and long as well*
    $.get('https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast ' +
        'where woeid in (select woeid from geo.places(1) where text=' + "\"" + town + ", " + state + "\"" + ")&format=json",
        // WHERE text="{$seedLat}, {$seedLong}" 
        function(data) {
            console.log(data);
            var div = document.getElementById('rightinner');

            div.innerHTML = "The temp in " + town + " is currently: " + data.query.results.channel.item.condition.temp + " " +
                data.query.results.channel.units.temperature + "<br><br> The date/time is: <br>" + data.query.results.channel.item.pubDate + "<br><br>" + "Current conditions: " + data.query.results.channel.item.condition.text + "<br><br>" +
                "Humidity: " + data.query.results.channel.atmosphere.humidity + "% <br><br>" +
                "Wind: " + data.query.results.channel.wind.speed + " mph";

            var rainStatus = data.query.results.channel.item.condition.text;
            console.log("Rain status: " + rainStatus);
            if (rainStatus == "Cloudy" || rainStatus == "Mostly Cloudy" || rainStatus == "Partly Cloudy") {

              //  document.getElementById("rainAnimation").className = "weather rain";
              //  $(".weather rain").css("background-color", "rgba(255,255,255,0.1)");
                document.getElementById("x1").className = "cloud x1";
                document.getElementById("x2").className = "cloud x2";
                document.getElementById("x3").className = "cloud x3";
                document.getElementById("x4").className = "cloud x4";
                document.getElementById("x5").className = "cloud x5";

                document.getElementById("rainAnimation").className = "weather rain";

            }
          if(rainStatus == "Mostly Sunny" || rainStatus == "Sunny"){
            document.getElementById("rainAnimation").className = "noRain";
          }

        });

    //get nearby places from wikipedia geonames api based on lat and long
    $.get('http://api.geonames.org/findNearbyWikipediaJSON?lat=' + lat + '&lng=' + long + '&radius=20&username=ivnl',
        function(response) {
            console.log(response);
            var div = document.getElementById('leftinner');
            div.innerHTML = "";
            for (i = 0; i < response.geonames.length; i++) {
                div.innerHTML = div.innerHTML + response.geonames[i].summary + "<br/><br/>";
            }
        });

}

//image search using bing
function imageSearch() {
$(function() {
        var params = {            // Request parameters
            "q": "cats",
            "count": "10",
            "offset": "0",
            "mkt": "en-us",
            "safeSearch": "Moderate",
        };
      
        $.ajax({
            url: "https://bingapis.azure-api.net/api/v5/images/search?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","{b96ce5f4c942427ba353c19b6610c3e5}");
            },
            type: "GET",
            // Request body
            data: "{body}",
        })
        .done(function(data) {
            alert("success");
        })
        .fail(function() {
            alert("error");
        });
    });
}

google.maps.event.addDomListener(window, "load", initialize);
