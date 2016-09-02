//czyszczenie i rysowanie po canvasie
var canvas = {
	
	scale : 100,
	width_canvas : 700,
	height_canvas : 400,
	canvas : null,
	context : null,
	thumbnail : null,
	title_project : 'nowy projekt',

	context_x : 0, //obecna pozycja contextu x
	context_y : 0, //obecna pozycja contextu y
	context_new_x : 0, //nowa pozycja contextu x
	context_new_y : 0, //nowa pozycja contextu y

	offset_left : null,
	offset_top : null,
	active_row : null, //liczba aktywnych wierszy i kolumn
	active_column : null, //liczba aktywnych wierszy i kolumn

	thumbnail : function(){
		var canvas = document.getElementById("main_canvas");
		var dataURL = canvas.toDataURL();
		console.log(dataURL);
	},

	//rysujemy canvas ze zdjęciem
	draw : function(){
		this.clear();

		pointers.create_array();
		pointers.draw();

		if (image.obj !== undefined)  image.draw();
	},

	draw_thumnail : function(){

		canvas.canvas = document.getElementById('thumbnail_canvas');
		canvas.thumbnail = document.getElementById('thumbnail_canvas');
		canvas.context = canvas.canvas.getContext('2d');

		this.clear();

		pointers.create_array();
		pointers.draw();

		canvas.canvas = document.getElementById('main_canvas');
		canvas.context = canvas.canvas.getContext('2d');

	},

	//resetujemy tło zdjęcia
	reset : function(){
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		canvas.context.scale( canvas.scale / 100 , canvas.scale / 100 );
	},

	// czyścimy całe zdjęcie na canvasie
	clear : function(){
		this.context.clearRect ( 0, 0, this.width_canvas, this.height_canvas );
		//this.context.fillRect ( 0, 0, this.width_canvas, this.height_canvas );
	},

	resize_width : function(new_width){
		this.width_canvas = new_width;
		$('#main_canvas').attr('width',this.width_canvas + 'px');
		$('#canvas_box, #canvas_wrapper').css({'width': this.width_canvas + 'px'});
		$('#canvas_info #width').val(this.width_canvas + 'px');
		this.scale = 100;
		$('#canvas_info #size').val(this.scale + '%');
		menu_top.show_info();
	},

	resize_height : function(new_height){
		this.height_canvas = new_height;
		$('#main_canvas').attr('height',this.height_canvas + 'px');
		$('#canvas_box, #canvas_wrapper').css({'height': this.height_canvas + 'px'});
		$('#canvas_info #height').val(this.height_canvas + 'px');
		this.scale = 100;
		$('#canvas_info #size').val(this.scale+'%');
		menu_top.show_info(); // aktualizujemy dane odnośnie rozmiarów canvasa w menu u góry
		//this.draw(); //rysujemy na nowo canvas
	},

	set_default : function(){
		$('#canvas_box #right_resize, #canvas_box #bottom_resize').fadeIn(500);
		if(this.move_image) $('#canvas_box #image_resize').fadeIn(0);

		canvas.scale = 100;
		canvas.context_x = 0;
		canvas.context_y = 0;
		canvas.context.scale( canvas.scale / 100 , canvas.scale / 100 );

		var new_width = canvas.width_canvas * (canvas.scale/100);
		var new_height = canvas.height_canvas * (canvas.scale/100);
		$('#main_canvas').attr({'width': new_width + 'px','height': new_height + 'px'});
		$('#canvas_box, #canvas_wrapper').css({'width': new_width + 'px','height' : new_height + 'px'});

		canvas.reset();
		canvas.context.translate( ( canvas.context_x / (canvas.scale / 100) ),( canvas.context_y / (canvas.scale / 100) ));
		canvas.draw();
		menu_top.show_info();
		canvas.draw();
	}
}

//obiekt kategorii dodanie / aktualizacja / usunięcie / pokazanie kategorii
var categories = {
	category : new Array(['pusty','#808080']),

	add : function(){
		var name = Array($('#category_box input[name="add_category"]').val(),'#ff0000');
		$('#category_box input[name="add_category"]').val('');

		this.category.push(name);
		menu_top.category = (this.category.length-1);
		this.show_list();
	},

	update : function(index,name){
		this.category[index][0] = name;
		this.show_list();
	},

	remove : function(id){
		var th = this;

		$.each(this.category,function(index,value){
			if(index >= id){
				th.category[index] = th.category[index+1];
			}
		});

		for(var row = 0; row < pointers.pointers.length; row++){
			for(var column = 0; column < pointers.pointers[row].length; column++){

				if(pointers.pointers[row][column] == id){
					pointers.pointers[row][column] = 0;
				}

				if(pointers.pointers[row][column] > id){
					pointers.pointers[row][column] = parseInt(pointers.pointers[row][column]) - 1;
				}

			}
		}

		this.category.pop();
		this.show_list();

		//rysujemy na nową canvas
		canvas.draw();
	},

	show_list : function(){

		var add_category = "<table>";
		//var add_select ='<option name="0">pusty</option>';
		var add_select = '';

		for(var i = this.category.length; i > 1; i--){
			add_category += '<tr><td><span>'+(i-1)+'</span></td><td><input type="text" name="category_name" id_category="'+(i-1)+'" value="'+this.category[(i-1)][0]+'" /></td><td><div class="colorpicker_box" style="background-color:'+this.category[(i-1)][1]+'" id_category="'+(i-1)+'"></div></td><td><button class="remove" id_category="'+(i-1)+'">usun</button></td></tr>';
			add_select += '<option name="'+(i-1)+'">'+this.category[(i-1)][0]+'</option>';
		}
		if(menu_top.category == 0){
			add_select += '<option selected name="0">'+this.category[0][0]+'</option>';
		}
		else{
			add_select += '<option name="0">'+this.category[0][0]+'</option>';
		}


		add_category += "</table>";

		$('#category_box #list').html(add_category);
		$('select#change_category').html(add_select);

		colorpicker.add();
	}
}

//sama nazwa wiele tłumaczy po prostu colorpicker
var colorpicker = {

	click_id : null,

	add : function(){
		this.remove();
		$('.colorpicker_box').ColorPicker({
			color: '#ff0000',
			onShow: function (colpkr) {
				if($(colpkr).css('display')=='none'){
					$(colpkr).fadeIn(200);
					colorpicker.click_id = $(this).attr('id_category');
				}
				return false;
			},
			onHide: function (colpkr) {
				$(colpkr).fadeOut(200);
				return false;
			},
			onChange: function (hsb, hex, rgb) {
				$('.colorpicker_box[id_category="'+colorpicker.click_id+'"]').css('backgroundColor', '#' + hex);
				categories.category[colorpicker.click_id][1] = '#' + hex;
				canvas.draw();
			}
		});
	},

	remove : function(){
		$('.colorpicker').remove();
	}
}

//funkcja odpowiedzialna za tworzenie zapisywanie i aktualizacje danych dotycząćcyh mapy
var crud = {

	map_json : Array(), //główna zmienna przechowująca wszystkie dane
	map_hash : null,

	select_map : function( id_map ){

		//jeśli uruchomimy
		if (id_map == 'new_map') { 
			this.create_map() 
		}
		else{
			this.map_hash = id_map;
			this.get_map();
		}

	},

	//pobieramy dane z porojektu i zapisujemy je do json-a
	get_data : function(){

		//zerujemy na nowo całą tablicę pointerów
		this.map_json = Array();

		// data[x] = zmienne podstawowe dotyczące mapy
		this.map_json[0] = Array();
		this.map_json[0][0] = canvas.height_canvas;
		this.map_json[0][1] = canvas.width_canvas;
		this.map_json[0][2] = pointers.padding_x;
		this.map_json[0][3] = pointers.padding_y;
		this.map_json[0][4] = pointers.translate_modulo;
		this.map_json[0][5] = pointers.size_pointer;
		this.map_json[0][6] = pointers.main_kind;
		this.map_json[0][7] = canvas.title_project;

		// data[1] = tablica punktów (pointers.pointers) [wiersz][kolumna] = "none" || (numer kategorii)
		this.map_json[1] = pointers.pointers;

		// data[2] = tablica kategorii
		this.map_json[2] = categories.category;

		//data[3] = tablica wzorca (zdjęcia w tle do odrysowania)
		this.map_json[3] = Array();

		if(image.obj){
			this.map_json[3][0] = image.obj.src;
			this.map_json[3][1] = image.x;
			this.map_json[3][2] = image.y;
			this.map_json[3][3] = image.width;
			this.map_json[3][4] = image.height;
			this.map_json[3][5] = image.alpha;
		}

		//konwertujemy nasza tablice na json
		console.log('MAP _ JSON', this.map_json, JSON.stringify( this.map_json ));
		this.map_json = JSON.stringify(this.map_json);

	},

	//pobranie mapy z bazy danych
	get_map : function(){

		var th = this;

		$.ajax({
			  url: '/api/maps/' + th.map_hash,
		  	type: "GET",
		    contentType: "application/json"
			}).done(function( data ) {

			console.log( data.data[0] );

			//po zapisaniu danych do bazy aktualizujemy id (w przypadku jeśli istnieje nadpisujemy je)
			var response = JSON.parse(data.data[0].map_json);

			//pobieramy i wczytujemy dane o canvasie do obiektu
			canvas.height_canvas = response[0][0];
			canvas.width_canvas = response[0][1];
			pointers.padding_x = response[0][2];
			pointers.padding_y = response[0][3];
			pointers.translate_modulo = response[0][4];
			pointers.size_pointer = response[0][5];
			pointers.main_kind = response[0][6];
			canvas.title_project = response[0][7];

			$('#pointer_box input[name="padding_x"]').val( response[0][2] );
			$('#pointer_box input[name="padding_y"]').val( response[0][3] );
			$('#pointer_box input[name="size_pointer"]').val( response[0][5] );
			$('input[name="title_project"]').val( response[0][7] );

			if( response[0][4] ){
				$('#pointer_box div[name="translate_modulo"]').removeClass('switch-off');
				$('#pointer_box div[name="translate_modulo"]').addClass('switch-on');
			}

			$('#pointer_box select[name="main_kind"]').html('');

			pointers.kinds.forEach(function(kind){

				if(kind == response[0][6]){
					$('#pointer_box select[name="main_kind"]').append('<option selected="selected" name="'+kind+'">'+kind+'</option>');
				}
				else{
					$('#pointer_box select[name="main_kind"]').append('<option name="'+kind+'">'+kind+'</option>');
				}

			});

			//pobieramy dane o pointerach
			pointers.pointers = response[1];

			//pobieramy dane o kategoriach
			categories.category = response[2];

			//pobieranie danych o zdjęciu jeżeli istnieje
			if( response[3].length > 2){
				image.obj = new Image();
				image.obj.src = response[3][0];
				image.x = parseInt( response[3][1] );
				image.y = parseInt( response[3][2] );
				image.width = parseInt( response[3][3] );
				image.height = parseInt( response[3][4] );
				image.alpha = parseInt( response[3][5] );

				//zaznaczenie odpowiedniego selecta alpha w menu top
				$('#alpha_image option[name="'+	image.alpha +'"]').attr('selected',true);

				image.obj.onload = function() {
					canvas.draw();
				};
			}

			//zaktualizowanie danych w inputach
			$('#main_canvas').attr('width', canvas.width_canvas+'px');
			$('#main_canvas').attr('height', canvas.height_canvas+'px');
			$('#canvas_box, #canvas_wrapper').css({'width':canvas.width_canvas+'px','height':canvas.height_canvas+'px'});

			canvas.draw();
			categories.show_list();
		});
	},

	//tworzymy nową mapę danych
	create_map : function(){

		//aktualizujemy jsona do wysłania ajaxem
		this.get_data();
		var th = this; //zmienna pomocnicza
		console.log('create',th.map_json);

		//wysysłamy dane ajaxem do bazy danych
		//canvas.draw_thumnail();
		//new_image = image.dataURItoBlob( canvas.thumbnail.toDataURL() );
		//canvas.draw();

		//var formData = new FormData();
		//formData.append("action",	'create_map' );
		//formData.append("map_name", canvas.title_project);
		//formData.append("map_json", th.map_json);
		//formData.append("map_image", new_image);
		//formData.append("_method", 'POST');
		//formData.append("_token", csrf_token);
		
		var data = {
			map_json: th.map_json
		}

		jQuery.ajax({
			url: "api/maps",
			data: { map_json: th.map_json },
			type: 'POST',
			success: function(response){
				th.map_hash = response.hash_map;
				alert('zapisano nową mapę');
				menu_top.get_maps();
			}
		});

	},

	//aktualizujemy mapę
	update_map : function(){

		//aktualizujemy jsona do wysłania ajaxem
		this.get_data();
		var th = this; //zmienna pomocnicza

		//canvas.draw_thumnail();
		//new_image = image.dataURItoBlob( canvas.thumbnail.toDataURL() );
	/*
		var formData = new FormData();
		formData.append("map_hash", th.map_hash );
		formData.append("map_name", canvas.title_project);
		formData.append("map_json", th.map_json);
		formData.append("map_image", new_image);
		formData.append("_method", 'PUT');
		formData.append("_token", csrf_token);

		jQuery.ajax({
			url: basic_url + "/map/"+th.map_hash,
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			type: 'POST',
			success: function(data){
				alert('zaktualizowano mapę');
			}
		});
	*/

		var data = {
			map_hash: th.map_hash,
			map_json: th.map_json
		}

		jQuery.ajax({
			url: "api/maps",
			//data: JSON.stringify(data),
			data: data,
			type: 'PUT',
			success: function(response){
				alert('zaktualizowano mapę');
			}
		});

	},

	//usuwamy mapę z bazy danych
	delete_map : function(){

		var th = this; //zmienna pomocnicza

		//sprawdzamy czy mapa do usunięcia posiada swoje id
		if(this.map_hash != null){
			$.post( basic_url + "/map/" + th.map_hash, {
				action: 'delete_map',
				_method: 'DELETE',
				_token: csrf_token,
				map_hash: th.map_hash
			})
			.done(function( response ) {
				response = JSON.parse(response);
				if (response.status = "OK") {
					window.location.replace(basic_url +"/map");
				}
				else{
					alert('błąd podczas usuwania mapy');
				}
			});
		}
		else{
			alert('brak hasha - mapa nie jest zapisana');
		}
	}
}

