//czyszczenie i rysowanie po canvasie
var canvas = {

	scale : 100,
	factor : 1,
	width_canvas : null,
	width_org : null,
	height_canvas : null,
	obj : null,
	context : null,

	offset_top : null,
	offset_left : null,

	max_row : null, //liczba aktywnych wierszy i kolumn
	max_column : null, //liczba aktywnych wierszy i kolumn

	//zmienne wykorzystywane przy ustaleniu zawartości dymka
	active : [{pointer : null, row : null, column : null}], //tablica zawietająca zmienne (pointer, row, column)


	//inicjujemy zmienne
	init : function(){
		this.obj = document.getElementById('canvas');
		this.context = this.obj.getContext('2d');
		this.width_canvas = parseInt( $('#canvas').attr('width') );
		this.height_canvas = parseInt( $('#canvas').attr('height') );
		this.factor = this.width_canvas / this.height_canvas;

		this.offset_top = $(this.obj).offset().top;
		this.offset_left = $(this.obj).offset().left;

	},


	//funkcja aktualizuja określone dane
	update : function(set_width){

		width = this.width_canvas;
		height = this.height_canvas;

		if( typeof set_width != 'undefined' ){
			width =	parseInt( set_width );
			height = parseInt(width / canvas.factor);
		}

		this.width_canvas = width;
		this.height_canvas = height;

		this.offset_top = $(this.obj).position().top;
		this.offset_left = $(this.obj).position().left;

		canvas.obj.height = height;
		canvas.obj.width = width;

		$('#window2 #width_canvas').val( width );
		$('#window2 #height_canvas').val( height );

		$('#canvas_wrapper, #canvas_wrapper #canvas').css('width', width + 'px');
		$('#canvas_wrapper, #canvas_wrapper #canvas').css('height', height + 'px');

		$('#canvas_wrapper #canvas').attr('width', width + 'px');
		$('#canvas_wrapper #canvas').attr('height', height + 'px');

	},

	clear : function(){
		this.context.clearRect ( 0, 0, this.width_canvas, this.height_canvas );
	},


	//funkcja aktualizująca aktualny pointer active
	set_active_pointer : function(){

		var top = parseInt( (mouse.top - $('#canvas').offset().top) / (pointers.size_pointer + pointers.padding_y) );

    if( (pointers.translate_modulo) && (top%2 == 0) ){
      var left = parseInt( (mouse.left - (pointers.size_pointer + pointers.padding_x)/2 - $('#canvas').offset().left) / (pointers.size_pointer + pointers.padding_x) );
    }
    else{
      var left = parseInt( (mouse.left - $('#canvas').offset().left) / (pointers.size_pointer + pointers.padding_x) );
    }

    if( (left >= 0) && (left < canvas.max_column) && (top >= 0) && (top < canvas.max_row) ){
      this.active.pointer = pointers.pointers[top][left];
      this.active.row = top;
      this.active.column = left;
    }
	}
}

