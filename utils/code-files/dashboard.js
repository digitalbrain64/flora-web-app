var map = null; // google map placeholder variable
var markers = new Array(); //array of markers
var sidebar_open_on_map_ready = false;
var tabs_width = 0;

$(document).ready(function(){
  createAppUserSection();
  
  createDevices();

  $(document).on('click', '.control_tab_btn', function(){
    // what you want to happen when mouseover and mouseout 
    // occurs on elements that match '.dosomething'
    var control_data_obj = $(this).data("linkToTab");
    console.log(control_data_obj);
    
    createTabAndTabContent(control_data_obj);
  });
 
  // event on side-bar toggle button
  $('#navbar-toggle').on('click', function(){
    if($('#sidebar')[0].style.width == '20%'){
      $(".user_icon").animate({width: "0%"}, 100);
      $(".user_icon img").animate({width: "0%"}, 100);
      $(".device_info_div").animate({width : "100%"},100);
      $(".location_icon_div").fadeOut(50);
      $(this).find("img").addClass("rotated");
      $(this).find("img").removeClass("rotated-back");
      $('.tab-content').animate({width: '89.9%'}, 200,"linear");
      $('#sidebar').animate({width : '10%'}, 180,"linear");
      $('#sidebar .expand-block').removeClass('in');
      $('#sidebar .expand-block').attr('aria-expanded', 'false');
    }
    else{
      $(".user_icon").animate({width: "20%"}, 100);
      $(".user_icon img").animate({width: "100%"}, 100);
      $(".device_info_div").animate({width : "80%"},100);
      $('.tab-content').animate({width: '79.9%'}, 180,"linear");
      $('#sidebar').animate({width : '20%'}, 200,"linear");
      $(this).find("img").removeClass("rotated");
      $(this).find("img").addClass("rotated-back");
      $('#sidebar .username').fadeIn(50)
      $('#sidebar li').find('.located').find('.location_icon_div').css('display', 'block');
    }
  });


  // reload button click event
  $('#reload_btn button').on('click',function(){
    fetchUpdates();
  })


  /* smooth scrolling event on tabs scroll errows */
  $(".scroller-right button").click(function (){
    $('#tabs').animate({
        scrollLeft: '+=150px'
    }, 200);
  });

  $(".scroller-left button").click(function (){
    $('#tabs').animate({
        scrollLeft: '-=150px'
    }, 200);
  });

  // event on 'close-tab' button on each tab
  $(document).on('mouseover', '.close_tab',function(){
    $(this).animate({'opacity': '1'}, 150);
  })
  $(document).on('mouseleave', '.close_tab',function(){
    $(this).animate({'opacity': '0.2'}, 150);
  })

  setInterval(function(){
    fetchUpdates();
  }, 4000);

});

// map utils
function initMap(locationObj){
  // options for google map : center is the location where the map is zooming on
  // zoom level may be any value=> bigger value is closer zoom
  
  if(markers.length != 0){
    var options = {
      zoom: 17
    }
    // binding google map with html element
    map = new google.maps.Map(document.getElementById('map'), options);

    // adding a marker that takes location and map and shows a default marker on the map
    var marker = new google.maps.Marker({
      position: markers[0].marker.getPosition().center,
      map:map,
    // adding custom marker icon
    //icon: 'icon-url-or-png'
  });
  }
  else{
    var options = {
      zoom: 4,
      center : {lat: 32.057690, lng: 34.804087}
    }
    // binding google map with html element
    map = new google.maps.Map(document.getElementById('map'), options);

    
  }
  
  map.addListener('tilesloaded', function () {
    if(!sidebar_open_on_map_ready){
      $('#navbar-toggle').click();
      // $('.tab-content').animate({width: '79.9%'}, 400,"linear");
      // $('#sidebar').animate({width: '20%'},403,"linear");
      sidebar_open_on_map_ready = true;
    }
    
  })
}

// function that creates an app-user section (right-top-block)
// includes username, last visit time and button with dropdown menu 
let createAppUserSection = ()=>{
  // pre-stored user_id in localStorage
  var user_id = localStorage.getItem('user_id');

  // get user data from API
  $.ajax({
    url: `https://dbrainz-flora-server-app.herokuapp.com/getAppUserAccount?user_id=${user_id}`,
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      $('.app_user_info_dropdown_content .app_user_basic_info h5').text(`${response[0].first_name} ${response[0].last_name}`);
      $('.app_user_info_dropdown_content .app_user_basic_info p').text(`${response[0].user_email}`);
      $('#account_info').data('linkToTab', {
        tab_type : "app_user_info",
        tab_id : `${response[0].user_id}`,
        tab_name : `Account Info - ${response[0].first_name} ${response[0].last_name}`,
        tab_icon : 'baseline_account_box_black_24dp.png',
        tab_template : 'app_user_info_template'
      })
      
      localStorage.setItem('app-user', response[0].user_id);
    },
    beforeSend: function() {
      var preload_gif = $('<img>',{
        id: "preload_gif",
        src : "/images/icons/pre-load.gif",
        width : "50px",
        display: "none"
      })
      // hide children elements
      $("#user_li").children().hide(); 
      // display 'loading gif'
      $('#user_li').append(preload_gif);
      $('#user_li').fadeIn(100);
    },
    complete : function () {
      // hide 'loading-gif'
      $("#user_li #preload_gif").fadeOut(800);
      // remove 'loading-gif'
      $("#user_li #preload_gif").remove();
      // display element children with data recieved from the server
      $("#user_li").children().fadeIn(500);
    },
})
}

// creating the devices and append them in the #sidebar
let createDevices = ()=>{
  // current app user
  var app_user = localStorage.getItem('app-user');
  // ajax get all devices that are registered to the app user
  $.ajax({
    url: `https://dbrainz-flora-server-app.herokuapp.com/getAppUserDevices?user_id=${app_user}`,
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      response.forEach(element => {
          createDeviceItem(element);
      });
    },
    beforeSend: function() {
      var preload_gif = $('<img>',{
        id: "preload_gif",
        src : "/images/icons/pre-load.gif",
        width : "100%",
        display: "none"
      })
      $("#sidebar").children().hide(); 
      $('#sidebar').append(preload_gif);
      $('#sidebar').fadeIn(400)
    },
    complete : function () {
      $("#sidebar #preload_gif").fadeOut(800);
      $("#sidebar #preload_gif").remove();
      $("#sidebar").children().fadeIn(500);
    },
  }) 


  setInterval(function(){
    $.ajax({
      url: `https://dbrainz-flora-server-app.herokuapp.com/getAppUserDevices?user_id=${app_user}`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        response.forEach(element => {
          if($(`#sidebar ul #list_item_${element.device_sn}`).length == 0){
            createDeviceItem(element);
          }
        });
      },
      beforeSend: function() {
      },
      complete : function () {
      },
    }) 
  },3000)
  
}

