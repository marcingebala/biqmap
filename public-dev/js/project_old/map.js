var map = {

  data : null,

  //pobieramy dane z bazy
  get : function( hash ){
    this.h
    var th = this;
    $.post( basic_url + "/map/"+hash, {
      _method: 'GET',
      _token: csrf_token,
    })
    .done(function( response ) {
     // console.log( response.map );
      th.data = JSON.parse( response.map );
    });
  },

  //pobieramy dane z pliku
  parse : function(){
 
    canvas.height_canvas = this.data[0][0];
    canvas.width_canvas = this.data[0][1];
    canvas.width_org = this.data[0][1];

    //console.log(canvas.height_canvas,canvas.width_canvas,canvas.width_org);

    canvas.facor = canvas.width_canvas / canvas.height_canvas;

    pointers.padding_x = this.data[0][2];
    pointers.padding_y = this.data[0][3];
    pointers.translate_modulo = this.data[0][4];
    pointers.size_pointer = this.data[0][5];
    pointers.main_kind = this.data[0][6];

    category.parse();

    canvas.update();
    this.draw();
    this.set_input();
  }, 

  //ustawiamy inpyt w divie
  set_input : function(){

    $('#pointer_box input[property=width_canvas]').val( canvas.width_canvas );
    $('#pointer_box input[property=height_canvas]').val( canvas.height_canvas );
    $('#pointer_box input[property=padding_x]').val( pointers.padding_x );
    $('#pointer_box input[property=padding_y]').val( pointers.padding_y );
    $('#pointer_box input[property=size_pointer]').val( pointers.size_pointer );

    //ustawiamy translate modulo
    if(pointers.translate_modulo ){
      $('#pointer_box  div[property=translate_modulo]').removeClass('switch-off');
      $('#pointer_box  div[property=translate_modulo]').addClass('switch-on');
    }else{
      $('#pointer_box  div[property=translate_modulo]').removeClass('switch-on');
      $('#pointer_box  div[property=translate_modulo]').addClass('switch-off');
    }

    //wybieramy odpowiednią wartość w polu select
    $('#pointer_box  select[property=main_kind] option[name=' + pointers.main_kind + ']').attr('selected','selected');

  },

  draw : function(){
    pointers.create_array();
    pointers.draw();
  }

}