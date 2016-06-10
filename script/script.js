var geocoder;
var map;
var marker;
var state;
var town;
var lat;
var lng;




/*The tool tip windows that shows above the marker with the location information*/
var infowindow = new google.maps.InfoWindow({
  size: new google.maps.Size(200, 200)
});

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
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
    });

    seekAddress();
}


//prevent default behavior of submit or find alternative, change submit to listener
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
                animation: google.maps.Animation.BOUNCE,
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
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
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
        function(data) {
             console.log(data);
             var div = document.getElementById('right');
             div.innerHTML = div.innerHTML + "<br/> The temp in " + town + " is: " + data.query.results.channel.item.condition.temp + " " +
                 data.query.results.channel.units.temperature + " the time is: " + data.query.results.channel.item.pubDate;

                var rainStatus =   data.query.results.channel.item.condition.text;
                console.log("Rain status: " + rainStatus);
                if(rainStatus == "Mostly Sunny" || rainStatus == "Sunny" || rainStatus == "Cloudy" || rainStatus == "Mostly Cloudy"){

                document.getElementById("rainAnimation").className = "weather rain";;
                $(".weather rain").css("background-color","#ffffff");
                $(".weather rain").css("opacity","0.3");

                }

        });

    //get nearby places from wikipedia geonames api based on lat and long
    $.get('http://api.geonames.org/findNearbyWikipediaJSON?lat=' + lat + '&lng=' + long + '&radius=20&username=ivnl',
        function(response) {
            console.log(response);
            var div = document.getElementById('left');
            div.innerHTML = div.innerHTML + "<br/><br/>" + response.geonames[0].summary;

        });
}

google.maps.event.addDomListener(window, "load", initialize);