let createDeviceItem = (device_obj)=>{


  // li to store all the content of device info in side bar
  var li = $('<li>', {
    class: "card",
    id: `list_item_${device_obj.device_sn}`
  });



  // pass data to item for later user as indexer of this device
  $(li).data("device_id", `${device_obj.device_sn}`);
  $(li).data("focused", "false");



  // upper block info is the user icon + user name + some controls
  var card_body_link = $('<a>',{
    class: "stretched-link"
  });

  // make the upper block clickable
  $(card_body_link).attr('href', '#');


  // building the upper block
  // bootstrap card-body as main class of the upper block
  var upper_block_icon_and_info = $('<div>',{
    class:"card-body"
  });



  // append upper block info div to upper block
  $(card_body_link).append(upper_block_icon_and_info);


  // div to store the device user icon
  var device_icon_box = $('<div>',{
    style : "padding:0px;",
    class : "user_icon"
  });

  // user icon (img)
  var device_icon = $('<img>',{
    src : "/images/icons/baseline_account_box_black_48dp.png",
    width: "5px"
  });

  // append the icon to the div
  $(device_icon_box).append(device_icon);

  /*  */


  // div to store the info about the device (top brief info)
  var device_name_box = $('<div>',{
    class : 'device_info_div',
  });

  var device_name = $('<div>',{
    class: 'side_bar_name_div'
  });

  var name = $('<p>',{
    text: `${device_obj.first_name} ${device_obj.last_name}`
  })

  var power_icon = $('<img>',{
    class : 'side_bar_power_switch',
    src: '/images/icons/switch_off.png',
    width : '25px',
  })

  $(device_name).append(name);
  $(device_name).append(power_icon);

  // append names to div
  $(device_name_box).append(device_name);
  

  var device_locaion_icon_box = $('<div>',{
    class : 'location_icon_div',
  })

  var device_location_icon = $('<img>',{
    class : "location_icon",
    src : "/images/icons/baseline_my_location_black_36dp.png",
    width : "20px"
  });

  // append location icon to div

  $(device_locaion_icon_box).append(device_location_icon);

  // button to expand for more info
  var device_expand_btn_box = $('<div>',{
  });

  var expand_btn_icon = $('<img>',{
    src : "/images/icons/baseline_more_horiz_black_18dp.png",
    style : "padding : 0px; margin:0px; width: 20px;"
  })

  var expand_btn = $('<button>',{
    class: 'btn-expand btn btn-default',
    'data-toggle':"collapse",
    'data-target':`#device_${device_obj.device_sn}_expanded_info_div`
  })

  // expand event on 'click' action
  $(expand_btn).on('click', function(){
    if($('#sidebar')[0].style.width != '20%'){
      $('#navbar-toggle').click();
    }
  })

  // expanded device information
  var device_expanded_div = $('<div>',{
    id:`device_${device_obj.device_sn}_expanded_info_div`,
    class : 'collapse expand-block',
  });

  
  $(device_expanded_div).append(createExpandBlock(device_obj));

  $(card_body_link).on('click',function(){
    if($('#sidebar')[0].style.width != "10%"){
      $('#sidebar .location_icon_div').css('display', 'none');
      $(device_locaion_icon_box).css('display', 'block');
      $('#sidebar li').css("background-color", "white");
      $(this).parent().css("background-color", "#ffb44a");
      $('#sidebar li').find('.located').removeClass('located');
      $(this).addClass('located');
      focusOnLocation(this);
    }
    else{
      $('#sidebar li').css("background-color", "white");
      $(this).parent().css("background-color", "#ffb44a");
      $('#sidebar li').find('.located').removeClass('located');
      $(this).addClass('located');
      focusOnLocation(this);
    }
    
    //map.panTo(userParam[i].userMarker.getPosition());
  })

  $(expand_btn).append(expand_btn_icon);
  $(device_expand_btn_box).append(expand_btn);
  $(device_name_box).append(device_locaion_icon_box)
  $(upper_block_icon_and_info).append(device_icon_box);
  $(upper_block_icon_and_info).append(device_name_box);
  
  //$(device_upper_info_block).append(device_active_location_icon_div);

  $(li).append(card_body_link);
  $(li).append(device_expand_btn_box);
  $(li).append(device_expanded_div);

  fetchUpdates();
  $("#sidebar ul").append(li);
  //createMarkers();
}


let createMarkers = ()=>{
  $(function() {
    $("#sidebar .stretched-link").each(function() {
      var locationObj = $(this).data("locationObj");
      //console.log(locationObj.device_sn);
      
      var options = {
        zoom: 20,
        center : {lat:parseFloat(locationObj.latitude), lng:parseFloat(locationObj.longitude)}
      }
    
      var marker = new google.maps.Marker({
        position: options.center,
        map:map,
        // adding custom marker icon
        //icon: 'icon-url-or-png'
      });

      console.log($(this).find(".side_bar_name_div p").text());
      

      addInfoWindow(marker, $(this).find(".side_bar_name_div p").text());

      markers.push(
        {
          device_id : locationObj.device_sn,
          marker: marker
        }
      );
    });
  });
}

function addInfoWindow(marker, content) {
  var infoWindow = new google.maps.InfoWindow({
      content: content
  });

  google.maps.event.addListener(marker, 'click', function () {
      infoWindow.open(map, marker);
  });
}


let focusOnLocation = (cardElement)=>{
  var locationObj = $(cardElement).data("locationObj");
  console.log(locationObj.latitude);
  
  
  for(var i = 0; i<markers.length; i++){
    if(markers[i].device_sn == locationObj.device_sn){
      var position = markers[i].marker.getPosition();
      map.setZoom(17); // Back to default zoom
      map.panTo(position); // Pan map to that position
      break;
    }
  }

}



