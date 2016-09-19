//czyszczenie i rysowanie po canvasie
var canvas = {
	
	scale : 100,
	width_canvas : 700,
	height_canvas : 400,
	canvas : null,
	context : null,
	thumbnail : null,
	title_project : 'nowa mapa',

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
	category : new Array(['gumuj','#808080']),

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
			  url: '/api/map/' + th.map_hash,
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

			jQuery.ajax({
				url: "api/map/"+th.map_hash,
				type: 'DELETE',
				success: function(response){
					if(response.status == 'ok'){
						location.reload();
					}
					else{
						alert('błąd podczas usuwania');
						console.log(response);
					}
				}
			});
		}
		else{
			alert('brak identyfikatora projektu');
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
			$(event.target).parent().animate({right: [-$(event.target).parent().width()-20,"swing"]}, 1000, function() {});
    }
    else{
    	 $(event.target).parent().animate({right: ["0px","swing"]}, 1000, function() {});
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


	$('#toolbar_top button.delete').click(function(){ 
		
		if(confirm('Czy chcesz usunąć mapę ?')){
			if(typeof crud.map_hash == 'string'){ crud.delete_map(); }
		}

	});


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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjb2xvcl9waWNrZXIuanMiLCJjcnVkLmpzIiwiZmlndXJlcy5qcyIsImdsb2JhbC5qcyIsImltYWdlLmpzIiwiaW5wdXQuanMiLCJtYWluLmpzIiwibWVudV90b3AuanMiLCJtb2RlbHMuanMiLCJtb3VzZS5qcyIsInBvaW50ZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2N6eXN6Y3plbmllIGkgcnlzb3dhbmllIHBvIGNhbnZhc2llXG52YXIgY2FudmFzID0ge1xuXHRcblx0c2NhbGUgOiAxMDAsXG5cdHdpZHRoX2NhbnZhcyA6IDcwMCxcblx0aGVpZ2h0X2NhbnZhcyA6IDQwMCxcblx0Y2FudmFzIDogbnVsbCxcblx0Y29udGV4dCA6IG51bGwsXG5cdHRodW1ibmFpbCA6IG51bGwsXG5cdHRpdGxlX3Byb2plY3QgOiAnbm93YSBtYXBhJyxcblxuXHRjb250ZXh0X3ggOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF95IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB5XG5cdGNvbnRleHRfbmV3X3ggOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfbmV3X3kgOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB5XG5cblx0b2Zmc2V0X2xlZnQgOiBudWxsLFxuXHRvZmZzZXRfdG9wIDogbnVsbCxcblx0YWN0aXZlX3JvdyA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cdGFjdGl2ZV9jb2x1bW4gOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXG5cdHRodW1ibmFpbCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbl9jYW52YXNcIik7XG5cdFx0dmFyIGRhdGFVUkwgPSBjYW52YXMudG9EYXRhVVJMKCk7XG5cdFx0Y29uc29sZS5sb2coZGF0YVVSTCk7XG5cdH0sXG5cblx0Ly9yeXN1amVteSBjYW52YXMgemUgemRqxJljaWVtXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGlmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkgIGltYWdlLmRyYXcoKTtcblx0fSxcblxuXHRkcmF3X3RodW1uYWlsIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy50aHVtYm5haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdH0sXG5cblx0Ly9yZXNldHVqZW15IHTFgm8gemRqxJljaWFcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHR9LFxuXG5cdC8vIGN6ecWbY2lteSBjYcWCZSB6ZGrEmWNpZSBuYSBjYW52YXNpZVxuXHRjbGVhciA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0XHQvL3RoaXMuY29udGV4dC5maWxsUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0fSxcblxuXHRyZXNpemVfd2lkdGggOiBmdW5jdGlvbihuZXdfd2lkdGgpe1xuXHRcdHRoaXMud2lkdGhfY2FudmFzID0gbmV3X3dpZHRoO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyx0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IHRoaXMud2lkdGhfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwodGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlICsgJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0fSxcblxuXHRyZXNpemVfaGVpZ2h0IDogZnVuY3Rpb24obmV3X2hlaWdodCl7XG5cdFx0dGhpcy5oZWlnaHRfY2FudmFzID0gbmV3X2hlaWdodDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3MoeydoZWlnaHQnOiB0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwodGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSsnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpOyAvLyBha3R1YWxpenVqZW15IGRhbmUgb2Rub8WbbmllIHJvem1pYXLDs3cgY2FudmFzYSB3IG1lbnUgdSBnw7NyeVxuXHRcdC8vdGhpcy5kcmF3KCk7IC8vcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0fSxcblxuXHRzZXRfZGVmYXVsdCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cblx0XHRjYW52YXMuc2NhbGUgPSAxMDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3Qga2F0ZWdvcmlpIGRvZGFuaWUgLyBha3R1YWxpemFjamEgLyB1c3VuacSZY2llIC8gcG9rYXphbmllIGthdGVnb3JpaVxudmFyIGNhdGVnb3JpZXMgPSB7XG5cdGNhdGVnb3J5IDogbmV3IEFycmF5KFsnZ3VtdWonLCcjODA4MDgwJ10pLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWUgPSBBcnJheSgkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoKSwnI2ZmMDAwMCcpO1xuXHRcdCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgnJyk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2gobmFtZSk7XG5cdFx0bWVudV90b3AuY2F0ZWdvcnkgPSAodGhpcy5jYXRlZ29yeS5sZW5ndGgtMSk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbihpbmRleCxuYW1lKXtcblx0XHR0aGlzLmNhdGVnb3J5W2luZGV4XVswXSA9IG5hbWU7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbihpZCl7XG5cdFx0dmFyIHRoID0gdGhpcztcblxuXHRcdCQuZWFjaCh0aGlzLmNhdGVnb3J5LGZ1bmN0aW9uKGluZGV4LHZhbHVlKXtcblx0XHRcdGlmKGluZGV4ID49IGlkKXtcblx0XHRcdFx0dGguY2F0ZWdvcnlbaW5kZXhdID0gdGguY2F0ZWdvcnlbaW5kZXgrMV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IHBvaW50ZXJzLnBvaW50ZXJzLmxlbmd0aDsgcm93Kyspe1xuXHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBwb2ludGVycy5wb2ludGVyc1tyb3ddLmxlbmd0aDsgY29sdW1uKyspe1xuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gMDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA+IGlkKXtcblx0XHRcdFx0XHRwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSBwYXJzZUludChwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pIC0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5jYXRlZ29yeS5wb3AoKTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXG5cdFx0Ly9yeXN1amVteSBuYSBub3fEhSBjYW52YXNcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHNob3dfbGlzdCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgYWRkX2NhdGVnb3J5ID0gXCI8dGFibGU+XCI7XG5cdFx0Ly92YXIgYWRkX3NlbGVjdCA9JzxvcHRpb24gbmFtZT1cIjBcIj5wdXN0eTwvb3B0aW9uPic7XG5cdFx0dmFyIGFkZF9zZWxlY3QgPSAnJztcblxuXHRcdGZvcih2YXIgaSA9IHRoaXMuY2F0ZWdvcnkubGVuZ3RoOyBpID4gMTsgaS0tKXtcblx0XHRcdGFkZF9jYXRlZ29yeSArPSAnPHRyPjx0ZD48c3Bhbj4nKyhpLTEpKyc8L3NwYW4+PC90ZD48dGQ+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImNhdGVnb3J5X25hbWVcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiIHZhbHVlPVwiJyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnXCIgLz48L3RkPjx0ZD48ZGl2IGNsYXNzPVwiY29sb3JwaWNrZXJfYm94XCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMV0rJ1wiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+PC9kaXY+PC90ZD48dGQ+PGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+dXN1bjwvYnV0dG9uPjwvdGQ+PC90cj4nO1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiJysoaS0xKSsnXCI+Jyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cdFx0aWYobWVudV90b3AuY2F0ZWdvcnkgPT0gMCl7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIHNlbGVjdGVkIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiMFwiPicrdGhpcy5jYXRlZ29yeVswXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cblxuXHRcdGFkZF9jYXRlZ29yeSArPSBcIjwvdGFibGU+XCI7XG5cblx0XHQkKCcjY2F0ZWdvcnlfYm94ICNsaXN0JykuaHRtbChhZGRfY2F0ZWdvcnkpO1xuXHRcdCQoJ3NlbGVjdCNjaGFuZ2VfY2F0ZWdvcnknKS5odG1sKGFkZF9zZWxlY3QpO1xuXG5cdFx0Y29sb3JwaWNrZXIuYWRkKCk7XG5cdH1cbn1cbiIsIi8vc2FtYSBuYXp3YSB3aWVsZSB0xYJ1bWFjenkgcG8gcHJvc3R1IGNvbG9ycGlja2VyXG52YXIgY29sb3JwaWNrZXIgPSB7XG5cblx0Y2xpY2tfaWQgOiBudWxsLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5yZW1vdmUoKTtcblx0XHQkKCcuY29sb3JwaWNrZXJfYm94JykuQ29sb3JQaWNrZXIoe1xuXHRcdFx0Y29sb3I6ICcjZmYwMDAwJyxcblx0XHRcdG9uU2hvdzogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHRpZigkKGNvbHBrcikuY3NzKCdkaXNwbGF5Jyk9PSdub25lJyl7XG5cdFx0XHRcdFx0JChjb2xwa3IpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdGNvbG9ycGlja2VyLmNsaWNrX2lkID0gJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRvbkhpZGU6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0JChjb2xwa3IpLmZhZGVPdXQoMjAwKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uQ2hhbmdlOiBmdW5jdGlvbiAoaHNiLCBoZXgsIHJnYikge1xuXHRcdFx0XHQkKCcuY29sb3JwaWNrZXJfYm94W2lkX2NhdGVnb3J5PVwiJytjb2xvcnBpY2tlci5jbGlja19pZCsnXCJdJykuY3NzKCdiYWNrZ3JvdW5kQ29sb3InLCAnIycgKyBoZXgpO1xuXHRcdFx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5W2NvbG9ycGlja2VyLmNsaWNrX2lkXVsxXSA9ICcjJyArIGhleDtcblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbigpe1xuXHRcdCQoJy5jb2xvcnBpY2tlcicpLnJlbW92ZSgpO1xuXHR9XG59XG4iLCIvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgdHdvcnplbmllIHphcGlzeXdhbmllIGkgYWt0dWFsaXphY2plIGRhbnljaCBkb3R5Y3rEhcSHY3loIG1hcHlcbnZhciBjcnVkID0ge1xuXG5cdG1hcF9qc29uIDogQXJyYXkoKSwgLy9nxYLDs3duYSB6bWllbm5hIHByemVjaG93dWrEhWNhIHdzenlzdGtpZSBkYW5lXG5cdG1hcF9oYXNoIDogbnVsbCxcblxuXHRzZWxlY3RfbWFwIDogZnVuY3Rpb24oIGlkX21hcCApe1xuXG5cdFx0Ly9qZcWbbGkgdXJ1Y2hvbWlteVxuXHRcdGlmIChpZF9tYXAgPT0gJ25ld19tYXAnKSB7IFxuXHRcdFx0dGhpcy5jcmVhdGVfbWFwKCkgXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLm1hcF9oYXNoID0gaWRfbWFwO1xuXHRcdFx0dGhpcy5nZXRfbWFwKCk7XG5cdFx0fVxuXG5cdH0sXG5cblx0Ly9wb2JpZXJhbXkgZGFuZSB6IHBvcm9qZWt0dSBpIHphcGlzdWplbXkgamUgZG8ganNvbi1hXG5cdGdldF9kYXRhIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vemVydWplbXkgbmEgbm93byBjYcWCxIUgdGFibGljxJkgcG9pbnRlcsOzd1xuXHRcdHRoaXMubWFwX2pzb24gPSBBcnJheSgpO1xuXG5cdFx0Ly8gZGF0YVt4XSA9IHptaWVubmUgcG9kc3Rhd293ZSBkb3R5Y3rEhWNlIG1hcHlcblx0XHR0aGlzLm1hcF9qc29uWzBdID0gQXJyYXkoKTtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzBdID0gY2FudmFzLmhlaWdodF9jYW52YXM7XG5cdFx0dGhpcy5tYXBfanNvblswXVsxXSA9IGNhbnZhcy53aWR0aF9jYW52YXM7XG5cdFx0dGhpcy5tYXBfanNvblswXVsyXSA9IHBvaW50ZXJzLnBhZGRpbmdfeDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzNdID0gcG9pbnRlcnMucGFkZGluZ195O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNF0gPSBwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNV0gPSBwb2ludGVycy5zaXplX3BvaW50ZXI7XG5cdFx0dGhpcy5tYXBfanNvblswXVs2XSA9IHBvaW50ZXJzLm1haW5fa2luZDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzddID0gY2FudmFzLnRpdGxlX3Byb2plY3Q7XG5cblx0XHQvLyBkYXRhWzFdID0gdGFibGljYSBwdW5rdMOzdyAocG9pbnRlcnMucG9pbnRlcnMpIFt3aWVyc3pdW2tvbHVtbmFdID0gXCJub25lXCIgfHwgKG51bWVyIGthdGVnb3JpaSlcblx0XHR0aGlzLm1hcF9qc29uWzFdID0gcG9pbnRlcnMucG9pbnRlcnM7XG5cblx0XHQvLyBkYXRhWzJdID0gdGFibGljYSBrYXRlZ29yaWlcblx0XHR0aGlzLm1hcF9qc29uWzJdID0gY2F0ZWdvcmllcy5jYXRlZ29yeTtcblxuXHRcdC8vZGF0YVszXSA9IHRhYmxpY2Egd3pvcmNhICh6ZGrEmWNpYSB3IHRsZSBkbyBvZHJ5c293YW5pYSlcblx0XHR0aGlzLm1hcF9qc29uWzNdID0gQXJyYXkoKTtcblxuXHRcdGlmKGltYWdlLm9iail7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzBdID0gaW1hZ2Uub2JqLnNyYztcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMV0gPSBpbWFnZS54O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVsyXSA9IGltYWdlLnk7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzNdID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzRdID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs1XSA9IGltYWdlLmFscGhhO1xuXHRcdH1cblxuXHRcdC8va29ud2VydHVqZW15IG5hc3phIHRhYmxpY2UgbmEganNvblxuXHRcdGNvbnNvbGUubG9nKCdNQVAgXyBKU09OJywgdGhpcy5tYXBfanNvbiwgSlNPTi5zdHJpbmdpZnkoIHRoaXMubWFwX2pzb24gKSk7XG5cdFx0dGhpcy5tYXBfanNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWFwX2pzb24pO1xuXG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBtYXB5IHogYmF6eSBkYW55Y2hcblx0Z2V0X21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzO1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdCAgdXJsOiAnL2FwaS9tYXAvJyArIHRoLm1hcF9oYXNoLFxuXHRcdCAgXHR0eXBlOiBcIkdFVFwiLFxuXHRcdCAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHRcdH0pLmRvbmUoZnVuY3Rpb24oIGRhdGEgKSB7XG5cblx0XHRcdGNvbnNvbGUubG9nKCBkYXRhLmRhdGFbMF0gKTtcblxuXHRcdFx0Ly9wbyB6YXBpc2FuaXUgZGFueWNoIGRvIGJhenkgYWt0dWFsaXp1amVteSBpZCAodyBwcnp5cGFka3UgamXFm2xpIGlzdG5pZWplIG5hZHBpc3VqZW15IGplKVxuXHRcdFx0dmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhLmRhdGFbMF0ubWFwX2pzb24pO1xuXG5cdFx0XHQvL3BvYmllcmFteSBpIHdjenl0dWplbXkgZGFuZSBvIGNhbnZhc2llIGRvIG9iaWVrdHVcblx0XHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcmVzcG9uc2VbMF1bMF07XG5cdFx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gcmVzcG9uc2VbMF1bMV07XG5cdFx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSByZXNwb25zZVswXVsyXTtcblx0XHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IHJlc3BvbnNlWzBdWzNdO1xuXHRcdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IHJlc3BvbnNlWzBdWzRdO1xuXHRcdFx0cG9pbnRlcnMuc2l6ZV9wb2ludGVyID0gcmVzcG9uc2VbMF1bNV07XG5cdFx0XHRwb2ludGVycy5tYWluX2tpbmQgPSByZXNwb25zZVswXVs2XTtcblx0XHRcdGNhbnZhcy50aXRsZV9wcm9qZWN0ID0gcmVzcG9uc2VbMF1bN107XG5cblx0XHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ194XCJdJykudmFsKCByZXNwb25zZVswXVsyXSApO1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3lcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzNdICk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInNpemVfcG9pbnRlclwiXScpLnZhbCggcmVzcG9uc2VbMF1bNV0gKTtcblx0XHRcdCQoJ2lucHV0W25hbWU9XCJ0aXRsZV9wcm9qZWN0XCJdJykudmFsKCByZXNwb25zZVswXVs3XSApO1xuXG5cdFx0XHRpZiggcmVzcG9uc2VbMF1bNF0gKXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR9XG5cblx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmh0bWwoJycpO1xuXG5cdFx0XHRwb2ludGVycy5raW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGtpbmQpe1xuXG5cdFx0XHRcdGlmKGtpbmQgPT0gcmVzcG9uc2VbMF1bNl0pe1xuXHRcdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBzZWxlY3RlZD1cInNlbGVjdGVkXCIgbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0pO1xuXG5cdFx0XHQvL3BvYmllcmFteSBkYW5lIG8gcG9pbnRlcmFjaFxuXHRcdFx0cG9pbnRlcnMucG9pbnRlcnMgPSByZXNwb25zZVsxXTtcblxuXHRcdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIGthdGVnb3JpYWNoXG5cdFx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5ID0gcmVzcG9uc2VbMl07XG5cblx0XHRcdC8vcG9iaWVyYW5pZSBkYW55Y2ggbyB6ZGrEmWNpdSBqZcW8ZWxpIGlzdG5pZWplXG5cdFx0XHRpZiggcmVzcG9uc2VbM10ubGVuZ3RoID4gMil7XG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0XHRpbWFnZS5vYmouc3JjID0gcmVzcG9uc2VbM11bMF07XG5cdFx0XHRcdGltYWdlLnggPSBwYXJzZUludCggcmVzcG9uc2VbM11bMV0gKTtcblx0XHRcdFx0aW1hZ2UueSA9IHBhcnNlSW50KCByZXNwb25zZVszXVsyXSApO1xuXHRcdFx0XHRpbWFnZS53aWR0aCA9IHBhcnNlSW50KCByZXNwb25zZVszXVszXSApO1xuXHRcdFx0XHRpbWFnZS5oZWlnaHQgPSBwYXJzZUludCggcmVzcG9uc2VbM11bNF0gKTtcblx0XHRcdFx0aW1hZ2UuYWxwaGEgPSBwYXJzZUludCggcmVzcG9uc2VbM11bNV0gKTtcblxuXHRcdFx0XHQvL3phem5hY3plbmllIG9kcG93aWVkbmllZ28gc2VsZWN0YSBhbHBoYSB3IG1lbnUgdG9wXG5cdFx0XHRcdCQoJyNhbHBoYV9pbWFnZSBvcHRpb25bbmFtZT1cIicrXHRpbWFnZS5hbHBoYSArJ1wiXScpLmF0dHIoJ3NlbGVjdGVkJyx0cnVlKTtcblxuXHRcdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblxuXHRcdFx0Ly96YWt0dWFsaXpvd2FuaWUgZGFueWNoIHcgaW5wdXRhY2hcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJywgY2FudmFzLndpZHRoX2NhbnZhcysncHgnKTtcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsIGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuXHRcdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzpjYW52YXMud2lkdGhfY2FudmFzKydweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMrJ3B4J30pO1xuXG5cdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0Y2F0ZWdvcmllcy5zaG93X2xpc3QoKTtcblx0XHR9KTtcblx0fSxcblxuXHQvL3R3b3J6eW15IG5vd8SFIG1hcMSZIGRhbnljaFxuXHRjcmVhdGVfbWFwIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5nZXRfZGF0YSgpO1xuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cdFx0Y29uc29sZS5sb2coJ2NyZWF0ZScsdGgubWFwX2pzb24pO1xuXG5cdFx0Ly93eXN5c8WCYW15IGRhbmUgYWpheGVtIGRvIGJhenkgZGFueWNoXG5cdFx0Ly9jYW52YXMuZHJhd190aHVtbmFpbCgpO1xuXHRcdC8vbmV3X2ltYWdlID0gaW1hZ2UuZGF0YVVSSXRvQmxvYiggY2FudmFzLnRodW1ibmFpbC50b0RhdGFVUkwoKSApO1xuXHRcdC8vY2FudmFzLmRyYXcoKTtcblxuXHRcdC8vdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0Ly9mb3JtRGF0YS5hcHBlbmQoXCJhY3Rpb25cIixcdCdjcmVhdGVfbWFwJyApO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwibWFwX25hbWVcIiwgY2FudmFzLnRpdGxlX3Byb2plY3QpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwibWFwX2pzb25cIiwgdGgubWFwX2pzb24pO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwibWFwX2ltYWdlXCIsIG5ld19pbWFnZSk7XG5cdFx0Ly9mb3JtRGF0YS5hcHBlbmQoXCJfbWV0aG9kXCIsICdQT1NUJyk7XG5cdFx0Ly9mb3JtRGF0YS5hcHBlbmQoXCJfdG9rZW5cIiwgY3NyZl90b2tlbik7XG5cdFx0XG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRtYXBfanNvbjogdGgubWFwX2pzb25cblx0XHR9XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IFwiYXBpL21hcHNcIixcblx0XHRcdGRhdGE6IHsgbWFwX2pzb246IHRoLm1hcF9qc29uIH0sXG5cdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHRoLm1hcF9oYXNoID0gcmVzcG9uc2UuaGFzaF9tYXA7XG5cdFx0XHRcdGFsZXJ0KCd6YXBpc2FubyBub3fEhSBtYXDEmScpO1xuXHRcdFx0XHRtZW51X3RvcC5nZXRfbWFwcygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0Ly9ha3R1YWxpenVqZW15IG1hcMSZXG5cdHVwZGF0ZV9tYXAgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9ha3R1YWxpenVqZW15IGpzb25hIGRvIHd5c8WCYW5pYSBhamF4ZW1cblx0XHR0aGlzLmdldF9kYXRhKCk7XG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblxuXHRcdC8vY2FudmFzLmRyYXdfdGh1bW5haWwoKTtcblx0XHQvL25ld19pbWFnZSA9IGltYWdlLmRhdGFVUkl0b0Jsb2IoIGNhbnZhcy50aHVtYm5haWwudG9EYXRhVVJMKCkgKTtcblx0Lypcblx0XHR2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJtYXBfaGFzaFwiLCB0aC5tYXBfaGFzaCApO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9uYW1lXCIsIGNhbnZhcy50aXRsZV9wcm9qZWN0KTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJtYXBfanNvblwiLCB0aC5tYXBfanNvbik7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX2ltYWdlXCIsIG5ld19pbWFnZSk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwiX21ldGhvZFwiLCAnUFVUJyk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwiX3Rva2VuXCIsIGNzcmZfdG9rZW4pO1xuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBiYXNpY191cmwgKyBcIi9tYXAvXCIrdGgubWFwX2hhc2gsXG5cdFx0XHRkYXRhOiBmb3JtRGF0YSxcblx0XHRcdGNhY2hlOiBmYWxzZSxcblx0XHRcdGNvbnRlbnRUeXBlOiBmYWxzZSxcblx0XHRcdHByb2Nlc3NEYXRhOiBmYWxzZSxcblx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRhbGVydCgnemFrdHVhbGl6b3dhbm8gbWFwxJknKTtcblx0XHRcdH1cblx0XHR9KTtcblx0Ki9cblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2hhc2g6IHRoLm1hcF9oYXNoLFxuXHRcdFx0bWFwX2pzb246IHRoLm1hcF9qc29uXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9tYXBzXCIsXG5cdFx0XHQvL2RhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdHR5cGU6ICdQVVQnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRhbGVydCgnemFrdHVhbGl6b3dhbm8gbWFwxJknKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cblx0XHQvL3VzdXdhbXkgbWFwxJkgeiBiYXp5IGRhbnljaFxuXHRkZWxldGVfbWFwIDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL3NwcmF3ZHphbXkgY3p5IG1hcGEgZG8gdXN1bmnEmWNpYSBwb3NpYWRhIHN3b2plIGlkXG5cdFx0aWYodGhpcy5tYXBfaGFzaCAhPSBudWxsKXtcdFx0XHRcblxuXHRcdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0XHR1cmw6IFwiYXBpL21hcC9cIit0aC5tYXBfaGFzaCxcblx0XHRcdFx0dHlwZTogJ0RFTEVURScsXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gJ29rJyl7XG5cdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyB1c3V3YW5pYScpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhbGVydCgnYnJhayBpZGVudHlmaWthdG9yYSBwcm9qZWt0dScpO1xuXHRcdH1cblx0fVxufVxuIiwiLy9mdW5rY2plIHJ5c3VqxIVjZSBwb2plZHnFhGN6eSBwdW5rdCAocG9pbnRlcilcbnZhciBmaWd1cmVzID0ge1xuXG5cdHNxdWFyZSA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHRjYW52YXMuY29udGV4dC5maWxsUmVjdCh4LHksc2l6ZSxzaXplKTtcblx0fSxcblxuXHRjaXJjbGUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIHNpemUgPSBzaXplIC8gMjtcblx0XHR2YXIgY2VudGVyX3ggPSB4ICsgc2l6ZTtcblx0XHR2YXIgY2VudGVyX3kgPSB5ICsgc2l6ZTtcblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5hcmMoY2VudGVyX3gsIGNlbnRlcl95LCBzaXplLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbCgpO1xuXHR9LFxuXG5cdGhleGFnb24gIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBhID0gc2l6ZS80O1xuXHRcdHZhciBhMiA9IHNpemUvMjtcblx0XHR2YXIgaCA9IHNpemUvMipNYXRoLnNxcnQoMykvMjtcblxuXHRcdGNhbnZhcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0Lm1vdmVUbyh4LHkrYTIpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EseSthMi1oKTtcbiAgXHRjYW52YXMuY29udGV4dC5saW5lVG8oeCthK2EyLHkrYTItaCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZSx5K2EyKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCtzaXplLWEseSthMitoKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbCgpO1xuXHR9LFxuXG5cdGhleGFnb24yIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBhID0gc2l6ZS80O1xuXHRcdHZhciBhMiA9IHNpemUvMjtcblx0XHR2YXIgaCA9IHNpemUvMipNYXRoLnNxcnQoMykvMjtcblxuXHRcdGNhbnZhcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0Lm1vdmVUbyh4K2EyLHkpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyK2gseSthKTtcbiAgXHRjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYTIrYSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIseStzaXplKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMi1oLHkrYTIrYSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblxuXHR9XG59XG4iLCIvL2Z1bmtjamUgZ2xvYmFsbmUga29udGVuZXIgbmEgd3N6eXN0a28gaSBuaWMgOylcbnZhciBnbG9iYWwgPSB7XG5cdHRvb2dsZV9wYW5lbCAgOiBmdW5jdGlvbihldmVudCl7XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRrYSBkbGEgbW96aWxsaVxuXHRcdGlmKCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdyaWdodCcpID09ICcwcHgnICl7XG5cdFx0XHQkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7cmlnaHQ6IFstJChldmVudC50YXJnZXQpLnBhcmVudCgpLndpZHRoKCktMjAsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBlbHNle1xuICAgIFx0ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtyaWdodDogW1wiMHB4XCIsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblx0fVxufVxuIiwiLy9nxYLDs3duZSB6ZGrEmWNpZSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxudmFyIGltYWdlID0ge1xuXHRvYmogOiB1bmRlZmluZWQsXG5cdHggOiBudWxsLFxuXHR5IDogbnVsbCxcblx0d2lkdGggOiBudWxsLFxuXHRoZWlnaHQgOiBudWxsLFxuXHRhbHBoYSA6IDEwLFxuXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYS8xMDtcblx0XHRjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5vYmosdGhpcy54LHRoaXMueSx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KTtcblxuXHRcdCQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5jc3MoeydoZWlnaHQnOnRoaXMuaGVpZ2h0LCd0b3AnOnRoaXMueSsncHgnLCdsZWZ0JzoodGhpcy54K3RoaXMud2lkdGgpKydweCd9KTtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG5cdH0sXG5cblx0Ly9mdW5rY2phIHBvbW9jbmljemEga29ud2VydHVqxIVjYSBkYXRhVVJJIG5hIHBsaWtcblx0ZGF0YVVSSXRvQmxvYiA6IGZ1bmN0aW9uKGRhdGFVUkkpIHtcbiAgICB2YXIgYmluYXJ5ID0gYXRvYihkYXRhVVJJLnNwbGl0KCcsJylbMV0pO1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXkucHVzaChiaW5hcnkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXSwge3R5cGU6ICdpbWFnZS9wbmcnfSk7XG5cdH1cblxufVxuIiwidmFyIGRhdGFfaW5wdXQgPSB7XG5cblx0Ly9wb2JpZXJhbmllIGluZm9ybWFjamkgeiBpbnB1dMOzdyBpIHphcGlzYW5pZSBkbyBvYmlla3R1IG1hcF9zdmdcblx0Z2V0IDogZnVuY3Rpb24oKXtcblx0XHRtYXAubmFtZSA9ICQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCgpO1xuXHRcdG1hcC5wYXRoID0gJCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCkucmVwbGFjZSgvXCIvZywgXCInXCIpO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBpbmZvcm1hY2ppIHogb2JpZWt0dSBtYXBfc3ZnIGkgemFwaXNhbmllIGRvIGlucHV0w7N3XG5cdHNldCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCBtYXAubmFtZSApO1xuXHRcdCQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCggbWFwLnBhdGggKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9XG5cbn1cbiIsIi8vbGlzdGEgb2JpZWt0w7N3XG5cblxuLypcbnZhciBjYW52YXMgPSBuZXcgX2NhbnZhcygpOyAvL29iaWVrdCBjYW52YXNhXG52YXIgY3J1ZCA9IG5ldyBfY3J1ZCgpOyAvL29iaWVrdCBjYW52YXNhXG52YXIgaW1hZ2UgPSBuZXcgX2ltYWdlKCk7IC8vb2JpZWt0IHpkasSZY2lhIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG52YXIgbW91c2UgPSBuZXcgX21vdXNlKCk7XG52YXIgbW9kZWxzID0gbmV3IF9tb2RlbHMoKTtcbnZhciBnbG9iYWwgPSBuZXcgX2dsb2JhbCgpOyAvL2Z1bmtjamUgbmllIHByenlwaXNhbnkgZG8gaW5ueWNoIG9iaWVrdMOzd1xudmFyIGNhdGVnb3JpZXMgPSBuZXcgX2NhdGVnb3JpZXMoKTtcbnZhciBwb2ludGVycyA9IG5ldyBfcG9pbnRlcnMoKTtcbnZhciBjb2xvcnBpY2tlciA9IG5ldyBfY29sb3JwaWNrZXIoKTtcbi8vdmFyIG1lbnVfdG9wID0gbmV3IF9tZW51X3RvcCgpO1xudmFyIGZpZ3VyZXMgPSBuZXcgX2ZpZ3VyZXMoKTtcbiovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblxuXHRtZW51X3RvcC5nZXRfbWFwcygpO1xuXG5cblx0Ly96YWJsb2tvd2FuaWUgbW/FvGxpd2/Fm2NpIHphem5hY3phbmlhIGJ1dHRvbsOzdyBwb2RjemFzIGVkeWNqaSBwb2xhXG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNpblwiLFwiaW5wdXRcIixmdW5jdGlvbigpeyBtZW51X3RvcC5kaXNhYmxlX3NlbGVjdCA9IHRydWU7IH0pO1xuXHQkKGRvY3VtZW50KS5vbihcImZvY3Vzb3V0XCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gZmFsc2U7IH0pO1xuXG5cblx0JCgnI3Rvb2xiYXJfdG9wIGJ1dHRvbi5zYXZlJykuY2xpY2soZnVuY3Rpb24oKXsgXG5cblx0XHQvL2plxZtsaSBuaWUgbWFteSB6ZGVmaW5pb3dhbmVnYSBoYXNoYSB0d29yenlteSBub3fEhSBtYXDEmSB3IHByemVjaXdueW0gd3lwYWRrdSBha3R1YWxpenVqZW15IGp1xbwgaXN0bmllasSFY8SFXG5cdFx0XG5cdFx0Y29uc29sZS5sb2coJ2NydWQnLGNydWQubWFwX2hhc2gpXG5cblx0XHRpZih0eXBlb2YgY3J1ZC5tYXBfaGFzaCA9PSAnc3RyaW5nJyl7XG5cdFx0XHRcblx0XHRcdGNydWQudXBkYXRlX21hcCgpO1xuXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRcblx0XHRcdGNydWQuY3JlYXRlX21hcCgpO1xuXHRcdFxuXHRcdH1cblxuXHR9KTtcblxuXG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uZGVsZXRlJykuY2xpY2soZnVuY3Rpb24oKXsgXG5cdFx0XG5cdFx0aWYoY29uZmlybSgnQ3p5IGNoY2VzeiB1c3VuxIXEhyBtYXDEmSA/Jykpe1xuXHRcdFx0aWYodHlwZW9mIGNydWQubWFwX2hhc2ggPT0gJ3N0cmluZycpeyBjcnVkLmRlbGV0ZV9tYXAoKTsgfVxuXHRcdH1cblxuXHR9KTtcblxuXG5cdC8vb2R6bmFjemVuaWUgc2VsZWN0YSBwcnp5IHptaWFuaWVcblx0JCgnI2NoYW5nZV9jYXRlZ29yeScpLmNoYW5nZShmdW5jdGlvbigpeyAkKCcjY2hhbmdlX2NhdGVnb3J5JykuYmx1cigpOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHB1c2N6ZW5pYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgbW91c2UubW91c2VfZG93biA9IGZhbHNlOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHdjacWbbmnEmWNpYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cdFxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vxYJhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7XG5cdFxuXHR9KTtcblxuXHQvL3d5d2/FgmFuaWUgZnVua2NqaSBwb2RjemFzIHBvcnVzemFuaWEgbXlzemvEhVxuXHQkKGRvY3VtZW50KS5tb3VzZW1vdmUoZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0aWYobW91c2UubW91c2VfZG93bikgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblx0XHRpZihtZW51X3RvcC5hdXRvX2RyYXcpeyBtb3VzZS5jbGlja19vYmogPSBcImNhbnZhc1wiOyBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO31cblx0XG5cdH0pO1xuXG5cdCQoJyNtYWluX2NhbnZhcycpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7Ly96YXJlamVzdHJvd2FuaWUgb2JpZWt0dXcgIGt0w7NyeSBrbGlrYW15XG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0bW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblxuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7XG5cblx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdFx0cG9pbnRlcnMubGFzdF9yb3cgPSBudWxsO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSBjYW52YXMuY29udGV4dF9uZXdfeDtcblx0XHRjYW52YXMuY29udGV4dF95ID0gY2FudmFzLmNvbnRleHRfbmV3X3k7XG5cblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaVxuXHQkKCcjYWRkX2NhdGVnb3J5JykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuXHR9KTtcblxuXHQvL2RvZGFuaWUgbm93ZWoga2F0ZWdvcmlpIChwbyB3Y2nFm25pxJljaXUgZW50ZXIpXG5cdCQoJ2lucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS5rZXlwcmVzcyhmdW5jdGlvbihlKSB7XG4gICAgXHRpZihlLndoaWNoID09IDEzKSB7XG4gICAgXHRcdGNhdGVnb3JpZXMuYWRkKCk7XG4gICAgXHR9XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHsgbWVudV90b3Auc3dpdGNoX21vZGUoIGUud2hpY2ggKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJmb2N1c291dFwiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZSkgeyBpZihlLndoaWNoID09IDEzKSB7Y2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0gfSk7XG5cblx0Ly91c3VuacSZY2llIGthdGVnb3JpaVxuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJidXR0b24ucmVtb3ZlXCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy5yZW1vdmUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgIH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKSB7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgIH0pO1xuXG5cdC8vcG9rYXphbmllIC8gdWtyeWNpZSBwYW5lbHUga2F0ZWdvcmlpXG5cdCQoJyNjYXRlZ29yeV9ib3ggaDIsICNwb2ludGVyX2JveCBoMicpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXsgZ2xvYmFsLnRvb2dsZV9wYW5lbChldmVudCk7IH0pO1xuXG5cdC8vb2JzxYJ1Z2EgYnV0dG9uw7N3IGRvIGlua3JlbWVudGFjamkgaSBkZWtyZW1lbnRhY2ppIGlucHV0w7N3XG5cdCQoJ2J1dHRvbi5pbmNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2luY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXHQkKCdidXR0b24uZGVjcmVtZW50JykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLmJ1dHRvbl9kZWNyZW1lbnQoICQodGhpcykgKSB9KTtcblxuXHQvL29ixYJ1Z2EgaW5wdXTDs3cgcG9icmFuaWUgZGFueWNoIGkgemFwaXNhbmllIGRvIGJhenlcblx0JCgnLnN3aXRjaCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9zd2l0Y2goICQodGhpcykgKTsgfSk7IC8vcHJ6eWNpc2tpIHN3aXRjaFxuXHQkKCcuaW5wdXRfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXQoICQodGhpcykgKTsgfSk7IC8vdHJhZHljeWpuZSBpbnB1dHlcblx0JCgnLmlucHV0X2Jhc2VfdGV4dCcpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXRfdGV4dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuc2VsZWN0X2Jhc2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3NlbGVjdCggJCh0aGlzKSApOyB9KTsgLy9saXN0eSByb3p3aWphbmUgc2VsZWN0XG5cblx0JCgnI21lbnVfdG9wICNpbmNyZW1lbnRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuaW5jcmVtZW50X3NjYWxlKCk7IH0pO1xuXHQkKCcjbWVudV90b3AgI2RlY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5kZWNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjYWRkX2ltYWdlJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuYWRkX2ltYWdlKCk7IH0pO1xuXG5cdCQoJyNtZW51X3RvcCAjcmVzZXRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgY2FudmFzLnNldF9kZWZhdWx0KCk7IH0pO1xuXG5cdC8vcHJ6eXBpc2FuaWUgcG9kc3Rhd293b3d5Y2ggZGFueWNoIGRvIG9iaWVrdHUgY2FudmFzXG5cdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcbiAgY2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnKSApO1xuICBjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnKSApO1xuICB2YXIgb2Zmc2V0ID0gJCgnI2NhbnZhc19ib3gnKS5vZmZzZXQoKTtcbiAgY2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuICAvL3R3b3J6eW15IHRhYmxpY2UgcG9pbnRlcsOzd1xuXHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblxuICAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuICAkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCwjY2FudmFzX2luZm8gI2hlaWdodCwjY2FudmFzX2luZm8gI3NpemUnKS5jaGFuZ2UoZnVuY3Rpb24oKXttZW51X3RvcC51cGRhdGVfY2FudmFzX2luZm8oKX0pO1xuXG5cdCQoJyNhbHBoYV9pbWFnZScpLmNoYW5nZShmdW5jdGlvbigpeyBtZW51X3RvcC5jaGFuZ2VfYWxwaGEoKSB9KTtcblxuXHQkKCdpbnB1dCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gZmFsc2U7IH0pO1xuXHQkKCdpbnB1dCcpLmZvY3Vzb3V0KGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgfSk7XG5cblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpeyBjYW52YXMuZHJhdygpOyB9KTtcblx0Y2FudmFzLmRyYXcoKTsgLy9yeXNvd2FuaWUgY2FudmFzXG5cblx0Ly96YXBpc3VqZW15IGx1YiBha3R1YWxpenVqZW15IG1hcMSZIHBvIGtsaWtuacSZY2l1IHcgYnV0dG93IHcgemFsZcW8bm/Fm2NpIG9kIHRlZ28gY3p5IG1hbXkgemRlZmluaW93YW5lIGlkIG1hcHlcblx0JCgnLm1lbnVfcmlnaHQgLnNhdmUnKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdGlmKGNydWQubWFwX2hhc2ggPT0gbnVsbCl7IGNydWQuY3JlYXRlX21hcCgpOyB9XG5cdFx0ZWxzZXsgY3J1ZC51cGRhdGVfbWFwKCk7IH1cblx0fSk7XG5cblx0Ly91c3V3YW15IG1hcMSZIHBvIGtsaWtuacSZY2l1IHcgYnV0dG9uXG5cdCQoJy5tZW51X3JpZ2h0IC5yZW1vdmUnKS5jbGljayhmdW5jdGlvbigpe2lmKGNvbmZpcm0oXCJjenkgbmFwZXdubyB1c3VuxIXEhyBtYXDEmSA/XCIpKXtjcnVkLmRlbGV0ZV9tYXAoKTt9IH0pO1xuXG59KTtcbiIsIi8vb2JpZWt0IG1lbnVfdG9wXG5tZW51X3RvcCA9IHtcblxuXHRtb3ZlX2ltYWdlIDogZmFsc2UsXG5cdG1vdmVfY2FudmFzIDogZmFsc2UsXG5cdGF1dG9fZHJhdyA6IGZhbHNlLFxuXHRtb2RlX2tleSA6IHRydWUsXG5cdGNhdGVnb3J5IDogMCxcblx0ZGlzYWJsZV9zZWxlY3QgOiBmYWxzZSxcblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9tYXBzIDogZnVuY3Rpb24oKXtcblx0XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL21hcHMnLFxuICAgIFx0dHlwZTogXCJHRVRcIixcbiAgICBcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoIGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblx0XHRcdFxuXHRcdFx0Ly93ecWbd2lldGxhbXkgbGlzdMSZIG1hcCB3IHBhbmVsdSB1IGfDs3J5XG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gXCJva1wiKXtcblxuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnJztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5tYXBfaGFzaCl7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBzZWxlY3RlZCBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfbWFwcycpLmFwcGVuZCggYWRkX2h0bWwgKTtcblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIG1hcFxuXHRcdCQoJy5zZWxlY3RfbWFwcycpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0XG5cdFx0XHRpZiAoY29uZmlybSgnQ3p5IGNoY2VzeiB3Y3p5dGHEhyBub3fEhSBtYXDEmSA/JykpIHtcblx0XHRcdFxuXHRcdFx0XHRpZiggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpID09ICduZXdfbWFwJyApe1xuXHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0Y3J1ZC5zZWxlY3RfbWFwKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0XG5cdFx0fSk7XG5cblx0fSxcblxuXHR1cGRhdGVfY2FudmFzX2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5zY2FsZSA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoKSApO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCgpICk7XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoKSApO1xuXG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCBjYW52YXMuc2NhbGUgKyAnJScgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCBjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcgKTtcblxuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyxjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JyxjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0Y2hhbmdlX2FscGhhIDogZnVuY3Rpb24oKXtcblx0XHRpbWFnZS5hbHBoYSA9ICQoJyNhbHBoYV9pbWFnZScpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGFkZF9pbWFnZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2plc2xpIHBvZGFueSBwYXJhbWV0ciBuaWUgamVzdCBwdXN0eVxuXHRcdHZhciBzcmNfaW1hZ2UgPSBwcm9tcHQoXCJQb2RhaiDFm2NpZcW8a8SZIGRvIHpkasSZY2lhOiBcIik7XG5cblx0XHRpZihzcmNfaW1hZ2Upe1xuXHRcdFx0aWYoc3JjX2ltYWdlLmxlbmd0aCA+IDApe1xuXG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0XHRcdC8vd2N6eXRhbmllIHpkasSZY2lhOlxuXHRcdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHRpbWFnZS53aWR0aCA9IGltYWdlLm9iai53aWR0aDtcblx0ICAgIFx0XHRpbWFnZS5oZWlnaHQgPSBpbWFnZS5vYmouaGVpZ2h0O1xuXHQgICAgXHRcdGltYWdlLmRyYXcoKTtcblx0ICBcdFx0fTtcblxuXHRcdFx0ICBpbWFnZS54ID0gMDtcblx0XHRcdCAgaW1hZ2UueSA9IDA7XG5cdFx0XHQgIGltYWdlLm9iai5zcmMgPSBzcmNfaW1hZ2U7XG5cdFx0XHRcdC8vc2ltYWdlLm9iai5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzaG93X2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbChwYXJzZUludChjYW52YXMuc2NhbGUpICsgJyUnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHBhcnNlSW50KGNhbnZhcy53aWR0aF9jYW52YXMpICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwocGFyc2VJbnQoY2FudmFzLmhlaWdodF9jYW52YXMpICsgJ3B4Jyk7XG5cdH0sXG5cblx0aW5jcmVtZW50X3NjYWxlIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdGNhbnZhcy5zY2FsZSs9NTtcblxuXHRcdGlmKGNhbnZhcy5zY2FsZSA9PSAxMDApe1xuXHRcdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRcdGlmKHRoaXMubW92ZV9pbWFnZSkgJCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmZhZGVJbigwKTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoJyNjYW52YXNfYm94ICNyaWdodF9yZXNpemUsICNjYW52YXNfYm94ICNib3R0b21fcmVzaXplJykuZmFkZU91dCg1MDApO1xuXHRcdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmZhZGVPdXQoMCk7XG5cdFx0fVxuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblxuXHRcdHRoaXMuc2hvd19pbmZvKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRkZWNyZW1lbnRfc2NhbGUgOiBmdW5jdGlvbigpe1xuXHRcdGlmKGNhbnZhcy5zY2FsZSA+IDEwMCl7XG5cdFx0XHRjYW52YXMucmVzZXQoKTtcblx0XHRcdGNhbnZhcy5zY2FsZSAtPSA1O1xuXG5cdFx0XHRpZihjYW52YXMuc2NhbGUgPT0gMTAwKXtcblx0XHRcdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRcdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlT3V0KDUwMCk7XG5cdFx0XHRcdCQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlT3V0KDApO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbmV3X3dpZHRoID0gY2FudmFzLndpZHRoX2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHRcdHZhciBuZXdfaGVpZ2h0ID0gY2FudmFzLmhlaWdodF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JyA6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cblx0XHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblx0XHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblxuXHRcdFx0dGhpcy5zaG93X2luZm8oKTtcblx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0fVxuXHR9LFxuXG5cdHN3aXRjaF9tb2RlIDogZnVuY3Rpb24oa2V5KXtcblx0XHRpZighdGhpcy5kaXNhYmxlX3NlbGVjdCl7XG5cdFx0XHRpZih0aGlzLm1vZGVfa2V5KXtcblx0XHRcdFx0c3dpdGNoKGtleSl7XG5cblx0XHRcdFx0XHRjYXNlIDEwNTogLy9wb3J1c3phbmllIHpkasSZY2llbVxuXHRcdFx0XHRcdFx0aWYoaW1hZ2Uub2JqKXtcblx0XHRcdFx0XHRcdFx0aWYodGhpcy5tb3ZlX2ltYWdlKXtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfaW1hZ2UgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I21vdmVfaW1hZ2UnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHRcdFx0JCgnI2NhbnZhc193cmFwcGVyICNpbWFnZV9yZXNpemUnKS5oaWRlKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfaW1hZ2UgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuYXV0b19kcmF3ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2NhbnZhcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9pbWFnZScpLmNzcygnYmFja2dyb3VuZCcsJyMzNGE4MWMnKTtcblx0XHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I2F1dG9fZHJhdycpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I21vdmVfY2FudmFzJykuY3NzKCdiYWNrZ3JvdW5kJywnI2FhYScpO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNjYW52YXNfd3JhcHBlciAjaW1hZ2VfcmVzaXplJykuc2hvdygpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIDEwMDogLy9yeXNvd2FuaWUgYmV6IHdjaXNuacSZY2lhIHByenljaXNrdVxuXG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X3JvdyA9IG51bGw7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XG5cblx0XHRcdFx0XHRcdGlmKHRoaXMuYXV0b19kcmF3KXtcblx0XHRcdFx0XHRcdFx0dGhpcy5hdXRvX2RyYXcgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNhdXRvX2RyYXcnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHR0aGlzLmF1dG9fZHJhdyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHRoaXMubW92ZV9jYW52YXMgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2ltYWdlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9jYW52YXMnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9pbWFnZScpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNhdXRvX2RyYXcnKS5jc3MoJ2JhY2tncm91bmQnLCcjMzRhODFjJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIDk5OiAvL3BvcnVzemFuaWUgY2HFgnltIGNhbnZhc2VtXG5cdFx0XHRcdFx0XHRpZih0aGlzLm1vdmVfY2FudmFzKXtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2NhbnZhcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I21vdmVfY2FudmFzJykuY3NzKCdiYWNrZ3JvdW5kJywnI2FhYScpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2NhbnZhcyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHRoaXMubW92ZV9pbWFnZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR0aGlzLmF1dG9fZHJhdyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I21vdmVfY2FudmFzJykuY3NzKCdiYWNrZ3JvdW5kJywnIzM0YTgxYycpO1xuXHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I21vdmVfaW1hZ2UnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjYXV0b19kcmF3JykuY3NzKCdiYWNrZ3JvdW5kJywnI2FhYScpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4iLCIvLyBwb2JpZXJhbmllIGRhbnljaCB6IHNlbGVrdGEgaW5wdXRhIHN3aXRjaHkgKGFrdHVhbGl6YWNqYSBvYmlla3TDs3cpIGJ1dHRvbiBpbmtyZW1lbnQgaSBkZWtyZW1lbnRcbnZhciBtb2RlbHMgPSB7XG5cblx0YnV0dG9uX2luY3JlbWVudCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgaW5wdXRfdG9fdXBkYXRlID0gJChvYmopLmF0dHIoJ25hbWVpbnB1dCcpO1xuXHRcdHZhciB2YWx1ZSA9IHBhcnNlSW50KCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKCkpICsgMTtcblxuXHRcdCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKHZhbHVlKTtcblx0XHR0aGlzLnVwZGF0ZV9mcm9tX2lucHV0KCAkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpICk7XG5cdH0sXG5cblx0YnV0dG9uX2RlY3JlbWVudCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgaW5wdXRfdG9fdXBkYXRlID0gJChvYmopLmF0dHIoJ25hbWVpbnB1dCcpO1xuXHRcdHZhciB2YWx1ZSA9IHBhcnNlSW50KCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKCkpIC0gMTtcblxuXHRcdCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKHZhbHVlKTtcblx0XHR0aGlzLnVwZGF0ZV9mcm9tX2lucHV0KCAkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpICk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21faW5wdXQgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gcGFyc2VJbnQoJChvYmopLnZhbCgpKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX2lucHV0X3RleHQgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gJChvYmopLnZhbCgpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21fc2VsZWN0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9ICQob2JqKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCduYW1lJyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9zd2l0Y2ggOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdGlmKCAkKG9iaikuYXR0cihcInZhbHVlXCIpID09ICdmYWxzZScgKXtcblx0XHRcdCQob2JqKS5hdHRyKFwidmFsdWVcIiwndHJ1ZScpO1xuXHRcdFx0JChvYmopLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHQkKG9iaikuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2V7IC8vd3nFgsSFY3phbXkgcHJ6ZcWCxIVjem5pa1xuXHRcdFx0JChvYmopLmF0dHIoXCJ2YWx1ZVwiLCdmYWxzZScpO1xuXHRcdFx0JChvYmopLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdCQob2JqKS5hZGRDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9IGZhbHNlO1xuXHRcdH1cblx0XHRjYW52YXMuZHJhdygpO1xuXHR9XG59XG4iLCIvL29iaWVrdCBteXN6a2kgKGRvIG9nYXJuaWVjaWEpXG52YXIgbW91c2UgPSB7XG5cdG1vdXNlX2Rvd24gOiBmYWxzZSxcblx0Y2xpY2tfb2JqIDogbnVsbCxcblxuXHR0bXBfbW91c2VfeCA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cdHRtcF9tb3VzZV95IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblxuXHRsZWZ0IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpXG5cdHRvcCA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praVxuXHRwYWRkaW5nX3ggOiBudWxsLCAvL3BvenljamEgeCBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0cGFkZGluZ195IDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdG9mZnNldF94IDogbnVsbCwgLy9vZmZzZXQgeCBvYmlla3R1IGtsaWtuacSZdGVnb1xuXHRvZmZzZXRfeSA6IG51bGwsIC8vb2Zmc2V0IHkgb2JpZWt0dSBrbGlrbmnEmXRlZ29cblxuXHQvL2Z1bmNramEgd3lrcnl3YWrEhWNhIHcgY28ga2xpa25pxJl0byBwb2JpZXJhasSFY2EgcGFkZGluZyBrbGlrbmnEmWNpYSBvcmF6IHphcGlzdWrEhWNhIGtsaWtuacSZY2llXG5cdHNldF9tb3VzZV9kb3duIDogZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0dmFyIG9iaiA9IGV2ZW50LnRhcmdldDtcblxuXHRcdC8vamXFm2xpIGVsZW1lbnQgbmEga3TDs3J5IGtsaWtuacSZdG8gbWEgYXRyeWJ1dCBuYW1lY2xpY2sgcHJ6eXBpc3VqZW15IGdvIGRvIG9iaWVrdHUgbXlzemtpXG5cdFx0aWYodHlwZW9mKCQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHR0aGlzLmNsaWNrX29iaiA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKTtcblxuXHRcdFx0dmFyIHBvc2l0aW9uID0gJChvYmopLm9mZnNldCgpO1xuXHRcdFx0dGhpcy5vZmZzZXRfeCA9IHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLm9mZnNldF95ID0gcG9zaXRpb24udG9wO1xuXHRcdFx0dGhpcy5wYWRkaW5nX3ggPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5wYWRkaW5nX3kgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDtcblx0XHRcdG1vdXNlLm1vdXNlX2Rvd24gPSB0cnVlO1xuXG5cdFx0XHR0aGlzLnRtcF9tb3VzZV94ID0gaW1hZ2UueDtcblx0XHRcdHRoaXMudG1wX21vdXNlX3kgPSBpbWFnZS55O1xuXHRcdH1cblx0fSxcblxuXHRzZXRfcG9zaXRpb24gOiBmdW5jdGlvbihldmVudCl7XG5cdFx0dGhpcy5sZWZ0ID0gZXZlbnQucGFnZVgsXG5cdFx0dGhpcy50b3AgPSBldmVudC5wYWdlWVxuXHR9LFxuXG5cdC8vZnVua2NqYSB3eWtvbnl3YW5hIHBvZGN6YXMgd2NpxZtuaWVjaWEgcHJ6eWNpa3NrdSBteXN6a2kgKHcgemFsZcW8bm/Fm2NpIG9kIGtsaWtuacSZdGVnbyBlbGVtZW50dSB3eWtvbnVqZW15IHLDs8W8bmUgcnplY3p5KVxuXHRtb3VzZW1vdmUgOiBmdW5jdGlvbigpe1xuXHRcdHN3aXRjaCh0aGlzLmNsaWNrX29iail7XG5cdFx0XHRjYXNlICdyaWdodF9yZXNpemUnOlxuXHRcdFx0XHQvL3JvenN6ZXJ6YW5pZSBjYW52YXNhIHcgcHJhd29cblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHR2YXIgbmV3X3dpZHRoID0gdGhpcy5sZWZ0IC0gdGhpcy5wYWRkaW5nX3ggLSBwb3NpdGlvbi5sZWZ0XG5cdFx0XHRcdGlmKG5ld193aWR0aCA8IHNjcmVlbi53aWR0aCAtIDEwMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhbnZhcy5yZXNpemVfd2lkdGgobmV3X3dpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2JvdHRvbV9yZXNpemUnOlxuXHRcdFx0XHQvL3ptaWVuaWFteSB3eXNva2/Fm8SHIGNhbnZhc2Fcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRjYW52YXMucmVzaXplX2hlaWdodCh0aGlzLnRvcCAtIHRoaXMucGFkZGluZ195IC0gcG9zaXRpb24udG9wKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdpbWFnZV9yZXNpemUnOlxuXG5cdFx0XHRcdGlmKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0XHR2YXIgeF9hY3R1YWwgPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1x0Ly9ha3R1YWxuYSBwb3p5Y2phIG15c3praVxuXHRcdFx0XHRcdHZhciBzdWJzdHJhY3QgPSBpbWFnZS54ICsgaW1hZ2Uud2lkdGggLSB4X2FjdHVhbCArIHRoaXMucGFkZGluZ194O1xuXHRcdFx0XHRcdHZhciBmYWNvciA9IGltYWdlLndpZHRoIC8gaW1hZ2UuaGVpZ2h0O1xuXG5cdFx0XHRcdFx0aWYgKGltYWdlLndpZHRoIC0gc3Vic3RyYWN0ID4gMTAwKXtcblx0XHRcdFx0XHRcdGltYWdlLndpZHRoIC09IHN1YnN0cmFjdDtcblx0XHRcdFx0XHRcdGltYWdlLmhlaWdodCAtPSBzdWJzdHJhY3QvZmFjb3I7XG5cdFx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2NhbnZhcyc6XG5cblx0XHRcdFx0Ly9wcnplc3V3YW5pZSB6ZGrEmWNpZW0gKG5wLiBtYXBhIC8gd3pvcnplYylcblx0XHRcdFx0aWYoKG1lbnVfdG9wLm1vdmVfaW1hZ2UpICYmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cblx0XHRcdFx0XHR2YXIgeF9hY3R1YWwgPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0OyAvL2FrdHVhbG5hIHBvenljamEgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHlfYWN0dWFsID0gdGhpcy50b3AgLSBwb3NpdGlvbi50b3A7IC8vIGFrdHVhbG5hIHBvenljamEgbXlzemtpXG5cblx0XHRcdFx0XHR2YXIgeF90cmFuc2xhdGUgPSB4X2FjdHVhbCAtIHRoaXMucGFkZGluZ194ICsgbW91c2UudG1wX21vdXNlX3g7IC8vcHJ6ZXN1bmnEmWNpZSBvYnJhemthIHd6Z2zEmWRlbSBha3R1YWxuZWogcG96eWNqaSBteXN6a2lcblx0XHRcdFx0XHR2YXIgeV90cmFuc2xhdGUgPSB5X2FjdHVhbCAtIHRoaXMucGFkZGluZ195ICsgbW91c2UudG1wX21vdXNlX3k7IC8vcHJ6ZXN1bmllY2llIG9icmF6a2Egd3pnbMSZZGVtIGFrdHVhbG5laiBwb3p5Y2ppIG15c3praVxuXG5cdFx0XHRcdFx0dmFyIHhfbmV3ID0geF90cmFuc2xhdGUgO1xuXHRcdFx0XHRcdHZhciB5X25ldyA9IHlfdHJhbnNsYXRlIDtcblxuXHRcdFx0XHRcdGltYWdlLnggPSB4X25ldztcbiAgICAgIFx0XHRcdFx0aW1hZ2UueSA9IHlfbmV3O1xuICAgICAgXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9yeXNvd2FuaWVcblx0XHRcdFx0ZWxzZSBpZiAoKCFtZW51X3RvcC5tb3ZlX2ltYWdlKSAmJiAoIW1lbnVfdG9wLm1vdmVfY2FudmFzKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciByb3dfY2xpY2sgPSBwYXJzZUludCggKHRoaXMudG9wIC0gY2FudmFzLm9mZnNldF90b3AgKyBjYW52YXMuY29udGV4dF95KigtMSkgKSAvICggKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeSkqKGNhbnZhcy5zY2FsZSAvIDEwMCkgICkgKTtcblx0XHRcdFx0XHR2YXIgY29sdW1uX2NsaWNrID0gcGFyc2VJbnQoICh0aGlzLmxlZnQgLSBjYW52YXMub2Zmc2V0X2xlZnQgKyBjYW52YXMuY29udGV4dF94KigtMSkgKSAvICggKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeCkqKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSApO1xuXG5cdFx0XHRcdC8vXHRjb25zb2xlLmxvZygna2xpaycscm93X2NsaWNrLGNvbHVtbl9jbGljayxjYW52YXMuY29udGV4dF94LGNhbnZhcy5jb250ZXh0X3kpO1xuXG5cdFx0XHRcdFx0aWYoKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICYmIChyb3dfY2xpY2slMiA9PTApKXtcblx0XHRcdFx0XHRcdC8vY29sdW1uX2NsaWNrID0gcGFyc2VJbnQoICh0aGlzLmxlZnQgLSBjYW52YXMub2Zmc2V0X2xlZnQgLSBwb2ludGVycy5zaXplX3BvaW50ZXIvMikgLyAoKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeCkqKGNhbnZhcy5zY2FsZSAvIDEwMCkpICApO1xuXHRcdFx0XHRcdFx0Y29sdW1uX2NsaWNrID0gcGFyc2VJbnQoICh0aGlzLmxlZnQgLSBjYW52YXMub2Zmc2V0X2xlZnQgKyBjYW52YXMuY29udGV4dF94KigtMSkgLSBwb2ludGVycy5zaXplX3BvaW50ZXIvMikgLyAoIChwb2ludGVycy5zaXplX3BvaW50ZXIgKyBwb2ludGVycy5wYWRkaW5nX3gpKihjYW52YXMuc2NhbGUgLyAxMDApICkgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiggKHJvd19jbGljayA+PSAwKSAmJiAocm93X2NsaWNrIDwgY2FudmFzLmFjdGl2ZV9yb3cpICYmIChjb2x1bW5fY2xpY2sgPj0gMCkgJiYgKGNvbHVtbl9jbGljayA8IGNhbnZhcy5hY3RpdmVfY29sdW1uKSApXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMudXBkYXRlX3BvaW50KHJvd19jbGljayxjb2x1bW5fY2xpY2sscG9pbnRlcnMubGFzdF9yb3cscG9pbnRlcnMubGFzdF9jb2x1bW4pO1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBjb2x1bW5fY2xpY2s7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X3JvdyA9IHJvd19jbGljaztcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X3JvdyA9IG51bGw7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9wcnplc3V3YW5pZSBjYcWCeW0gY2FudmFzZW1cblx0XHRcdFx0ZWxzZSBpZihtZW51X3RvcC5tb3ZlX2NhbnZhcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdFx0XHRcdGNhbnZhcy5jbGVhcigpO1xuXG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHRfbmV3X3ggPSAobW91c2UubGVmdCAtIG1vdXNlLm9mZnNldF94KSAtIG1vdXNlLnBhZGRpbmdfeCArIGNhbnZhcy5jb250ZXh0X3g7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHRfbmV3X3kgPSAobW91c2UudG9wIC0gbW91c2Uub2Zmc2V0X3kpIC0gbW91c2UucGFkZGluZ195ICsgY2FudmFzLmNvbnRleHRfeTtcblxuXHRcdFx0XHRcdGlmKGNhbnZhcy5jb250ZXh0X25ld194ID4gMCkgY2FudmFzLmNvbnRleHRfbmV3X3ggPSAwO1xuXHRcdFx0XHRcdGlmKGNhbnZhcy5jb250ZXh0X25ld195ID4gMCkgY2FudmFzLmNvbnRleHRfbmV3X3kgPSAwO1xuXG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X25ld194IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X25ld195IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSk7XG5cdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cbiIsIi8vbWVudSBwb2ludGVyXG52YXIgcG9pbnRlcnMgPSB7XG5cdHNob3dfYWxsX3BvaW50IDogdHJ1ZSxcblx0cGFkZGluZ194IDogMSxcblx0cGFkZGluZ195IDogMSxcblx0dHJhbnNsYXRlX21vZHVsbyA6IGZhbHNlLFxuXHRzaXplX3BvaW50ZXIgOiAxMCxcblx0bWFpbl9raW5kIDogJ3NxdWFyZScsXG5cdGtpbmRzIDogQXJyYXkoJ3NxdWFyZScsJ2NpcmNsZScsJ2hleGFnb24nLCdoZXhhZ29uMicpLFxuXG5cdHBvaW50ZXJzIDogQXJyYXkoKSwgLy9wb2ludGVycy5wb2ludGVyc1tyemFkXVtrb2x1bW5hXSA6IGthdGVnb3JpYVtudW1lcl1cblxuXHRsYXN0X2NvbHVtbiA6IG51bGwsXHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdGxhc3Rfcm93IDogbnVsbCxcdC8vd2llcnN6IHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXG5cblx0Ly9yeXNvd2FuaWUgd3N6eXN0a2ljaCBwdW5rdMOzd1xuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZV9wb2ludGVyICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0dmFyIGhlaWdodF9wb2ludGVyID0gdGhpcy5zaXplX3BvaW50ZXIgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiXG5cblx0XHRpZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGlmKCAodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gIT0gbWVudV90b3AuY2F0ZWdvcnkpICYmIChtZW51X3RvcC5jYXRlZ29yeSAhPSAwKSApe1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnl7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSBjYXRlZ29yaWVzLmNhdGVnb3J5WyB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSBdWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaChlKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdFUlJPUiAzOSBMSU5FICEgJyx0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSxyb3csY29sdW1uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiggKHJvdyAlIDIgPT0gMCkgJiYgKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICl7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciArIHdpZHRoX3BvaW50ZXIvMiAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZV9wb2ludGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemVfcG9pbnRlcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL3R3b3J6eW15IHRhYmxpY2UgcG9udGVyw7N3IChqZcWbbGkgamFracWbIHBvbnRlciBpc3RuaWVqZSB6b3N0YXdpYW15IGdvLCB3IHByenlwYWRrdSBnZHkgcG9pbnRlcmEgbmllIG1hIHR3b3J6eW15IGdvIG5hIG5vd28pXG5cdGNyZWF0ZV9hcnJheSA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmFjdGl2ZV9yb3cgPSBwYXJzZUludCggY2FudmFzLmhlaWdodF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdGNhbnZhcy5hY3RpdmVfY29sdW1uID0gcGFyc2VJbnQoIGNhbnZhcy53aWR0aF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXG5cdFx0aWYoICh0aGlzLnBvaW50ZXJzLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfcm93KSB8fCAodGhpcy5wb2ludGVyc1swXS5sZW5ndGggPCBjYW52YXMuYWN0aXZlX2NvbHVtbikgKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddID09IHVuZGVmaW5lZCkgdGhpcy5wb2ludGVyc1tyb3ddID0gbmV3IEFycmF5KCk7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gdW5kZWZpbmVkKVx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZV9wb2ludCA6IGZ1bmN0aW9uKHkseCx5X2xhc3QseF9sYXN0KXtcblxuXHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblxuXHRcdC8vd3l6bmFjemVuaWUgcsOzd25hbmlhIHByb3N0ZWpcblx0XHRpZiggKCh5X2xhc3QgIT0geSkgfHwgKHhfbGFzdCAhPSB4KSkgJiYgKHlfbGFzdCAhPSBudWxsKSAmJiAoeF9sYXN0ICE9IG51bGwpICl7XG5cdFx0XHR2YXIgYSA9ICh5X2xhc3QgLSB5KSAvICh4X2xhc3QgLSB4KTtcblx0XHRcdHZhciBiID0geSAtIGEqeDtcblxuXHRcdFx0aWYoeF9sYXN0ID4geCl7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHg7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIGNvbF90byA9IHg7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHhfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0aWYoeV9sYXN0ID4geSl7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHk7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHJvd190byA9IHk7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHlfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJvdyA9IG51bGw7XG5cdFx0XHRmb3IodmFyIGNvbCA9IGNvbF9mcm9tOyBjb2wgPD0gY29sX3RvOyBjb2wrKylcblx0XHRcdHtcblx0XHRcdFx0cm93ID0gcGFyc2VJbnQoIGEqY29sK2IgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHJvdykpIHJvdyA9IHk7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjb2wgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciByb3cgPSByb3dfZnJvbTsgcm93IDw9IHJvd190bzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbCA9IHBhcnNlSW50KCAocm93LWIpL2EgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKGNvbCkpIGNvbCA9IHg7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0fVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
