//obiekt mówiący nam nad jaką kategoria jesteśmy

var on_category = {
	
	canvas_offset_top : null,
	canvas_offset_left : null,

	init : function(){

		canvas_offset_top = $('#canvas_wrapper').offset().top;
		canvas_offset_left = $('#canvas_wrapper').offset().left;

		$('#canvas_wrapper').mousemove(function(){

	

			console.log( on_category.get_name() );
	
		});


	},
	//funkcja zwracająca aktualną kategorię nad którą znajduje się kursor
	get_name : function(){
		var left = mouse.left - canvas_offset_left;
			var top = mouse.top - canvas_offset_top;

			var row = Math.ceil( top / (pointers.size + pointers.padding_y) );
			
			if((pointers.translate_modulo) && (row % 2 != 0)){
				var column = Math.ceil( (left + (pointers.size/2))/ (pointers.size + pointers.padding_x) ) - 1;
			}
			else{
				var column = Math.ceil( left/ (pointers.size + pointers.padding_x) );
			}

			try{
				var category_num = pointers.pointers[row-1][column-1] 
				var category_name = categories.category[category_num][0]
			}
			catch(e){
				return 'null';
			}
			
			if( category_name == 'pusty'){
				return 'null';
			}
			else{
				return category_name;		
			}

		}


}