let createExpandBlock = (device_obj)=>{
  // div to store all the expanded-block elements
  var expand_block_inner_div = $('<div>',{
    style : 'margin-top: 8px; padding:10px;'
  });

  // creating controls div - status of every module of the GST device
  var controls_inner_div = $('<div>',{
  })
  var contorls_div = $('<div>',{
    class: 'controls_div'
  });

  var bat_control = $('<div>',{class:"bat_div"});
  var sat_control = $('<div>',{class:"sat_div"});
  var bt_control = $('<div>',{class:"bt_div"});
  var gsm_control = $('<div>',{class:"gsm_div"});
  var gps_control = $('<div>',{class:"gps_div"});
  
  var bat_icon_div = $('<div>',{class: 'bat_icon_div control-off'});
  
  var sat_icon_div = $('<div>',{class:'sat_icon_div control-off'});

  var gsm_icon_div = $('<div>',{class: 'gsm_icon_div control-off'});

  var bt_icon_div = $('<div>',{class: 'bt_icon_div control-off'});

  var gps_icon_div = $('<div>',{class: 'gps_icon_div control-off'});

  // icons
  var bat_icon = $('<img>',{
    width: "22px",
    src: '/images/icons/baseline_battery_unknown_black_18dp.png'
  });
  var gps_icon = $('<img>',{
    width: "22px",
    src: '/images/icons/baseline_room_black_18dp.png'
  });
  var gsm_icon = $('<img>',{
    width: "22px",
    src : '/images/icons/baseline_signal_cellular_off_black_18dp.png'
  });
  var bt_icon = $('<img>',{
    width: "22px",
    src: '/images/icons/baseline_bluetooth_disabled_black_18dp.png'
  });
  var sat_icon = $('<img>',{
    width: "22px",
    src : '/images/icons/baseline_satellite_black_18dp.png'
  });

  // append div icon + icon 
  $(bat_icon_div).append(bat_icon);
  $(gps_icon_div).append(gps_icon);
  $(gsm_icon_div).append(gsm_icon);
  $(bt_icon_div).append(bt_icon);
  $(sat_icon_div).append(sat_icon);

  // text
  var bat_text = $('<h4>',{
    class : 'control-text',
    text : 'N/A'
  });

  var gps_text = $('<h4>',{
    class : 'control-text',
    html : 'GPS<br/><b>OFF</b>'
  });

  var gsm_text = $('<h4>',{
    class : 'control-text',
    html : 'Network<br/><b>OFF</b>'
  });

  var bt_text = $('<h4>',{
    class : 'control-text',
    html : 'Bluetooth<br/><b>OFF</b>'
  });

  var sat_text = $('<h4>',{
    class : 'control-text',
    html : 'Satellites<br/><b>0</b>'
  });

  // append div icon+icon and text to control
  $(bat_control).append(bat_icon_div);
  $(bat_control).append(bat_text);

  $(sat_control).append(sat_icon_div);
  $(sat_control).append(sat_text);

  $(gsm_control).append(gsm_icon_div);
  $(gsm_control).append(gsm_text);

  $(gps_control).append(gps_icon_div);
  $(gps_control).append(gps_text);

  $(bt_control).append(bt_icon_div);
  $(bt_control).append(bt_text);

  /*////////////////////////////////////////////////////////////// */

  // device info controls
  var control_btn = $('<a>',{
    class : 'control_tab_btn btn btn-default',
    text : 'view device information'
  });

  /* button - device info */
  $(control_btn).data("linkToTab", {
    tab_type : "device_info",
    tab_id : `${device_obj.device_sn}`,
    tab_name : `Device Info - ${device_obj.first_name} ${device_obj.last_name}`,
    tab_icon : 'baseline_info_black_36dp.png',
    tab_template : 'device_info_template'
  });


  $(contorls_div).append(bat_control);
  $(contorls_div).append(gsm_control);
  $(contorls_div).append(gps_control);
  $(contorls_div).append(bt_control);
  $(contorls_div).append(sat_control);

  $(controls_inner_div).append(control_btn);
  $(controls_inner_div).append(contorls_div);





  ///////////////////////////////////////////////////////////////////


  var avg_speed_control_div = $('<div>',{
    class : 'avg_speed_div'
  });

  var avg_speed_icon_div = $('<div>',{
    class : 'control-off'
  })

  var avg_speed_icon = $('<img>',{
    src:'/images/icons/baseline_directions_walk_black_18dp.png',
    width : '25px'
  });

  var avg_speed_text = $('<h4>',{
    class : 'control-text',
    style:"font-size:10px; margin-top:14px; color:black; margin-right:1px",
    text: '0 km/h'
  });

  $(avg_speed_icon_div).append(avg_speed_icon);
  $(avg_speed_control_div).append(avg_speed_icon_div);
  $(avg_speed_control_div).append(avg_speed_text);


  // var control_pulse_div = $('<div>',{
  //   style : 'margin-top: 8px; padding:10px;'
  // });

  // pulse

  var pulse_control_div = $('<div>',{
    class: 'pulse_div'
  });

  var pulse_icon_div = $('<div>',{
    class: 'pulse_icon_div',
    style : 'width: 40px;'
  });

  var pulse_icon = $('<img>',{
    src : '/images/icons/heart-icon.png',
    width : '40px'
  })

  var pulse_text = $('<h4>',{
    class : 'pulse-control-text',
    style:"font-size:14px",
    text: 'N/A'
  });

  var control_pulse_btn = $('<a>',{
    class : 'control_tab_btn btn btn-default',
    text: 'view statistics',
  })


  $(control_pulse_btn).data("linkToTab", {
    tab_type : "device_stats",
    tab_id : `${device_obj.device_sn}`,
    tab_name : `Statistics - ${device_obj.first_name} ${device_obj.last_name}`,
    tab_icon : 'baseline_assignment_black_36dp.png',
    tab_template : 'device_statistic_template'
  });

  $(pulse_icon_div).append(pulse_icon);


  $(pulse_control_div).append(pulse_icon_div);
  $(pulse_control_div).append(pulse_text);


  var pulse_and_speed_div = $("<div>",{
    class : "pulse_and_speed_div",
  });

  $(pulse_and_speed_div).append(pulse_control_div);
  $(pulse_and_speed_div).append(avg_speed_control_div);

  var sos_control_div = $("<div>",{
    class :"sos_div"
  });

  var sos_icon_div = $('<div>',{
    class: 'sos_icon_div',
    style : 'width: 40px;'
  });

  var sos_icon = $('<img>',{
    src : '/images/icons/sos_icon.png',
    width : '40px'
  })

  $(sos_icon_div).append(sos_icon);


  $(sos_control_div).append(sos_icon_div);



  $(expand_block_inner_div).append(controls_inner_div);

  $(expand_block_inner_div).append(control_pulse_btn);

  $(expand_block_inner_div).append(pulse_and_speed_div);

  $(expand_block_inner_div).append(sos_control_div);



  // // distance
  // var control_distance_div = $('<div>',{
  //   class : 'distance_div'
  // });

  // var distance_icon_div = $('<div>',{
  //   class : 'control-off'
  // })

  // var distance_icon = $('<img>',{
  //   src:'/images/icons/baseline_map_black_18dp.png',
  //   width : '22px'
  // });

  // var distance_text = $('<h4>',{
  //   class : 'control-text',
  //   text: '0.00'
  // });

  // $(distance_icon_div).append(distance_icon);
  // $(control_distance_div).append(distance_icon_div);
  // $(control_distance_div).append(distance_text);

  // var history_btn = $('<a>',{
  //   class : 'control_tab_btn btn btn-default',
  //   text : 'view history'
  // })

  // $(history_btn).data("linkToTab", {
  //   tab_type : "device_history",
  //   tab_id : `${device_obj.device_sn}`,
  //   tab_name : `Location History - ${device_obj.first_name} ${device_obj.last_name}`,
  //   tab_icon : 'baseline_history_black_36dp.png',
  //   tab_template : 'device_history_template'
  // });
  return expand_block_inner_div;
}



