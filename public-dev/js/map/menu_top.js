//obiekt menu_top
var menu_top = {

	move_image : false,
	move_canvas : false,
	auto_draw : false,
	mode_key : true,
	category : 0,
	disable_select : false,

	//funkcja służąca do pobierania danych dotyczących map
	get_maps : function(){
	
		$.ajax({
   		url: '/api/maps',
    	type: "GET",
    	contentType: "application/json"
		}).done( function( response ) {
			
			//wyświetlamy listę map w panelu u góry
			if(response.status == "ok"){

				var add_html = '';
				for (var i = 0, i_max = response.data.length; i < i_max ;i++){

					console.log( JSON.parse(response.data[i].map_json)[0][7] );
					
					if(response.data[i]._id == crud.map_hash){
						add_html += '<option selected id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].map_json)[0][7] + '</option>';
					}
					else{
						add_html += '<option id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].map_json)[0][7] + '</option>';
					}
				
				}

				$('#toolbar_top select.select_maps').append( add_html );
			}

		});

		//dodajemu zdarzenie change map
		$('.select_maps').change(function(){
			
			if (confirm('Czy chcesz wczytać nową mapę ?')) {
			
				if( $(this).find('option:selected').attr('id') == 'new_map' ){
					location.reload();
				}
				else{
					crud.select_map( $(this).find('option:selected').attr('id') );
				}

			}
		
		});

	},

	update_canvas_info : function(){
		canvas.scale = parseInt( $('#canvas_info #size').val() );
		canvas.width_canvas = parseInt( $('#canvas_info #width').val() );
		canvas.height_canvas = parseInt( $('#canvas_info #height').val() );

		$('#canvas_info #size').val( canvas.scale + '%' );
		$('#canvas_info #width').val( canvas.width_canvas + 'px' );
		$('#canvas_info #height').val( canvas.height_canvas + 'px' );

		$('#canvas_box, #canvas_wrapper').css({'width': canvas.width_canvas + 'px','height':canvas.height_canvas + 'px'});
		$('#canvas_box #main_canvas').attr('width',canvas.width_canvas + 'px');
		$('#canvas_box #main_canvas').attr('height',canvas.height_canvas + 'px');
		canvas.draw();
	},

	change_alpha : function(){
		image.alpha = $('#alpha_image').find('option:selected').attr('name');
		canvas.draw();
	},

	add_image : function(){

		//jesli podany parametr nie jest pusty
		var src_image = prompt("Podaj ścieżkę do zdjęcia: ");

		if(src_image){
			if(src_image.length > 0){

				image.obj = new Image();

				//wczytanie zdjęcia:
					image.obj.onload = function() {
	    		image.width = image.obj.width;
	    		image.height = image.obj.height;
	    		image.draw();
	  		};

			  image.x = 0;
			  image.y = 0;
			  image.obj.src = src_image;
				//simage.obj.setAttribute('crossOrigin', 'anonymous');
			}
		}
	},

	show_info : function(){
		$('#canvas_info #size').val(parseInt(canvas.scale) + '%');
		$('#canvas_info #width').val(parseInt(canvas.width_canvas) + 'px');
		$('#canvas_info #height').val(parseInt(canvas.height_canvas) + 'px');
	},

	increment_scale : function(){

		canvas.reset();
		canvas.scale+=5;

		if(canvas.scale == 100){
			$('#canvas_box #right_resize, #canvas_box #bottom_resize').fadeIn(500);
			if(this.move_image) $('#canvas_box #image_resize').fadeIn(0);
		}
		else{
			$('#canvas_box #right_resize, #canvas_box #bottom_resize').fadeOut(500);
			$('#canvas_box #image_resize').fadeOut(0);
		}

		var new_width = canvas.width_canvas * (canvas.scale/100);
		var new_height = canvas.height_canvas * (canvas.scale/100);
		$('#main_canvas').attr({'width': new_width + 'px','height': new_height + 'px'});
		$('#canvas_box, #canvas_wrapper').css({'width': new_width + 'px','height' : new_height + 'px'});

		canvas.context.scale( canvas.scale / 100 , canvas.scale / 100 );
		canvas.context.translate( ( canvas.context_x / (canvas.scale / 100) ),( canvas.context_y / (canvas.scale / 100) ));

		this.show_info();
		canvas.draw();
	},

	decrement_scale : function(){
		if(canvas.scale > 100){
			canvas.reset();
			canvas.scale -= 5;

			if(canvas.scale == 100){
				$('#canvas_box #right_resize, #canvas_box #bottom_resize').fadeIn(500);
				if(this.move_image) $('#canvas_box #image_resize').fadeIn(0);
			}
			else{
				$('#canvas_box #right_resize, #canvas_box #bottom_resize').fadeOut(500);
				$('#canvas_box #image_resize').fadeOut(0);
			}

			var new_width = canvas.width_canvas * (canvas.scale/100);
			var new_height = canvas.height_canvas * (canvas.scale/100);
			$('#main_canvas').attr({'width': new_width + 'px','height': new_height + 'px'});
			$('#canvas_box, #canvas_wrapper').css({'width': new_width + 'px','height' : new_height + 'px'});

			canvas.context.scale( canvas.scale / 100 , canvas.scale / 100 );
			canvas.context.translate( ( canvas.context_x / (canvas.scale / 100) ),( canvas.context_y / (canvas.scale / 100) ));

			this.show_info();
			canvas.draw();
		}
	},

	switch_mode : function(key){
		if(!this.disable_select){
			if(this.mode_key){
				switch(key){

					case 105: //poruszanie zdjęciem
						if(image.obj){
							if(this.move_image){
								this.move_image = false;
								$('#menu_top div#move_image').css('background','#aaa');
								$('#canvas_wrapper #image_resize').hide();
							}
							else{
								this.move_image = true;
								this.auto_draw = false;
								this.move_canvas = false;
								$('#menu_top div#move_image').css('background','#34a81c');
								$('#menu_top div#auto_draw').css('background','#aaa');
								$('#menu_top div#move_canvas').css('background','#aaa');
								$('#canvas_wrapper #image_resize').show();
							}
						}
					break;

					case 100: //rysowanie bez wcisnięcia przycisku

						pointers.last_row = null;
						pointers.last_column = null;

						if(this.auto_draw){
							this.auto_draw = false;
							$('#menu_top div#auto_draw').css('background','#aaa');
						}
						else{
							this.auto_draw = true;
							this.move_canvas = false;
							this.move_image = false;
							$('#menu_top div#move_canvas').css('background','#aaa');
							$('#menu_top div#move_image').css('background','#aaa');
							$('#menu_top div#auto_draw').css('background','#34a81c');
						}
					break;

					case 99: //poruszanie całym canvasem
						if(this.move_canvas){
							this.move_canvas = false;
							$('#menu_top div#move_canvas').css('background','#aaa');
						}
						else{
							this.move_canvas = true;
							this.move_image = false;
							this.auto_draw = false;
							$('#menu_top div#move_canvas').css('background','#34a81c');
							$('#menu_top div#move_image').css('background','#aaa');
							$('#menu_top div#auto_draw').css('background','#aaa');
						}
					break;
				}
			}
		}
	}
}