//funkcje rysujące pojedyńczy punkt (pointer)
var figures = {

	square : function(x,y,size){
		canvas.context.fillRect(x,y,size,size);
	},

	circle : function(x,y,size){
		var size = size / 2;
		var center_x = x + size;
		var center_y = y + size;
		canvas.context.beginPath();
		canvas.context.arc(center_x, center_y, size, 0, 2 * Math.PI);
		canvas.context.fill();
	},

	hexagon  : function(x,y,size){
		var a = size/4;
		var a2 = size/2;
		var h = size/2*Math.sqrt(3)/2;

		canvas.context.beginPath();
		canvas.context.moveTo(x,y+a2);
    canvas.context.lineTo(x+a,y+a2-h);
  	canvas.context.lineTo(x+a+a2,y+a2-h);
		canvas.context.lineTo(x+size,y+a2);
		canvas.context.lineTo(x+size-a,y+a2+h);
		canvas.context.lineTo(x+a,y+a2+h);
		canvas.context.lineTo(x,y+a2);
		canvas.context.fill();
	},

	hexagon2 : function(x,y,size){
		var a = size/4;
		var a2 = size/2;
		var h = size/2*Math.sqrt(3)/2;

		canvas.context.beginPath();
		canvas.context.moveTo(x+a2,y);
    canvas.context.lineTo(x+a2+h,y+a);
  	canvas.context.lineTo(x+a2+h,y+a2+a);
    canvas.context.lineTo(x+a2,y+size);
    canvas.context.lineTo(x+a2-h,y+a2+a);
    canvas.context.lineTo(x+a2-h,y+a);
    canvas.context.lineTo(x+a2,y);
		canvas.context.fill();

	}
}

//funkcje globalne kontener na wszystko i nic ;)
var global = {
	toogle_panel  : function(event){
		if (!event) {event = window.event;} //latka dla mozilli
		if( $(event.target).parent().css('right') == '0px' ){
			$(event.target).parent().animate({right: [-$(event.target).parent().width()-20,"easeOutBounce"]}, 1000, function() {});
    }
    else{
    	 $(event.target).parent().animate({right: ["0px","easeOutBounce"]}, 1000, function() {});
    }
	}
}

//główne zdjęcie od którego odrysowujemy mapy
var image = {
	obj : undefined,
	x : null,
	y : null,
	width : null,
	height : null,
	alpha : 10,

	draw : function(){
		canvas.context.globalAlpha = this.alpha/10;
		canvas.context.drawImage(this.obj,this.x,this.y,this.width,this.height);

		$('#canvas_box #image_resize').css({'height':this.height,'top':this.y+'px','left':(this.x+this.width)+'px'});
		canvas.context.globalAlpha = 1;
	},

	//funkcja pomocnicza konwertująca dataURI na plik
	dataURItoBlob : function(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
	}

}