let createTabAndTabContent = (tab_data_obj)=>{
  var tab_type = `${tab_data_obj.tab_type}`;
  var tab_id = `${tab_data_obj.tab_id}`;
  var tab_link_id = `${tab_data_obj.tab_id}_tab`
  var tab_content_id = `${tab_data_obj.tab_id}_content`
  var tab_icon = `images/icons/${tab_data_obj.tab_icon}`
  var tab_temp = tab_data_obj.tab_template;
  
  // check if tab exist already
  // if not - create account info tab
  if($("#tabs").find(`#${tab_type}_${tab_id}_tab`).length == 0){
    // remove all .active from other tabs and tab contents
    // this way our new tab will be created and immediately shown
    var active_tab = $("#tabs").find('.active')[0];
    $(active_tab).removeClass("active");

    var active_tab_content = $(".tab-content").find('.active')[0];
    $(active_tab_content).removeClass("active in");

    // CREATE THE TAB:
    // li to store tab context
    var tab = $('<li>',{
      id : `${tab_type}_${tab_id}_tab`,
      'class':'active'// adding .active as this is now the tab in focus
    });

    var tab_left_icon = $('<img>',{
      src : tab_icon,
      width : '18px'
    })

    var tab_link = $("<a>",{
      id : `${tab_link_id}`,
      href:`#${tab_type}_${tab_id}_tab_content`,
    });
    $(tab_link).attr("data-toggle", "tab");
    
    // add "close tab" button to li (tab)
    var tab_close_btn = $('<button>',{
      class : "close_tab",
    });

    // add "close tab" icon 
    var tab_close_icon = $('<img>',{src : "/images/icons/icon-x-circle-512.png",});


    var tab_div = $('<div>',{});

    $(tab_close_btn).append(tab_close_icon);
    $(tab_div).append(tab_left_icon);
    $(tab_div).append(` ${tab_data_obj.tab_name} `);
    $(tab_div).append(tab_close_btn);
  

    // append link to tab (li)
    $(tab_link).append(tab_div);

    $(tab).append(tab_link);
    
    // add newly created tab to #tabs
    $("#tabs").append(tab);

    // click event to close the 'account info' tab
    $(tab_close_btn).on('click', function(){
      $(tab_content).removeClass('active in');
      $(tab).removeClass('active')
      $('.tab-content').find(':first').addClass('active in');
      $('#tabs').find(':first').addClass('active in');
      $(tab_content).remove();
      $(tab).remove();
      // on deleting tabs, check if nav arrows are needed
      showHideTabsNavArrows();
    })
    // on creating new tab, check if nav arrows are needed
    showHideTabsNavArrows();


    //CREATE THE TAB CONTENT:

    // creating tab div
    var tab_content = $("<div>",{
      id: `${tab_type}_${tab_id}_tab_content`,
      class : "tab-pane fade active in", // adding .active as this tab content is now in focus and shown to the user
    })
    // getting the correct html template
    $(tab_content).load( `/${tab_temp}.html`);
    $('.tab-content').append(tab_content);
    switch (tab_type) {
      case "device_info":
        fetchDeviceUserData(tab_id)
        break;

      case "device_stats":        
        stat_fetchDeviceStats(tab_id);
        break;

      case "device_history":
        fetchDeviceHistory(tab_id);
        break;

      case "app_user_info":
        fetchDeviceHistory(tab_id);
        break;
    }
  }
  else{
    // remove all .active from other tabs and tab contents
    // this way our new tab will be created and immediately shown
    var active_tab = $("#tabs").find('.active')[0];
    $(active_tab).removeClass("active");

    var active_tab_content = $(".tab-content").find('.active')[0];
    $(active_tab_content).removeClass("active in");

    $("#tabs").find(`#${tab_type}_${tab_id}_tab`).addClass("active");
    $(".tab-content").find(`#${tab_type}_${tab_id}_tab_content`).addClass("active in");
  }
}

let stat_fetchDeviceStats = (tab_id)=>{
  $.ajax({
    url :  `https://dbrainz-flora-server-app.herokuapp.com/getHighestLowestPulse?device_sn=${tab_id}`,
    method: 'GET',
      dataType: 'json',
      success: function (response) {
        stat_setDeviceUserInfo(tab_id,response[0]);
      },
      beforeSend: function() {

      },
      complete : function () {

      },
  })

  setInterval(function(){
    $.ajax({
      url: `https://dbrainz-flora-server-app.herokuapp.com/getDeviceStatistic?device_sn=${tab_id}`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        stat_updateDeviceStat(tab_id,response[0]);
      },
      beforeSend: function() {
      },
      complete : function () {
      },
    }) 
  }, 5000)
}

