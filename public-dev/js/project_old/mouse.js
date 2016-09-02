//obiekt myszki (do ogarniecia)
var mouse = {

	down : false,
	click_obj : null,

	tmp_mouse_x : null, //zmienne tymczasowe umożliwiające przesuwanie tła
	tmp_mouse_y : null, //zmienne tymczasowe umożliwiające przesuwanie tła

	left : null, //pozycja x myszki
	top : null, //pozycja y myszki
	padding_x : null, //pozycja x myszki od górnej krawędzi
	padding_y : null, //pozycja y myszki od górnej krawędzi
	offset_x : null, //offset x obiektu klikniętego
	offset_y : null, //offset y obiektu klikniętego

	//funckja wykrywająca w co kliknięto pobierająca padding kliknięcia oraz zapisująca kliknięcie
	set_down : function(event){
		
		if (!event) { event = window.event; } //lata dla mozilli
		
		var obj = event.target;
    var position = $(obj).offset();
		this.offset_x = position.left;
		this.offset_y = position.top;
		this.padding_x = this.left - position.left;
		this.padding_y = this.top - position.top;
		mouse.down = true;
    this.click_obj = $(obj).attr('id');
  
  },

	set_up : function(){
    
    mouse.down = false;

    switch(this.click_obj){
      case 'border_right':
        map.draw();
				$('.input_base[property=width_canvas]').val(canvas.width_canvas);
				$('.input_base[property=height_canvas]').val(canvas.height_canvas);
      break;
    }

    this.click_obj = null;
  },

	set_position : function(event){
    
    if (!event) {event = window.event;} //lata dla mozilli
    this.left = event.pageX;
		this.top = event.pageY;
		//console.log(this.left,this.top);
	},

	//funkcja wykonywana podczas wciśniecia przyciksku myszki (w zależności od klikniętego elementu wykonujemy różne rzeczy)
	mousemove : function(){

    switch(this.click_obj){
      case 'border_right':

        //rozszerzanie canvasa w prawo
				var position = $('#window2 #canvas').offset();
				var new_width = this.left - this.padding_x - position.left

        if ( new_width > 300 ){
          canvas.update( parseInt(new_width), parseInt(new_width / canvas.factor) );
					map.draw();
					$('.input_base[property=width_canvas]').val(canvas.width_canvas);
					$('.input_base[property=height_canvas]').val(canvas.height_canvas);
				}

			break;
		}
	}
}
