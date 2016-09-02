var project = {

  hash_map : null,
  //map : null,
  //excel : null,
  step : 0,

  get_excel : function(hash){
    var th = this;
    $.post( basic_url + "/excel/"+hash, {
      _method: 'GET',
      _token: csrf_token,
      map_hash: th.map_hash
    })
    .done(function( response ) {
      //console.log( response );
      excel.data = response ;
    });
  },

  //idziemy do następnego okna w kolejności
  next_window : function(){
  
    switch (this.step){

      case 0 :
        if ( (map.data != null) && (excel.data != null) ){
          //jeśli wybrano mapę i projekt excel przechodzimy do następnego okna i wyświetlamy te dane w podglądzie
          this.step = 1;
          var newLeft = parseInt( $("#window_wrapper #window_slider" ).css('left') ) - 960 + 'px';
          $( "#window_wrapper #window_slider" ).animate({ left: newLeft }, 500 );

          map.parse();
          excel.show();
          excel.convert();
          layers.list[layers.active].color_panel.show();
          category.show();

          $('.setting_box').show();
        }
        else{
          alert('nie zaznaczyłeś mapy lub pliku excel');
        }
      break;

      case 1 :
        alert('go to 2');
      break;

      case 2 :
        alert('go to 3');
      break;

    }
  },

  //idziemy do poprzedniego okna w kolejności
  prev_window : function(){

    switch (this.step){

      case 1 :
        this.step = 0;
        var newLeft = parseInt($( "#window_wrapper #window_slider" ).css('left')) + 960 + 'px';
        $( "#window_wrapper #window_slider" ).animate({ left: newLeft }, 500 );
      break;

      case 2 :
        alert('1');
      break;

      case 3 :
        alert('2');
      break;

    }
  }
}