let stat_setDeviceUserInfo = (tab_id, devUserBasicObj)=>{
  var device_stat_info = $(`#device_stats_${tab_id}_tab_content .device_user_info`);
  $(`#device_stats_${tab_id}_tab_content`).find(".dev-user-name").text(`${devUserBasicObj.first_name} ${devUserBasicObj.last_name}`);
  $(`#device_stats_${tab_id}_tab_content`).find(".dev-user-age").text(`${devUserBasicObj.user_age}`);
  $(`#device_stats_${tab_id}_tab_content`).find(".dev-user-gender").text(`${devUserBasicObj.gender}`);
  $(`#device_stats_${tab_id}_tab_content`).find(".dev-user-weight").text(`${devUserBasicObj.weight}kg`);

  $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .high_p .table tbody tr").children().remove();
  $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .low_p .table tbody tr").children().remove();


  if(devUserBasicObj.highest_pulse){
    var high_tr = $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .high_p .table tbody tr");
    stat_createMaxMinPulseBlock(devUserBasicObj.highest_pulse, high_tr, devUserBasicObj.first_name);
  }
  else{
    $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .high_p").fadeOut(100);
  }
  if( (devUserBasicObj.highest_pulse.pulse == devUserBasicObj.lowest_pulse.pulse) || (!devUserBasicObj.lowest_pulse || !devUserBasicObj.highest_pulse) ){
    $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .low_p").fadeOut(100);
    
  }
  else{
    var low_tr = $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .low_p .table tbody tr");
    stat_createMaxMinPulseBlock(devUserBasicObj.lowest_pulse, low_tr, devUserBasicObj.first_name);
  }

  // running setInterval for infinite updates every 10 seconds
  setInterval( function(){
    $.ajax({
      url :  `https://dbrainz-flora-server-app.herokuapp.com/getHighestLowestPulse?device_sn=${tab_id}`,
      method: 'GET',
        dataType: 'json',
        success: function (response) {
          stat_updateMaxMinPulseBlock(response[0],tab_id);
        },
        beforeSend: function() {
  
        },
        complete : function () {
  
        },
    })
  },10000)
}

let stat_updateMaxMinPulseBlock = (pulseObj,tab_id)=>{
  var tr_low = $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .low_p .table tbody tr");
  var tr_high = $(`#device_stats_${tab_id}_tab_content`).find(".low-high-pulse .high_p .table tbody tr")
  var low_pulse_date = new Date(Date.parse(`${pulseObj.lowest_pulse.time_log}`));
  low_pulse_date.setHours(low_pulse_date.getHours()+3);

  var high_pulse_date = new Date(Date.parse(`${pulseObj.highest_pulse.time_log}`));
  high_pulse_date.setHours(high_pulse_date.getHours()+3);


  $(tr_high).find(".stat_pulse_text").text(`${pulseObj.highest_pulse.pulse} Bpm`);
  $(tr_high).find(".stat_pulse_date_text").text(`${high_pulse_date.toUTCString()}`);
  $(tr_high).find(".stat_pulse_map").attr("src", `https://maps.googleapis.com/maps/api/staticmap?center=${pulseObj.highest_pulse.latitude},${pulseObj.highest_pulse.longitude}&zoom=14&size=700x200&maptype=roadmap&markers=color:red%7Clabel:${pulseObj.first_name[0]}%7C${pulseObj.highest_pulse.latitude},${pulseObj.highest_pulse.longitude}&key=AIzaSyCOGS-yYwAKpMVTGPWkMPyzWfUW-2n6fPw`)

  $(tr_low).find(".stat_pulse_text").text(`${pulseObj.lowest_pulse.pulse} Bpm`);
  $(tr_low).find(".stat_pulse_date_text").text(`${low_pulse_date.toUTCString()}`);
  $(tr_low).find(".stat_pulse_map").attr("src", `https://maps.googleapis.com/maps/api/staticmap?center=${pulseObj.lowest_pulse.latitude},${pulseObj.lowest_pulse.longitude}&zoom=14&size=700x200&maptype=roadmap&markers=color:red%7Clabel:${pulseObj.first_name[0]}%7C${pulseObj.lowest_pulse.latitude},${pulseObj.lowest_pulse.longitude}&key=AIzaSyCOGS-yYwAKpMVTGPWkMPyzWfUW-2n6fPw`)
}

let stat_createMaxMinPulseBlock = (pulseObj, tr, userName)=>{
  $.ajax({
      url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${parseFloat(pulseObj.latitude)},${parseFloat(pulseObj.longitude)}&key=AIzaSyCOGS-yYwAKpMVTGPWkMPyzWfUW-2n6fPw`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        var pulse_div = $("<div>",{

        })
        var pulse_text = $("<h5>",{
          class:"stat_pulse_text",
          text: `${pulseObj.pulse} Bpm`
        })
    
        var pulse_date_div = $("<div>",{
        })
    
        var pulse_date = new Date(Date.parse(`${pulseObj.time_log}`));
        pulse_date.setHours(pulse_date.getHours()+3);
    
        var pulse_date_text = $("<h5>",{
          class : "stat_pulse_date_text",
          text : `${pulse_date.toUTCString()}`
        })
    
        var pulse_address_div = $("<div>",{
        })
    
        var pulse_address_text = $("<h5>",{
        })
        $(pulse_address_text).text(`${response.results[0].formatted_address}`);

        var map_div = $("<div>",{
          class:"stat-map-div"
        })
        var map_img = $("<img>",{
          class : "stat_pulse_map",
          src: `https://maps.googleapis.com/maps/api/staticmap?center=${pulseObj.latitude},${pulseObj.longitude}&zoom=14&size=700x200&maptype=roadmap&markers=color:red%7Clabel:${userName[0]}%7C${pulseObj.latitude},${pulseObj.longitude}&key=AIzaSyCOGS-yYwAKpMVTGPWkMPyzWfUW-2n6fPw`,
          width: "300px"
        })
  
        
        $(pulse_div).append(pulse_text);
        $(pulse_date_div).append(pulse_date_text);
        $(pulse_address_div).append(pulse_address_text);
        $(map_div).append(map_img)

        var td_pulse = $("<td>");
        var td_date = $("<td>");
        var td_address = $("<td>");
        var td_map = $("<td>");

        td_pulse.append(pulse_div);
        td_date.append(pulse_date_div);
        td_address.append(pulse_address_div);
        td_map.append(map_div);

        $(tr).append(td_pulse);
        $(tr).append(td_date);
        $(tr).append(td_address);
        $(tr).append(td_map);
      },
      beforeSend: function() {
      },
      complete : function () {
      },
    })
}

let fetchDeviceUserData= (tab_id)=>{
   // tab content: first name, last name, contancts and other information
   $.ajax({
    url: `http://dbrainz-flora-server-app.herokuapp.com/getDeviceUserFull?device_id=${tab_id}`,
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      appendDeviceUserData(tab_id,response[0]);
    },
    beforeSend: function() {
    },
    complete : function () {
    },
  }) 
}


