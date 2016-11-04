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
		context_new_x = 0;
		context_new_y = 0;
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

	duplicate : function(){
		canvas.title_project = canvas.title_project + ' - kopia';
		//aktualizujemy jsona do wysłania ajaxem
		this.get_data();
		var th = this; //zmienna pomocnicza
		
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
				location.reload();
			}
		});

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
		//console.log('MAP _ JSON', this.map_json, JSON.stringify( this.map_json ));
		this.map_json = JSON.stringify(this.map_json);

	},

	//pobranie mapy z bazy danych
	special : function(){

		var th = this;  

	/*	$.ajax({
			  url: '/api/map/' + th.map_hash,
		  	type: "GET",
		    contentType: "application/json"
			}).done(function( data ) {
*/
		//	console.log( data.data[0] );

			//po zapisaniu danych do bazy aktualizujemy id (w przypadku jeśli istnieje nadpisujemy je)
			var response = crud.data;

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
		//});
	},

	//pobranie mapy z bazy danych
	get_map : function(){

		var th = this;

		$.ajax({
			  url: '/api/map/' + th.map_hash,
		  	type: "GET",
		    contentType: "application/json"
			}).done(function( data ) {

			//console.log( data.data[0] );

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
		//console.log('create',th.map_json);

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
						//console.log(response);
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

	$('#duplicate').click(function(){ if(confirm("czy chcesz skopiować aktualną mapę ? ?")){crud.duplicate();} });

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

//var biqmap = biqmap || {};
//biqmap.map = biqmap.map || {}; 

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
			this.mouse_down = true;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjb2xvcl9waWNrZXIuanMiLCJjcnVkLmpzIiwiZmlndXJlcy5qcyIsImdsb2JhbC5qcyIsImltYWdlLmpzIiwiaW5wdXQuanMiLCJtYWluLmpzIiwibWVudV90b3AuanMiLCJtb2RlbHMuanMiLCJtb3VzZS5qcyIsInBvaW50ZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9jenlzemN6ZW5pZSBpIHJ5c293YW5pZSBwbyBjYW52YXNpZVxudmFyIGNhbnZhcyA9IHtcblx0XG5cdHNjYWxlIDogMTAwLFxuXHR3aWR0aF9jYW52YXMgOiA3MDAsXG5cdGhlaWdodF9jYW52YXMgOiA0MDAsXG5cdGNhbnZhcyA6IG51bGwsXG5cdGNvbnRleHQgOiBudWxsLFxuXHR0aHVtYm5haWwgOiBudWxsLFxuXHR0aXRsZV9wcm9qZWN0IDogJ25vd2EgbWFwYScsXG5cblx0Y29udGV4dF94IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfeSA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeVxuXHRjb250ZXh0X25ld194IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X25ld195IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeVxuXG5cdG9mZnNldF9sZWZ0IDogbnVsbCxcblx0b2Zmc2V0X3RvcCA6IG51bGwsXG5cdGFjdGl2ZV9yb3cgOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXHRhY3RpdmVfY29sdW1uIDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblxuXHR0aHVtYm5haWwgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5fY2FudmFzXCIpO1xuXHRcdHZhciBkYXRhVVJMID0gY2FudmFzLnRvRGF0YVVSTCgpO1xuXHRcdGNvbnNvbGUubG9nKGRhdGFVUkwpO1xuXHR9LFxuXG5cdC8vcnlzdWplbXkgY2FudmFzIHplIHpkasSZY2llbVxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblx0XHRwb2ludGVycy5kcmF3KCk7XG5cblx0XHRpZiAoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpICBpbWFnZS5kcmF3KCk7XG5cdH0sXG5cblx0ZHJhd190aHVtbmFpbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMudGh1bWJuYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHR9LFxuXG5cdC8vcmVzZXR1amVteSB0xYJvIHpkasSZY2lhXG5cdHJlc2V0IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblx0fSxcblxuXHQvLyBjennFm2NpbXkgY2HFgmUgemRqxJljaWUgbmEgY2FudmFzaWVcblx0Y2xlYXIgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5jbGVhclJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdFx0Ly90aGlzLmNvbnRleHQuZmlsbFJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdH0sXG5cblx0cmVzaXplX3dpZHRoIDogZnVuY3Rpb24obmV3X3dpZHRoKXtcblx0XHR0aGlzLndpZHRoX2NhbnZhcyA9IG5ld193aWR0aDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsdGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiB0aGlzLndpZHRoX2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHRoaXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSArICclJyk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdH0sXG5cblx0cmVzaXplX2hlaWdodCA6IGZ1bmN0aW9uKG5ld19oZWlnaHQpe1xuXHRcdHRoaXMuaGVpZ2h0X2NhbnZhcyA9IG5ld19oZWlnaHQ7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0Jyx0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnaGVpZ2h0JzogdGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdHRoaXMuc2NhbGUgPSAxMDA7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHRoaXMuc2NhbGUrJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTsgLy8gYWt0dWFsaXp1amVteSBkYW5lIG9kbm/Fm25pZSByb3ptaWFyw7N3IGNhbnZhc2EgdyBtZW51IHUgZ8Ozcnlcblx0XHQvL3RoaXMuZHJhdygpOyAvL3J5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdH0sXG5cblx0c2V0X2RlZmF1bHQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfYm94ICNyaWdodF9yZXNpemUsICNjYW52YXNfYm94ICNib3R0b21fcmVzaXplJykuZmFkZUluKDUwMCk7XG5cdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXG5cdFx0Y2FudmFzLnNjYWxlID0gMTAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSAwO1xuXHRcdGNvbnRleHRfbmV3X3ggPSAwO1xuXHRcdGNvbnRleHRfbmV3X3kgPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblxuXHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdHZhciBuZXdfaGVpZ2h0ID0gY2FudmFzLmhlaWdodF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cih7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JzogbmV3X2hlaWdodCArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IGthdGVnb3JpaSBkb2RhbmllIC8gYWt0dWFsaXphY2phIC8gdXN1bmnEmWNpZSAvIHBva2F6YW5pZSBrYXRlZ29yaWlcbnZhciBjYXRlZ29yaWVzID0ge1xuXHRjYXRlZ29yeSA6IG5ldyBBcnJheShbJ2d1bXVqJywnIzgwODA4MCddKSxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBuYW1lID0gQXJyYXkoJCgnI2NhdGVnb3J5X2JveCBpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykudmFsKCksJyNmZjAwMDAnKTtcblx0XHQkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoJycpO1xuXG5cdFx0dGhpcy5jYXRlZ29yeS5wdXNoKG5hbWUpO1xuXHRcdG1lbnVfdG9wLmNhdGVnb3J5ID0gKHRoaXMuY2F0ZWdvcnkubGVuZ3RoLTEpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblx0dXBkYXRlIDogZnVuY3Rpb24oaW5kZXgsbmFtZSl7XG5cdFx0dGhpcy5jYXRlZ29yeVtpbmRleF1bMF0gPSBuYW1lO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblx0cmVtb3ZlIDogZnVuY3Rpb24oaWQpe1xuXHRcdHZhciB0aCA9IHRoaXM7XG5cblx0XHQkLmVhY2godGhpcy5jYXRlZ29yeSxmdW5jdGlvbihpbmRleCx2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA+PSBpZCl7XG5cdFx0XHRcdHRoLmNhdGVnb3J5W2luZGV4XSA9IHRoLmNhdGVnb3J5W2luZGV4KzFdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBwb2ludGVycy5wb2ludGVycy5sZW5ndGg7IHJvdysrKXtcblx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgcG9pbnRlcnMucG9pbnRlcnNbcm93XS5sZW5ndGg7IGNvbHVtbisrKXtcblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gaWQpe1xuXHRcdFx0XHRcdHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPiBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gcGFyc2VJbnQocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSAtIDE7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmNhdGVnb3J5LnBvcCgpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cblx0XHQvL3J5c3VqZW15IG5hIG5vd8SFIGNhbnZhc1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0c2hvd19saXN0IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBhZGRfY2F0ZWdvcnkgPSBcIjx0YWJsZT5cIjtcblx0XHQvL3ZhciBhZGRfc2VsZWN0ID0nPG9wdGlvbiBuYW1lPVwiMFwiPnB1c3R5PC9vcHRpb24+Jztcblx0XHR2YXIgYWRkX3NlbGVjdCA9ICcnO1xuXG5cdFx0Zm9yKHZhciBpID0gdGhpcy5jYXRlZ29yeS5sZW5ndGg7IGkgPiAxOyBpLS0pe1xuXHRcdFx0YWRkX2NhdGVnb3J5ICs9ICc8dHI+PHRkPjxzcGFuPicrKGktMSkrJzwvc3Bhbj48L3RkPjx0ZD48aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiY2F0ZWdvcnlfbmFtZVwiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCIgdmFsdWU9XCInK3RoaXMuY2F0ZWdvcnlbKGktMSldWzBdKydcIiAvPjwvdGQ+PHRkPjxkaXYgY2xhc3M9XCJjb2xvcnBpY2tlcl9ib3hcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6Jyt0aGlzLmNhdGVnb3J5WyhpLTEpXVsxXSsnXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIj48L2Rpdj48L3RkPjx0ZD48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIj51c3VuPC9idXR0b24+PC90ZD48L3RyPic7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIG5hbWU9XCInKyhpLTEpKydcIj4nK3RoaXMuY2F0ZWdvcnlbKGktMSldWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblx0XHRpZihtZW51X3RvcC5jYXRlZ29yeSA9PSAwKXtcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gc2VsZWN0ZWQgbmFtZT1cIjBcIj4nK3RoaXMuY2F0ZWdvcnlbMF1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblxuXG5cdFx0YWRkX2NhdGVnb3J5ICs9IFwiPC90YWJsZT5cIjtcblxuXHRcdCQoJyNjYXRlZ29yeV9ib3ggI2xpc3QnKS5odG1sKGFkZF9jYXRlZ29yeSk7XG5cdFx0JCgnc2VsZWN0I2NoYW5nZV9jYXRlZ29yeScpLmh0bWwoYWRkX3NlbGVjdCk7XG5cblx0XHRjb2xvcnBpY2tlci5hZGQoKTtcblx0fVxufVxuIiwiLy9zYW1hIG5hendhIHdpZWxlIHTFgnVtYWN6eSBwbyBwcm9zdHUgY29sb3JwaWNrZXJcbnZhciBjb2xvcnBpY2tlciA9IHtcblxuXHRjbGlja19pZCA6IG51bGwsXG5cblx0YWRkIDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLnJlbW92ZSgpO1xuXHRcdCQoJy5jb2xvcnBpY2tlcl9ib3gnKS5Db2xvclBpY2tlcih7XG5cdFx0XHRjb2xvcjogJyNmZjAwMDAnLFxuXHRcdFx0b25TaG93OiBmdW5jdGlvbiAoY29scGtyKSB7XG5cdFx0XHRcdGlmKCQoY29scGtyKS5jc3MoJ2Rpc3BsYXknKT09J25vbmUnKXtcblx0XHRcdFx0XHQkKGNvbHBrcikuZmFkZUluKDIwMCk7XG5cdFx0XHRcdFx0Y29sb3JwaWNrZXIuY2xpY2tfaWQgPSAkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uSGlkZTogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHQkKGNvbHBrcikuZmFkZU91dCgyMDApO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0b25DaGFuZ2U6IGZ1bmN0aW9uIChoc2IsIGhleCwgcmdiKSB7XG5cdFx0XHRcdCQoJy5jb2xvcnBpY2tlcl9ib3hbaWRfY2F0ZWdvcnk9XCInK2NvbG9ycGlja2VyLmNsaWNrX2lkKydcIl0nKS5jc3MoJ2JhY2tncm91bmRDb2xvcicsICcjJyArIGhleCk7XG5cdFx0XHRcdGNhdGVnb3JpZXMuY2F0ZWdvcnlbY29sb3JwaWNrZXIuY2xpY2tfaWRdWzFdID0gJyMnICsgaGV4O1xuXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnLmNvbG9ycGlja2VyJykucmVtb3ZlKCk7XG5cdH1cbn1cbiIsIi8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB0d29yemVuaWUgemFwaXN5d2FuaWUgaSBha3R1YWxpemFjamUgZGFueWNoIGRvdHljesSFxIdjeWggbWFweVxudmFyIGNydWQgPSB7XG5cblx0bWFwX2pzb24gOiBBcnJheSgpLCAvL2fFgsOzd25hIHptaWVubmEgcHJ6ZWNob3d1asSFY2Egd3N6eXN0a2llIGRhbmVcblx0bWFwX2hhc2ggOiBudWxsLFxuXG5cdHNlbGVjdF9tYXAgOiBmdW5jdGlvbiggaWRfbWFwICl7XG5cblx0XHQvL2plxZtsaSB1cnVjaG9taW15XG5cdFx0aWYgKGlkX21hcCA9PSAnbmV3X21hcCcpIHsgXG5cdFx0XHR0aGlzLmNyZWF0ZV9tYXAoKSBcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMubWFwX2hhc2ggPSBpZF9tYXA7XG5cdFx0XHR0aGlzLmdldF9tYXAoKTtcblx0XHR9XG5cblx0fSxcblxuXHRkdXBsaWNhdGUgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy50aXRsZV9wcm9qZWN0ID0gY2FudmFzLnRpdGxlX3Byb2plY3QgKyAnIC0ga29waWEnO1xuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5nZXRfZGF0YSgpO1xuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cdFx0XG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRtYXBfanNvbjogdGgubWFwX2pzb25cblx0XHR9XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IFwiYXBpL21hcHNcIixcblx0XHRcdGRhdGE6IHsgbWFwX2pzb246IHRoLm1hcF9qc29uIH0sXG5cdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHRoLm1hcF9oYXNoID0gcmVzcG9uc2UuaGFzaF9tYXA7XG5cdFx0XHRcdGFsZXJ0KCd6YXBpc2FubyBub3fEhSBtYXDEmScpO1xuXHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vcG9iaWVyYW15IGRhbmUgeiBwb3JvamVrdHUgaSB6YXBpc3VqZW15IGplIGRvIGpzb24tYVxuXHRnZXRfZGF0YSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL3plcnVqZW15IG5hIG5vd28gY2HFgsSFIHRhYmxpY8SZIHBvaW50ZXLDs3dcblx0XHR0aGlzLm1hcF9qc29uID0gQXJyYXkoKTtcblxuXHRcdC8vIGRhdGFbeF0gPSB6bWllbm5lIHBvZHN0YXdvd2UgZG90eWN6xIVjZSBtYXB5XG5cdFx0dGhpcy5tYXBfanNvblswXSA9IEFycmF5KCk7XG5cdFx0dGhpcy5tYXBfanNvblswXVswXSA9IGNhbnZhcy5oZWlnaHRfY2FudmFzO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMV0gPSBjYW52YXMud2lkdGhfY2FudmFzO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMl0gPSBwb2ludGVycy5wYWRkaW5nX3g7XG5cdFx0dGhpcy5tYXBfanNvblswXVszXSA9IHBvaW50ZXJzLnBhZGRpbmdfeTtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzRdID0gcG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzVdID0gcG9pbnRlcnMuc2l6ZV9wb2ludGVyO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNl0gPSBwb2ludGVycy5tYWluX2tpbmQ7XG5cdFx0dGhpcy5tYXBfanNvblswXVs3XSA9IGNhbnZhcy50aXRsZV9wcm9qZWN0O1xuXG5cdFx0Ly8gZGF0YVsxXSA9IHRhYmxpY2EgcHVua3TDs3cgKHBvaW50ZXJzLnBvaW50ZXJzKSBbd2llcnN6XVtrb2x1bW5hXSA9IFwibm9uZVwiIHx8IChudW1lciBrYXRlZ29yaWkpXG5cdFx0dGhpcy5tYXBfanNvblsxXSA9IHBvaW50ZXJzLnBvaW50ZXJzO1xuXG5cdFx0Ly8gZGF0YVsyXSA9IHRhYmxpY2Ega2F0ZWdvcmlpXG5cdFx0dGhpcy5tYXBfanNvblsyXSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnk7XG5cblx0XHQvL2RhdGFbM10gPSB0YWJsaWNhIHd6b3JjYSAoemRqxJljaWEgdyB0bGUgZG8gb2RyeXNvd2FuaWEpXG5cdFx0dGhpcy5tYXBfanNvblszXSA9IEFycmF5KCk7XG5cblx0XHRpZihpbWFnZS5vYmope1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVswXSA9IGltYWdlLm9iai5zcmM7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzFdID0gaW1hZ2UueDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMl0gPSBpbWFnZS55O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVszXSA9IGltYWdlLndpZHRoO1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs0XSA9IGltYWdlLmhlaWdodDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bNV0gPSBpbWFnZS5hbHBoYTtcblx0XHR9XG5cblx0XHQvL2tvbndlcnR1amVteSBuYXN6YSB0YWJsaWNlIG5hIGpzb25cblx0XHQvL2NvbnNvbGUubG9nKCdNQVAgXyBKU09OJywgdGhpcy5tYXBfanNvbiwgSlNPTi5zdHJpbmdpZnkoIHRoaXMubWFwX2pzb24gKSk7XG5cdFx0dGhpcy5tYXBfanNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWFwX2pzb24pO1xuXG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBtYXB5IHogYmF6eSBkYW55Y2hcblx0c3BlY2lhbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzOyAgXG5cblx0LypcdCQuYWpheCh7XG5cdFx0XHQgIHVybDogJy9hcGkvbWFwLycgKyB0aC5tYXBfaGFzaCxcblx0XHQgIFx0dHlwZTogXCJHRVRcIixcblx0XHQgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0XHR9KS5kb25lKGZ1bmN0aW9uKCBkYXRhICkge1xuKi9cblx0XHQvL1x0Y29uc29sZS5sb2coIGRhdGEuZGF0YVswXSApO1xuXG5cdFx0XHQvL3BvIHphcGlzYW5pdSBkYW55Y2ggZG8gYmF6eSBha3R1YWxpenVqZW15IGlkICh3IHByenlwYWRrdSBqZcWbbGkgaXN0bmllamUgbmFkcGlzdWplbXkgamUpXG5cdFx0XHR2YXIgcmVzcG9uc2UgPSBjcnVkLmRhdGE7XG5cblx0XHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSByZXNwb25zZVswXVswXTtcblx0XHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSByZXNwb25zZVswXVsxXTtcblx0XHRcdHBvaW50ZXJzLnBhZGRpbmdfeCA9IHJlc3BvbnNlWzBdWzJdO1xuXHRcdFx0cG9pbnRlcnMucGFkZGluZ195ID0gcmVzcG9uc2VbMF1bM107XG5cdFx0XHRwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvID0gcmVzcG9uc2VbMF1bNF07XG5cdFx0XHRwb2ludGVycy5zaXplX3BvaW50ZXIgPSByZXNwb25zZVswXVs1XTtcblx0XHRcdHBvaW50ZXJzLm1haW5fa2luZCA9IHJlc3BvbnNlWzBdWzZdO1xuXHRcdFx0Y2FudmFzLnRpdGxlX3Byb2plY3QgPSByZXNwb25zZVswXVs3XTtcblxuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3hcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzJdICk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeVwiXScpLnZhbCggcmVzcG9uc2VbMF1bM10gKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwic2l6ZV9wb2ludGVyXCJdJykudmFsKCByZXNwb25zZVswXVs1XSApO1xuXHRcdFx0JCgnaW5wdXRbbmFtZT1cInRpdGxlX3Byb2plY3RcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzddICk7XG5cblx0XHRcdGlmKCByZXNwb25zZVswXVs0XSApe1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdH1cblxuXHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuaHRtbCgnJyk7XG5cblx0XHRcdHBvaW50ZXJzLmtpbmRzLmZvckVhY2goZnVuY3Rpb24oa2luZCl7XG5cblx0XHRcdFx0aWYoa2luZCA9PSByZXNwb25zZVswXVs2XSl7XG5cdFx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIHNlbGVjdGVkPVwic2VsZWN0ZWRcIiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSk7XG5cblx0XHRcdC8vcG9iaWVyYW15IGRhbmUgbyBwb2ludGVyYWNoXG5cdFx0XHRwb2ludGVycy5wb2ludGVycyA9IHJlc3BvbnNlWzFdO1xuXG5cdFx0XHQvL3BvYmllcmFteSBkYW5lIG8ga2F0ZWdvcmlhY2hcblx0XHRcdGNhdGVnb3JpZXMuY2F0ZWdvcnkgPSByZXNwb25zZVsyXTtcblxuXHRcdFx0Ly9wb2JpZXJhbmllIGRhbnljaCBvIHpkasSZY2l1IGplxbxlbGkgaXN0bmllamVcblx0XHRcdGlmKCByZXNwb25zZVszXS5sZW5ndGggPiAyKXtcblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cdFx0XHRcdGltYWdlLm9iai5zcmMgPSByZXNwb25zZVszXVswXTtcblx0XHRcdFx0aW1hZ2UueCA9IHBhcnNlSW50KCByZXNwb25zZVszXVsxXSApO1xuXHRcdFx0XHRpbWFnZS55ID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzJdICk7XG5cdFx0XHRcdGltYWdlLndpZHRoID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzNdICk7XG5cdFx0XHRcdGltYWdlLmhlaWdodCA9IHBhcnNlSW50KCByZXNwb25zZVszXVs0XSApO1xuXHRcdFx0XHRpbWFnZS5hbHBoYSA9IHBhcnNlSW50KCByZXNwb25zZVszXVs1XSApO1xuXG5cdFx0XHRcdC8vemF6bmFjemVuaWUgb2Rwb3dpZWRuaWVnbyBzZWxlY3RhIGFscGhhIHcgbWVudSB0b3Bcblx0XHRcdFx0JCgnI2FscGhhX2ltYWdlIG9wdGlvbltuYW1lPVwiJytcdGltYWdlLmFscGhhICsnXCJdJykuYXR0cignc2VsZWN0ZWQnLHRydWUpO1xuXG5cdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHQvL3pha3R1YWxpem93YW5pZSBkYW55Y2ggdyBpbnB1dGFjaFxuXHRcdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLCBjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHRcdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JywgY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG5cdFx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOmNhbnZhcy53aWR0aF9jYW52YXMrJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnfSk7XG5cblx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRjYXRlZ29yaWVzLnNob3dfbGlzdCgpO1xuXHRcdC8vfSk7XG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBtYXB5IHogYmF6eSBkYW55Y2hcblx0Z2V0X21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzO1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdCAgdXJsOiAnL2FwaS9tYXAvJyArIHRoLm1hcF9oYXNoLFxuXHRcdCAgXHR0eXBlOiBcIkdFVFwiLFxuXHRcdCAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHRcdH0pLmRvbmUoZnVuY3Rpb24oIGRhdGEgKSB7XG5cblx0XHRcdC8vY29uc29sZS5sb2coIGRhdGEuZGF0YVswXSApO1xuXG5cdFx0XHQvL3BvIHphcGlzYW5pdSBkYW55Y2ggZG8gYmF6eSBha3R1YWxpenVqZW15IGlkICh3IHByenlwYWRrdSBqZcWbbGkgaXN0bmllamUgbmFkcGlzdWplbXkgamUpXG5cdFx0XHR2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEuZGF0YVswXS5tYXBfanNvbik7XG5cblx0XHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSByZXNwb25zZVswXVswXTtcblx0XHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSByZXNwb25zZVswXVsxXTtcblx0XHRcdHBvaW50ZXJzLnBhZGRpbmdfeCA9IHJlc3BvbnNlWzBdWzJdO1xuXHRcdFx0cG9pbnRlcnMucGFkZGluZ195ID0gcmVzcG9uc2VbMF1bM107XG5cdFx0XHRwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvID0gcmVzcG9uc2VbMF1bNF07XG5cdFx0XHRwb2ludGVycy5zaXplX3BvaW50ZXIgPSByZXNwb25zZVswXVs1XTtcblx0XHRcdHBvaW50ZXJzLm1haW5fa2luZCA9IHJlc3BvbnNlWzBdWzZdO1xuXHRcdFx0Y2FudmFzLnRpdGxlX3Byb2plY3QgPSByZXNwb25zZVswXVs3XTtcblxuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3hcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzJdICk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeVwiXScpLnZhbCggcmVzcG9uc2VbMF1bM10gKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwic2l6ZV9wb2ludGVyXCJdJykudmFsKCByZXNwb25zZVswXVs1XSApO1xuXHRcdFx0JCgnaW5wdXRbbmFtZT1cInRpdGxlX3Byb2plY3RcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzddICk7XG5cblx0XHRcdGlmKCByZXNwb25zZVswXVs0XSApe1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdH1cblxuXHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuaHRtbCgnJyk7XG5cblx0XHRcdHBvaW50ZXJzLmtpbmRzLmZvckVhY2goZnVuY3Rpb24oa2luZCl7XG5cblx0XHRcdFx0aWYoa2luZCA9PSByZXNwb25zZVswXVs2XSl7XG5cdFx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIHNlbGVjdGVkPVwic2VsZWN0ZWRcIiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSk7XG5cblx0XHRcdC8vcG9iaWVyYW15IGRhbmUgbyBwb2ludGVyYWNoXG5cdFx0XHRwb2ludGVycy5wb2ludGVycyA9IHJlc3BvbnNlWzFdO1xuXG5cdFx0XHQvL3BvYmllcmFteSBkYW5lIG8ga2F0ZWdvcmlhY2hcblx0XHRcdGNhdGVnb3JpZXMuY2F0ZWdvcnkgPSByZXNwb25zZVsyXTtcblxuXHRcdFx0Ly9wb2JpZXJhbmllIGRhbnljaCBvIHpkasSZY2l1IGplxbxlbGkgaXN0bmllamVcblx0XHRcdGlmKCByZXNwb25zZVszXS5sZW5ndGggPiAyKXtcblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cdFx0XHRcdGltYWdlLm9iai5zcmMgPSByZXNwb25zZVszXVswXTtcblx0XHRcdFx0aW1hZ2UueCA9IHBhcnNlSW50KCByZXNwb25zZVszXVsxXSApO1xuXHRcdFx0XHRpbWFnZS55ID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzJdICk7XG5cdFx0XHRcdGltYWdlLndpZHRoID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzNdICk7XG5cdFx0XHRcdGltYWdlLmhlaWdodCA9IHBhcnNlSW50KCByZXNwb25zZVszXVs0XSApO1xuXHRcdFx0XHRpbWFnZS5hbHBoYSA9IHBhcnNlSW50KCByZXNwb25zZVszXVs1XSApO1xuXG5cdFx0XHRcdC8vemF6bmFjemVuaWUgb2Rwb3dpZWRuaWVnbyBzZWxlY3RhIGFscGhhIHcgbWVudSB0b3Bcblx0XHRcdFx0JCgnI2FscGhhX2ltYWdlIG9wdGlvbltuYW1lPVwiJytcdGltYWdlLmFscGhhICsnXCJdJykuYXR0cignc2VsZWN0ZWQnLHRydWUpO1xuXG5cdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHQvL3pha3R1YWxpem93YW5pZSBkYW55Y2ggdyBpbnB1dGFjaFxuXHRcdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLCBjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHRcdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JywgY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG5cdFx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOmNhbnZhcy53aWR0aF9jYW52YXMrJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnfSk7XG5cblx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRjYXRlZ29yaWVzLnNob3dfbGlzdCgpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8vdHdvcnp5bXkgbm93xIUgbWFwxJkgZGFueWNoXG5cdGNyZWF0ZV9tYXAgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9ha3R1YWxpenVqZW15IGpzb25hIGRvIHd5c8WCYW5pYSBhamF4ZW1cblx0XHR0aGlzLmdldF9kYXRhKCk7XG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblx0XHQvL2NvbnNvbGUubG9nKCdjcmVhdGUnLHRoLm1hcF9qc29uKTtcblxuXHRcdC8vd3lzeXPFgmFteSBkYW5lIGFqYXhlbSBkbyBiYXp5IGRhbnljaFxuXHRcdC8vY2FudmFzLmRyYXdfdGh1bW5haWwoKTtcblx0XHQvL25ld19pbWFnZSA9IGltYWdlLmRhdGFVUkl0b0Jsb2IoIGNhbnZhcy50aHVtYm5haWwudG9EYXRhVVJMKCkgKTtcblx0XHQvL2NhbnZhcy5kcmF3KCk7XG5cblx0XHQvL3ZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiYWN0aW9uXCIsXHQnY3JlYXRlX21hcCcgKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9uYW1lXCIsIGNhbnZhcy50aXRsZV9wcm9qZWN0KTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9qc29uXCIsIHRoLm1hcF9qc29uKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9pbWFnZVwiLCBuZXdfaW1hZ2UpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiX21ldGhvZFwiLCAnUE9TVCcpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiX3Rva2VuXCIsIGNzcmZfdG9rZW4pO1xuXHRcdFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2pzb246IHRoLm1hcF9qc29uXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9tYXBzXCIsXG5cdFx0XHRkYXRhOiB7IG1hcF9qc29uOiB0aC5tYXBfanNvbiB9LFxuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHR0aC5tYXBfaGFzaCA9IHJlc3BvbnNlLmhhc2hfbWFwO1xuXHRcdFx0XHRhbGVydCgnemFwaXNhbm8gbm93xIUgbWFwxJknKTtcblx0XHRcdFx0bWVudV90b3AuZ2V0X21hcHMoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vYWt0dWFsaXp1amVteSBtYXDEmVxuXHR1cGRhdGVfbWFwIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5nZXRfZGF0YSgpO1xuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL2NhbnZhcy5kcmF3X3RodW1uYWlsKCk7XG5cdFx0Ly9uZXdfaW1hZ2UgPSBpbWFnZS5kYXRhVVJJdG9CbG9iKCBjYW52YXMudGh1bWJuYWlsLnRvRGF0YVVSTCgpICk7XG5cdC8qXG5cdFx0dmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX2hhc2hcIiwgdGgubWFwX2hhc2ggKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJtYXBfbmFtZVwiLCBjYW52YXMudGl0bGVfcHJvamVjdCk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX2pzb25cIiwgdGgubWFwX2pzb24pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9pbWFnZVwiLCBuZXdfaW1hZ2UpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIl9tZXRob2RcIiwgJ1BVVCcpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIl90b2tlblwiLCBjc3JmX3Rva2VuKTtcblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogYmFzaWNfdXJsICsgXCIvbWFwL1wiK3RoLm1hcF9oYXNoLFxuXHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHRjYWNoZTogZmFsc2UsXG5cdFx0XHRjb250ZW50VHlwZTogZmFsc2UsXG5cdFx0XHRwcm9jZXNzRGF0YTogZmFsc2UsXG5cdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIG1hcMSZJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdCovXG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdG1hcF9oYXNoOiB0aC5tYXBfaGFzaCxcblx0XHRcdG1hcF9qc29uOiB0aC5tYXBfanNvblxuXHRcdH1cblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogXCJhcGkvbWFwc1wiLFxuXHRcdFx0Ly9kYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcblx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHR0eXBlOiAnUFVUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIG1hcMSZJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXG5cdFx0Ly91c3V3YW15IG1hcMSZIHogYmF6eSBkYW55Y2hcblx0ZGVsZXRlX21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0Ly9zcHJhd2R6YW15IGN6eSBtYXBhIGRvIHVzdW5pxJljaWEgcG9zaWFkYSBzd29qZSBpZFxuXHRcdGlmKHRoaXMubWFwX2hhc2ggIT0gbnVsbCl7XHRcdFx0XG5cblx0XHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdFx0dXJsOiBcImFwaS9tYXAvXCIrdGgubWFwX2hhc2gsXG5cdFx0XHRcdHR5cGU6ICdERUxFVEUnLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09ICdvaycpe1xuXHRcdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhbGVydCgnYsWCxIVkIHBvZGN6YXMgdXN1d2FuaWEnKTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhbGVydCgnYnJhayBpZGVudHlmaWthdG9yYSBwcm9qZWt0dScpO1xuXHRcdH1cblx0fVxufVxuIiwiLy9mdW5rY2plIHJ5c3VqxIVjZSBwb2plZHnFhGN6eSBwdW5rdCAocG9pbnRlcilcbnZhciBmaWd1cmVzID0ge1xuXG5cdHNxdWFyZSA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHRjYW52YXMuY29udGV4dC5maWxsUmVjdCh4LHksc2l6ZSxzaXplKTtcblx0fSxcblxuXHRjaXJjbGUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIHNpemUgPSBzaXplIC8gMjtcblx0XHR2YXIgY2VudGVyX3ggPSB4ICsgc2l6ZTtcblx0XHR2YXIgY2VudGVyX3kgPSB5ICsgc2l6ZTtcblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5hcmMoY2VudGVyX3gsIGNlbnRlcl95LCBzaXplLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbCgpO1xuXHR9LFxuXG5cdGhleGFnb24gIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBhID0gc2l6ZS80O1xuXHRcdHZhciBhMiA9IHNpemUvMjtcblx0XHR2YXIgaCA9IHNpemUvMipNYXRoLnNxcnQoMykvMjtcblxuXHRcdGNhbnZhcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0Lm1vdmVUbyh4LHkrYTIpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EseSthMi1oKTtcbiAgXHRjYW52YXMuY29udGV4dC5saW5lVG8oeCthK2EyLHkrYTItaCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZSx5K2EyKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCtzaXplLWEseSthMitoKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbCgpO1xuXHR9LFxuXG5cdGhleGFnb24yIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBhID0gc2l6ZS80O1xuXHRcdHZhciBhMiA9IHNpemUvMjtcblx0XHR2YXIgaCA9IHNpemUvMipNYXRoLnNxcnQoMykvMjtcblxuXHRcdGNhbnZhcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0Lm1vdmVUbyh4K2EyLHkpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyK2gseSthKTtcbiAgXHRjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYTIrYSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIseStzaXplKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMi1oLHkrYTIrYSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblxuXHR9XG59XG4iLCIvL2Z1bmtjamUgZ2xvYmFsbmUga29udGVuZXIgbmEgd3N6eXN0a28gaSBuaWMgOylcbnZhciBnbG9iYWwgPSB7XG5cdHRvb2dsZV9wYW5lbCAgOiBmdW5jdGlvbihldmVudCl7XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRrYSBkbGEgbW96aWxsaVxuXHRcdGlmKCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdyaWdodCcpID09ICcwcHgnICl7XG5cdFx0XHQkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7cmlnaHQ6IFstJChldmVudC50YXJnZXQpLnBhcmVudCgpLndpZHRoKCktMjAsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBlbHNle1xuICAgIFx0ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtyaWdodDogW1wiMHB4XCIsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblx0fVxufVxuIiwiLy9nxYLDs3duZSB6ZGrEmWNpZSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxudmFyIGltYWdlID0ge1xuXHRvYmogOiB1bmRlZmluZWQsXG5cdHggOiBudWxsLFxuXHR5IDogbnVsbCxcblx0d2lkdGggOiBudWxsLFxuXHRoZWlnaHQgOiBudWxsLFxuXHRhbHBoYSA6IDEwLFxuXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYS8xMDtcblx0XHRjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5vYmosdGhpcy54LHRoaXMueSx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KTtcblxuXHRcdCQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5jc3MoeydoZWlnaHQnOnRoaXMuaGVpZ2h0LCd0b3AnOnRoaXMueSsncHgnLCdsZWZ0JzoodGhpcy54K3RoaXMud2lkdGgpKydweCd9KTtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG5cdH0sXG5cblx0Ly9mdW5rY2phIHBvbW9jbmljemEga29ud2VydHVqxIVjYSBkYXRhVVJJIG5hIHBsaWtcblx0ZGF0YVVSSXRvQmxvYiA6IGZ1bmN0aW9uKGRhdGFVUkkpIHtcbiAgICB2YXIgYmluYXJ5ID0gYXRvYihkYXRhVVJJLnNwbGl0KCcsJylbMV0pO1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXkucHVzaChiaW5hcnkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXSwge3R5cGU6ICdpbWFnZS9wbmcnfSk7XG5cdH1cblxufVxuIiwidmFyIGRhdGFfaW5wdXQgPSB7XG5cblx0Ly9wb2JpZXJhbmllIGluZm9ybWFjamkgeiBpbnB1dMOzdyBpIHphcGlzYW5pZSBkbyBvYmlla3R1IG1hcF9zdmdcblx0Z2V0IDogZnVuY3Rpb24oKXtcblx0XHRtYXAubmFtZSA9ICQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCgpO1xuXHRcdG1hcC5wYXRoID0gJCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCkucmVwbGFjZSgvXCIvZywgXCInXCIpO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBpbmZvcm1hY2ppIHogb2JpZWt0dSBtYXBfc3ZnIGkgemFwaXNhbmllIGRvIGlucHV0w7N3XG5cdHNldCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCBtYXAubmFtZSApO1xuXHRcdCQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCggbWFwLnBhdGggKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9XG5cbn1cbiIsIi8vbGlzdGEgb2JpZWt0w7N3XG5cblxuLypcbnZhciBjYW52YXMgPSBuZXcgX2NhbnZhcygpOyAvL29iaWVrdCBjYW52YXNhXG52YXIgY3J1ZCA9IG5ldyBfY3J1ZCgpOyAvL29iaWVrdCBjYW52YXNhXG52YXIgaW1hZ2UgPSBuZXcgX2ltYWdlKCk7IC8vb2JpZWt0IHpkasSZY2lhIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG52YXIgbW91c2UgPSBuZXcgX21vdXNlKCk7XG52YXIgbW9kZWxzID0gbmV3IF9tb2RlbHMoKTtcbnZhciBnbG9iYWwgPSBuZXcgX2dsb2JhbCgpOyAvL2Z1bmtjamUgbmllIHByenlwaXNhbnkgZG8gaW5ueWNoIG9iaWVrdMOzd1xudmFyIGNhdGVnb3JpZXMgPSBuZXcgX2NhdGVnb3JpZXMoKTtcbnZhciBwb2ludGVycyA9IG5ldyBfcG9pbnRlcnMoKTtcbnZhciBjb2xvcnBpY2tlciA9IG5ldyBfY29sb3JwaWNrZXIoKTtcbi8vdmFyIG1lbnVfdG9wID0gbmV3IF9tZW51X3RvcCgpO1xudmFyIGZpZ3VyZXMgPSBuZXcgX2ZpZ3VyZXMoKTtcbiovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblxuXHRtZW51X3RvcC5nZXRfbWFwcygpO1xuXG5cblx0Ly96YWJsb2tvd2FuaWUgbW/FvGxpd2/Fm2NpIHphem5hY3phbmlhIGJ1dHRvbsOzdyBwb2RjemFzIGVkeWNqaSBwb2xhXG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNpblwiLFwiaW5wdXRcIixmdW5jdGlvbigpeyBtZW51X3RvcC5kaXNhYmxlX3NlbGVjdCA9IHRydWU7IH0pO1xuXHQkKGRvY3VtZW50KS5vbihcImZvY3Vzb3V0XCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gZmFsc2U7IH0pO1xuXG5cblx0JCgnI3Rvb2xiYXJfdG9wIGJ1dHRvbi5zYXZlJykuY2xpY2soZnVuY3Rpb24oKXsgXG5cblx0XHQvL2plxZtsaSBuaWUgbWFteSB6ZGVmaW5pb3dhbmVnYSBoYXNoYSB0d29yenlteSBub3fEhSBtYXDEmSB3IHByemVjaXdueW0gd3lwYWRrdSBha3R1YWxpenVqZW15IGp1xbwgaXN0bmllasSFY8SFXG5cdFx0XG5cdFx0Y29uc29sZS5sb2coJ2NydWQnLGNydWQubWFwX2hhc2gpXG5cblx0XHRpZih0eXBlb2YgY3J1ZC5tYXBfaGFzaCA9PSAnc3RyaW5nJyl7XG5cdFx0XHRcblx0XHRcdGNydWQudXBkYXRlX21hcCgpO1xuXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRcblx0XHRcdGNydWQuY3JlYXRlX21hcCgpO1xuXHRcdFxuXHRcdH1cblxuXHR9KTtcblxuXG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uZGVsZXRlJykuY2xpY2soZnVuY3Rpb24oKXsgXG5cdFx0XG5cdFx0aWYoY29uZmlybSgnQ3p5IGNoY2VzeiB1c3VuxIXEhyBtYXDEmSA/Jykpe1xuXHRcdFx0aWYodHlwZW9mIGNydWQubWFwX2hhc2ggPT0gJ3N0cmluZycpeyBjcnVkLmRlbGV0ZV9tYXAoKTsgfVxuXHRcdH1cblxuXHR9KTtcblxuXG5cdC8vb2R6bmFjemVuaWUgc2VsZWN0YSBwcnp5IHptaWFuaWVcblx0JCgnI2NoYW5nZV9jYXRlZ29yeScpLmNoYW5nZShmdW5jdGlvbigpeyAkKCcjY2hhbmdlX2NhdGVnb3J5JykuYmx1cigpOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHB1c2N6ZW5pYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgbW91c2UubW91c2VfZG93biA9IGZhbHNlOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHdjacWbbmnEmWNpYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cdFxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vxYJhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7XG5cdFxuXHR9KTtcblxuXHQvL3d5d2/FgmFuaWUgZnVua2NqaSBwb2RjemFzIHBvcnVzemFuaWEgbXlzemvEhVxuXHQkKGRvY3VtZW50KS5tb3VzZW1vdmUoZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0aWYobW91c2UubW91c2VfZG93bikgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblx0XHRpZihtZW51X3RvcC5hdXRvX2RyYXcpeyBtb3VzZS5jbGlja19vYmogPSBcImNhbnZhc1wiOyBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO31cblx0XG5cdH0pO1xuXG5cdCQoJyNtYWluX2NhbnZhcycpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7Ly96YXJlamVzdHJvd2FuaWUgb2JpZWt0dXcgIGt0w7NyeSBrbGlrYW15XG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0bW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblxuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7XG5cblx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdFx0cG9pbnRlcnMubGFzdF9yb3cgPSBudWxsO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSBjYW52YXMuY29udGV4dF9uZXdfeDtcblx0XHRjYW52YXMuY29udGV4dF95ID0gY2FudmFzLmNvbnRleHRfbmV3X3k7XG5cblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaVxuXHQkKCcjYWRkX2NhdGVnb3J5JykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuXHR9KTtcblxuXHQvL2RvZGFuaWUgbm93ZWoga2F0ZWdvcmlpIChwbyB3Y2nFm25pxJljaXUgZW50ZXIpXG5cdCQoJ2lucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS5rZXlwcmVzcyhmdW5jdGlvbihlKSB7XG4gICAgXHRpZihlLndoaWNoID09IDEzKSB7XG4gICAgXHRcdGNhdGVnb3JpZXMuYWRkKCk7XG4gICAgXHR9XG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHsgbWVudV90b3Auc3dpdGNoX21vZGUoIGUud2hpY2ggKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJmb2N1c291dFwiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZSkgeyBpZihlLndoaWNoID09IDEzKSB7Y2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0gfSk7XG5cblx0Ly91c3VuacSZY2llIGthdGVnb3JpaVxuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJidXR0b24ucmVtb3ZlXCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy5yZW1vdmUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgIH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKSB7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgIH0pO1xuXG5cdC8vcG9rYXphbmllIC8gdWtyeWNpZSBwYW5lbHUga2F0ZWdvcmlpXG5cdCQoJyNjYXRlZ29yeV9ib3ggaDIsICNwb2ludGVyX2JveCBoMicpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXsgZ2xvYmFsLnRvb2dsZV9wYW5lbChldmVudCk7IH0pO1xuXG5cdC8vb2JzxYJ1Z2EgYnV0dG9uw7N3IGRvIGlua3JlbWVudGFjamkgaSBkZWtyZW1lbnRhY2ppIGlucHV0w7N3XG5cdCQoJ2J1dHRvbi5pbmNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2luY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXHQkKCdidXR0b24uZGVjcmVtZW50JykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLmJ1dHRvbl9kZWNyZW1lbnQoICQodGhpcykgKSB9KTtcblxuXHQvL29ixYJ1Z2EgaW5wdXTDs3cgcG9icmFuaWUgZGFueWNoIGkgemFwaXNhbmllIGRvIGJhenlcblx0JCgnLnN3aXRjaCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9zd2l0Y2goICQodGhpcykgKTsgfSk7IC8vcHJ6eWNpc2tpIHN3aXRjaFxuXHQkKCcuaW5wdXRfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXQoICQodGhpcykgKTsgfSk7IC8vdHJhZHljeWpuZSBpbnB1dHlcblx0JCgnLmlucHV0X2Jhc2VfdGV4dCcpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXRfdGV4dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuc2VsZWN0X2Jhc2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3NlbGVjdCggJCh0aGlzKSApOyB9KTsgLy9saXN0eSByb3p3aWphbmUgc2VsZWN0XG5cblx0JCgnI21lbnVfdG9wICNpbmNyZW1lbnRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuaW5jcmVtZW50X3NjYWxlKCk7IH0pO1xuXHQkKCcjbWVudV90b3AgI2RlY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5kZWNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjYWRkX2ltYWdlJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuYWRkX2ltYWdlKCk7IH0pO1xuXG5cdCQoJyNtZW51X3RvcCAjcmVzZXRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgY2FudmFzLnNldF9kZWZhdWx0KCk7IH0pO1xuXG5cdCQoJyNkdXBsaWNhdGUnKS5jbGljayhmdW5jdGlvbigpeyBpZihjb25maXJtKFwiY3p5IGNoY2VzeiBza29waW93YcSHIGFrdHVhbG7EhSBtYXDEmSA/ID9cIikpe2NydWQuZHVwbGljYXRlKCk7fSB9KTtcblxuXHQvL3ByenlwaXNhbmllIHBvZHN0YXdvd293eWNoIGRhbnljaCBkbyBvYmlla3R1IGNhbnZhc1xuXHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5fY2FudmFzJyk7XG4gIGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBjYW52YXMud2lkdGhfY2FudmFzID0gcGFyc2VJbnQoICQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJykgKTtcbiAgY2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JykgKTtcbiAgdmFyIG9mZnNldCA9ICQoJyNjYW52YXNfYm94Jykub2Zmc2V0KCk7XG4gIGNhbnZhcy5vZmZzZXRfbGVmdCA9IG9mZnNldC5sZWZ0O1xuICBjYW52YXMub2Zmc2V0X3RvcCA9IG9mZnNldC50b3A7XG5cbiAgLy90d29yenlteSB0YWJsaWNlIHBvaW50ZXLDs3dcblx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cbiAgJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbChjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbChjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnKTtcbiAgJCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgsI2NhbnZhc19pbmZvICNoZWlnaHQsI2NhbnZhc19pbmZvICNzaXplJykuY2hhbmdlKGZ1bmN0aW9uKCl7bWVudV90b3AudXBkYXRlX2NhbnZhc19pbmZvKCl9KTtcblxuXHQkKCcjYWxwaGFfaW1hZ2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2FscGhhKCkgfSk7XG5cblx0JCgnaW5wdXQnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyB9KTtcblx0JCgnaW5wdXQnKS5mb2N1c291dChmdW5jdGlvbigpeyBtZW51X3RvcC5tb2RlX2tleSA9IHRydWU7IH0pO1xuXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgY2FudmFzLmRyYXcoKTsgfSk7XG5cdGNhbnZhcy5kcmF3KCk7IC8vcnlzb3dhbmllIGNhbnZhc1xuXG5cdC8vemFwaXN1amVteSBsdWIgYWt0dWFsaXp1amVteSBtYXDEmSBwbyBrbGlrbmnEmWNpdSB3IGJ1dHRvdyB3IHphbGXFvG5vxZtjaSBvZCB0ZWdvIGN6eSBtYW15IHpkZWZpbmlvd2FuZSBpZCBtYXB5XG5cdCQoJy5tZW51X3JpZ2h0IC5zYXZlJykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRpZihjcnVkLm1hcF9oYXNoID09IG51bGwpeyBjcnVkLmNyZWF0ZV9tYXAoKTsgfVxuXHRcdGVsc2V7IGNydWQudXBkYXRlX21hcCgpOyB9XG5cdH0pO1xuXG5cdC8vdXN1d2FteSBtYXDEmSBwbyBrbGlrbmnEmWNpdSB3IGJ1dHRvblxuXHQkKCcubWVudV9yaWdodCAucmVtb3ZlJykuY2xpY2soZnVuY3Rpb24oKXtpZihjb25maXJtKFwiY3p5IG5hcGV3bm8gdXN1bsSFxIcgbWFwxJkgP1wiKSl7Y3J1ZC5kZWxldGVfbWFwKCk7fSB9KTtcblxufSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxudmFyIG1lbnVfdG9wID0ge1xuXG5cdG1vdmVfaW1hZ2UgOiBmYWxzZSxcblx0bW92ZV9jYW52YXMgOiBmYWxzZSxcblx0YXV0b19kcmF3IDogZmFsc2UsXG5cdG1vZGVfa2V5IDogdHJ1ZSxcblx0Y2F0ZWdvcnkgOiAwLFxuXHRkaXNhYmxlX3NlbGVjdCA6IGZhbHNlLFxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X21hcHMgOiBmdW5jdGlvbigpe1xuXHRcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvbWFwcycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgbWFwIHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICcnO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXBzJykuYXBwZW5kKCBhZGRfaHRtbCApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0XHQvL2RvZGFqZW11IHpkYXJ6ZW5pZSBjaGFuZ2UgbWFwXG5cdFx0JCgnLnNlbGVjdF9tYXBzJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcblx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd8SFIG1hcMSZID8nKSkge1xuXHRcdFx0XG5cdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19tYXAnICl7XG5cdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRjcnVkLnNlbGVjdF9tYXAoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcblx0XHR9KTtcblxuXHR9LFxuXG5cdHVwZGF0ZV9jYW52YXNfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLnNjYWxlID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCgpICk7XG5cdFx0Y2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCkgKTtcblx0XHRjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCgpICk7XG5cblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoIGNhbnZhcy5zY2FsZSArICclJyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoIGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnICk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoIGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4JyApO1xuXG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCAjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRjaGFuZ2VfYWxwaGEgOiBmdW5jdGlvbigpe1xuXHRcdGltYWdlLmFscGhhID0gJCgnI2FscGhhX2ltYWdlJykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0YWRkX2ltYWdlIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vamVzbGkgcG9kYW55IHBhcmFtZXRyIG5pZSBqZXN0IHB1c3R5XG5cdFx0dmFyIHNyY19pbWFnZSA9IHByb21wdChcIlBvZGFqIMWbY2llxbxrxJkgZG8gemRqxJljaWE6IFwiKTtcblxuXHRcdGlmKHNyY19pbWFnZSl7XG5cdFx0XHRpZihzcmNfaW1hZ2UubGVuZ3RoID4gMCl7XG5cblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cblx0XHRcdFx0Ly93Y3p5dGFuaWUgemRqxJljaWE6XG5cdFx0XHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdGltYWdlLndpZHRoID0gaW1hZ2Uub2JqLndpZHRoO1xuXHQgICAgXHRcdGltYWdlLmhlaWdodCA9IGltYWdlLm9iai5oZWlnaHQ7XG5cdCAgICBcdFx0aW1hZ2UuZHJhdygpO1xuXHQgIFx0XHR9O1xuXG5cdFx0XHQgIGltYWdlLnggPSAwO1xuXHRcdFx0ICBpbWFnZS55ID0gMDtcblx0XHRcdCAgaW1hZ2Uub2JqLnNyYyA9IHNyY19pbWFnZTtcblx0XHRcdFx0Ly9zaW1hZ2Uub2JqLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNob3dfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHBhcnNlSW50KGNhbnZhcy5zY2FsZSkgKyAnJScpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwocGFyc2VJbnQoY2FudmFzLndpZHRoX2NhbnZhcykgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbChwYXJzZUludChjYW52YXMuaGVpZ2h0X2NhbnZhcykgKyAncHgnKTtcblx0fSxcblxuXHRpbmNyZW1lbnRfc2NhbGUgOiBmdW5jdGlvbigpe1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLnNjYWxlKz01O1xuXG5cdFx0aWYoY2FudmFzLnNjYWxlID09IDEwMCl7XG5cdFx0XHQkKCcjY2FudmFzX2JveCAjcmlnaHRfcmVzaXplLCAjY2FudmFzX2JveCAjYm90dG9tX3Jlc2l6ZScpLmZhZGVJbig1MDApO1xuXHRcdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlT3V0KDUwMCk7XG5cdFx0XHQkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZU91dCgwKTtcblx0XHR9XG5cblx0XHR2YXIgbmV3X3dpZHRoID0gY2FudmFzLndpZHRoX2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHR2YXIgbmV3X2hlaWdodCA9IGNhbnZhcy5oZWlnaHRfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCc6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JyA6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cblx0XHRjYW52YXMuY29udGV4dC5zY2FsZSggY2FudmFzLnNjYWxlIC8gMTAwICwgY2FudmFzLnNjYWxlIC8gMTAwICk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXG5cdFx0dGhpcy5zaG93X2luZm8oKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGRlY3JlbWVudF9zY2FsZSA6IGZ1bmN0aW9uKCl7XG5cdFx0aWYoY2FudmFzLnNjYWxlID4gMTAwKXtcblx0XHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdFx0Y2FudmFzLnNjYWxlIC09IDU7XG5cblx0XHRcdGlmKGNhbnZhcy5zY2FsZSA9PSAxMDApe1xuXHRcdFx0XHQkKCcjY2FudmFzX2JveCAjcmlnaHRfcmVzaXplLCAjY2FudmFzX2JveCAjYm90dG9tX3Jlc2l6ZScpLmZhZGVJbig1MDApO1xuXHRcdFx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHQkKCcjY2FudmFzX2JveCAjcmlnaHRfcmVzaXplLCAjY2FudmFzX2JveCAjYm90dG9tX3Jlc2l6ZScpLmZhZGVPdXQoNTAwKTtcblx0XHRcdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmZhZGVPdXQoMCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCc6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cdFx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHRcdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXG5cdFx0XHR0aGlzLnNob3dfaW5mbygpO1xuXHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHR9XG5cdH0sXG5cblx0c3dpdGNoX21vZGUgOiBmdW5jdGlvbihrZXkpe1xuXHRcdGlmKCF0aGlzLmRpc2FibGVfc2VsZWN0KXtcblx0XHRcdGlmKHRoaXMubW9kZV9rZXkpe1xuXHRcdFx0XHRzd2l0Y2goa2V5KXtcblxuXHRcdFx0XHRcdGNhc2UgMTA1OiAvL3BvcnVzemFuaWUgemRqxJljaWVtXG5cdFx0XHRcdFx0XHRpZihpbWFnZS5vYmope1xuXHRcdFx0XHRcdFx0XHRpZih0aGlzLm1vdmVfaW1hZ2Upe1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMubW92ZV9pbWFnZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9pbWFnZScpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0XHQkKCcjY2FudmFzX3dyYXBwZXIgI2ltYWdlX3Jlc2l6ZScpLmhpZGUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMubW92ZV9pbWFnZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5hdXRvX2RyYXcgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfY2FudmFzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNtb3ZlX2ltYWdlJykuY3NzKCdiYWNrZ3JvdW5kJywnIzM0YTgxYycpO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjYXV0b19kcmF3JykuY3NzKCdiYWNrZ3JvdW5kJywnI2FhYScpO1xuXHRcdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9jYW52YXMnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHRcdFx0JCgnI2NhbnZhc193cmFwcGVyICNpbWFnZV9yZXNpemUnKS5zaG93KCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgMTAwOiAvL3J5c293YW5pZSBiZXogd2Npc25pxJljaWEgcHJ6eWNpc2t1XG5cblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcblxuXHRcdFx0XHRcdFx0aWYodGhpcy5hdXRvX2RyYXcpe1xuXHRcdFx0XHRcdFx0XHR0aGlzLmF1dG9fZHJhdyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I2F1dG9fZHJhdycpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdHRoaXMuYXV0b19kcmF3ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2NhbnZhcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfaW1hZ2UgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNtb3ZlX2NhbnZhcycpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNtb3ZlX2ltYWdlJykuY3NzKCdiYWNrZ3JvdW5kJywnI2FhYScpO1xuXHRcdFx0XHRcdFx0XHQkKCcjbWVudV90b3AgZGl2I2F1dG9fZHJhdycpLmNzcygnYmFja2dyb3VuZCcsJyMzNGE4MWMnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgOTk6IC8vcG9ydXN6YW5pZSBjYcWCeW0gY2FudmFzZW1cblx0XHRcdFx0XHRcdGlmKHRoaXMubW92ZV9jYW52YXMpe1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfY2FudmFzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9jYW52YXMnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdmVfY2FudmFzID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZlX2ltYWdlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdHRoaXMuYXV0b19kcmF3ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9jYW52YXMnKS5jc3MoJ2JhY2tncm91bmQnLCcjMzRhODFjJyk7XG5cdFx0XHRcdFx0XHRcdCQoJyNtZW51X3RvcCBkaXYjbW92ZV9pbWFnZScpLmNzcygnYmFja2dyb3VuZCcsJyNhYWEnKTtcblx0XHRcdFx0XHRcdFx0JCgnI21lbnVfdG9wIGRpdiNhdXRvX2RyYXcnKS5jc3MoJ2JhY2tncm91bmQnLCcjYWFhJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIi8vIHBvYmllcmFuaWUgZGFueWNoIHogc2VsZWt0YSBpbnB1dGEgc3dpdGNoeSAoYWt0dWFsaXphY2phIG9iaWVrdMOzdykgYnV0dG9uIGlua3JlbWVudCBpIGRla3JlbWVudFxudmFyIG1vZGVscyA9IHtcblxuXHRidXR0b25faW5jcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgKyAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHRidXR0b25fZGVjcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgLSAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBwYXJzZUludCgkKG9iaikudmFsKCkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21faW5wdXRfdGV4dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikudmFsKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9zZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gJChvYmopLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3N3aXRjaCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0aWYoICQob2JqKS5hdHRyKFwidmFsdWVcIikgPT0gJ2ZhbHNlJyApe1xuXHRcdFx0JChvYmopLmF0dHIoXCJ2YWx1ZVwiLCd0cnVlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQob2JqKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZXsgLy93ecWCxIVjemFteSBwcnplxYLEhWN6bmlrXG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ2ZhbHNlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vdmFyIGJpcW1hcCA9IGJpcW1hcCB8fCB7fTtcbi8vYmlxbWFwLm1hcCA9IGJpcW1hcC5tYXAgfHwge307IFxuXG4vL29iaWVrdCBteXN6a2kgKGRvIG9nYXJuaWVjaWEpXG52YXIgbW91c2UgPSB7XG5cdG1vdXNlX2Rvd24gOiBmYWxzZSxcblx0Y2xpY2tfb2JqIDogbnVsbCxcblxuXHR0bXBfbW91c2VfeCA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cdHRtcF9tb3VzZV95IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblxuXHRsZWZ0IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpXG5cdHRvcCA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praVxuXHRwYWRkaW5nX3ggOiBudWxsLCAvL3BvenljamEgeCBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0cGFkZGluZ195IDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdG9mZnNldF94IDogbnVsbCwgLy9vZmZzZXQgeCBvYmlla3R1IGtsaWtuacSZdGVnb1xuXHRvZmZzZXRfeSA6IG51bGwsIC8vb2Zmc2V0IHkgb2JpZWt0dSBrbGlrbmnEmXRlZ29cblxuXHQvL2Z1bmNramEgd3lrcnl3YWrEhWNhIHcgY28ga2xpa25pxJl0byBwb2JpZXJhasSFY2EgcGFkZGluZyBrbGlrbmnEmWNpYSBvcmF6IHphcGlzdWrEhWNhIGtsaWtuacSZY2llXG5cdHNldF9tb3VzZV9kb3duIDogZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0dmFyIG9iaiA9IGV2ZW50LnRhcmdldDtcblxuXHRcdC8vamXFm2xpIGVsZW1lbnQgbmEga3TDs3J5IGtsaWtuacSZdG8gbWEgYXRyeWJ1dCBuYW1lY2xpY2sgcHJ6eXBpc3VqZW15IGdvIGRvIG9iaWVrdHUgbXlzemtpXG5cdFx0aWYodHlwZW9mKCQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHR0aGlzLmNsaWNrX29iaiA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKTtcblxuXHRcdFx0dmFyIHBvc2l0aW9uID0gJChvYmopLm9mZnNldCgpO1xuXHRcdFx0dGhpcy5vZmZzZXRfeCA9IHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLm9mZnNldF95ID0gcG9zaXRpb24udG9wO1xuXHRcdFx0dGhpcy5wYWRkaW5nX3ggPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5wYWRkaW5nX3kgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDtcblx0XHRcdHRoaXMubW91c2VfZG93biA9IHRydWU7XG5cblx0XHRcdHRoaXMudG1wX21vdXNlX3ggPSBpbWFnZS54O1xuXHRcdFx0dGhpcy50bXBfbW91c2VfeSA9IGltYWdlLnk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR0aGlzLmxlZnQgPSBldmVudC5wYWdlWCxcblx0XHR0aGlzLnRvcCA9IGV2ZW50LnBhZ2VZXG5cdH0sXG5cblx0Ly9mdW5rY2phIHd5a29ueXdhbmEgcG9kY3phcyB3Y2nFm25pZWNpYSBwcnp5Y2lrc2t1IG15c3praSAodyB6YWxlxbxub8WbY2kgb2Qga2xpa25pxJl0ZWdvIGVsZW1lbnR1IHd5a29udWplbXkgcsOzxbxuZSByemVjenkpXG5cdG1vdXNlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHRzd2l0Y2godGhpcy5jbGlja19vYmopeyBcblx0XHRcdGNhc2UgJ3JpZ2h0X3Jlc2l6ZSc6XG5cdFx0XHRcdC8vcm96c3plcnphbmllIGNhbnZhc2EgdyBwcmF3b1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdHZhciBuZXdfd2lkdGggPSB0aGlzLmxlZnQgLSB0aGlzLnBhZGRpbmdfeCAtIHBvc2l0aW9uLmxlZnRcblx0XHRcdFx0aWYobmV3X3dpZHRoIDwgc2NyZWVuLndpZHRoIC0gMTAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2l6ZV93aWR0aChuZXdfd2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYm90dG9tX3Jlc2l6ZSc6XG5cdFx0XHRcdC8vem1pZW5pYW15IHd5c29rb8WbxIcgY2FudmFzYVxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdGNhbnZhcy5yZXNpemVfaGVpZ2h0KHRoaXMudG9wIC0gdGhpcy5wYWRkaW5nX3kgLSBwb3NpdGlvbi50b3ApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2ltYWdlX3Jlc2l6ZSc6XG5cblx0XHRcdFx0aWYoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XHQvL2FrdHVhbG5hIHBvenljamEgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHN1YnN0cmFjdCA9IGltYWdlLnggKyBpbWFnZS53aWR0aCAtIHhfYWN0dWFsICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0XHRcdFx0dmFyIGZhY29yID0gaW1hZ2Uud2lkdGggLyBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdFx0XHRpZiAoaW1hZ2Uud2lkdGggLSBzdWJzdHJhY3QgPiAxMDApe1xuXHRcdFx0XHRcdFx0aW1hZ2Uud2lkdGggLT0gc3Vic3RyYWN0O1xuXHRcdFx0XHRcdFx0aW1hZ2UuaGVpZ2h0IC09IHN1YnN0cmFjdC9mYWNvcjtcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnY2FudmFzJzpcblxuXHRcdFx0XHQvL3ByemVzdXdhbmllIHpkasSZY2llbSAobnAuIG1hcGEgLyB3em9yemVjKVxuXHRcdFx0XHRpZigobWVudV90b3AubW92ZV9pbWFnZSkgJiYgKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblxuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7IC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgeV9hY3R1YWwgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDsgLy8gYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblxuXHRcdFx0XHRcdHZhciB4X3RyYW5zbGF0ZSA9IHhfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3ggKyBtb3VzZS50bXBfbW91c2VfeDsgLy9wcnplc3VuacSZY2llIG9icmF6a2Egd3pnbMSZZGVtIGFrdHVhbG5laiBwb3p5Y2ppIG15c3praVxuXHRcdFx0XHRcdHZhciB5X3RyYW5zbGF0ZSA9IHlfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3kgKyBtb3VzZS50bXBfbW91c2VfeTsgLy9wcnplc3VuaWVjaWUgb2JyYXprYSB3emdsxJlkZW0gYWt0dWFsbmVqIHBvenljamkgbXlzemtpXG5cblx0XHRcdFx0XHR2YXIgeF9uZXcgPSB4X3RyYW5zbGF0ZSA7XG5cdFx0XHRcdFx0dmFyIHlfbmV3ID0geV90cmFuc2xhdGUgO1xuXG5cdFx0XHRcdFx0aW1hZ2UueCA9IHhfbmV3O1xuICAgICAgXHRcdGltYWdlLnkgPSB5X25ldztcbiAgICAgIFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9yeXNvd2FuaWVcblx0XHRcdFx0ZWxzZSBpZiAoKCFtZW51X3RvcC5tb3ZlX2ltYWdlKSAmJiAoIW1lbnVfdG9wLm1vdmVfY2FudmFzKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciByb3dfY2xpY2sgPSBwYXJzZUludCggKHRoaXMudG9wIC0gY2FudmFzLm9mZnNldF90b3AgKyBjYW52YXMuY29udGV4dF95KigtMSkgKSAvICggKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeSkqKGNhbnZhcy5zY2FsZSAvIDEwMCkgICkgKTtcblx0XHRcdFx0XHR2YXIgY29sdW1uX2NsaWNrID0gcGFyc2VJbnQoICh0aGlzLmxlZnQgLSBjYW52YXMub2Zmc2V0X2xlZnQgKyBjYW52YXMuY29udGV4dF94KigtMSkgKSAvICggKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeCkqKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSApO1xuXG5cdFx0XHRcdC8vXHRjb25zb2xlLmxvZygna2xpaycscm93X2NsaWNrLGNvbHVtbl9jbGljayxjYW52YXMuY29udGV4dF94LGNhbnZhcy5jb250ZXh0X3kpO1xuXG5cdFx0XHRcdFx0aWYoKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICYmIChyb3dfY2xpY2slMiA9PTApKXtcblx0XHRcdFx0XHRcdC8vY29sdW1uX2NsaWNrID0gcGFyc2VJbnQoICh0aGlzLmxlZnQgLSBjYW52YXMub2Zmc2V0X2xlZnQgLSBwb2ludGVycy5zaXplX3BvaW50ZXIvMikgLyAoKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeCkqKGNhbnZhcy5zY2FsZSAvIDEwMCkpICApO1xuXHRcdFx0XHRcdFx0Y29sdW1uX2NsaWNrID0gcGFyc2VJbnQoICh0aGlzLmxlZnQgLSBjYW52YXMub2Zmc2V0X2xlZnQgKyBjYW52YXMuY29udGV4dF94KigtMSkgLSBwb2ludGVycy5zaXplX3BvaW50ZXIvMikgLyAoIChwb2ludGVycy5zaXplX3BvaW50ZXIgKyBwb2ludGVycy5wYWRkaW5nX3gpKihjYW52YXMuc2NhbGUgLyAxMDApICkgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiggKHJvd19jbGljayA+PSAwKSAmJiAocm93X2NsaWNrIDwgY2FudmFzLmFjdGl2ZV9yb3cpICYmIChjb2x1bW5fY2xpY2sgPj0gMCkgJiYgKGNvbHVtbl9jbGljayA8IGNhbnZhcy5hY3RpdmVfY29sdW1uKSApXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMudXBkYXRlX3BvaW50KHJvd19jbGljayxjb2x1bW5fY2xpY2sscG9pbnRlcnMubGFzdF9yb3cscG9pbnRlcnMubGFzdF9jb2x1bW4pO1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBjb2x1bW5fY2xpY2s7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X3JvdyA9IHJvd19jbGljaztcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X3JvdyA9IG51bGw7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9wcnplc3V3YW5pZSBjYcWCeW0gY2FudmFzZW1cblx0XHRcdFx0ZWxzZSBpZihtZW51X3RvcC5tb3ZlX2NhbnZhcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdFx0XHRcdGNhbnZhcy5jbGVhcigpO1xuXG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHRfbmV3X3ggPSAobW91c2UubGVmdCAtIG1vdXNlLm9mZnNldF94KSAtIG1vdXNlLnBhZGRpbmdfeCArIGNhbnZhcy5jb250ZXh0X3g7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHRfbmV3X3kgPSAobW91c2UudG9wIC0gbW91c2Uub2Zmc2V0X3kpIC0gbW91c2UucGFkZGluZ195ICsgY2FudmFzLmNvbnRleHRfeTtcblxuXHRcdFx0XHRcdGlmKGNhbnZhcy5jb250ZXh0X25ld194ID4gMCkgY2FudmFzLmNvbnRleHRfbmV3X3ggPSAwO1xuXHRcdFx0XHRcdGlmKGNhbnZhcy5jb250ZXh0X25ld195ID4gMCkgY2FudmFzLmNvbnRleHRfbmV3X3kgPSAwO1xuXG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X25ld194IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X25ld195IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSk7XG5cdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cbiIsIi8vbWVudSBwb2ludGVyXG52YXIgcG9pbnRlcnMgPSB7XG5cdHNob3dfYWxsX3BvaW50IDogdHJ1ZSxcblx0cGFkZGluZ194IDogMSxcblx0cGFkZGluZ195IDogMSxcblx0dHJhbnNsYXRlX21vZHVsbyA6IGZhbHNlLFxuXHRzaXplX3BvaW50ZXIgOiAxMCxcblx0bWFpbl9raW5kIDogJ3NxdWFyZScsXG5cdGtpbmRzIDogQXJyYXkoJ3NxdWFyZScsJ2NpcmNsZScsJ2hleGFnb24nLCdoZXhhZ29uMicpLFxuXG5cdHBvaW50ZXJzIDogQXJyYXkoKSwgLy9wb2ludGVycy5wb2ludGVyc1tyemFkXVtrb2x1bW5hXSA6IGthdGVnb3JpYVtudW1lcl1cblxuXHRsYXN0X2NvbHVtbiA6IG51bGwsXHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdGxhc3Rfcm93IDogbnVsbCxcdC8vd2llcnN6IHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXG5cblx0Ly9yeXNvd2FuaWUgd3N6eXN0a2ljaCBwdW5rdMOzd1xuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZV9wb2ludGVyICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0dmFyIGhlaWdodF9wb2ludGVyID0gdGhpcy5zaXplX3BvaW50ZXIgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiXG5cblx0XHRpZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGlmKCAodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gIT0gbWVudV90b3AuY2F0ZWdvcnkpICYmIChtZW51X3RvcC5jYXRlZ29yeSAhPSAwKSApe1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnl7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSBjYXRlZ29yaWVzLmNhdGVnb3J5WyB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSBdWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaChlKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdFUlJPUiAzOSBMSU5FICEgJyx0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSxyb3csY29sdW1uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiggKHJvdyAlIDIgPT0gMCkgJiYgKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICl7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciArIHdpZHRoX3BvaW50ZXIvMiAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZV9wb2ludGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemVfcG9pbnRlcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL3R3b3J6eW15IHRhYmxpY2UgcG9udGVyw7N3IChqZcWbbGkgamFracWbIHBvbnRlciBpc3RuaWVqZSB6b3N0YXdpYW15IGdvLCB3IHByenlwYWRrdSBnZHkgcG9pbnRlcmEgbmllIG1hIHR3b3J6eW15IGdvIG5hIG5vd28pXG5cdGNyZWF0ZV9hcnJheSA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmFjdGl2ZV9yb3cgPSBwYXJzZUludCggY2FudmFzLmhlaWdodF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdGNhbnZhcy5hY3RpdmVfY29sdW1uID0gcGFyc2VJbnQoIGNhbnZhcy53aWR0aF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXG5cdFx0aWYoICh0aGlzLnBvaW50ZXJzLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfcm93KSB8fCAodGhpcy5wb2ludGVyc1swXS5sZW5ndGggPCBjYW52YXMuYWN0aXZlX2NvbHVtbikgKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddID09IHVuZGVmaW5lZCkgdGhpcy5wb2ludGVyc1tyb3ddID0gbmV3IEFycmF5KCk7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gdW5kZWZpbmVkKVx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZV9wb2ludCA6IGZ1bmN0aW9uKHkseCx5X2xhc3QseF9sYXN0KXtcblxuXHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblxuXHRcdC8vd3l6bmFjemVuaWUgcsOzd25hbmlhIHByb3N0ZWpcblx0XHRpZiggKCh5X2xhc3QgIT0geSkgfHwgKHhfbGFzdCAhPSB4KSkgJiYgKHlfbGFzdCAhPSBudWxsKSAmJiAoeF9sYXN0ICE9IG51bGwpICl7XG5cdFx0XHR2YXIgYSA9ICh5X2xhc3QgLSB5KSAvICh4X2xhc3QgLSB4KTtcblx0XHRcdHZhciBiID0geSAtIGEqeDtcblxuXHRcdFx0aWYoeF9sYXN0ID4geCl7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHg7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIGNvbF90byA9IHg7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHhfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0aWYoeV9sYXN0ID4geSl7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHk7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHJvd190byA9IHk7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHlfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJvdyA9IG51bGw7XG5cdFx0XHRmb3IodmFyIGNvbCA9IGNvbF9mcm9tOyBjb2wgPD0gY29sX3RvOyBjb2wrKylcblx0XHRcdHtcblx0XHRcdFx0cm93ID0gcGFyc2VJbnQoIGEqY29sK2IgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHJvdykpIHJvdyA9IHk7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjb2wgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciByb3cgPSByb3dfZnJvbTsgcm93IDw9IHJvd190bzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbCA9IHBhcnNlSW50KCAocm93LWIpL2EgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKGNvbCkpIGNvbCA9IHg7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0fVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
