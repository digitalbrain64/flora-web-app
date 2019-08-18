var map = null; // google map placeholder variable
var markers = new Array(); //array of markers
var usersDataArr = new Array(); //array of active users


// map utils
function initMap(locationObj){
  // options for google map : center is the location where the map is zooming on
  // zoom level may be any value=> bigger value is closer zoom
  var options = {
    zoom: 20,
    center : {lat:32.085300, lng:34.781769}
  }

  // binding google map with html element
  map = new google.maps.Map(document.getElementById('map'), options);

  // adding a marker that takes location and map and shows a default marker on the map
  var marker = new google.maps.Marker({
    position: options.center,
    map:map,
    // adding custom marker icon
    //icon: 'icon-url-or-png'
  });

  // adding infoWIndows above the marker when the marer is clicked
  var infoWindow = new google.maps.InfoWindow({
    content: '<h1>Some Random Location</h1>'
  })

  // adding a listener to fire (show infoWindows) when clicking on marker
  marker.addListener('click', ()=>{
    infoWindow.open(map, marker);
  })
}

$(document).ready(function(){
    fetchDataAsync();
});


// fetching most recent data from NodeJs server application (heroku container)
function fetchDataAsync(){
  let i = 0;
  setInterval(()=>{
    $.ajax({
      url: 'http://dbrainz-flora-server-app.herokuapp.com/getDataFromCache',
      method: 'GET',
      dataType: 'json',
      data:{
        'device_sn': 1
      },
      success: function (response) {
        // loop for the user by device_sn: if found, update the data
        for (i = 0; i < usersDataArr.length; i++) {
            if(usersDataArr[i].userData.device_sn == response.device_sn){
              usersDataArr[i] = {
                userMarker: marker,
                userData: {
                device_status: response.device_status,
                battery_level: response.battery,
                bluetooth_status: response.bt_status,
                gps_status: response.gps_status,
                gsm_status: response.gsm_status,
                pulse:response.pulse,
                sat_num:response.sats
                }
              }
              // no need to loop any further: break
              break;
            }
          }
          // if user not found || usersDataArr is empty -> create new user
          if(i == usersDataArr.length){
            // create new google maps marker
            var marker = new google.maps.Marker({ position: {lat: parseFloat(response.latitude)/100, lng: parseFloat(response.longitude)/100}, map:map});
            
            // push new user data object to usersDataArr
            usersDataArr.push(
              {
                userMarker: marker,
                userData: {
                  device_status: response.device_status,
                  device_id: response.device_sn,
                  battery_level: response.battery,
                  bluetooth_status: response.bt_status,
                  gps_status: response.gps_status,
                  gsm_status: response.gsm_status,
                  pulse:response.pulse,
                  sat_num:response.sats
                }
              }
            )
          }
      updateUserDataAndMarker();
      console.log(response);
    },
    beforeSend: function() {
    },
    complete : function () {
    },
  })
  }, 1000);
}

// dynamically creating the 'user' html block
function updateUserDataAndMarker(){
  if($('#sidebar ul li').length == 0){
      // create all new li elements using usersDataArr
      createUser(usersDataArr);
  }
  else{
      updateUserData($('#sidebar ul li#1'), usersDataArr[0]);
      // search for the correct li in #sidebar>ul
  }
}

function updateUserData(li_element, userData){
  li_element = $("<li>",
  {
    id: userData.userData.device_id,
    'class': "nav-item"
  })
  .append($("<a>",
  {
    'class':"nav-link",
    'href':"#"
  })
  .append($("<div>",
  {
    'class':'flex-row'
  })
  .append($("<img>",
  {
    width:'40px',
    height:'40px',
    'src': "/images/baseline_account_circle_black_48dp.png"
  }))));
  // adding <div> to li
  $(li_element).append($("<div>",
  {
    'class':'info-dropdown'
  }).append($("<p>", { // adding <p> with some text in it
    text:`${Object.entries(userData.userData)}`
  })));
}

function createUser(userParam){

  for(var i = 0; i<userParam.length; i++){

    // li to store all the user data
    var li = $('<li>', {
      id: userParam[i].userData.device_id,
      'class': "nav-item"
    });

    // clickable link on li
    var a = $("<a>",
    {
      'class':"nav-link",
      'href':"#"
    });

    // div : image + username
    var image_div = $("<div>",
    {
      'class':'flex-row'
    });

    // user image
    var user_img = $("<img>",
    {
      width:'40px',
      height:'40px',
      'src': "/images/baseline_account_circle_black_48dp.png"
    });

    // dropdown info div
    var info_dropdown_div = $("<div>",
    {
      'class':'info-dropdown'
    });

    // user info to be in dropdown info div
    var user_info_div = $("<div>",{
      'class':'container'
    });

    // div to store divs with data and icons of battery, gps and more
    var controls_line_div = $('<div',{
      id: 'controls'
    });

    // div store icon and data
    var icon_and_data_div = $('div').append('<img>', {
      'src': '/images/icons/baseline_battery_unknown_black_18dp.png',
      'width':'10px',
      id:'batt_icon'
    });


    /*
    var li = $("<li>",
    {
      id: userParam[i].userData.device_id,
      'class': "nav-item"
    })
    .append($("<a>",
    {
      'class':"nav-link",
      'href':"#"
    })
    .append($("<div>",
    {
      'class':'flex-row'
    })
    .append($("<img>",
    {
      width:'40px',
      height:'40px',
      'src': "/images/baseline_account_circle_black_48dp.png"
    }))));
    // adding <div> to li
    $(li).append($("<div>",
    {
      'class':'info-dropdown'
    }).append($("<div>", { // adding <p> with some text in it
      text:`${Object.entries(userParam[0].userData)}`
    })));

    */

    
    
    // adding <li> to #sidebar>ul.nav
    $("#sidebar ul.nav").append(li);
    $('.nav-item').hide();
    $('.nav-item').slideDown(500);
    
    // adding 'slide down' effect to info-dropdown
    $('.nav-item').on('click', function(){
      $(this).find('.info-dropdown').slideToggle(300);
      map.panTo(userParam[i].userMarker.getPosition()); // center on marker with animation  
    });
  }
}
  
/*
function moveToLocation(lat, lng){
  var center = new google.maps.LatLng(lat, lng);
  // using global variable:
  map.panTo(center);
}

// update markers position on the map
function updateMarkerPosition(markers) {
  for (let i = 0; i < markers.length; i++) {
    var latlng = new google.maps.LatLng(markers[i].position.lat, markers[i].position.lng);
    markers[i].setPosition(latlng);    
  }
}
*/