let stat_updateDeviceStat = ( tab_id, statObj)=>{
  var device_stat_section = $(`#device_stats_${tab_id}_tab_content`);
  
  // set update date:
  if( statObj.stats_start_time != "0000-00-00 00:00:00" ){
    // hide placeholder and show the stat data
    $(device_stat_section).find(".stat-data-placeholder").fadeOut(100)
    $(device_stat_section).find(".stat-data").fadeIn(500);

    // set and display the start time of the statistics
    var timeLog = new Date(Date.parse(`${statObj.stats_start_time}`));
    console.log(statObj.avg_pulse_daily);
    timeLog.setHours(timeLog.getHours()+3);
    $(device_stat_section).find(".stat-date").text(timeLog.toUTCString());

    // average pulse per day
    $(device_stat_section).find(".pulse-per-day-text").text(`${statObj.avg_pulse_daily} bpm`);

    // time from start of statistic
    $(device_stat_section).find('.stat-time').text(`${statObj.minutes_since_stats_start} minutes`);

    // total distance
    $(device_stat_section).find(`.distance-stats .info-text-off`).text(`${statObj.total_distance} km`);


    // avg speed
    $(device_stat_section).find(`.speed-stats .info-text-off`).text(`${statObj.avg_speed} km/h`);

    // step count
    $(device_stat_section).find(`.steps-stats .info-text-off`).text(`${statObj.steps_count} steps`);

    // step count
    $(device_stat_section).find(`.pulse-stats .info-text-off`).text(`${statObj.avg_pulse} bpm`);


    // step count
    $(device_stat_section).find(`.calories-stats .info-text-off`).text(`${statObj.calories_burn} kcal`);

  }
  else{
    $(device_stat_section).find(".stat-data").fadeOut(50);
    $(device_stat_section).find(".stat-data-placeholder").fadeIn(500)
  }
}

let appendDeviceUserData = ( tab_id, device_user_obj)=>{
  
  var device_user_info_section = $(`#device_info_${tab_id}_tab_content .device_user_info`);

  // set device user contact number/s
  // at least one phone number
  var p_number_1 = $('<p>',{
    text : `tel: ${device_user_obj.phone_number_1?device_user_obj.phone_number_1:'---'}`
  });

  var p_number_2 = $('<p>',{
    text : `tel: ${device_user_obj.phone_number_2?device_user_obj.phone_number_2:'---'}`
  });
  $(device_user_info_section).find('.li_content_contact_numbers').append(p_number_1);
  $(device_user_info_section).find('.li_content_contact_numbers').append(p_number_2);

  // set device user general information: name, address
  $(device_user_info_section).find('.li_content_name p').text(`${device_user_obj.first_name} ${device_user_obj.last_name}`);

  $(device_user_info_section).find('.li_content_address p').text(`${device_user_obj.address}`);

  
  // set device user contacts
  if(device_user_obj.user_phone_book!= "no contacts"){
    for(var i = 0; i<device_user_obj.user_phone_book.length ; i++){
      var contact_tr = $('<tr>');
      var name_td = $('<td>',{
        text : `${device_user_obj.user_phone_book[i].contact_first_name} ${device_user_obj.user_phone_book[i].contact_last_name}`
      });
      var relation_td = $('<td>',{
        text : device_user_obj.user_phone_book[i].relation
      });
      var address_td = $('<td>',{
        text : device_user_obj.user_phone_book[i].contact_address
      });
      
      var phone_num_td_1 = $('<td>',{
        text : device_user_obj.user_phone_book[i].contact_phone_number_1?device_user_obj.user_phone_book[i].contact_phone_number_1:'-------'
      });
      var phone_num_td_2 = $('<td>',{
        text : device_user_obj.user_phone_book[i].contact_phone_number_2?device_user_obj.user_phone_book[i].contact_phone_number_2:'-------'
      });

      $(contact_tr).append(name_td);
      $(contact_tr).append(relation_td);
      $(contact_tr).append(address_td);
      $(contact_tr).append(phone_num_td_1);
      $(contact_tr).append(phone_num_td_2);
      $(device_user_info_section).find('.user_contacts_table tbody').append(contact_tr);
    }
    
  }
  else{
    $(device_user_info_section).find('.user_contacts_table tbody').text("user has no contacts");
  }

}


let showHideTabsNavArrows = ()=>{
  $('#tabs').children().each(function(){
    tabs_width+=$(this).outerWidth();
  });

  if(tabs_width > $('#tabs').width()){
    $('#scroll-me button').fadeTo(200,1);
    $('#scroll-me button').attr('disabled', false);
  }
  else{
    $('#scroll-me button').fadeTo(200,0)
    $('#scroll-me button').attr('disabled', true);
  }
  tabs_width = 0;
}

let fetchUpdates = ()=>{  
  // loop update all devices
  $("#sidebar ul").children().each(function(){

    // the li we want to update
    var device_item = $(this);

    // device_id stored inside of the li meta-data
    var device_id = $(this).data("device_id");
    

    // fetch the newewst data about the device: device_id
    $.ajax({
      url: `https://dbrainz-flora-server-app.herokuapp.com/getDeviceUpdates?device_sn=${device_id}`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        updateDevice(device_item, response[0]);
      },
      beforeSend: function() {
        
      },
      complete : function () {
        
      },
    }) 
  });

  //createMarkers();
}