var data_input = {

	//pobieranie informacji z inputów i zapisanie do obiektu map_svg
	get : function(){
		map.name = $('#map_form input[name="name"]').val();
		map.path = $('#map_form textarea').val().replace(/"/g, "'");
		$('#map_contener').html( $('textarea[name=map_path]').val() );
	},

	//pobranie informacji z obiektu map_svg i zapisanie do inputów
	set : function(){
		$('#map_form input[name="name"]').val( map.name );
		$('#map_form textarea').val( map.path );
		$('#map_contener').html( $('textarea[name=map_path]').val() );
	}

}

//lista obiektów


/*
var canvas = new _canvas(); //obiekt canvasa
var crud = new _crud(); //obiekt canvasa
var image = new _image(); //obiekt zdjęcia od którego odrysowujemy mapy
var mouse = new _mouse();
var models = new _models();
var global = new _global(); //funkcje nie przypisany do innych obiektów
var categories = new _categories();
var pointers = new _pointers();
var colorpicker = new _colorpicker();
//var menu_top = new _menu_top();
var figures = new _figures();
*/

$(document).ready(function(){


	menu_top.get_maps();


	//zablokowanie możliwości zaznaczania buttonów podczas edycji pola
	$(document).on("focusin","input",function(){ menu_top.disable_select = true; });
	$(document).on("focusout","input",function(){ menu_top.disable_select = false; });


	$('#toolbar_top button.save').click(function(){ 

		//jeśli nie mamy zdefiniowanega hasha tworzymy nową mapę w przeciwnym wypadku aktualizujemy już istniejącą
		
		console.log('crud',crud.map_hash)

		if(typeof crud.map_hash == 'string'){
			
			crud.update_map();

		}
		else{
			
			crud.create_map();
		
		}

	});


	$('#toolbar_top button.delete').click(function(){ alert('delete'); });


	//odznaczenie selecta przy zmianie
	$('#change_category').change(function(){ $('#change_category').blur(); });

	//rejestracja zdarzenia w momencie pusczenia przycisku myszki
	$(document).mouseup(function(){ mouse.mouse_down = false; });

	//rejestracja zdarzenia w momencie wciśnięcia przycisku myszki
	$(document).mousedown(function(event){
	
		if (!event) {event = window.event;} //łata dla mozilli
		mouse.set_mouse_down(event);
	
	});

	//wywołanie funkcji podczas poruszania myszką
	$(document).mousemove(function(event){

		if (!event) {event = window.event;} //lata dla mozilli
		mouse.set_position(event); //zarejestrowanie pozycji myszki
		//jesli przycisk jest wciśnięty wykonujemy dodatkowe zdarzenia (przy ruszaniu myszką)
		if(mouse.mouse_down) mouse.mousemove(event);
		if(menu_top.auto_draw){ mouse.click_obj = "canvas"; mouse.mousemove(event);}
	
	});

	$('#main_canvas').mousedown(function(event){

		if (!event) {event = window.event;} //lata dla mozilli
		mouse.set_mouse_down(event);//zarejestrowanie obiektuw  który klikamy
		mouse.set_position(event); //zarejestrowanie pozycji myszki
		//jesli przycisk jest wciśnięty wykonujemy dodatkowe zdarzenia (przy ruszaniu myszką)
		mouse.mousemove(event);

	});

	$(document).mouseup(function(){

		pointers.last_column = null;	//kolumna pointera który został ostatnio zmieniony
		pointers.last_row = null;
		canvas.context_x = canvas.context_new_x;
		canvas.context_y = canvas.context_new_y;

	});

	//dodanie nowej kategorii
	$('#add_category').click(function(){
		categories.add();
	});

	//dodanie nowej kategorii (po wciśnięciu enter)
	$('input[name="add_category"]').keypress(function(e) {
    	if(e.which == 13) {
    		categories.add();
    	}
	});

	$(document).keypress(function(e) { menu_top.switch_mode( e.which ); });

	//zaktualizowanie kategorii
	$("#list").delegate("input","focusout", function() { categories.update($(this).attr('id_category') ,$(this).val() ); });
	$("#list").delegate("input","keypress", function(e) { if(e.which == 13) {categories.update($(this).attr('id_category') ,$(this).val() ); } });

	//usunięcie kategorii
	$("#list").delegate("button.remove","click", function() { categories.remove($(this).attr('id_category')); });

	//zaktualizowanie kategorii
	$("#list").delegate("input","click", function() { menu_top.mode_key = false;  });
	$("#list").delegate("input","focusout", function() { menu_top.mode_key = true;  });

	//pokazanie / ukrycie panelu kategorii
	$('#category_box h2, #pointer_box h2').click(function(event){ global.toogle_panel(event); });

	//obsługa buttonów do inkrementacji i dekrementacji inputów
	$('button.increment').click(function(){ models.button_increment( $(this) ) });
	$('button.decrement').click(function(){ models.button_decrement( $(this) ) });

	//obługa inputów pobranie danych i zapisanie do bazy
	$('.switch').click(function(){ models.update_from_switch( $(this) ); }); //przyciski switch
	$('.input_base').change(function(){ models.update_from_input( $(this) ); }); //tradycyjne inputy
	$('.input_base_text').change(function(){ models.update_from_input_text( $(this) ); }); //tradycyjne inputy
	$('.select_base').change(function(){ models.update_from_select( $(this) ); }); //listy rozwijane select

	$('#menu_top #increment_canvas').click(function(){ menu_top.increment_scale(); });
	$('#menu_top #decrement_canvas').click(function(){ menu_top.decrement_scale(); });
	$('#menu_top #add_image').click(function(){ menu_top.add_image(); });

	$('#menu_top #reset_canvas').click(function(){ canvas.set_default(); });

	//przypisanie podstawowowych danych do obiektu canvas
	canvas.canvas = document.getElementById('main_canvas');
  canvas.context = canvas.canvas.getContext('2d');
  canvas.width_canvas = parseInt( $('#main_canvas').attr('width') );
  canvas.height_canvas = parseInt( $('#main_canvas').attr('height') );
  var offset = $('#canvas_box').offset();
  canvas.offset_left = offset.left;
  canvas.offset_top = offset.top;

  //tworzymy tablice pointerów
	pointers.create_array();

  $('#canvas_info #width').val(canvas.width_canvas+'px');
	$('#canvas_info #height').val(canvas.height_canvas+'px');
  $('#canvas_box, #canvas_wrapper').css({'width': canvas.width_canvas + 'px','height':canvas.height_canvas + 'px'});
	$('#canvas_info #width,#canvas_info #height,#canvas_info #size').change(function(){menu_top.update_canvas_info()});

	$('#alpha_image').change(function(){ menu_top.change_alpha() });

	$('input').click(function(){ menu_top.mode_key = false; });
	$('input').focusout(function(){ menu_top.mode_key = true; });

	$(document).mouseup(function(){ canvas.draw(); });
	canvas.draw(); //rysowanie canvas

	//zapisujemy lub aktualizujemy mapę po kliknięciu w buttow w zależności od tego czy mamy zdefiniowane id mapy
	$('.menu_right .save').click(function(){
		if(crud.map_hash == null){ crud.create_map(); }
		else{ crud.update_map(); }
	});

	//usuwamy mapę po kliknięciu w button
	$('.menu_right .remove').click(function(){if(confirm("czy napewno usunąć mapę ?")){crud.delete_map();} });

});

//obiekt menu_top
menu_top = {

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

// pobieranie danych z selekta inputa switchy (aktualizacja obiektów) button inkrement i dekrement
var models = {

	button_increment : function(obj){

		var input_to_update = $(obj).attr('nameinput');
		var value = parseInt($('input[name="'+input_to_update+'"]').val()) + 1;

		$('input[name="'+input_to_update+'"]').val(value);
		this.update_from_input( $('input[name="'+input_to_update+'"]') );
	},

	button_decrement : function(obj){

		var input_to_update = $(obj).attr('nameinput');
		var value = parseInt($('input[name="'+input_to_update+'"]').val()) - 1;

		$('input[name="'+input_to_update+'"]').val(value);
		this.update_from_input( $('input[name="'+input_to_update+'"]') );
	},

	update_from_input : function(obj){
		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		window[name_class][name_method] = parseInt($(obj).val());
		canvas.draw();
	},

	update_from_input_text : function(obj){
		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		window[name_class][name_method] = $(obj).val();
		canvas.draw();
	},

	update_from_select : function(obj){
		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		window[name_class][name_method] = $(obj).find('option:selected').attr('name');
		canvas.draw();
	},

	update_from_switch : function(obj){

		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		if( $(obj).attr("value") == 'false' ){
			$(obj).attr("value",'true');
			$(obj).removeClass('switch-off');
			$(obj).addClass('switch-on');
			window[name_class][name_method] = true;
		}
		else{ //wyłączamy przełącznik
			$(obj).attr("value",'false');
			$(obj).removeClass('switch-on');
			$(obj).addClass('switch-off');
			window[name_class][name_method] = false;
		}
		canvas.draw();
	}
}

//obiekt myszki (do ogarniecia)
var mouse = {
	mouse_down : false,
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
	set_mouse_down : function(event){

		if (!event) {event = window.event;} //lata dla mozilli
		var obj = event.target;

		//jeśli element na który kliknięto ma atrybut nameclick przypisujemy go do obiektu myszki
		if(typeof($(event.target).attr('nameclick')) != "undefined"){
			this.click_obj = $(event.target).attr('nameclick');

			var position = $(obj).offset();
			this.offset_x = position.left;
			this.offset_y = position.top;
			this.padding_x = this.left - position.left;
			this.padding_y = this.top - position.top;
			mouse.mouse_down = true;

			this.tmp_mouse_x = image.x;
			this.tmp_mouse_y = image.y;
		}
	},

	set_position : function(event){
		this.left = event.pageX,
		this.top = event.pageY
	},

	//funkcja wykonywana podczas wciśniecia przyciksku myszki (w zależności od klikniętego elementu wykonujemy różne rzeczy)
	mousemove : function(){
		switch(this.click_obj){
			case 'right_resize':
				//rozszerzanie canvasa w prawo
				var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();
				var new_width = this.left - this.padding_x - position.left
				if(new_width < screen.width - 100)
				{
					canvas.resize_width(new_width);
				}
			break;

			case 'bottom_resize':
				//zmieniamy wysokość canvasa
				var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();
				canvas.resize_height(this.top - this.padding_y - position.top);
			break;

			case 'image_resize':

				if(image.obj !== undefined){

					var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();
					var x_actual = this.left - position.left;	//aktualna pozycja myszki
					var substract = image.x + image.width - x_actual + this.padding_x;
					var facor = image.width / image.height;

					if (image.width - substract > 100){
						image.width -= substract;
						image.height -= substract/facor;
						canvas.draw();
					}
				}
			break;

			case 'canvas':

				//przesuwanie zdjęciem (np. mapa / wzorzec)
				if((menu_top.move_image) && (image.obj !== undefined))
				{
					var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();

					var x_actual = this.left - position.left; //aktualna pozycja myszki
					var y_actual = this.top - position.top; // aktualna pozycja myszki

					var x_translate = x_actual - this.padding_x + mouse.tmp_mouse_x; //przesunięcie obrazka względem aktualnej pozycji myszki
					var y_translate = y_actual - this.padding_y + mouse.tmp_mouse_y; //przesuniecie obrazka względem aktualnej pozycji myszki

					var x_new = x_translate ;
					var y_new = y_translate ;

					image.x = x_new;
      				image.y = y_new;
      				canvas.draw();
				}

				//rysowanie
				else if ((!menu_top.move_image) && (!menu_top.move_canvas))
				{
					var row_click = parseInt( (this.top - canvas.offset_top + canvas.context_y*(-1) ) / ( (pointers.size_pointer + pointers.padding_y)*(canvas.scale / 100)  ) );
					var column_click = parseInt( (this.left - canvas.offset_left + canvas.context_x*(-1) ) / ( (pointers.size_pointer + pointers.padding_x)*(canvas.scale / 100) ) );

				//	console.log('klik',row_click,column_click,canvas.context_x,canvas.context_y);

					if((pointers.translate_modulo) && (row_click%2 ==0)){
						//column_click = parseInt( (this.left - canvas.offset_left - pointers.size_pointer/2) / ((pointers.size_pointer + pointers.padding_x)*(canvas.scale / 100))  );
						column_click = parseInt( (this.left - canvas.offset_left + canvas.context_x*(-1) - pointers.size_pointer/2) / ( (pointers.size_pointer + pointers.padding_x)*(canvas.scale / 100) ) );
					}

					if( (row_click >= 0) && (row_click < canvas.active_row) && (column_click >= 0) && (column_click < canvas.active_column) )
					{
						pointers.update_point(row_click,column_click,pointers.last_row,pointers.last_column);
						pointers.last_column = column_click;
						pointers.last_row = row_click;
						canvas.draw();
					}
					else{
						pointers.last_row = null;
						pointers.last_column = null;
					}
				}

				//przesuwanie całym canvasem
				else if(menu_top.move_canvas)
				{
					canvas.reset();
					canvas.clear();

					canvas.context_new_x = (mouse.left - mouse.offset_x) - mouse.padding_x + canvas.context_x;
					canvas.context_new_y = (mouse.top - mouse.offset_y) - mouse.padding_y + canvas.context_y;

					if(canvas.context_new_x > 0) canvas.context_new_x = 0;
					if(canvas.context_new_y > 0) canvas.context_new_y = 0;

					canvas.context.translate( ( canvas.context_new_x / (canvas.scale / 100) ),( canvas.context_new_y / (canvas.scale / 100) ));
					canvas.draw();
				}

			break;
		}
	}
}

//menu pointer
var pointers = {
	show_all_point : true,
	padding_x : 1,
	padding_y : 1,
	translate_modulo : false,
	size_pointer : 10,
	main_kind : 'square',
	kinds : Array('square','circle','hexagon','hexagon2'),

	pointers : Array(), //pointers.pointers[rzad][kolumna] : kategoria[numer]

	last_column : null,	//kolumna pointera który został ostatnio zmieniony
	last_row : null,	//wiersz pointera który został ostatnio zmieniony


	//rysowanie wszystkich punktów
	draw : function(){
		var width_pointer = this.size_pointer + this.padding_x;
		var height_pointer = this.size_pointer + this.padding_y;
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
						canvas.context.fillStyle = categories.category[ this.pointers[row][column] ][1];
					}
					catch(e){
						console.log('ERROR 39 LINE ! ',this.pointers[row][column],row,column);
					}
				}

				if( (row % 2 == 0) && (pointers.translate_modulo) ){
					window['figures'][this.main_kind]( column*width_pointer + width_pointer/2 , row*height_pointer , this.size_pointer);
				}
				else{
					window['figures'][this.main_kind]( column*width_pointer , row*height_pointer , this.size_pointer);
				}

			}
		}
	},

	//tworzymy tablice ponterów (jeśli jakiś ponter istnieje zostawiamy go, w przypadku gdy pointera nie ma tworzymy go na nowo)
	create_array : function(){
		canvas.active_row = parseInt( canvas.height_canvas / (pointers.size_pointer + pointers.padding_y) );
		canvas.active_column = parseInt( canvas.width_canvas / (pointers.size_pointer + pointers.padding_x) );

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjb2xvcl9waWNrZXIuanMiLCJjcnVkLmpzIiwiZmlndXJlcy5qcyIsImdsb2JhbC5qcyIsImltYWdlLmpzIiwiaW5wdXQuanMiLCJtYWluLmpzIiwibWVudV90b3AuanMiLCJtb2RlbHMuanMiLCJtb3VzZS5qcyIsInBvaW50ZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2N6eXN6Y3plbmllIGkgcnlzb3dhbmllIHBvIGNhbnZhc2llXG52YXIgY2FudmFzID0ge1xuXHRcblx0c2NhbGUgOiAxMDAsXG5cdHdpZHRoX2NhbnZhcyA6IDcwMCxcblx0aGVpZ2h0X2NhbnZhcyA6IDQwMCxcblx0Y2FudmFzIDogbnVsbCxcblx0Y29udGV4dCA6IG51bGwsXG5cdHRodW1ibmFpbCA6IG51bGwsXG5cdHRpdGxlX3Byb2plY3QgOiAnbm93eSBwcm9qZWt0JyxcblxuXHRjb250ZXh0X3ggOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF95IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB5XG5cdGNvbnRleHRfbmV3X3ggOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfbmV3X3kgOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB5XG5cblx0b2Zmc2V0X2xlZnQgOiBudWxsLFxuXHRvZmZzZXRfdG9wIDogbnVsbCxcblx0YWN0aXZlX3JvdyA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cdGFjdGl2ZV9jb2x1bW4gOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXG5cdHRodW1ibmFpbCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbl9jYW52YXNcIik7XG5cdFx0dmFyIGRhdGFVUkwgPSBjYW52YXMudG9EYXRhVVJMKCk7XG5cdFx0Y29uc29sZS5sb2coZGF0YVVSTCk7XG5cdH0sXG5cblx0Ly9yeXN1amVteSBjYW52YXMgemUgemRqxJljaWVtXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGlmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkgIGltYWdlLmRyYXcoKTtcblx0fSxcblxuXHRkcmF3X3RodW1uYWlsIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy50aHVtYm5haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdH0sXG5cblx0Ly9yZXNldHVqZW15IHTFgm8gemRqxJljaWFcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHR9LFxuXG5cdC8vIGN6ecWbY2lteSBjYcWCZSB6ZGrEmWNpZSBuYSBjYW52YXNpZVxuXHRjbGVhciA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0XHQvL3RoaXMuY29udGV4dC5maWxsUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0fSxcblxuXHRyZXNpemVfd2lkdGggOiBmdW5jdGlvbihuZXdfd2lkdGgpe1xuXHRcdHRoaXMud2lkdGhfY2FudmFzID0gbmV3X3dpZHRoO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyx0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IHRoaXMud2lkdGhfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwodGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlICsgJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0fSxcblxuXHRyZXNpemVfaGVpZ2h0IDogZnVuY3Rpb24obmV3X2hlaWdodCl7XG5cdFx0dGhpcy5oZWlnaHRfY2FudmFzID0gbmV3X2hlaWdodDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3MoeydoZWlnaHQnOiB0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwodGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSsnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpOyAvLyBha3R1YWxpenVqZW15IGRhbmUgb2Rub8WbbmllIHJvem1pYXLDs3cgY2FudmFzYSB3IG1lbnUgdSBnw7NyeVxuXHRcdC8vdGhpcy5kcmF3KCk7IC8vcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0fSxcblxuXHRzZXRfZGVmYXVsdCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cblx0XHRjYW52YXMuc2NhbGUgPSAxMDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3Qga2F0ZWdvcmlpIGRvZGFuaWUgLyBha3R1YWxpemFjamEgLyB1c3VuacSZY2llIC8gcG9rYXphbmllIGthdGVnb3JpaVxudmFyIGNhdGVnb3JpZXMgPSB7XG5cdGNhdGVnb3J5IDogbmV3IEFycmF5KFsncHVzdHknLCcjODA4MDgwJ10pLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWUgPSBBcnJheSgkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoKSwnI2ZmMDAwMCcpO1xuXHRcdCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgnJyk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2gobmFtZSk7XG5cdFx0bWVudV90b3AuY2F0ZWdvcnkgPSAodGhpcy5jYXRlZ29yeS5sZW5ndGgtMSk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbihpbmRleCxuYW1lKXtcblx0XHR0aGlzLmNhdGVnb3J5W2luZGV4XVswXSA9IG5hbWU7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbihpZCl7XG5cdFx0dmFyIHRoID0gdGhpcztcblxuXHRcdCQuZWFjaCh0aGlzLmNhdGVnb3J5LGZ1bmN0aW9uKGluZGV4LHZhbHVlKXtcblx0XHRcdGlmKGluZGV4ID49IGlkKXtcblx0XHRcdFx0dGguY2F0ZWdvcnlbaW5kZXhdID0gdGguY2F0ZWdvcnlbaW5kZXgrMV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IHBvaW50ZXJzLnBvaW50ZXJzLmxlbmd0aDsgcm93Kyspe1xuXHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBwb2ludGVycy5wb2ludGVyc1tyb3ddLmxlbmd0aDsgY29sdW1uKyspe1xuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gMDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA+IGlkKXtcblx0XHRcdFx0XHRwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSBwYXJzZUludChwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pIC0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5jYXRlZ29yeS5wb3AoKTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXG5cdFx0Ly9yeXN1amVteSBuYSBub3fEhSBjYW52YXNcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHNob3dfbGlzdCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgYWRkX2NhdGVnb3J5ID0gXCI8dGFibGU+XCI7XG5cdFx0Ly92YXIgYWRkX3NlbGVjdCA9JzxvcHRpb24gbmFtZT1cIjBcIj5wdXN0eTwvb3B0aW9uPic7XG5cdFx0dmFyIGFkZF9zZWxlY3QgPSAnJztcblxuXHRcdGZvcih2YXIgaSA9IHRoaXMuY2F0ZWdvcnkubGVuZ3RoOyBpID4gMTsgaS0tKXtcblx0XHRcdGFkZF9jYXRlZ29yeSArPSAnPHRyPjx0ZD48c3Bhbj4nKyhpLTEpKyc8L3NwYW4+PC90ZD48dGQ+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImNhdGVnb3J5X25hbWVcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiIHZhbHVlPVwiJyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnXCIgLz48L3RkPjx0ZD48ZGl2IGNsYXNzPVwiY29sb3JwaWNrZXJfYm94XCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMV0rJ1wiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+PC9kaXY+PC90ZD48dGQ+PGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+dXN1bjwvYnV0dG9uPjwvdGQ+PC90cj4nO1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiJysoaS0xKSsnXCI+Jyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cdFx0aWYobWVudV90b3AuY2F0ZWdvcnkgPT0gMCl7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIHNlbGVjdGVkIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiMFwiPicrdGhpcy5jYXRlZ29yeVswXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cblxuXHRcdGFkZF9jYXRlZ29yeSArPSBcIjwvdGFibGU+XCI7XG5cblx0XHQkKCcjY2F0ZWdvcnlfYm94ICNsaXN0JykuaHRtbChhZGRfY2F0ZWdvcnkpO1xuXHRcdCQoJ3NlbGVjdCNjaGFuZ2VfY2F0ZWdvcnknKS5odG1sKGFkZF9zZWxlY3QpO1xuXG5cdFx0Y29sb3JwaWNrZXIuYWRkKCk7XG5cdH1cbn1cbiIsIi8vc2FtYSBuYXp3YSB3aWVsZSB0xYJ1bWFjenkgcG8gcHJvc3R1IGNvbG9ycGlja2VyXG52YXIgY29sb3JwaWNrZXIgPSB7XG5cblx0Y2xpY2tfaWQgOiBudWxsLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5yZW1vdmUoKTtcblx0XHQkKCcuY29sb3JwaWNrZXJfYm94JykuQ29sb3JQaWNrZXIoe1xuXHRcdFx0Y29sb3I6ICcjZmYwMDAwJyxcblx0XHRcdG9uU2hvdzogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHRpZigkKGNvbHBrcikuY3NzKCdkaXNwbGF5Jyk9PSdub25lJyl7XG5cdFx0XHRcdFx0JChjb2xwa3IpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdGNvbG9ycGlja2VyLmNsaWNrX2lkID0gJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRvbkhpZGU6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0JChjb2xwa3IpLmZhZGVPdXQoMjAwKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uQ2hhbmdlOiBmdW5jdGlvbiAoaHNiLCBoZXgsIHJnYikge1xuXHRcdFx0XHQkKCcuY29sb3JwaWNrZXJfYm94W2lkX2NhdGVnb3J5PVwiJytjb2xvcnBpY2tlci5jbGlja19pZCsnXCJdJykuY3NzKCdiYWNrZ3JvdW5kQ29sb3InLCAnIycgKyBoZXgpO1xuXHRcdFx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5W2NvbG9ycGlja2VyLmNsaWNrX2lkXVsxXSA9ICcjJyArIGhleDtcblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbigpe1xuXHRcdCQoJy5jb2xvcnBpY2tlcicpLnJlbW92ZSgpO1xuXHR9XG59XG4iLCIvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgdHdvcnplbmllIHphcGlzeXdhbmllIGkgYWt0dWFsaXphY2plIGRhbnljaCBkb3R5Y3rEhcSHY3loIG1hcHlcbnZhciBjcnVkID0ge1xuXG5cdG1hcF9qc29uIDogQXJyYXkoKSwgLy9nxYLDs3duYSB6bWllbm5hIHByemVjaG93dWrEhWNhIHdzenlzdGtpZSBkYW5lXG5cdG1hcF9oYXNoIDogbnVsbCxcblxuXHRzZWxlY3RfbWFwIDogZnVuY3Rpb24oIGlkX21hcCApe1xuXG5cdFx0Ly9qZcWbbGkgdXJ1Y2hvbWlteVxuXHRcdGlmIChpZF9tYXAgPT0gJ25ld19tYXAnKSB7IFxuXHRcdFx0dGhpcy5jcmVhdGVfbWFwKCkgXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLm1hcF9oYXNoID0gaWRfbWFwO1xuXHRcdFx0dGhpcy5nZXRfbWFwKCk7XG5cdFx0fVxuXG5cdH0sXG5cblx0Ly9wb2JpZXJhbXkgZGFuZSB6IHBvcm9qZWt0dSBpIHphcGlzdWplbXkgamUgZG8ganNvbi1hXG5cdGdldF9kYXRhIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vemVydWplbXkgbmEgbm93byBjYcWCxIUgdGFibGljxJkgcG9pbnRlcsOzd1xuXHRcdHRoaXMubWFwX2pzb24gPSBBcnJheSgpO1xuXG5cdFx0Ly8gZGF0YVt4XSA9IHptaWVubmUgcG9kc3Rhd293ZSBkb3R5Y3rEhWNlIG1hcHlcblx0XHR0aGlzLm1hcF9qc29uWzBdID0gQXJyYXkoKTtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzBdID0gY2FudmFzLmhlaWdodF9jYW52YXM7XG5cdFx0dGhpcy5tYXBfanNvblswXVsxXSA9IGNhbnZhcy53aWR0aF9jYW52YXM7XG5cdFx0dGhpcy5tYXBfanNvblswXVsyXSA9IHBvaW50ZXJzLnBhZGRpbmdfeDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzNdID0gcG9pbnRlcnMucGFkZGluZ195O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNF0gPSBwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNV0gPSBwb2ludGVycy5zaXplX3BvaW50ZXI7XG5cdFx0dGhpcy5tYXBfanNvblswXVs2XSA9IHBvaW50ZXJzLm1haW5fa2luZDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzddID0gY2FudmFzLnRpdGxlX3Byb2plY3Q7XG5cblx0XHQvLyBkYXRhWzFdID0gdGFibGljYSBwdW5rdMOzdyAocG9pbnRlcnMucG9pbnRlcnMpIFt3aWVyc3pdW2tvbHVtbmFdID0gXCJub25lXCIgfHwgKG51bWVyIGthdGVnb3JpaSlcblx0XHR0aGlzLm1hcF9qc29uWzFdID0gcG9pbnRlcnMucG9pbnRlcnM7XG5cblx0XHQvLyBkYXRhWzJdID0gdGFibGljYSBrYXRlZ29yaWlcblx0XHR0aGlzLm1hcF9qc29uWzJdID0gY2F0ZWdvcmllcy5jYXRlZ29yeTtcblxuXHRcdC8vZGF0YVszXSA9IHRhYmxpY2Egd3pvcmNhICh6ZGrEmWNpYSB3IHRsZSBkbyBvZHJ5c293YW5pYSlcblx0XHR0aGlzLm1hcF9qc29uWzNdID0gQXJyYXkoKTtcblxuXHRcdGlmKGltYWdlLm9iail7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzBdID0gaW1hZ2Uub2JqLnNyYztcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMV0gPSBpbWFnZS54O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVsyXSA9IGltYWdlLnk7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzNdID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzRdID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs1XSA9IGltYWdlLmFscGhhO1xuXHRcdH1cblxuXHRcdC8va29ud2VydHVqZW15IG5hc3phIHRhYmxpY2UgbmEganNvblxuXHRcdGNvbnNvbGUubG9nKCdNQVAgXyBKU09OJywgdGhpcy5tYXBfanNvbiwgSlNPTi5zdHJpbmdpZnkoIHRoaXMubWFwX2pzb24gKSk7XG5cdFx0dGhpcy5tYXBfanNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWFwX2pzb24pO1xuXG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBtYXB5IHogYmF6eSBkYW55Y2hcblx0Z2V0X21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzO1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdCAgdXJsOiAnL2FwaS9tYXBzLycgKyB0aC5tYXBfaGFzaCxcblx0XHQgIFx0dHlwZTogXCJHRVRcIixcblx0XHQgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0XHR9KS5kb25lKGZ1bmN0aW9uKCBkYXRhICkge1xuXG5cdFx0XHRjb25zb2xlLmxvZyggZGF0YS5kYXRhWzBdICk7XG5cblx0XHRcdC8vcG8gemFwaXNhbml1IGRhbnljaCBkbyBiYXp5IGFrdHVhbGl6dWplbXkgaWQgKHcgcHJ6eXBhZGt1IGplxZtsaSBpc3RuaWVqZSBuYWRwaXN1amVteSBqZSlcblx0XHRcdHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YS5kYXRhWzBdLm1hcF9qc29uKTtcblxuXHRcdFx0Ly9wb2JpZXJhbXkgaSB3Y3p5dHVqZW15IGRhbmUgbyBjYW52YXNpZSBkbyBvYmlla3R1XG5cdFx0XHRjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHJlc3BvbnNlWzBdWzBdO1xuXHRcdFx0Y2FudmFzLndpZHRoX2NhbnZhcyA9IHJlc3BvbnNlWzBdWzFdO1xuXHRcdFx0cG9pbnRlcnMucGFkZGluZ194ID0gcmVzcG9uc2VbMF1bMl07XG5cdFx0XHRwb2ludGVycy5wYWRkaW5nX3kgPSByZXNwb25zZVswXVszXTtcblx0XHRcdHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8gPSByZXNwb25zZVswXVs0XTtcblx0XHRcdHBvaW50ZXJzLnNpemVfcG9pbnRlciA9IHJlc3BvbnNlWzBdWzVdO1xuXHRcdFx0cG9pbnRlcnMubWFpbl9raW5kID0gcmVzcG9uc2VbMF1bNl07XG5cdFx0XHRjYW52YXMudGl0bGVfcHJvamVjdCA9IHJlc3BvbnNlWzBdWzddO1xuXG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeFwiXScpLnZhbCggcmVzcG9uc2VbMF1bMl0gKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ195XCJdJykudmFsKCByZXNwb25zZVswXVszXSApO1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJzaXplX3BvaW50ZXJcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzVdICk7XG5cdFx0XHQkKCdpbnB1dFtuYW1lPVwidGl0bGVfcHJvamVjdFwiXScpLnZhbCggcmVzcG9uc2VbMF1bN10gKTtcblxuXHRcdFx0aWYoIHJlc3BvbnNlWzBdWzRdICl7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0fVxuXG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5odG1sKCcnKTtcblxuXHRcdFx0cG9pbnRlcnMua2luZHMuZm9yRWFjaChmdW5jdGlvbihraW5kKXtcblxuXHRcdFx0XHRpZihraW5kID09IHJlc3BvbnNlWzBdWzZdKXtcblx0XHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5hcHBlbmQoJzxvcHRpb24gc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5hcHBlbmQoJzxvcHRpb24gbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIHBvaW50ZXJhY2hcblx0XHRcdHBvaW50ZXJzLnBvaW50ZXJzID0gcmVzcG9uc2VbMV07XG5cblx0XHRcdC8vcG9iaWVyYW15IGRhbmUgbyBrYXRlZ29yaWFjaFxuXHRcdFx0Y2F0ZWdvcmllcy5jYXRlZ29yeSA9IHJlc3BvbnNlWzJdO1xuXG5cdFx0XHQvL3BvYmllcmFuaWUgZGFueWNoIG8gemRqxJljaXUgamXFvGVsaSBpc3RuaWVqZVxuXHRcdFx0aWYoIHJlc3BvbnNlWzNdLmxlbmd0aCA+IDIpe1xuXHRcdFx0XHRpbWFnZS5vYmogPSBuZXcgSW1hZ2UoKTtcblx0XHRcdFx0aW1hZ2Uub2JqLnNyYyA9IHJlc3BvbnNlWzNdWzBdO1xuXHRcdFx0XHRpbWFnZS54ID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzFdICk7XG5cdFx0XHRcdGltYWdlLnkgPSBwYXJzZUludCggcmVzcG9uc2VbM11bMl0gKTtcblx0XHRcdFx0aW1hZ2Uud2lkdGggPSBwYXJzZUludCggcmVzcG9uc2VbM11bM10gKTtcblx0XHRcdFx0aW1hZ2UuaGVpZ2h0ID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzRdICk7XG5cdFx0XHRcdGltYWdlLmFscGhhID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzVdICk7XG5cblx0XHRcdFx0Ly96YXpuYWN6ZW5pZSBvZHBvd2llZG5pZWdvIHNlbGVjdGEgYWxwaGEgdyBtZW51IHRvcFxuXHRcdFx0XHQkKCcjYWxwaGFfaW1hZ2Ugb3B0aW9uW25hbWU9XCInK1x0aW1hZ2UuYWxwaGEgKydcIl0nKS5hdHRyKCdzZWxlY3RlZCcsdHJ1ZSk7XG5cblx0XHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdC8vemFrdHVhbGl6b3dhbmllIGRhbnljaCB3IGlucHV0YWNoXG5cdFx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsIGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdFx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLCBjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnKTtcblx0XHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6Y2FudmFzLndpZHRoX2NhbnZhcysncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzKydweCd9KTtcblxuXHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGNhdGVnb3JpZXMuc2hvd19saXN0KCk7XG5cdFx0fSk7XG5cdH0sXG5cblx0Ly90d29yenlteSBub3fEhSBtYXDEmSBkYW55Y2hcblx0Y3JlYXRlX21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2FrdHVhbGl6dWplbXkganNvbmEgZG8gd3lzxYJhbmlhIGFqYXhlbVxuXHRcdHRoaXMuZ2V0X2RhdGEoKTtcblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXHRcdGNvbnNvbGUubG9nKCdjcmVhdGUnLHRoLm1hcF9qc29uKTtcblxuXHRcdC8vd3lzeXPFgmFteSBkYW5lIGFqYXhlbSBkbyBiYXp5IGRhbnljaFxuXHRcdC8vY2FudmFzLmRyYXdfdGh1bW5haWwoKTtcblx0XHQvL25ld19pbWFnZSA9IGltYWdlLmRhdGFVUkl0b0Jsb2IoIGNhbnZhcy50aHVtYm5haWwudG9EYXRhVVJMKCkgKTtcblx0XHQvL2NhbnZhcy5kcmF3KCk7XG5cblx0XHQvL3ZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiYWN0aW9uXCIsXHQnY3JlYXRlX21hcCcgKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9uYW1lXCIsIGNhbnZhcy50aXRsZV9wcm9qZWN0KTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9qc29uXCIsIHRoLm1hcF9qc29uKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9pbWFnZVwiLCBuZXdfaW1hZ2UpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiX21ldGhvZFwiLCAnUE9TVCcpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiX3Rva2VuXCIsIGNzcmZfdG9rZW4pO1xuXHRcdFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2pzb246IHRoLm1hcF9qc29uXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9tYXBzXCIsXG5cdFx0XHRkYXRhOiB7IG1hcF9qc29uOiB0aC5tYXBfanNvbiB9LFxuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHR0aC5tYXBfaGFzaCA9IHJlc3BvbnNlLmhhc2hfbWFwO1xuXHRcdFx0XHRhbGVydCgnemFwaXNhbm8gbm93xIUgbWFwxJknKTtcblx0XHRcdFx0bWVudV90b3AuZ2V0X21hcHMoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vYWt0dWFsaXp1amVteSBtYXDEmVxuXHR1cGRhdGVfbWFwIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5nZXRfZGF0YSgpO1xuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL2NhbnZhcy5kcmF3X3RodW1uYWlsKCk7XG5cdFx0Ly9uZXdfaW1hZ2UgPSBpbWFnZS5kYXRhVVJJdG9CbG9iKCBjYW52YXMudGh1bWJuYWlsLnRvRGF0YVVSTCgpICk7XG5cdC8qXG5cdFx0dmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX2hhc2hcIiwgdGgubWFwX2hhc2ggKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJtYXBfbmFtZVwiLCBjYW52YXMudGl0bGVfcHJvamVjdCk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX2pzb25cIiwgdGgubWFwX2pzb24pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9pbWFnZVwiLCBuZXdfaW1hZ2UpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIl9tZXRob2RcIiwgJ1BVVCcpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIl90b2tlblwiLCBjc3JmX3Rva2VuKTtcblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogYmFzaWNfdXJsICsgXCIvbWFwL1wiK3RoLm1hcF9oYXNoLFxuXHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHRjYWNoZTogZmFsc2UsXG5cdFx0XHRjb250ZW50VHlwZTogZmFsc2UsXG5cdFx0XHRwcm9jZXNzRGF0YTogZmFsc2UsXG5cdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIG1hcMSZJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdCovXG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdG1hcF9oYXNoOiB0aC5tYXBfaGFzaCxcblx0XHRcdG1hcF9qc29uOiB0aC5tYXBfanNvblxuXHRcdH1cblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogXCJhcGkvbWFwc1wiLFxuXHRcdFx0Ly9kYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcblx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHR0eXBlOiAnUFVUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIG1hcMSZJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXHQvL3VzdXdhbXkgbWFwxJkgeiBiYXp5IGRhbnljaFxuXHRkZWxldGVfbWFwIDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL3NwcmF3ZHphbXkgY3p5IG1hcGEgZG8gdXN1bmnEmWNpYSBwb3NpYWRhIHN3b2plIGlkXG5cdFx0aWYodGhpcy5tYXBfaGFzaCAhPSBudWxsKXtcblx0XHRcdCQucG9zdCggYmFzaWNfdXJsICsgXCIvbWFwL1wiICsgdGgubWFwX2hhc2gsIHtcblx0XHRcdFx0YWN0aW9uOiAnZGVsZXRlX21hcCcsXG5cdFx0XHRcdF9tZXRob2Q6ICdERUxFVEUnLFxuXHRcdFx0XHRfdG9rZW46IGNzcmZfdG9rZW4sXG5cdFx0XHRcdG1hcF9oYXNoOiB0aC5tYXBfaGFzaFxuXHRcdFx0fSlcblx0XHRcdC5kb25lKGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblx0XHRcdFx0cmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9IFwiT0tcIikge1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGJhc2ljX3VybCArXCIvbWFwXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoJ2LFgsSFZCBwb2RjemFzIHVzdXdhbmlhIG1hcHknKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhbGVydCgnYnJhayBoYXNoYSAtIG1hcGEgbmllIGplc3QgemFwaXNhbmEnKTtcblx0XHR9XG5cdH1cbn1cbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cblx0fVxufVxuIiwiLy9mdW5rY2plIGdsb2JhbG5lIGtvbnRlbmVyIG5hIHdzenlzdGtvIGkgbmljIDspXG52YXIgZ2xvYmFsID0ge1xuXHR0b29nbGVfcGFuZWwgIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0a2EgZGxhIG1vemlsbGlcblx0XHRpZiggJChldmVudC50YXJnZXQpLnBhcmVudCgpLmNzcygncmlnaHQnKSA9PSAnMHB4JyApe1xuXHRcdFx0JChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe3JpZ2h0OiBbLSQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS53aWR0aCgpLTIwLFwiZWFzZU91dEJvdW5jZVwiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBlbHNle1xuICAgIFx0ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtyaWdodDogW1wiMHB4XCIsXCJlYXNlT3V0Qm91bmNlXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXHR9XG59XG4iLCIvL2fFgsOzd25lIHpkasSZY2llIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG52YXIgaW1hZ2UgPSB7XG5cdG9iaiA6IHVuZGVmaW5lZCxcblx0eCA6IG51bGwsXG5cdHkgOiBudWxsLFxuXHR3aWR0aCA6IG51bGwsXG5cdGhlaWdodCA6IG51bGwsXG5cdGFscGhhIDogMTAsXG5cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhLzEwO1xuXHRcdGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLm9iaix0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpO1xuXG5cdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmNzcyh7J2hlaWdodCc6dGhpcy5oZWlnaHQsJ3RvcCc6dGhpcy55KydweCcsJ2xlZnQnOih0aGlzLngrdGhpcy53aWR0aCkrJ3B4J30pO1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcblx0fSxcblxuXHQvL2Z1bmtjamEgcG9tb2NuaWN6YSBrb253ZXJ0dWrEhWNhIGRhdGFVUkkgbmEgcGxpa1xuXHRkYXRhVVJJdG9CbG9iIDogZnVuY3Rpb24oZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheS5wdXNoKGJpbmFyeS5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7dHlwZTogJ2ltYWdlL3BuZyd9KTtcblx0fVxuXG59XG4iLCJ2YXIgZGF0YV9pbnB1dCA9IHtcblxuXHQvL3BvYmllcmFuaWUgaW5mb3JtYWNqaSB6IGlucHV0w7N3IGkgemFwaXNhbmllIGRvIG9iaWVrdHUgbWFwX3N2Z1xuXHRnZXQgOiBmdW5jdGlvbigpe1xuXHRcdG1hcC5uYW1lID0gJCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCk7XG5cdFx0bWFwLnBhdGggPSAkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoKS5yZXBsYWNlKC9cIi9nLCBcIidcIik7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fSxcblxuXHQvL3BvYnJhbmllIGluZm9ybWFjamkgeiBvYmlla3R1IG1hcF9zdmcgaSB6YXBpc2FuaWUgZG8gaW5wdXTDs3dcblx0c2V0IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoIG1hcC5uYW1lICk7XG5cdFx0JCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCBtYXAucGF0aCApO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH1cblxufVxuIiwiLy9saXN0YSBvYmlla3TDs3dcblxuXG4vKlxudmFyIGNhbnZhcyA9IG5ldyBfY2FudmFzKCk7IC8vb2JpZWt0IGNhbnZhc2FcbnZhciBjcnVkID0gbmV3IF9jcnVkKCk7IC8vb2JpZWt0IGNhbnZhc2FcbnZhciBpbWFnZSA9IG5ldyBfaW1hZ2UoKTsgLy9vYmlla3QgemRqxJljaWEgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbnZhciBtb3VzZSA9IG5ldyBfbW91c2UoKTtcbnZhciBtb2RlbHMgPSBuZXcgX21vZGVscygpO1xudmFyIGdsb2JhbCA9IG5ldyBfZ2xvYmFsKCk7IC8vZnVua2NqZSBuaWUgcHJ6eXBpc2FueSBkbyBpbm55Y2ggb2JpZWt0w7N3XG52YXIgY2F0ZWdvcmllcyA9IG5ldyBfY2F0ZWdvcmllcygpO1xudmFyIHBvaW50ZXJzID0gbmV3IF9wb2ludGVycygpO1xudmFyIGNvbG9ycGlja2VyID0gbmV3IF9jb2xvcnBpY2tlcigpO1xuLy92YXIgbWVudV90b3AgPSBuZXcgX21lbnVfdG9wKCk7XG52YXIgZmlndXJlcyA9IG5ldyBfZmlndXJlcygpO1xuKi9cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXG5cdG1lbnVfdG9wLmdldF9tYXBzKCk7XG5cblxuXHQvL3phYmxva293YW5pZSBtb8W8bGl3b8WbY2kgemF6bmFjemFuaWEgYnV0dG9uw7N3IHBvZGN6YXMgZWR5Y2ppIHBvbGFcblx0JChkb2N1bWVudCkub24oXCJmb2N1c2luXCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gdHJ1ZTsgfSk7XG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNvdXRcIixcImlucHV0XCIsZnVuY3Rpb24oKXsgbWVudV90b3AuZGlzYWJsZV9zZWxlY3QgPSBmYWxzZTsgfSk7XG5cblxuXHQkKCcjdG9vbGJhcl90b3AgYnV0dG9uLnNhdmUnKS5jbGljayhmdW5jdGlvbigpeyBcblxuXHRcdC8vamXFm2xpIG5pZSBtYW15IHpkZWZpbmlvd2FuZWdhIGhhc2hhIHR3b3J6eW15IG5vd8SFIG1hcMSZIHcgcHJ6ZWNpd255bSB3eXBhZGt1IGFrdHVhbGl6dWplbXkganXFvCBpc3RuaWVqxIVjxIVcblx0XHRcblx0XHRjb25zb2xlLmxvZygnY3J1ZCcsY3J1ZC5tYXBfaGFzaClcblxuXHRcdGlmKHR5cGVvZiBjcnVkLm1hcF9oYXNoID09ICdzdHJpbmcnKXtcblx0XHRcdFxuXHRcdFx0Y3J1ZC51cGRhdGVfbWFwKCk7XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdFxuXHRcdFx0Y3J1ZC5jcmVhdGVfbWFwKCk7XG5cdFx0XG5cdFx0fVxuXG5cdH0pO1xuXG5cblx0JCgnI3Rvb2xiYXJfdG9wIGJ1dHRvbi5kZWxldGUnKS5jbGljayhmdW5jdGlvbigpeyBhbGVydCgnZGVsZXRlJyk7IH0pO1xuXG5cblx0Ly9vZHpuYWN6ZW5pZSBzZWxlY3RhIHByenkgem1pYW5pZVxuXHQkKCcjY2hhbmdlX2NhdGVnb3J5JykuY2hhbmdlKGZ1bmN0aW9uKCl7ICQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5ibHVyKCk7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgcHVzY3plbmlhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpeyBtb3VzZS5tb3VzZV9kb3duID0gZmFsc2U7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgd2NpxZtuacSZY2lhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblx0XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy/FgmF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTtcblx0XG5cdH0pO1xuXG5cdC8vd3l3b8WCYW5pZSBmdW5rY2ppIHBvZGN6YXMgcG9ydXN6YW5pYSBteXN6a8SFXG5cdCQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRpZihtb3VzZS5tb3VzZV9kb3duKSBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXHRcdGlmKG1lbnVfdG9wLmF1dG9fZHJhdyl7IG1vdXNlLmNsaWNrX29iaiA9IFwiY2FudmFzXCI7IG1vdXNlLm1vdXNlbW92ZShldmVudCk7fVxuXHRcblx0fSk7XG5cblx0JCgnI21haW5fY2FudmFzJykubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTsvL3phcmVqZXN0cm93YW5pZSBvYmlla3R1dyAga3TDs3J5IGtsaWthbXlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXtcblxuXHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0XHRwb2ludGVycy5sYXN0X3JvdyA9IG51bGw7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IGNhbnZhcy5jb250ZXh0X25ld194O1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSBjYW52YXMuY29udGV4dF9uZXdfeTtcblxuXHR9KTtcblxuXHQvL2RvZGFuaWUgbm93ZWoga2F0ZWdvcmlpXG5cdCQoJyNhZGRfY2F0ZWdvcnknKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdGNhdGVnb3JpZXMuYWRkKCk7XG5cdH0pO1xuXG5cdC8vZG9kYW5pZSBub3dlaiBrYXRlZ29yaWkgKHBvIHdjacWbbmnEmWNpdSBlbnRlcilcblx0JCgnaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHtcbiAgICBcdGlmKGUud2hpY2ggPT0gMTMpIHtcbiAgICBcdFx0Y2F0ZWdvcmllcy5hZGQoKTtcbiAgICBcdH1cblx0fSk7XG5cblx0JChkb2N1bWVudCkua2V5cHJlc3MoZnVuY3Rpb24oZSkgeyBtZW51X3RvcC5zd2l0Y2hfbW9kZSggZS53aGljaCApOyB9KTtcblxuXHQvL3pha3R1YWxpem93YW5pZSBrYXRlZ29yaWlcblx0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImZvY3Vzb3V0XCIsIGZ1bmN0aW9uKCkgeyBjYXRlZ29yaWVzLnVwZGF0ZSgkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5JykgLCQodGhpcykudmFsKCkgKTsgfSk7XG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihlKSB7IGlmKGUud2hpY2ggPT0gMTMpIHtjYXRlZ29yaWVzLnVwZGF0ZSgkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5JykgLCQodGhpcykudmFsKCkgKTsgfSB9KTtcblxuXHQvL3VzdW5pxJljaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImJ1dHRvbi5yZW1vdmVcIixcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBjYXRlZ29yaWVzLnJlbW92ZSgkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5JykpOyB9KTtcblxuXHQvL3pha3R1YWxpem93YW5pZSBrYXRlZ29yaWlcblx0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyAgfSk7XG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJmb2N1c291dFwiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSB0cnVlOyAgfSk7XG5cblx0Ly9wb2themFuaWUgLyB1a3J5Y2llIHBhbmVsdSBrYXRlZ29yaWlcblx0JCgnI2NhdGVnb3J5X2JveCBoMiwgI3BvaW50ZXJfYm94IGgyJykuY2xpY2soZnVuY3Rpb24oZXZlbnQpeyBnbG9iYWwudG9vZ2xlX3BhbmVsKGV2ZW50KTsgfSk7XG5cblx0Ly9vYnPFgnVnYSBidXR0b27Ds3cgZG8gaW5rcmVtZW50YWNqaSBpIGRla3JlbWVudGFjamkgaW5wdXTDs3dcblx0JCgnYnV0dG9uLmluY3JlbWVudCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy5idXR0b25faW5jcmVtZW50KCAkKHRoaXMpICkgfSk7XG5cdCQoJ2J1dHRvbi5kZWNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2RlY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXG5cdC8vb2LFgnVnYSBpbnB1dMOzdyBwb2JyYW5pZSBkYW55Y2ggaSB6YXBpc2FuaWUgZG8gYmF6eVxuXHQkKCcuc3dpdGNoJykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3N3aXRjaCggJCh0aGlzKSApOyB9KTsgLy9wcnp5Y2lza2kgc3dpdGNoXG5cdCQoJy5pbnB1dF9iYXNlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9pbnB1dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuaW5wdXRfYmFzZV90ZXh0JykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9pbnB1dF90ZXh0KCAkKHRoaXMpICk7IH0pOyAvL3RyYWR5Y3lqbmUgaW5wdXR5XG5cdCQoJy5zZWxlY3RfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21fc2VsZWN0KCAkKHRoaXMpICk7IH0pOyAvL2xpc3R5IHJvendpamFuZSBzZWxlY3RcblxuXHQkKCcjbWVudV90b3AgI2luY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5pbmNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjZGVjcmVtZW50X2NhbnZhcycpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRlY3JlbWVudF9zY2FsZSgpOyB9KTtcblx0JCgnI21lbnVfdG9wICNhZGRfaW1hZ2UnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5hZGRfaW1hZ2UoKTsgfSk7XG5cblx0JCgnI21lbnVfdG9wICNyZXNldF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBjYW52YXMuc2V0X2RlZmF1bHQoKTsgfSk7XG5cblx0Ly9wcnp5cGlzYW5pZSBwb2RzdGF3b3dvd3ljaCBkYW55Y2ggZG8gb2JpZWt0dSBjYW52YXNcblx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuICBjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcpICk7XG4gIGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcGFyc2VJbnQoICQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcpICk7XG4gIHZhciBvZmZzZXQgPSAkKCcjY2FudmFzX2JveCcpLm9mZnNldCgpO1xuICBjYW52YXMub2Zmc2V0X2xlZnQgPSBvZmZzZXQubGVmdDtcbiAgY2FudmFzLm9mZnNldF90b3AgPSBvZmZzZXQudG9wO1xuXG4gIC8vdHdvcnp5bXkgdGFibGljZSBwb2ludGVyw7N3XG5cdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXG4gICQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoY2FudmFzLndpZHRoX2NhbnZhcysncHgnKTtcblx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG4gICQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHQkKCcjY2FudmFzX2luZm8gI3dpZHRoLCNjYW52YXNfaW5mbyAjaGVpZ2h0LCNjYW52YXNfaW5mbyAjc2l6ZScpLmNoYW5nZShmdW5jdGlvbigpe21lbnVfdG9wLnVwZGF0ZV9jYW52YXNfaW5mbygpfSk7XG5cblx0JCgnI2FscGhhX2ltYWdlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9hbHBoYSgpIH0pO1xuXG5cdCQoJ2lucHV0JykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgfSk7XG5cdCQoJ2lucHV0JykuZm9jdXNvdXQoZnVuY3Rpb24oKXsgbWVudV90b3AubW9kZV9rZXkgPSB0cnVlOyB9KTtcblxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IGNhbnZhcy5kcmF3KCk7IH0pO1xuXHRjYW52YXMuZHJhdygpOyAvL3J5c293YW5pZSBjYW52YXNcblxuXHQvL3phcGlzdWplbXkgbHViIGFrdHVhbGl6dWplbXkgbWFwxJkgcG8ga2xpa25pxJljaXUgdyBidXR0b3cgdyB6YWxlxbxub8WbY2kgb2QgdGVnbyBjenkgbWFteSB6ZGVmaW5pb3dhbmUgaWQgbWFweVxuXHQkKCcubWVudV9yaWdodCAuc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0aWYoY3J1ZC5tYXBfaGFzaCA9PSBudWxsKXsgY3J1ZC5jcmVhdGVfbWFwKCk7IH1cblx0XHRlbHNleyBjcnVkLnVwZGF0ZV9tYXAoKTsgfVxuXHR9KTtcblxuXHQvL3VzdXdhbXkgbWFwxJkgcG8ga2xpa25pxJljaXUgdyBidXR0b25cblx0JCgnLm1lbnVfcmlnaHQgLnJlbW92ZScpLmNsaWNrKGZ1bmN0aW9uKCl7aWYoY29uZmlybShcImN6eSBuYXBld25vIHVzdW7EhcSHIG1hcMSZID9cIikpe2NydWQuZGVsZXRlX21hcCgpO30gfSk7XG5cbn0pO1xuIiwiLy9vYmlla3QgbWVudV90b3Bcbm1lbnVfdG9wID0ge1xuXG5cdG1vdmVfaW1hZ2UgOiBmYWxzZSxcblx0bW92ZV9jYW52YXMgOiBmYWxzZSxcblx0YXV0b19kcmF3IDogZmFsc2UsXG5cdG1vZGVfa2V5IDogdHJ1ZSxcblx0Y2F0ZWdvcnkgOiAwLFxuXHRkaXNhYmxlX3NlbGVjdCA6IGZhbHNlLFxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X21hcHMgOiBmdW5jdGlvbigpe1xuXHRcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvbWFwcycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgbWFwIHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICcnO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXBzJykuYXBwZW5kKCBhZGRfaHRtbCApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0XHQvL2RvZGFqZW11IHpkYXJ6ZW5pZSBjaGFuZ2UgbWFwXG5cdFx0JCgnLnNlbGVjdF9tYXBzJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcblx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd8SFIG1hcMSZID8nKSkge1xuXHRcdFx0XG5cdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19tYXAnICl7XG5cdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRjcnVkLnNlbGVjdF9tYXAoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcblx0XHR9KTtcblxuXHR9LFxuXG5cdHVwZGF0ZV9jYW52YXNfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLnNjYWxlID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCgpICk7XG5cdFx0Y2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCkgKTtcblx0XHRjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCgpICk7XG5cblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoIGNhbnZhcy5zY2FsZSArICclJyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoIGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnICk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoIGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4JyApO1xuXG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCAjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRjaGFuZ2VfYWxwaGEgOiBmdW5jdGlvbigpe1xuXHRcdGltYWdlLmFscGhhID0gJCgnI2FscGhhX2ltYWdlJykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0YWRkX2ltYWdlIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vamVzbGkgcG9kYW55IHBhcmFtZXRyIG5pZSBqZXN0IHB1c3R5XG5cdFx0dmFyIHNyY19pbWFnZSA9IHByb21wdChcIlBvZGFqIMWbY2llxbxrxJkgZG8gemRqxJljaWE6IFwiKTtcblxuXHRcdGlmKHNyY19pbWFnZSl7XG5cdFx0XHRpZihzcmNfaW1hZ2UubGVuZ3RoID4gMCl7XG5cblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cblx0XHRcdFx0Ly93Y3p5dGFuaWUgemRqxJljaWE6XG5cdFx0XHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdGltYWdlLndpZHRoID0gaW1hZ2Uub2JqLndpZHRoO1xuXHQgICAgXHRcdGltYWdlLmhlaWdodCA9IGltYWdlLm9iai5oZWlnaHQ7XG5cdCAgICBcdFx0aW1hZ2UuZHJhdygpO1xuXHQgIFx0XHR9O1xuXG5cdFx0XHQgIGltYWdlLnggPSAwO1xuXHRcdFx0ICBpbWFnZS55ID0gMDtcblx0XHRcdCAgaW1hZ2Uub2JqLnNyYyA9IHNyY19pbWFnZTtcblx0XHRcdFx0Ly9zaW1hZ2Uub2JqLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNob3dfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHBhcnNlSW50KGNhbnZhcy5zY2FsZSkgKyAnJScpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwocGFyc2VJbnQoY2FudmFzLndpZHRoX2NhbnZhcykgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbChwYXJzZUludChjYW52YXMuaGVpZ2h0X2NhbnZhcykgKyAncHgnKTtcblx0fSxcblxuXHRpbmNyZW1lbnRfc2NhbGUgOiBmdW5jdGlvbigpe1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLnNjYWxlKz01O1xuXG5cdFx0aWYoY2FudmFzLnNjYWxlID09IDEwMCl7XG5cdFx0XHQkKCcjY2FudmFzX2JveCAjcmlnaHRfcmVzaXplLCAjY2FudmFzX2JveCAjYm90dG9tX3Jlc2l6ZScpLmZhZGVJbig1MDApO1xuXHRcdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlT3V0KDUwMCk7XG5cdFx0XHQkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZU91dCgwKTtcblx0XHR9XG5cblx0XHR2YXIgbmV3X3dpZHRoID0gY2FudmFzLndpZHRoX2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHR2YXIgbmV3X2hlaWdodCA9IGNhbnZhcy5oZWlnaHRfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCc6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JyA6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cblx0XHRjYW52YXMuY29udGV4dC5zY2FsZSggY2FudmFzLnNjYWxlIC8gMTAwICwgY2FudmFzLnNjYWxlIC8gMTAwICk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXG5cdFx0dGhpcy5zaG93X2luZm8oKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGRlY3JlbWVudF9zY2FsZSA6IGZ1bmN0aW9uKCl7XG5cdFx0aWYoY2FudmFzLnNjYWxlID4gMTAwKXtcblx0XHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdFx0Y2FudmFzLnNjYWxlIC09IDU7XG5cblx0XHRcdGlmKGNhbnZhcy5zY2FsZSA9PSAxMDApe1xuXHRcdFx0XHQkKCcjY2FudmFzX2JveCAjcmlnaHRfcmVzaXplLCAjY2FudmFzX2JveCAjYm90dG9tX3Jlc2l6ZScpLmZhZGVJbig1MDApO1xuXHRcdFx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHQkKCcjY2FudmFzX2JveCAjcmlnaHRfcmVzaXplLCAjY2FudmFzX2JveCAjYm90dG9tX3Jlc2l6ZScpLmZhZGVPdXQoNTAwKTtcblx0XHRcdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmZhZGVPdXQoMCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCc6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cdFx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHRcdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXG5cdFx0XHR0aGlzLnNob3dfaW5mbygpO1xuXHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHR9XG5cdH0sXG5cblx0c3dpdGNoX21vZGUgOiBmdW5jdGlvbihrZXkpe1xuXHRcdGlmKCF0aGlzLmRpc2FibGVfc2VsZWN0KXtcblx0XHRcdGlmKHRoaXMubW9kZV9rZXkpe1xuXHRcdFx0XHRzd2l0Y2goa2V5KXtcblxuXHRcdFx0XHRcdGNhc2UgMTA1OiAvL3BvcnVzemFuaWUgemRqxJljaWVtXG5cdFx0XHRcdFx0XHRpZihpbWFnZS5vYmope1xuXHRcdFx0XHRcdFx0XHRpZih0aGlzLm1vdmVfaW1hZ2Upe1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMubW92ZV9pbWFnZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9pbWFnZScpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0XHQkKCcjY2FudmFzX3dyYXBwZXIgI2ltYWdlX3Jlc2l6ZScpLmhpZGUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMubW92ZV9pbWFnZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5hdXRvX2RyYXcgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfY2FudmFzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNtb3ZlX2ltYWdlJykuY3NzKCdiYWNrZ3JvdW5kJywnIzM0YTgxYycpO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjYXV0b19kcmF3JykuY3NzKCdiYWNrZ3JvdW5kJywnI2FhYScpO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9jYW52YXMnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHRcdFx0JCgnI2NhbnZhc193cmFwcGVyICNpbWFnZV9yZXNpemUnKS5zaG93KCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgMTAwOiAvL3J5c293YW5pZSBiZXogd2Npc25pxJljaWEgcHJ6eWNpc2t1XG5cblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcblxuXHRcdFx0XHRcdFx0aWYodGhpcy5hdXRvX2RyYXcpe1xuXHRcdFx0XHRcdFx0XHR0aGlzLmF1dG9fZHJhdyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I2F1dG9fZHJhdycpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdHRoaXMuYXV0b19kcmF3ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2NhbnZhcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfaW1hZ2UgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNtb3ZlX2NhbnZhcycpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNtb3ZlX2ltYWdlJykuY3NzKCdiYWNrZ3JvdW5kJywnI2FhYScpO1xuXHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I2F1dG9fZHJhdycpLmNzcygnYmFja2dyb3VuZCcsJyMzNGE4MWMnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgOTk6IC8vcG9ydXN6YW5pZSBjYcWCeW0gY2FudmFzZW1cblx0XHRcdFx0XHRcdGlmKHRoaXMubW92ZV9jYW52YXMpe1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfY2FudmFzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9jYW52YXMnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfY2FudmFzID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2ltYWdlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdHRoaXMuYXV0b19kcmF3ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9jYW52YXMnKS5jc3MoJ2JhY2tncm91bmQnLCcjMzRhODFjJyk7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9pbWFnZScpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNhdXRvX2RyYXcnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIi8vIHBvYmllcmFuaWUgZGFueWNoIHogc2VsZWt0YSBpbnB1dGEgc3dpdGNoeSAoYWt0dWFsaXphY2phIG9iaWVrdMOzdykgYnV0dG9uIGlua3JlbWVudCBpIGRla3JlbWVudFxudmFyIG1vZGVscyA9IHtcblxuXHRidXR0b25faW5jcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgKyAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHRidXR0b25fZGVjcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgLSAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBwYXJzZUludCgkKG9iaikudmFsKCkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21faW5wdXRfdGV4dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikudmFsKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9zZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gJChvYmopLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3N3aXRjaCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0aWYoICQob2JqKS5hdHRyKFwidmFsdWVcIikgPT0gJ2ZhbHNlJyApe1xuXHRcdFx0JChvYmopLmF0dHIoXCJ2YWx1ZVwiLCd0cnVlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQob2JqKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZXsgLy93ecWCxIVjemFteSBwcnplxYLEhWN6bmlrXG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ2ZhbHNlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IG15c3praSAoZG8gb2dhcm5pZWNpYSlcbnZhciBtb3VzZSA9IHtcblx0bW91c2VfZG93biA6IGZhbHNlLFxuXHRjbGlja19vYmogOiBudWxsLFxuXG5cdHRtcF9tb3VzZV94IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblx0dG1wX21vdXNlX3kgOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXG5cdGxlZnQgOiBudWxsLCAvL3BvenljamEgeCBteXN6a2lcblx0dG9wIDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpXG5cdHBhZGRpbmdfeCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRwYWRkaW5nX3kgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0b2Zmc2V0X3ggOiBudWxsLCAvL29mZnNldCB4IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cdG9mZnNldF95IDogbnVsbCwgLy9vZmZzZXQgeSBvYmlla3R1IGtsaWtuacSZdGVnb1xuXG5cdC8vZnVuY2tqYSB3eWtyeXdhasSFY2EgdyBjbyBrbGlrbmnEmXRvIHBvYmllcmFqxIVjYSBwYWRkaW5nIGtsaWtuacSZY2lhIG9yYXogemFwaXN1asSFY2Ega2xpa25pxJljaWVcblx0c2V0X21vdXNlX2Rvd24gOiBmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHR2YXIgb2JqID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0Ly9qZcWbbGkgZWxlbWVudCBuYSBrdMOzcnkga2xpa25pxJl0byBtYSBhdHJ5YnV0IG5hbWVjbGljayBwcnp5cGlzdWplbXkgZ28gZG8gb2JpZWt0dSBteXN6a2lcblx0XHRpZih0eXBlb2YoJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdHRoaXMuY2xpY2tfb2JqID0gJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpO1xuXG5cdFx0XHR2YXIgcG9zaXRpb24gPSAkKG9iaikub2Zmc2V0KCk7XG5cdFx0XHR0aGlzLm9mZnNldF94ID0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMub2Zmc2V0X3kgPSBwb3NpdGlvbi50b3A7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeSA9IHRoaXMudG9wIC0gcG9zaXRpb24udG9wO1xuXHRcdFx0bW91c2UubW91c2VfZG93biA9IHRydWU7XG5cblx0XHRcdHRoaXMudG1wX21vdXNlX3ggPSBpbWFnZS54O1xuXHRcdFx0dGhpcy50bXBfbW91c2VfeSA9IGltYWdlLnk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR0aGlzLmxlZnQgPSBldmVudC5wYWdlWCxcblx0XHR0aGlzLnRvcCA9IGV2ZW50LnBhZ2VZXG5cdH0sXG5cblx0Ly9mdW5rY2phIHd5a29ueXdhbmEgcG9kY3phcyB3Y2nFm25pZWNpYSBwcnp5Y2lrc2t1IG15c3praSAodyB6YWxlxbxub8WbY2kgb2Qga2xpa25pxJl0ZWdvIGVsZW1lbnR1IHd5a29udWplbXkgcsOzxbxuZSByemVjenkpXG5cdG1vdXNlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0c3dpdGNoKHRoaXMuY2xpY2tfb2JqKXtcblx0XHRcdGNhc2UgJ3JpZ2h0X3Jlc2l6ZSc6XG5cdFx0XHRcdC8vcm96c3plcnphbmllIGNhbnZhc2EgdyBwcmF3b1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdHZhciBuZXdfd2lkdGggPSB0aGlzLmxlZnQgLSB0aGlzLnBhZGRpbmdfeCAtIHBvc2l0aW9uLmxlZnRcblx0XHRcdFx0aWYobmV3X3dpZHRoIDwgc2NyZWVuLndpZHRoIC0gMTAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2l6ZV93aWR0aChuZXdfd2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYm90dG9tX3Jlc2l6ZSc6XG5cdFx0XHRcdC8vem1pZW5pYW15IHd5c29rb8WbxIcgY2FudmFzYVxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdGNhbnZhcy5yZXNpemVfaGVpZ2h0KHRoaXMudG9wIC0gdGhpcy5wYWRkaW5nX3kgLSBwb3NpdGlvbi50b3ApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2ltYWdlX3Jlc2l6ZSc6XG5cblx0XHRcdFx0aWYoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XHQvL2FrdHVhbG5hIHBvenljamEgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHN1YnN0cmFjdCA9IGltYWdlLnggKyBpbWFnZS53aWR0aCAtIHhfYWN0dWFsICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0XHRcdFx0dmFyIGZhY29yID0gaW1hZ2Uud2lkdGggLyBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdFx0XHRpZiAoaW1hZ2Uud2lkdGggLSBzdWJzdHJhY3QgPiAxMDApe1xuXHRcdFx0XHRcdFx0aW1hZ2Uud2lkdGggLT0gc3Vic3RyYWN0O1xuXHRcdFx0XHRcdFx0aW1hZ2UuaGVpZ2h0IC09IHN1YnN0cmFjdC9mYWNvcjtcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnY2FudmFzJzpcblxuXHRcdFx0XHQvL3ByemVzdXdhbmllIHpkasSZY2llbSAobnAuIG1hcGEgLyB3em9yemVjKVxuXHRcdFx0XHRpZigobWVudV90b3AubW92ZV9pbWFnZSkgJiYgKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblxuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7IC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgeV9hY3R1YWwgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDsgLy8gYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblxuXHRcdFx0XHRcdHZhciB4X3RyYW5zbGF0ZSA9IHhfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3ggKyBtb3VzZS50bXBfbW91c2VfeDsgLy9wcnplc3VuacSZY2llIG9icmF6a2Egd3pnbMSZZGVtIGFrdHVhbG5laiBwb3p5Y2ppIG15c3praVxuXHRcdFx0XHRcdHZhciB5X3RyYW5zbGF0ZSA9IHlfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3kgKyBtb3VzZS50bXBfbW91c2VfeTsgLy9wcnplc3VuaWVjaWUgb2JyYXprYSB3emdsxJlkZW0gYWt0dWFsbmVqIHBvenljamkgbXlzemtpXG5cblx0XHRcdFx0XHR2YXIgeF9uZXcgPSB4X3RyYW5zbGF0ZSA7XG5cdFx0XHRcdFx0dmFyIHlfbmV3ID0geV90cmFuc2xhdGUgO1xuXG5cdFx0XHRcdFx0aW1hZ2UueCA9IHhfbmV3O1xuICAgICAgXHRcdFx0XHRpbWFnZS55ID0geV9uZXc7XG4gICAgICBcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3J5c293YW5pZVxuXHRcdFx0XHRlbHNlIGlmICgoIW1lbnVfdG9wLm1vdmVfaW1hZ2UpICYmICghbWVudV90b3AubW92ZV9jYW52YXMpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIHJvd19jbGljayA9IHBhcnNlSW50KCAodGhpcy50b3AgLSBjYW52YXMub2Zmc2V0X3RvcCArIGNhbnZhcy5jb250ZXh0X3kqKC0xKSApIC8gKCAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ195KSooY2FudmFzLnNjYWxlIC8gMTAwKSAgKSApO1xuXHRcdFx0XHRcdHZhciBjb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCArIGNhbnZhcy5jb250ZXh0X3gqKC0xKSApIC8gKCAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSooY2FudmFzLnNjYWxlIC8gMTAwKSApICk7XG5cblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKCdrbGlrJyxyb3dfY2xpY2ssY29sdW1uX2NsaWNrLGNhbnZhcy5jb250ZXh0X3gsY2FudmFzLmNvbnRleHRfeSk7XG5cblx0XHRcdFx0XHRpZigocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgJiYgKHJvd19jbGljayUyID09MCkpe1xuXHRcdFx0XHRcdFx0Ly9jb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCAtIHBvaW50ZXJzLnNpemVfcG9pbnRlci8yKSAvICgocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSooY2FudmFzLnNjYWxlIC8gMTAwKSkgICk7XG5cdFx0XHRcdFx0XHRjb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCArIGNhbnZhcy5jb250ZXh0X3gqKC0xKSAtIHBvaW50ZXJzLnNpemVfcG9pbnRlci8yKSAvICggKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeCkqKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKCAocm93X2NsaWNrID49IDApICYmIChyb3dfY2xpY2sgPCBjYW52YXMuYWN0aXZlX3JvdykgJiYgKGNvbHVtbl9jbGljayA+PSAwKSAmJiAoY29sdW1uX2NsaWNrIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW4pIClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwb2ludGVycy51cGRhdGVfcG9pbnQocm93X2NsaWNrLGNvbHVtbl9jbGljayxwb2ludGVycy5sYXN0X3Jvdyxwb2ludGVycy5sYXN0X2NvbHVtbik7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IGNvbHVtbl9jbGljaztcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gcm93X2NsaWNrO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3ByemVzdXdhbmllIGNhxYJ5bSBjYW52YXNlbVxuXHRcdFx0XHRlbHNlIGlmKG1lbnVfdG9wLm1vdmVfY2FudmFzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0XHRcdFx0Y2FudmFzLmNsZWFyKCk7XG5cblx0XHRcdFx0XHRjYW52YXMuY29udGV4dF9uZXdfeCA9IChtb3VzZS5sZWZ0IC0gbW91c2Uub2Zmc2V0X3gpIC0gbW91c2UucGFkZGluZ194ICsgY2FudmFzLmNvbnRleHRfeDtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dF9uZXdfeSA9IChtb3VzZS50b3AgLSBtb3VzZS5vZmZzZXRfeSkgLSBtb3VzZS5wYWRkaW5nX3kgKyBjYW52YXMuY29udGV4dF95O1xuXG5cdFx0XHRcdFx0aWYoY2FudmFzLmNvbnRleHRfbmV3X3ggPiAwKSBjYW52YXMuY29udGV4dF9uZXdfeCA9IDA7XG5cdFx0XHRcdFx0aWYoY2FudmFzLmNvbnRleHRfbmV3X3kgPiAwKSBjYW52YXMuY29udGV4dF9uZXdfeSA9IDA7XG5cblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC50cmFuc2xhdGUoICggY2FudmFzLmNvbnRleHRfbmV3X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfbmV3X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuIiwiLy9tZW51IHBvaW50ZXJcbnZhciBwb2ludGVycyA9IHtcblx0c2hvd19hbGxfcG9pbnQgOiB0cnVlLFxuXHRwYWRkaW5nX3ggOiAxLFxuXHRwYWRkaW5nX3kgOiAxLFxuXHR0cmFuc2xhdGVfbW9kdWxvIDogZmFsc2UsXG5cdHNpemVfcG9pbnRlciA6IDEwLFxuXHRtYWluX2tpbmQgOiAnc3F1YXJlJyxcblx0a2luZHMgOiBBcnJheSgnc3F1YXJlJywnY2lyY2xlJywnaGV4YWdvbicsJ2hleGFnb24yJyksXG5cblx0cG9pbnRlcnMgOiBBcnJheSgpLCAvL3BvaW50ZXJzLnBvaW50ZXJzW3J6YWRdW2tvbHVtbmFdIDoga2F0ZWdvcmlhW251bWVyXVxuXG5cdGxhc3RfY29sdW1uIDogbnVsbCxcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0bGFzdF9yb3cgOiBudWxsLFx0Ly93aWVyc3ogcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cblxuXHQvL3J5c293YW5pZSB3c3p5c3RraWNoIHB1bmt0w7N3XG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHZhciB3aWR0aF9wb2ludGVyID0gdGhpcy5zaXplX3BvaW50ZXIgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHR2YXIgaGVpZ2h0X3BvaW50ZXIgPSB0aGlzLnNpemVfcG9pbnRlciArIHRoaXMucGFkZGluZ195O1xuXHRcdHZhciBub25lX2NvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCJcblxuXHRcdGlmKHRoaXMuc2hvd19hbGxfcG9pbnQpIG5vbmVfY29sb3IgPSBcInJnYmEoMTI4LDEyOCwxMjgsMSlcIjtcblxuXHRcdGZvcih2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKXtcblx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKXtcblxuXHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSAwKXtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSBub25lX2NvbG9yO1xuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC41O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0aWYoICh0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSAhPSBtZW51X3RvcC5jYXRlZ29yeSkgJiYgKG1lbnVfdG9wLmNhdGVnb3J5ICE9IDApICl7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnlbIHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dIF1bMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoKGUpe1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ0VSUk9SIDM5IExJTkUgISAnLHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dLHJvdyxjb2x1bW4pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCAocm93ICUgMiA9PSAwKSAmJiAocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgKXtcblx0XHRcdFx0XHR3aW5kb3dbJ2ZpZ3VyZXMnXVt0aGlzLm1haW5fa2luZF0oIGNvbHVtbip3aWR0aF9wb2ludGVyICsgd2lkdGhfcG9pbnRlci8yICwgcm93KmhlaWdodF9wb2ludGVyICwgdGhpcy5zaXplX3BvaW50ZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZV9wb2ludGVyKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vdHdvcnp5bXkgdGFibGljZSBwb250ZXLDs3cgKGplxZtsaSBqYWtpxZsgcG9udGVyIGlzdG5pZWplIHpvc3Rhd2lhbXkgZ28sIHcgcHJ6eXBhZGt1IGdkeSBwb2ludGVyYSBuaWUgbWEgdHdvcnp5bXkgZ28gbmEgbm93bylcblx0Y3JlYXRlX2FycmF5IDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuYWN0aXZlX3JvdyA9IHBhcnNlSW50KCBjYW52YXMuaGVpZ2h0X2NhbnZhcyAvIChwb2ludGVycy5zaXplX3BvaW50ZXIgKyBwb2ludGVycy5wYWRkaW5nX3kpICk7XG5cdFx0Y2FudmFzLmFjdGl2ZV9jb2x1bW4gPSBwYXJzZUludCggY2FudmFzLndpZHRoX2NhbnZhcyAvIChwb2ludGVycy5zaXplX3BvaW50ZXIgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cblx0XHRpZiggKHRoaXMucG9pbnRlcnMubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9yb3cpIHx8ICh0aGlzLnBvaW50ZXJzWzBdLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfY29sdW1uKSApXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd10gPT0gdW5kZWZpbmVkKSB0aGlzLnBvaW50ZXJzW3Jvd10gPSBuZXcgQXJyYXkoKTtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSB1bmRlZmluZWQpXHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlX3BvaW50IDogZnVuY3Rpb24oeSx4LHlfbGFzdCx4X2xhc3Qpe1xuXG5cdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXG5cdFx0Ly93eXpuYWN6ZW5pZSByw7N3bmFuaWEgcHJvc3RlalxuXHRcdGlmKCAoKHlfbGFzdCAhPSB5KSB8fCAoeF9sYXN0ICE9IHgpKSAmJiAoeV9sYXN0ICE9IG51bGwpICYmICh4X2xhc3QgIT0gbnVsbCkgKXtcblx0XHRcdHZhciBhID0gKHlfbGFzdCAtIHkpIC8gKHhfbGFzdCAtIHgpO1xuXHRcdFx0dmFyIGIgPSB5IC0gYSp4O1xuXG5cdFx0XHRpZih4X2xhc3QgPiB4KXtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geDtcblx0XHRcdFx0dmFyIGNvbF90byA9IHhfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgY29sX3RvID0geDtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geF9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZih5X2xhc3QgPiB5KXtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geTtcblx0XHRcdFx0dmFyIHJvd190byA9IHlfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgcm93X3RvID0geTtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geV9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcm93ID0gbnVsbDtcblx0XHRcdGZvcih2YXIgY29sID0gY29sX2Zyb207IGNvbCA8PSBjb2xfdG87IGNvbCsrKVxuXHRcdFx0e1xuXHRcdFx0XHRyb3cgPSBwYXJzZUludCggYSpjb2wrYiApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMocm93KSkgcm93ID0geTtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGNvbCA9IG51bGw7XG5cdFx0XHRmb3IodmFyIHJvdyA9IHJvd19mcm9tOyByb3cgPD0gcm93X3RvOyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Y29sID0gcGFyc2VJbnQoIChyb3ctYikvYSApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMoY29sKSkgY29sID0geDtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHR9XG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
