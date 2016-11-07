//menu pointer
var pointers = {
	show_all_point : true,
	show_border : false,
	padding_x : 1,
	padding_y : 1,
	translate_modulo : false,
	size: 10,
	main_kind : 'square',
	kinds : Array('square','circle','hexagon','hexagon2'),
	color_border: '#333',
	pointers : Array(), //pointers.pointers[rzad][kolumna] : kategoria[numer]

	last_column : null,	//kolumna pointera który został ostatnio zmieniony
	last_row : null,	//wiersz pointera który został ostatnio zmieniony

	draw_border: function(){
		var width_pointer = this.size + this.padding_x,
				height_pointer = this.size + this.padding_y,
				none_color = "rgba(0,0,0,0)",
				border = {},
				data = {};

		if((this.main_kind == 'square') || (this.main_kind == 'circle') || (this.main_kind == 'hexagon')){
				
			canvas.context.fillStyle = this.color_border;

			for(var row = 0; row < canvas.active_row; row++){
				for(var column = 0; column < canvas.active_column; column++){

					if(this.pointers[row][column] != 0){

						border = {
							top: false,
							top_left : false,
							top_right : false,
							right: false
						};

						//rysujemy połówkami
						//sprawdzamy czy mamy włączoną opcje modulo
						if(row-1 >= 0){
							if(!pointers.translate_modulo){
								//jeśli nie to sprawdzamy tradycyjnie włączoną granicę nad 
								if((this.pointers[row-1][column] != 0)&&(this.pointers[row-1][column] != this.pointers[row][column])){
									border.top = true;
								}
							}
							else{
								//jeśli tak to: sprawdzamy czy wiersz jest przesunięty
								if(row % 2 == 0){
									if((column-1) > 0){
										if((this.pointers[row-1][column] != 0)&&(this.pointers[row-1][column] != this.pointers[row][column])){
											border.top_left = true;
										}
									}
									if((this.pointers[row-1][column+1] != 0)&&(this.pointers[row-1][column+1] != this.pointers[row][column])){
										border.top_right = true;
									}
								}
								else{
									if((this.pointers[row-1][column-1] != 0)&&(this.pointers[row-1][column-1] != this.pointers[row][column])){
										border.top_left = true;
									}
									if((column+1) <= canvas.active_column){
										if((this.pointers[row-1][column] != 0)&&(this.pointers[row-1][column] != this.pointers[row][column])){
											border.top_right = true;
										}
									}
								}
							}	
						}

						if((column+1) <= canvas.active_column){
							if((this.pointers[row][column+1] != 0)&&(this.pointers[row][column+1] != this.pointers[row][column])){
								border.right = true;
							}
						}

						data = {
							x : column*width_pointer,
							y : row*height_pointer,
							size : this.size,
							border : border,
							line_width_x : pointers.padding_x,
							line_width_y : pointers.padding_y,
							t_modulo : false
						}

						if( (row % 2 == 0) && (pointers.translate_modulo) ){
							data.x = column*width_pointer + width_pointer/2;
						}
						
						figures.square_border(data);
					}
				}	
			}
		}
	},

	//rysowanie wszystkich punktów
	draw : function(){
		var width_pointer = this.size + this.padding_x;
		var height_pointer = this.size + this.padding_y;
		var none_color = "rgba(0,0,0,0)"

		if(this.show_all_point) none_color = "rgba(128,128,128,1)";

				for(var row = 0; row < canvas.active_row; row++){
				for(var column = 0; column < canvas.active_column; column++){

				if(this.pointers[row][column] == 0){
					canvas.context.fillStyle = none_color;
					canvas.context.globalAlpha = 0.5;
				}
				else{				

					if( (this.pointers[row][column] != menu_top.category) && (menu_top.category != 0) ){
						canvas.context.globalAlpha = 0.2
					}
					else{
						canvas.context.globalAlpha = 1
					}
					try{
						canvas.context.fillStyle = layers.category_colors[layers.active][ this.pointers[row][column] ];
					}
					catch(e){
						console.log('ERROR 39 LINE ! ',this.pointers[row][column],row,column);
					}
				}

				if( (row % 2 == 0) && (pointers.translate_modulo) ){
					window['figures'][this.main_kind]( column*width_pointer + width_pointer/2 , row*height_pointer , this.size);
				}
				else{
					window['figures'][this.main_kind]( column*width_pointer , row*height_pointer , this.size);
				}

			}
		}

		if(this.show_border){
			this.draw_border();
		}

	},

	//tworzymy tablice ponterów (jeśli jakiś ponter istnieje zostawiamy go, w przypadku gdy pointera nie ma tworzymy go na nowo)
	create_array : function(){
		canvas.active_row = parseInt( canvas.height_canvas / (pointers.size + pointers.padding_y) );
		canvas.active_column = parseInt( canvas.width_canvas / (pointers.size + pointers.padding_x) );

		if( (this.pointers.length < canvas.active_row) || (this.pointers[0].length < canvas.active_column) )
		{
			for (var row = 0; row < canvas.active_row; row++)
			{
				for (var column = 0; column < canvas.active_column; column++)
				{
					if(this.pointers[row] == undefined) this.pointers[row] = new Array();
					if(this.pointers[row][column] == undefined)	this.pointers[row][column] = 0;
				}
			}
		}
	},

	update_point : function(y,x,y_last,x_last){

		this.pointers[y][x] = parseInt( menu_top.category );

		//wyznaczenie równania prostej
		if( ((y_last != y) || (x_last != x)) && (y_last != null) && (x_last != null) ){
			var a = (y_last - y) / (x_last - x);
			var b = y - a*x;

			if(x_last > x){
				var col_from = x;
				var col_to = x_last;
			}else{
				var col_to = x;
				var col_from = x_last;
			}

			if(y_last > y){
				var row_from = y;
				var row_to = y_last;
			}else{
				var row_to = y;
				var row_from = y_last;
			}

			var row = null;
			for(var col = col_from; col <= col_to; col++)
			{
				row = parseInt( a*col+b );
				if(!$.isNumeric(row)) row = y;
				this.pointers[row][col] = parseInt( menu_top.category );
			}

			var col = null;
			for(var row = row_from; row <= row_to; row++)
			{
				col = parseInt( (row-b)/a );
				if(!$.isNumeric(col)) col = x;
				this.pointers[row][col] = parseInt( menu_top.category );
			}
		}
		else{
			this.pointers[y][x] = parseInt( menu_top.category );
		}
	}
}