let updateDevice = (li, device_update)=>{
  // updating the expand-block
  // checking control conditions:
  //console.log(device_update);

  var card_body_link = $(li).find('.stretched-link');

  $(card_body_link).data("locationObj", {
    device_sn:device_update.device_sn,
    latitude:device_update.latitude,
    longitude:device_update.longitude
  });

  var data_from_card = $(li).find('.stretched-link').data("locationObj");

  var i = 0;
  // loop to find the marker inside markers array
  for(i = 0; i<markers.length; i++){
    // if marker is found - update the marker to new position of the marker
    if(markers[i].device_sn == device_update.device_sn){
      var position = new google.maps.LatLng(parseFloat(data_from_card.latitude), parseFloat(data_from_card.longitude));
    
      markers[i].marker.setPosition(position);
      break;
    }
  }
  // if i == markers array length - marker not found or markers array is empty
  // add new marker to array
  if( i == markers.length){
    var position = new google.maps.LatLng(parseFloat(data_from_card.latitude), parseFloat(data_from_card.longitude));
    var marker = new google.maps.Marker({
      position: position,
      map:map,
      // adding custom marker icon
      //icon: 'icon-url-or-png'
    });
    addInfoWindow(marker, $(li).find(".side_bar_name_div p").text())

      markers.push({
          device_sn: device_update.device_sn,
          marker : marker
      });
    }

  // control on the left sidebar for the specific device
  var bat_div = $(li).find('.bat_div');
  var bat_icon_div = $(bat_div).find('.bat_icon_div');
  var bat_icon = $(bat_icon_div).find('img');
  var bat_text = $(bat_div).find('.control-text');
  var gps_div = $(li).find('.gps_div');
  var gps_icon_div = $(gps_div).find('.gps_icon_div');
  var gps_icon = $(gps_icon_div).find('img');
  var gps_text = $(gps_div).find('.control-text');
  var gsm_div = $(li).find('.gsm_div');
  var gsm_icon_div = $(gsm_div).find('.gsm_icon_div');
  var gsm_icon = $(gsm_icon_div).find('img');
  var gsm_text = $(gsm_div).find('.control-text');
  var bt_div = $(li).find('.bt_div');
  var bt_icon_div = $(bt_div).find('.bt_icon_div');
  var bt_icon = $(bt_icon_div).find('img');
  var bt_text = $(bt_div).find('.control-text');
  var sat_div = $(li).find('.sat_div');
  var sat_icon_div = $(sat_div).find('.sat_icon_div');
  var sat_icon = $(sat_icon_div).find('img');
  var sat_text = $(sat_div).find('.control-text');
  

  var timeLog = new Date(Date.parse(`${device_update.log_time}`));
  timeLog.setHours(timeLog.getHours()+3);

  $(`#device_info_${device_update.device_sn}_tab_content`).find(".last_update_time p small").text(` ${timeLog.toUTCString()}`);


  if(device_update.device_status == 0){
    $(li).data("focused", "false");
    $(li).find('.sos_div').css("animation","none");
    $(li).find('.pulse_icon_div').css("animation","none");
    $(li).find('.pulse-control-text').text("N/A");
    $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_off_on_switcher img").attr("src", "/images/icons/switch_off.png");
    $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_switcher_text p").text("device turned OFF");

    $(li).find('.side_bar_power_switch').attr('src', '/images/icons/switch_off.png');

    $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_info_sos_status").css('background-color', "")
    $(bat_icon).attr('src', '/images/icons/baseline_battery_unknown_black_18dp.png');
    $(bat_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
    $(bat_text).text('N/A');

    $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_unknown_black_18dp.png');
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div').switchClass('control-on', 'control-off', 300, 'easeInOutQuad');
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control h4').text(`N/A`);

    $(gps_icon).attr('src', '/images/icons/baseline_room_black_18dp.png');
    $(gps_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
    $(gps_text).html("GPS<br/><b>OFF</b>");

    // for tab content
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control td div img').attr('src', '/images/icons/baseline_room_black_18dp.png');
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control td div').switchClass( "control-on", "control-off", 300, "easeInOutQuad");
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control h4').text('OFF');

    $(gsm_icon).attr('src', '/images/icons/baseline_signal_cellular_off_black_18dp.png');
    $(gsm_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
    $(gsm_text).html("Network<br/><b>OFF</b>");

    // for tab content
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control td div img').attr('src', '/images/icons/baseline_signal_cellular_off_black_18dp.png');
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control td div').switchClass( "control-on", "control-off", 300, "easeInOutQuad");
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control h4').text('OFF');

    $(bt_icon).attr('src', '/images/icons/baseline_bluetooth_disabled_black_18dp.png');
    $(bt_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
    $(bt_text).html('Bluetooth<br/><b>OFF</b>')

    // for tab content
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control td div').switchClass('control-on', 'control-off', 300, 'easeInOutQuad');
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control td div img').attr('src', '/images/icons/baseline_bluetooth_disabled_black_18dp.png');
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control h4').text('OFF');

    $(sat_icon).attr('src', '/images/icons/baseline_satellite_black_18dp.png');
    $(sat_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
    $(sat_text).html('Satellites<br/><b>N/A</b>')

    // for tab content
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control td div').switchClass('control-on', 'control-off', 300, 'easeInOutQuad');
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
    $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control h4').text(`N/A`);


  }
  else{
    // pulse in sidebar
    $(li).find('.pulse_icon_div').css("animation","heartbeat 1s infinite");
    $(li).find('.pulse-control-text').text(`${device_update.pulse} bpm`);

    // speed in sidebar
    $(li).find('.avg_speed_div .control-text').text(`${device_update.avg_speed} km/h`);


    $.ajax({
      url:`https://maps.googleapis.com/maps/api/geocode/json?latlng=${parseFloat(device_update.latitude)},${parseFloat(device_update.longitude)}&key=AIzaSyCOGS-yYwAKpMVTGPWkMPyzWfUW-2n6fPw`,
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_map img").attr("src", `https://maps.googleapis.com/maps/api/staticmap?center=${device_update.latitude},${device_update.longitude}&zoom=13&size=700x450&maptype=roadmap&markers=color:red%7Clabel:${$(`#device_info_${device_update.device_sn}_tab_content`).find(".li_content_name p").text()[0]}%7C${device_update.latitude},${device_update.longitude}&key=AIzaSyCOGS-yYwAKpMVTGPWkMPyzWfUW-2n6fPw`)
        $(`#device_info_${device_update.device_sn}_tab_content`).find(".lat_lng_info h4").text(`${response.results.formatted_address}`)
      },
      beforeSend: function() {
      },
      complete : function () {
      },
    })

    $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_off_on_switcher img").attr("src", "/images/icons/switch_on.png");
    $(".device_switcher_text p").text("device turned ON")
    $(li).find('.side_bar_power_switch').attr('src', '/images/icons/switch_on.png');
    if(device_update.sos_status == 1){
      if($(li).data("focused") == "false"){
        focusOnLocation($(li).find(".stretched-link")[0]);
        $(li).find(".stretched-link")[0].click();
        $(li).find(".btn-expand")[0].click();
        
        $(li).data("focused", "true");
        var active_tab = $("#tabs").find('.active')[0];
        $(active_tab).removeClass("active");

        var active_tab_content = $(".tab-content").find('.active')[0];
        $(active_tab_content).removeClass("active in");

        $('#tabs').find(':first').addClass('active in');
        $('.tab-content').find(':first').addClass('active in');
      }
      
      $(li).find('.sos_div').css("animation","sosAnimation 1s infinite");
      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_info_sos_status").css("background-color", "red");
      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_sos_button_text p").text("EMERGENCY");
    }
    else{
      $(li).find('.sos_div').css("animation","none");
      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_info_sos_status").css("background-color", "#9b9b9b");
      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_sos_button_text p").text("emergancy button is idle");
    }
    if(device_update.battery >= 0 && device_update.battery<=100){
      $(bat_icon_div).switchClass( "control-off", "control-on", 300, "easeInOutQuad" );
      console.log(`device_info_${device_update.device_sn}_tab_content`);
      
      // for device info tab content tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div').switchClass('control-off', 'control-on', 300, 'easeInOutQuad');
  
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div h4').switchClass('info-text-off', 'info-text-on', 300, 'easeInOutQuad');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control h4').text(`${device_update.battery}%`);
  
      $(bat_text).text(`${device_update.battery}%`);
      // conditions - battery control
      // battery 0 to 29
      if( (device_update.battery <= 20 ||  device_update.battery >= 20 ) && device_update.battery < 30){
        $(bat_icon).attr('src', '/images/icons/baseline_battery_20_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_20_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td h4').css('color', 'red');
      }
  
      // battery 30 to 49
      if( device_update.battery >= 30 && device_update.battery < 50 ){
        $(bat_icon).attr('src', '/images/icons/baseline_battery_30_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_30_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td h4').css('color', 'orange');
  
      }
      // battery 50 to 59
      if( device_update.battery >= 50 && device_update.battery < 60 ){
        $(bat_icon).attr('src', '/images/icons/baseline_battery_50_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_50_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td h4').css('color', 'green');
  
      }
      // battery 60 to 79
      if( device_update.battery >= 60 && device_update.battery < 80 ){
        $(bat_icon).attr('src', '/images/icons/baseline_battery_60_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_60_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td h4').css('color', 'green');
  
  
      }
      // battery 80 to 89
      if( device_update.battery >= 80 && device_update.battery < 90 ){
        $(bat_icon).attr('src', '/images/icons/baseline_battery_80_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_80_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td h4').css('color', 'green');
  
  
      }
      // battery 90 to 99
      if( device_update.battery >= 90 && device_update.battery < 100 ){
        $(bat_icon).attr('src', '/images/icons/baseline_battery_90_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_90_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td h4').css('color', 'green');
  
  
      }
      // battery 90 to 100
      if( device_update.battery >= 100 ){
        $(bat_icon).attr('src', '/images/icons/baseline_battery_full_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_full_black_18dp.png');
        $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td h4').css('color', 'green');
  
  
        
      }
    }
    else{
      $(bat_icon).attr('src', '/images/icons/baseline_battery_unknown_black_18dp.png');
      $(bat_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
      $(bat_text).text('error');
  
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div img').attr('src', '/images/icons/baseline_battery_unknown_black_18dp.png');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control td div').switchClass('control-on', 'control-off', 300, 'easeInOutQuad');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.battery_control h4').text(`N/A`);
  
  
    }
    
    // conditions - gps
    if(device_update.gps_status == 1){
      $(gps_icon_div).switchClass( "control-off", "control-on", 300, "easeInOutQuad" );
      $(gps_text).html("GPS<br/><b>ON</b>");
      $(gps_icon).attr('src', '/images/icons/baseline_room_black_18dp.png');
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control td div img').attr('src', '/images/icons/baseline_room_black_18dp.png');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control td div').switchClass( "control-off", "control-on", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control h4').switchClass( "info-text-off", "info-text-on", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control h4').text('ON');
  
  
    }
    else{
      $(gps_icon).attr('src', '/images/icons/baseline_room_black_18dp.png');
      $(gps_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
      $(gps_text).html("GPS<br/><b>OFF</b>");
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control td div img').attr('src', '/images/icons/baseline_room_black_18dp.png');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control td div').switchClass( "control-on", "control-off", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gps_control h4').text('OFF');
    }
  
    // conditions - gsm
    if(device_update.gsm_status == 1){
      $(gsm_icon_div).switchClass( "control-off", "control-on", 300, "easeInOutQuad" );
      $(gsm_text).html("Network<br/><b>ON</b>");
      $(gsm_icon).attr('src', '/images/icons/baseline_signal_cellular_4_bar_black_18dp.png');
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control td div img').attr('src', '/images/icons/baseline_signal_cellular_4_bar_black_18dp.png');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control td div').switchClass( "control-off", "control-on", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control h4').switchClass( "info-text-off", "info-text-on", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control h4').text('ON');

      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_info_call_status").css("background-color", "green");
      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_calls_text p").text("cellular calls available");

    }
    else{
      $(gsm_icon).attr('src', '/images/icons/baseline_signal_cellular_off_black_18dp.png');
      $(gsm_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
      $(gsm_text).html("Network<br/><b>OFF</b>");
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control td div img').attr('src', '/images/icons/baseline_signal_cellular_off_black_18dp.png');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control td div').switchClass( "control-on", "control-off", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.gsm_control h4').text('OFF');
    
      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_info_call_status").css("background-color", "#9b9b9b");
      $(`#device_info_${device_update.device_sn}_tab_content`).find(".device_calls_text p").text("cellular calls unavailable");
    }
  
    // conditions - gsm
    if(device_update.bt_status == 1){
      $(bt_icon_div).switchClass( "control-off", "control-on", 300, "easeInOutQuad" );
      $(bt_text).html("Bluetooth<br/><b>ON</b>");
      $(bt_icon).attr('src', '/images/icons/baseline_bluetooth_black_18dp.png');
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control td div').switchClass('control-off', 'control-on', 300, 'easeInOutQuad');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control td div img').attr('src', '/images/icons/baseline_bluetooth_black_18dp.png');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control h4').switchClass( "info-text-off", "info-text-on", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control h4').text('ON');
    }
    else{
      $(bt_icon).attr('src', '/images/icons/baseline_bluetooth_disabled_black_18dp.png');
      $(bt_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
      $(bt_text).html('Bluetooth<br/><b>OFF</b>')
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control td div').switchClass('control-on', 'control-off', 300, 'easeInOutQuad');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control td div img').attr('src', '/images/icons/baseline_bluetooth_disabled_black_18dp.png');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.bluetooth_control h4').text('OFF');
    }

  
    // conditions - gsm
    if(device_update.sats > 0){
      $(sat_icon_div).switchClass( "control-off", "control-on", 300, "easeInOutQuad" );
      $(sat_text).html(`Satellites<br/><b>${device_update.sats}</b>`);
      $(sat_icon).attr('src', '/images/icons/baseline_satellite_black_18dp.png');
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control td div').switchClass('control-off', 'control-on', 300, 'easeInOutQuad');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control h4').switchClass( "info-text-off", "info-text-on", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control h4').text(`${device_update.sats}`);
    }
    else{
      $(sat_icon).attr('src', '/images/icons/baseline_satellite_black_18dp.png');
      $(sat_icon_div).switchClass( "control-on", "control-off", 300, "easeInOutQuad" );
      $(sat_text).html('Satellites<br/><b>0</b>')
  
      // for tab content
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control td div').switchClass('control-on', 'control-off', 300, 'easeInOutQuad');
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control h4').switchClass( "info-text-on", "info-text-off", 300, "easeInOutQuad");
      $(`#device_info_${device_update.device_sn}_tab_content`).find('.sats_control h4').text(`N/A`);
    }
  }

  

 





}





