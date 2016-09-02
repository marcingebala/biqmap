//menu pointer
var pointers = {

	show_all_point : true,
	padding_x : 1,
	padding_y : 1,
	translate_modulo : false,
	size_pointer : 10,
	main_kind : 'square',
	active : null,

	pointers : Array(), //pointers.pointers[rzad][kolumna] : kategoria[numer]

	//rysowanie wszystkich punktów
	draw : function(){
	
		console.log('pointers.draw()');

		canvas.clear();

		var width_pointer = this.size_pointer + this.padding_x;
		var height_pointer = this.size_pointer + this.padding_y;
		var none_color = "rgba(0,0,0,0)";

		if(this.show_all_point) none_color = "rgba(128,128,128,1)";

		for(var row = 0; row < canvas.max_row; row++){
			for(var column = 0; column < canvas.max_column; column++){

				if(this.pointers[row][column] > 0){

					canvas.context.fillStyle = category.list[ this.pointers[row][column] ].color;

					if( (row % 2 == 0) && (pointers.translate_modulo) ){
						window['figures'][this.main_kind]( column*width_pointer + width_pointer/2 , row*height_pointer , this.size_pointer);
					}
					else{
						window['figures'][this.main_kind]( column*width_pointer , row*height_pointer , this.size_pointer);
					}
				}
			}
		}
	},

	//tworzymy tablice ponterów na podstawie tablicy projektów
	create_array : function(){

		canvas.max_row = map.data[1].length;
		canvas.max_column = map.data[1][0].length

		for (var row = 0; row < canvas.max_row; row++){

			this.pointers[row] = Array();

			for (var column = 0; column < canvas.max_column; column++){
				this.pointers[row][column] = map.data[1][row][column];
			}
		}
	}
}
