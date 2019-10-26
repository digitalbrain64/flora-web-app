$(document).ready(function(){
    
    var contact_number = localStorage.getItem('contact_num');
    var email = localStorage.getItem('email');
    $("#number").text(contact_number);
    $('#btn_verify').attr('disabled', true);
    $('#send_sms_button').attr('disabled', true);
    $('#login_submit').attr('disabled', true)
    $('#verify_code_button').attr('disabled', true)

$("#pwd,#email").on('input',()=>{
    if($('#error-msg-pass-change').css("display") == "block"){
        $('#error-msg-pass-change').fadeOut(200);
        $("#email,#pwd").val('');
    }
    if($("#email").val()!="" && $("#pwd").val()!=""){
        $('#login_submit').attr('disabled', false)
    }
    else {
        $('#login_submit').attr('disabled', true)
    }
})

$('#login_submit').on('click', function(){
    $.ajax({url: `https://dbrainz-flora-server-app.herokuapp.com/getAppUserAccount?u=${$('#email').val()}&p=${$('#pwd').val()}`,
    dataType: "json",
    method: 'GET',
    success: function(result){
      if(result[0].status == "error"){
        $('#error-msg-pass-change').fadeIn(300);
        $('#error-msg-pass-change > p').text("incorrect email/username or password");
        
        // set local storage data 
      }
      else{
          localStorage.setItem('user_id', result[0].user_id);
          window.location.replace('dashboard');
      }
    },
    beforeSend: function(){
      // show loading gif
      $('#loading_icon').css("display", "inline-block");
    },
    complete: function(){
      // hide loading gif
      $('#loading_icon').css("display", "none");
    }
  });
  
})

$("#credentials").on('input',()=>{
    if($('#error-msg-pass-change').css("display") == "block"){
        $('#error-msg-pass-change').css("display", "none");
        $("#credentials").val('');
    }
    if($("#credentials").val()!=""){
        $('#send_sms_button').attr('disabled', false)
    }
    else {
        $('#send_sms_button').attr('disabled', true);
    }
})

$('#digit_table input').on('input',function(){
    if($(this).val() != ''){
        $(this).parent().next('td').find('.form-control').focus();
    }
})

$('#digit_table input').on('keydown',function(e){
    var key = event.keyCode || event.charCode
    if((key == 8 || key == 46) && $(this).val() == ''){
        $(this).parent().prev('td').find('.form-control').focus();
    }
})

$('#digit_table').on('input',function(){
    $('#error-msg-pass-change').css("display", "none");
    //$('#error-msg-pass-change').text('hello');
    var empty = $(this).find("input").filter(function() {
        return this.value === "";
    });
    if(empty.length) {
        $('#verify_code_button').attr('disabled', true)
    }
    else{
        $('#verify_code_button').attr('disabled', false)
    }
})



$('#verify_code_button').on('click',function(){
    var restoreCode = '';
    $('#digit_table input').each(function() {
        restoreCode+=($(this).val())
    });
    console.log(restoreCode);
    
    $.ajax({url: `https://dbrainz-flora-server-app.herokuapp.com/checkRestoreCode?e=${email}&restoreCode=${restoreCode}`,
      dataType: "json",
      method: 'GET',
      success: function(result){
        // create the weather card according to user location
        if(result[0].status == "OK"){
            window.location.replace('pass-change-step-3');
        }
        else{
            $('#error-msg-pass-change').css("display", "block");
            $('#error-msg-pass-change > p').text("incorrect verification code");
        }
      },
      beforeSend: function(){
        // show loading gif
        $('#loading_icon').css("display", "inline-block");
      },
      complete: function(){
        // hide loading gif
        $('#loading_icon').css("display", "none");
      }
    });
    
    
})

$('#send_sms_button').on('click', ()=>{
    var credentials = $("#credentials").val();
    //alert(credentials);

    $.ajax({url: `https://dbrainz-flora-server-app.herokuapp.com/sendRestoreCode?u=${credentials}`,
      dataType: "json",
      method: 'GET',
      success: function(result){
        // create the weather card according to user location
        if(result[0].status == "OK"){
            var number = `+${result[0].phone_number}`;
            var rgx = /(^[+0-9]{4})([0-9]{5})([0-9]+)/g;
            var match = rgx.exec(number);
            localStorage.setItem('contact_num',`${match[1]}-${match[2]}****`);
            localStorage.setItem('email', result[0].email);
            contact_number = result[0].phone_number;
            window.location.replace('pass-change-step-2');
            
            
        }
        else{
            $('#error-msg-pass-change').css("display", "block");
            $('#error-msg-pass-change > p').text(result[0].message);
        }
      },
      beforeSend: function(){
        // show loading gif
        $('#loading_icon').css("display", "inline-block");
      },
      complete: function(){
        // hide loading gif
        $('#loading_icon').css("display", "none");
      }
    });
    
    
})


$('#newPass input').on('input', function(){
    if($(this).val() == $('#newPassRepeat input').val()){
        $('#btn_verify').attr('disabled', false);
    }
    else{
        $('#btn_verify').attr('disabled', true);
    }
    $(this).animate({width: '250px'});
    $('#newPassRepeat input').animate({width: '250px'});
    $('#pass_format_list').delay(300).fadeIn(300);
    var patt_upper = new RegExp('[A-Z]{1,}');
    var patt_num = new RegExp('[0-9]{1,}');
    var patt_8_chars = new RegExp('[a-zA-Z0-9]{8,}');
    var patt_no_symbols = new RegExp('[\\W_-]+');
    if(patt_no_symbols.test($(this).val())){
        $('#pass_format_list ul').children().eq(0).css( "color", "red" );
        $('#btn_verify').attr('disabled', true);
    }
    else{
        $('#pass_format_list ul').children().eq(0).css( "color", "green" );
    }

    if(patt_upper.test($(this).val())){
        
        $('#pass_format_list ul').children().eq(1).css( "color", "green" );
    }
    else{
        $('#pass_format_list ul').children().eq(1).css( "color", "red" );
        $('#btn_verify').attr('disabled', true);
    }

    if(patt_num.test($(this).val())){
        
        $('#pass_format_list ul').children().eq(2).css( "color", "green" );
    }
    else{
        $('#pass_format_list ul').children().eq(2).css( "color", "red" );
        $('#btn_verify').attr('disabled', true);
    }

    if(patt_8_chars.test($(this).val())){
        
        
        $('#pass_format_list ul').children().eq(3).css( "color", "green" );
    }
    else{
        $('#pass_format_list ul').children().eq(3).css( "color", "red" );
        $('#btn_verify').attr('disabled', true);
    }

})

$('#newPassRepeat input').on('input', function(){
    var patt_8_chars = new RegExp('[a-zA-Z0-9]{8,}');
    var patt_no_symbols = new RegExp('[\\W_-]+');
    var patt = new RegExp('[A-Z]{1,}[a-z]{1,}[0-9]{1,}');
    if($(this).val() == $('#newPass input').val()){
        if(patt.test($(this).val())&&patt_8_chars.test($(this).val()) && !patt_no_symbols.test($(this).val())){
            $('#btn_verify').attr('disabled', false);
        }
        else{
            $('#btn_verify').attr('disabled', true);
        }
    }
    else{
        $('#btn_verify').attr('disabled', true);
    }
})

$('#btn_verify').on('click',function(){
    var newPass = $('#newPass input').val();
    console.log(email);
    console.log(newPass);
    
    
    $.ajax({url: `https://dbrainz-flora-server-app.herokuapp.com/passChange?e=${email}&newPass=${newPass}`,
      dataType: "json",
      method: 'GET',
      success: function(result){
        if(result[0].status != "error"){
            window.location.replace('login');
        }
      },
      beforeSend: function(){
        // show loading gif
        $('#loading_icon').css("display", "inline-block");
      },
      complete: function(){
        // hide loading gif
        $('#loading_icon').css("display", "none");
      }
    });

})


})