var input = {

  //zmieniamy wartośc pobraną z inputa:
  set_input : function(obj,property,obj_this){
    if( jQuery.isNumeric( $(obj_this).val() )){
      //console.log('tak to jest numer');
      window[obj][property] = parseInt( $(obj_this).val() );
    }
    else{
      //console.log('nie to nie jest numer');
      window[obj][property] = $(obj_this).val();
    }
    canvas.update();
    pointers.draw();
  },

  //zmieniamy wartość za pomocą buttona:
  set_button : function(obj,property,obj_this){
    if( $(obj_this).html() == '+' ){
      window[obj][property] =  parseInt(window[obj][property]) + 1;
    }
    else{
      window[obj][property] =  parseInt(window[obj][property]) - 1;
    }

    $('input.input_base[property=' + property + ']').val( window[obj][property] );

    canvas.update();
    pointers.draw();
  },

  //funkcja do zmiany wartości w przełącznikach true / false
  set_switch : function(obj,property,obj_this){
    if( $(obj_this).attr('value') == 'true' ){
      $(obj_this).attr('value','false');
      $(obj_this).removeClass('switch-on');
      $(obj_this).addClass('switch-off');
      window[obj][property] = false;
    }
    else{
      $(obj_this).attr('value','true');
      $(obj_this).removeClass('switch-off');
      $(obj_this).addClass('switch-on');
      window[obj][property] = true;
    }
    canvas.update();
    pointers.draw();
  },

  //wybieranie określonego selecta
  set_select : function(obj,property,obj_this){
    window[obj][property] = $(obj_this).val();
    canvas.update();
    pointers.draw();
  }

}
