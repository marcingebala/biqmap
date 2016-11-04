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
		//console.log('canvas draw');
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
		//canvas.draw();
		menu_top.show_info();
		//canvas.draw();
	}
}

//obiekt kategorii dodanie / aktualizacja / usunięcie / pokazanie kategorii
var categories = {};
/*	

	//category : new Array(['pusty','#808080']),

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


	//aktualizujemy tablicę kolorów
	update_color : function(){

		//możliwa aktualizacja jedynie w przypadku wybrania konkretnej kolumny wartości i kategorii w excelu
		if((crud.map_json.length > 0) && (excel.data.length > 0) && (layers.category[layers.active] != -1) && (layers.value[layers.active] != -1)){

			for (var i_category = 0, i_category_max =	layers.category_name.length; i_category < i_category_max; i_category++){
				var name = layers.category_name[i_category];

				for (var i_exel = 0, i_exel_max = excel.data.length; i_exel < i_exel_max; i_exel++){
					if( excel.data[i_exel][layers.category[layers.active]] == name){
						//jeśli znaleźliśmy kategorię w excelu
						var value = excel.data[i_exel][layers.value[layers.active]];

						for ( var i_legends = 0, i_legends_max = layers.legends[layers.active].length; i_legends < i_legends_max; i_legends++ ){
							if( (value >= layers.legends[layers.active][i_legends][0]) && (value <= layers.legends[layers.active][i_legends][1]) ){
								//jeśli znaleźlismy
								layers.category_colors[layers.active][i_category] = layers.legends[layers.active][i_legends][3];
								i_legends = i_legends_max;
								i_exel = i_exel_max;
							}
						}

						//jeśli wartość wychodzi poza skale u tak przypisujemy jej odpowiedni kolor
						if(value < layers.legends[layers.active][0][0]){
							layers.category_colors[layers.active][i_category] = layers.legends[layers.active][0][3];
						}	

						if(value > layers.legends[layers.active][i_legends_max-1][1]){
							layers.category_colors[layers.active][i_category] = layers.legends[layers.active][i_legends_max-1][3];
						}

					}
				}
			}
		}

		//po zaktualizowaniu kolorów w kategoriach rysujemy na nowo canvas
		canvas.draw();


	},
}*/

cloud = {

	set_textarea : function(){
		$('#cloud .cloud_text').val( layers.cloud[layers.active] );
	},

	//ustawiamy poprawną pozycję dymka
	set_position : function(){
		var left = mouse.left - on_category.canvas_offset_left;
		var top = mouse.top - on_category.canvas_offset_top;
		var width = $("#canvas_cloud").width();

		if((left + width) > $("body").width()-20){
			left = left - width-20;
		}

 
		$("#canvas_cloud").css({top:parseInt(top - $("#canvas_cloud").height())+'px',left:left+'px'});
	},

	//funkcja odpowiedzialna za wyświetlenie dymka z odpowiednią zawartością
	update_text : function(name){

		if((name != "") && (name != 'null')){

			var tmp_row = null;
			var find = 0;
			for( var i_row = 0, i_row_max = excel.data.length; i_row < i_row_max; i_row++ ){
				if(String(name).toLowerCase() == String(excel.data[i_row][layers.category[layers.active]]).toLowerCase()){
					
					this.set_position();
					var text_tmp = layers.cloud[layers.active];

					for(var i = 0, i_max = excel.data[0].length; i < i_max; i++){
						text_tmp = text_tmp.replace('{'+excel.data[0][i]+'}',excel.data[i_row][i]);
					}
					
					//dopiero jeśli dymek ma mieć jakaś konkretną zawartość wyświetlamy go
					if((text_tmp!="") && ( excel.data[i_row][layers.value[layers.active]] != null )){
						$("#canvas_cloud").fadeIn(0);
						$("#canvas_cloud").html(text_tmp);
						find = 1;
					}
				}
			}

			//jeśli nie znaleziono odpowiedniej kategorii
			if (!find) { 
				$("#canvas_cloud").fadeOut(0);
			}

		}
		else{
			$("#canvas_cloud").fadeOut(0);
		}
	}

}

//funkcja odpowiedzialna za tworzenie zapisywanie i aktualizacje danych dotycząćcyh mapy
//var crud = crud || {}
crud = {

	map_json : Array(), //główna zmienna przechowująca wszystkie dane
	map_hash :null,
	layers : {},
	excel : Array(),
	project : {},
	project_hash : project_hash, //główny hash dotyczący naszego projektu
 
	//wczytanie zmiennych do obiektów mapy

	set_map : function(data){

		//po zapisaniu danych do bazy aktualizujemy id (w przypadku jeśli istnieje nadpisujemy je)
		this.map_json = data;

		//pobieramy i wczytujemy dane o canvasie do obiektu
		canvas.height_canvas = data[0][0];
		canvas.width_canvas = data[0][1];
		pointers.padding_x = data[0][2];
		pointers.padding_y = data[0][3];
		pointers.translate_modulo = data[0][4];
		pointers.size = data[0][5];
		pointers.main_kind = data[0][6];
		canvas.title_project = data[0][7];

		$('#pointer_box input[name="padding_x"]').val( data[0][2] );
		$('#pointer_box input[name="padding_y"]').val( data[0][3] );
		$('#pointer_box input[name="size_pointer"]').val( data[0][5] );
		$('input[name="title_project"]').val( data[0][7] );

		if( data[0][4] ){
			$('#pointer_box div[name="translate_modulo"]').removeClass('switch-off');
			$('#pointer_box div[name="translate_modulo"]').addClass('switch-on');
		}

		$('#pointer_box select[name="main_kind"]').html('');

		pointers.kinds.forEach(function(kind){

			if(kind == data[0][6]){
				$('#pointer_box select[name="main_kind"]').append('<option selected="selected" name="'+kind+'">'+kind+'</option>');
			}
			else{
				$('#pointer_box select[name="main_kind"]').append('<option name="'+kind+'">'+kind+'</option>');
			}

		});

		//pobieramy dane o pointerach
		pointers.pointers = data[1];

		//pobieramy dane o kategoriach
		var categories = {};
		categories.category = data[2];


		//po wczytaniu mapy aktyalizujemy dane dotyczącą kategorii i kolorów
		layers.category_colors[0] = [];
		layers.category_name = [];

		for(var i = 0, i_max = categories.category.length; i < i_max; i++){
			layers.category_name.push(categories.category[i][0]);
			layers.category_colors[0].push(categories.category[i][1]);
		}

		//pobieranie danych o zdjęciu jeżeli istnieje
		if( data[3].length > 2){
			image.obj = new Image();
			image.obj.src = data[3][0];
			image.x = parseInt( data[3][1] );
			image.y = parseInt( data[3][2] );
			image.width = parseInt( data[3][3] );
			image.height = parseInt( data[3][4] );
			image.alpha = parseInt( data[3][5] );

			//zaznaczenie odpowiedniego selecta alpha w menu top
			$('#alpha_image option[name="'+	image.alpha +'"]').attr('selected',true);

			image.obj.onload = function() { canvas.draw(); };
		}

		//zaktualizowanie danych w inputach
		$('#main_canvas').attr('width', canvas.width_canvas+'px');
		$('#main_canvas').attr('height', canvas.height_canvas+'px');
		$('#canvas_box, #canvas_wrapper').css({'width':canvas.width_canvas+'px','height':canvas.height_canvas+'px'});

		//canvas.draw();

	},

	set_project : function(data){

		//wczytujemy dane dotyczące mapy
		this.set_map( JSON.parse(data.map_json) );
		excel.data = JSON.parse(data.excel);

		data.project = JSON.parse(data.project);  
		data.layers = JSON.parse(data.layers); 

		//wczytujemy dane dotyczące projektu
		layers.palets_active = data.layers.palets_active;
		layers.value = data.layers.value;
		layers.colors_pos = data.layers.colors_pos;
		layers.colors_active = data.layers.colors_active;
		layers.min_value = data.layers.min_value;
		layers.max_value = data.layers.max_value;
		layers.cloud = data.layers.cloud;
		layers.cloud_parser = data.layers.cloud_parser;
		layers.legends = data.layers.legends;
		layers.labels = data.layers.labels;
	 	layers.category = 	data.layers.category;
		layers.category_colors = data.layers.category_colors;
		layers.category_name = data.layers.category_name;
		layers.list = data.layers.list;

		//zmienne globalne dotyczące całego projektu
		layers.project_name = data.project.name;
		layers.source = data.project.source;

		//console.log( data.layers.category_colors );

		$('input[name="project_name"]').val(layers.project_name);

		legends.show(); 
		labels.show();
		layers.show();
		source.show();

		var offset = $('#canvas_box').offset();
  	canvas.offset_left = offset.left;
  	canvas.offset_top = offset.top;

	},

	//pobieranie projektu z bazy danych i wczytanie
	get_project : function(){
		$.ajax({
			url: '/api/project/' + crud.project_hash,
		  type: "GET",
		  contentType: "application/json"
		}).done(function( data ) { crud.set_project( data.data );  });
	}

}

var excel = {};    

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

labels = {
	show : function(){
		$('#labels').html( layers.labels[layers.active] );
	}
}
var layers = {

	list : ['zakładka 1'],
	active : 0,

	//tablica z podstawowywmi danymi zagregowanymi dla każdej warstwy
	palets_active : [0], 

	value : [-1],
	colors_pos : [[1,1,1,1,1,1,1,1,1]],
	colors_active : [["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"]],
	min_value : [0],
	max_value : [0],
	cloud : [""],
	cloud_parser : [""],
	legends : [[]],
	labels : [""],
	category : [-1],
	category_colors : [],
	category_name : [],

	//zmienne globalne dotyczące całego projektu
	project_name : 'nowy projekt',
	source : '',

	show : function(){

		if( this.list.length > 1 ){
			var html = "";
			html += '<span num="'+0+'" class="active">' + this.list[0] + '</span>';
			
			for(var i = 1, i_max = this.list.length; i < i_max; i++){
				html += '<span num="'+i+'">' + this.list[i] + '</span>';
			}

			$('#area').html(html);
			$('#area span').click(function(){ layers.select(this); });
			}
		else{
			$('#area').css('display','none');
		}

	},

	select : function(obj){

		$('#area span').removeClass('active');
		$(obj).addClass('active');

		console.log(obj);

		layers.active = $(obj).index();

		legends.show(); 
		labels.show();
		//layers.show();
		canvas.draw();
	
	}
}
//obiekt dotycząsy wyswietlania akutalizacji i edycji panelu legend
legends = {
	//wyświetlamy wszystkie legendy w panelu map
	show : function(){
  		var html = "";
  		for(var i = 0, i_max = layers.legends[layers.active].length; i < i_max; i++){
  			html += "<div> <span style='background-color:"+layers.legends[layers.active][i][3]+"'></span><span>"+layers.legends[layers.active][i][2]+"</span></div>";
  		}
      $('#legends').html(html);
	}
}
/*
    ____   ____ ____    __  ___ ___     ____     _____    ____ 
   / __ ) /  _// __ \  /  |/  //   |   / __ \   |__  /   / __ \
  / __  | / / / / / / / /|_/ // /| |  / /_/ /    /_ <   / / / /
 / /_/ /_/ / / /_/ / / /  / // ___ | / ____/   ___/ /_ / /_/ / 
/_____//___/ \___\_\/_/  /_//_/  |_|/_/       /____/(_)\____/  

varsion 3.0 by Marcin Gębala

lista obiektów:

 canvas = canvas() - obiekt canvasa
 crud = crud() - obiekt canvasa
 image = image() - obiekt zdjęcia od którego odrysowujemy mapy
 mouse = mouse()
 models = models()
 global = global() - funkcje nie przypisany do innych obiektów
 categories = categories()
 pointers = pointers()
 colorpicker = colorpicker()
 menu_top = menu_top()
 figures = figures()

*/
  
//po kliknięciu zmieniay aktualny panel
$('.box > ul > li').click(function(){ menu_top.change_box(this) });

$(document).ready(function(){

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

	//odznaczenie selecta przy zmianie
	//$//('#change_category').change(function(){ $('#change_category').blur(); });

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

	crud.get_project();

  //parent.postMessage($('body').height(),'http://'+location.href.split( '/' )[2]);
});
   

$('#canvas_wrapper').mouseleave(function(){ $("#canvas_cloud").fadeOut(200); });

$('#canvas_wrapper').mousemove(function(){
  var text = on_category.get_name() 
  cloud.update_text(text ); 
});

$("#canvas_cloud").mousemove(function(){ cloud.set_position(); });

//obiekt menu_top
menu_top = {

	move_image : false,
	move_canvas : false,
	auto_draw : false,
	mode_key : true,
	category : 0,
	disable_select : false,

	//zmiana aktualnej zakładki
	change_box : function(obj){
		console.log(obj);
		$(obj).parent().children('li').removeClass('active');
		$(obj).addClass('active');

		var category = $(obj).attr('category');
		$(obj).parent().parent().children('div').fadeOut(500, function(){
			$(obj).parent().parent().children('#'+category).delay(100).fadeIn(500);
		});
	
	 
	},

	//funkcja służąca do pobierania danych dotyczących map
	get_maps : function(){
	
		$.ajax({
   		url: '/api/maps',
    	type: "GET",
    	contentType: "application/json"
		}).done( function( response ) {
			
			//wyświetlamy listę map w panelu u góry
			if(response.status == "ok"){
				var add_html = '<option id="select_map">wybierz mapę</option>';
				for (var i = 0, i_max = response.data.length; i < i_max ;i++){
					if(response.data[i]._id == crud.map_hash){
						add_html += '<option selected id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].map_json)[0][7] + '</option>';
					}
					else{
						add_html += '<option id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].map_json)[0][7] + '</option>';
					}
				}
				$('#toolbar_top select.select_map').html( add_html );

				//dodajemu zdarzenie change map 
				$('.select_map').change(function(){
					//sprawdzamy czy wybraliśmy pole z hashem mapy
					if( $(this).find('option:selected').attr('id') != 'select_map'){
						//jeśli tak to sprawdzamy czy wczytujemy mapę po raz pierwszy czy drugi
						if(crud.map_hash != null){
							//jeśli wczytujemy po raz kolejny to pytamy czy napewno chcemy ją wczytać
							if (confirm('Czy chcesz wczytać nową mapę ?')) {
								crud.map_hash = $(this).find('option:selected').attr('id');
								crud.get_map();
							}
						}
						else{
							$('.select_map option').eq(0).remove();
							crud.map_hash = $(this).find('option:selected').attr('id');
							crud.get_map();
						}
					}
				});

			}
			else{
				alert('nie mogę pobrać listy map');
				console.log( response );
			}

		});



	},


	//funkcja służąca do pobierania danych dotyczących map
	get_projects : function(){
		$.ajax({
   		url: '/api/projects',
    	type: "GET",
    	contentType: "application/json"
		}).done( function( response ) {

			//wyświetlamy listę projektów w panelu u góry
			if(response.status == "ok"){

				var add_html = '<option id="new_project">nowy projekt</option>';
				for (var i = 0, i_max = response.data.length; i < i_max ;i++){

					if(response.data[i]._id == crud.project_hash){
						add_html += '<option selected id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].project).name + '</option>';
					}
					else{
						add_html += '<option id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].project).name + '</option>';
					}
				
				}

				$('#toolbar_top select.select_project').html( add_html );
			
				//dodajemu zdarzenie change project 
				$('.select_project').change(function(){
					if (confirm('Czy chcesz wczytać nowy projekt ?')) {
						if( $(this).find('option:selected').attr('id') == 'new_project' ){
							location.reload();
						}
						else{
							crud.project_hash = $(this).find('option:selected').attr('id');
							crud.get_project();
						}
					}
				});

			}
			else{
				alert('nie mogę pobrać listy projektów');
				console.log( response );
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
				canvas.draw();
			break;

			case 'bottom_resize':
				//zmieniamy wysokość canvasa
				var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();
				canvas.resize_height(this.top - this.padding_y - position.top);
				canvas.draw();
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
		}
	}
}

//obiekt mówiący nam nad jaką kategoria jesteśmy
var on_category = {
	
	canvas_offset_top : $('#canvas_wrapper').offset().top,
	canvas_offset_left : $('#canvas_wrapper').offset().left,

	//funkcja zwracająca aktualną kategorię nad którą znajduje się kursor
	get_name : function(){

		var left = mouse.left - canvas.offset_left;
		var top = mouse.top - canvas.offset_top;
		//console.log(left,top);
		var row = Math.ceil( top / (pointers.size + pointers.padding_y) );
		//console.log(left,top,this.canvas_offset_left,this.canvas_offset_top);
		if((pointers.translate_modulo) && (row % 2 != 0)){
			var column = Math.ceil( (left + (pointers.size/2))/ (pointers.size + pointers.padding_x) ) - 1;
		}
		else{
			var column = Math.ceil( left / (pointers.size + pointers.padding_x) );
		}
		
		try{

			var category_num = pointers.pointers[row-1][column-1];
			var category_name = layers.category_name[category_num];
			//console.log('test',category_name);

		}
		catch(e){
			return 'null';
		}
		
		if((category_name == 'pusty') || (category_name == 'gumuj')){
			return 'null';
		} 
		else{
			return category_name;		
		}

	}

}
/*
$('document').ready(function(){
	on_category.canvas_offset_top = ;
	on_category.canvas_offset_left = ;
});

*/
palets = {}
//menu pointer
var pointers = {
	show_all_point : true,
	padding_x : 1,
	padding_y : 1,
	translate_modulo : false,
	size : 10,
	main_kind : 'square',
	kinds : Array('square','circle','hexagon','hexagon2'),

	pointers : Array(), //pointers.pointers[rzad][kolumna] : kategoria[numer]

	last_column : null,	//kolumna pointera który został ostatnio zmieniony
	last_row : null,	//wiersz pointera który został ostatnio zmieniony

	//rysowanie wszystkich punktów
	draw : function(){
		//console.log('draw',this.size,layers.category_colors); 
		var width_pointer = this.size + this.padding_x;
		var height_pointer = this.size + this.padding_y;
		var none_color = "rgba(0,0,0,0)";

		//if(this.show_all_point) none_color = "rgba(128,128,128,1)";

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

var source = {
  show : function(){
    //console.log( layers.source );
    $('#source').html( layers.source ); 
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyIsInNvdXJjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSkE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJlbWJlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vY3p5c3pjemVuaWUgaSByeXNvd2FuaWUgcG8gY2FudmFzaWVcbnZhciBjYW52YXMgPSB7XG5cdFxuXHRzY2FsZSA6IDEwMCxcblx0d2lkdGhfY2FudmFzIDogNzAwLFxuXHRoZWlnaHRfY2FudmFzIDogNDAwLFxuXHRjYW52YXMgOiBudWxsLFxuXHRjb250ZXh0IDogbnVsbCxcblx0dGh1bWJuYWlsIDogbnVsbCxcblx0dGl0bGVfcHJvamVjdCA6ICdub3d5IHByb2pla3QnLFxuXG5cdGNvbnRleHRfeCA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X3kgOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHlcblx0Y29udGV4dF9uZXdfeCA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF9uZXdfeSA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHlcblxuXHRvZmZzZXRfbGVmdCA6IG51bGwsXG5cdG9mZnNldF90b3AgOiBudWxsLFxuXHRhY3RpdmVfcm93IDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblx0YWN0aXZlX2NvbHVtbiA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cblx0dGh1bWJuYWlsIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluX2NhbnZhc1wiKTtcblx0XHR2YXIgZGF0YVVSTCA9IGNhbnZhcy50b0RhdGFVUkwoKTtcblx0XHRjb25zb2xlLmxvZyhkYXRhVVJMKTtcblx0fSxcblxuXHQvL3J5c3VqZW15IGNhbnZhcyB6ZSB6ZGrEmWNpZW1cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Ly9jb25zb2xlLmxvZygnY2FudmFzIGRyYXcnKTtcblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblx0XHRwb2ludGVycy5kcmF3KCk7XG5cblx0XHRpZiAoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpICBpbWFnZS5kcmF3KCk7XG5cdH0sXG5cblx0ZHJhd190aHVtbmFpbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMudGh1bWJuYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHR9LFxuXG5cdC8vcmVzZXR1amVteSB0xYJvIHpkasSZY2lhXG5cdHJlc2V0IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblx0fSxcblxuXHQvLyBjennFm2NpbXkgY2HFgmUgemRqxJljaWUgbmEgY2FudmFzaWVcblx0Y2xlYXIgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5jbGVhclJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdFx0Ly90aGlzLmNvbnRleHQuZmlsbFJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdH0sXG5cblx0cmVzaXplX3dpZHRoIDogZnVuY3Rpb24obmV3X3dpZHRoKXtcblx0XHR0aGlzLndpZHRoX2NhbnZhcyA9IG5ld193aWR0aDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsdGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiB0aGlzLndpZHRoX2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHRoaXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSArICclJyk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdH0sXG5cblx0cmVzaXplX2hlaWdodCA6IGZ1bmN0aW9uKG5ld19oZWlnaHQpe1xuXHRcdHRoaXMuaGVpZ2h0X2NhbnZhcyA9IG5ld19oZWlnaHQ7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0Jyx0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnaGVpZ2h0JzogdGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdHRoaXMuc2NhbGUgPSAxMDA7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHRoaXMuc2NhbGUrJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTsgLy8gYWt0dWFsaXp1amVteSBkYW5lIG9kbm/Fm25pZSByb3ptaWFyw7N3IGNhbnZhc2EgdyBtZW51IHUgZ8Ozcnlcblx0XHQvL3RoaXMuZHJhdygpOyAvL3J5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdH0sXG5cblx0c2V0X2RlZmF1bHQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfYm94ICNyaWdodF9yZXNpemUsICNjYW52YXNfYm94ICNib3R0b21fcmVzaXplJykuZmFkZUluKDUwMCk7XG5cdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXG5cdFx0Y2FudmFzLnNjYWxlID0gMTAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblxuXHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdHZhciBuZXdfaGVpZ2h0ID0gY2FudmFzLmhlaWdodF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cih7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JzogbmV3X2hlaWdodCArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHQvL2NhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Ly9jYW52YXMuZHJhdygpO1xuXHR9XG59XG4iLCIvL29iaWVrdCBrYXRlZ29yaWkgZG9kYW5pZSAvIGFrdHVhbGl6YWNqYSAvIHVzdW5pxJljaWUgLyBwb2themFuaWUga2F0ZWdvcmlpXG52YXIgY2F0ZWdvcmllcyA9IHt9O1xuLypcdFxuXG5cdC8vY2F0ZWdvcnkgOiBuZXcgQXJyYXkoWydwdXN0eScsJyM4MDgwODAnXSksXG5cblx0YWRkIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgbmFtZSA9IEFycmF5KCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgpLCcjZmYwMDAwJyk7XG5cdFx0JCgnI2NhdGVnb3J5X2JveCBpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykudmFsKCcnKTtcblxuXHRcdHRoaXMuY2F0ZWdvcnkucHVzaChuYW1lKTtcblx0XHRtZW51X3RvcC5jYXRlZ29yeSA9ICh0aGlzLmNhdGVnb3J5Lmxlbmd0aC0xKTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXHR9LFxuXG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGluZGV4LG5hbWUpe1xuXHRcdHRoaXMuY2F0ZWdvcnlbaW5kZXhdWzBdID0gbmFtZTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXHR9LFxuXG5cblx0Ly9ha3R1YWxpenVqZW15IHRhYmxpY8SZIGtvbG9yw7N3XG5cdHVwZGF0ZV9jb2xvciA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL21vxbxsaXdhIGFrdHVhbGl6YWNqYSBqZWR5bmllIHcgcHJ6eXBhZGt1IHd5YnJhbmlhIGtvbmtyZXRuZWoga29sdW1ueSB3YXJ0b8WbY2kgaSBrYXRlZ29yaWkgdyBleGNlbHVcblx0XHRpZigoY3J1ZC5tYXBfanNvbi5sZW5ndGggPiAwKSAmJiAoZXhjZWwuZGF0YS5sZW5ndGggPiAwKSAmJiAobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdICE9IC0xKSAmJiAobGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdICE9IC0xKSl7XG5cblx0XHRcdGZvciAodmFyIGlfY2F0ZWdvcnkgPSAwLCBpX2NhdGVnb3J5X21heCA9XHRsYXllcnMuY2F0ZWdvcnlfbmFtZS5sZW5ndGg7IGlfY2F0ZWdvcnkgPCBpX2NhdGVnb3J5X21heDsgaV9jYXRlZ29yeSsrKXtcblx0XHRcdFx0dmFyIG5hbWUgPSBsYXllcnMuY2F0ZWdvcnlfbmFtZVtpX2NhdGVnb3J5XTtcblxuXHRcdFx0XHRmb3IgKHZhciBpX2V4ZWwgPSAwLCBpX2V4ZWxfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfZXhlbCA8IGlfZXhlbF9tYXg7IGlfZXhlbCsrKXtcblx0XHRcdFx0XHRpZiggZXhjZWwuZGF0YVtpX2V4ZWxdW2xheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXV0gPT0gbmFtZSl7XG5cdFx0XHRcdFx0XHQvL2plxZtsaSB6bmFsZcW6bGnFm215IGthdGVnb3JpxJkgdyBleGNlbHVcblx0XHRcdFx0XHRcdHZhciB2YWx1ZSA9IGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV1dO1xuXG5cdFx0XHRcdFx0XHRmb3IgKCB2YXIgaV9sZWdlbmRzID0gMCwgaV9sZWdlbmRzX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaV9sZWdlbmRzIDwgaV9sZWdlbmRzX21heDsgaV9sZWdlbmRzKysgKXtcblx0XHRcdFx0XHRcdFx0aWYoICh2YWx1ZSA+PSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNdWzBdKSAmJiAodmFsdWUgPD0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV9sZWdlbmRzXVsxXSkgKXtcblx0XHRcdFx0XHRcdFx0XHQvL2plxZtsaSB6bmFsZcW6bGlzbXlcblx0XHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2xheWVycy5hY3RpdmVdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV9sZWdlbmRzXVszXTtcblx0XHRcdFx0XHRcdFx0XHRpX2xlZ2VuZHMgPSBpX2xlZ2VuZHNfbWF4O1xuXHRcdFx0XHRcdFx0XHRcdGlfZXhlbCA9IGlfZXhlbF9tYXg7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9qZcWbbGkgd2FydG/Fm8SHIHd5Y2hvZHppIHBvemEgc2thbGUgdSB0YWsgcHJ6eXBpc3VqZW15IGplaiBvZHBvd2llZG5pIGtvbG9yXG5cdFx0XHRcdFx0XHRpZih2YWx1ZSA8IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdWzBdWzBdKXtcblx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdWzBdWzNdO1xuXHRcdFx0XHRcdFx0fVx0XG5cblx0XHRcdFx0XHRcdGlmKHZhbHVlID4gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV9sZWdlbmRzX21heC0xXVsxXSl7XG5cdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbbGF5ZXJzLmFjdGl2ZV1baV9jYXRlZ29yeV0gPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNfbWF4LTFdWzNdO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9wbyB6YWt0dWFsaXpvd2FuaXUga29sb3LDs3cgdyBrYXRlZ29yaWFjaCByeXN1amVteSBuYSBub3dvIGNhbnZhc1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cblxuXHR9LFxufSovXG4iLCJjbG91ZCA9IHtcblxuXHRzZXRfdGV4dGFyZWEgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjbG91ZCAuY2xvdWRfdGV4dCcpLnZhbCggbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdICk7XG5cdH0sXG5cblx0Ly91c3Rhd2lhbXkgcG9wcmF3bsSFIHBvenljasSZIGR5bWthXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGxlZnQgPSBtb3VzZS5sZWZ0IC0gb25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X3RvcDtcblx0XHR2YXIgd2lkdGggPSAkKFwiI2NhbnZhc19jbG91ZFwiKS53aWR0aCgpO1xuXG5cdFx0aWYoKGxlZnQgKyB3aWR0aCkgPiAkKFwiYm9keVwiKS53aWR0aCgpLTIwKXtcblx0XHRcdGxlZnQgPSBsZWZ0IC0gd2lkdGgtMjA7XG5cdFx0fVxuXG4gXG5cdFx0JChcIiNjYW52YXNfY2xvdWRcIikuY3NzKHt0b3A6cGFyc2VJbnQodG9wIC0gJChcIiNjYW52YXNfY2xvdWRcIikuaGVpZ2h0KCkpKydweCcsbGVmdDpsZWZ0KydweCd9KTtcblx0fSxcblxuXHQvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgd3nFm3dpZXRsZW5pZSBkeW1rYSB6IG9kcG93aWVkbmnEhSB6YXdhcnRvxZtjacSFXG5cdHVwZGF0ZV90ZXh0IDogZnVuY3Rpb24obmFtZSl7XG5cblx0XHRpZigobmFtZSAhPSBcIlwiKSAmJiAobmFtZSAhPSAnbnVsbCcpKXtcblxuXHRcdFx0dmFyIHRtcF9yb3cgPSBudWxsO1xuXHRcdFx0dmFyIGZpbmQgPSAwO1xuXHRcdFx0Zm9yKCB2YXIgaV9yb3cgPSAwLCBpX3Jvd19tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaV9yb3cgPCBpX3Jvd19tYXg7IGlfcm93KysgKXtcblx0XHRcdFx0aWYoU3RyaW5nKG5hbWUpLnRvTG93ZXJDYXNlKCkgPT0gU3RyaW5nKGV4Y2VsLmRhdGFbaV9yb3ddW2xheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXV0pLnRvTG93ZXJDYXNlKCkpe1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRoaXMuc2V0X3Bvc2l0aW9uKCk7XG5cdFx0XHRcdFx0dmFyIHRleHRfdG1wID0gbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdO1xuXG5cdFx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRcdFx0dGV4dF90bXAgPSB0ZXh0X3RtcC5yZXBsYWNlKCd7JytleGNlbC5kYXRhWzBdW2ldKyd9JyxleGNlbC5kYXRhW2lfcm93XVtpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vZG9waWVybyBqZcWbbGkgZHltZWsgbWEgbWllxIcgamFrYcWbIGtvbmtyZXRuxIUgemF3YXJ0b8WbxIcgd3nFm3dpZXRsYW15IGdvXG5cdFx0XHRcdFx0aWYoKHRleHRfdG1wIT1cIlwiKSAmJiAoIGV4Y2VsLmRhdGFbaV9yb3ddW2xheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXV0gIT0gbnVsbCApKXtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVJbigwKTtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmh0bWwodGV4dF90bXApO1xuXHRcdFx0XHRcdFx0ZmluZCA9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vamXFm2xpIG5pZSB6bmFsZXppb25vIG9kcG93aWVkbmllaiBrYXRlZ29yaWlcblx0XHRcdGlmICghZmluZCkgeyBcblx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgwKTtcblx0XHRcdH1cblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgwKTtcblx0XHR9XG5cdH1cblxufVxuIiwiLy9mdW5rY2phIG9kcG93aWVkemlhbG5hIHphIHR3b3J6ZW5pZSB6YXBpc3l3YW5pZSBpIGFrdHVhbGl6YWNqZSBkYW55Y2ggZG90eWN6xIXEh2N5aCBtYXB5XG4vL3ZhciBjcnVkID0gY3J1ZCB8fCB7fVxuY3J1ZCA9IHtcblxuXHRtYXBfanNvbiA6IEFycmF5KCksIC8vZ8WCw7N3bmEgem1pZW5uYSBwcnplY2hvd3VqxIVjYSB3c3p5c3RraWUgZGFuZVxuXHRtYXBfaGFzaCA6bnVsbCxcblx0bGF5ZXJzIDoge30sXG5cdGV4Y2VsIDogQXJyYXkoKSxcblx0cHJvamVjdCA6IHt9LFxuXHRwcm9qZWN0X2hhc2ggOiBwcm9qZWN0X2hhc2gsIC8vZ8WCw7N3bnkgaGFzaCBkb3R5Y3rEhWN5IG5hc3plZ28gcHJvamVrdHVcbiBcblx0Ly93Y3p5dGFuaWUgem1pZW5ueWNoIGRvIG9iaWVrdMOzdyBtYXB5XG5cblx0c2V0X21hcCA6IGZ1bmN0aW9uKGRhdGEpe1xuXG5cdFx0Ly9wbyB6YXBpc2FuaXUgZGFueWNoIGRvIGJhenkgYWt0dWFsaXp1amVteSBpZCAodyBwcnp5cGFka3UgamXFm2xpIGlzdG5pZWplIG5hZHBpc3VqZW15IGplKVxuXHRcdHRoaXMubWFwX2pzb24gPSBkYXRhO1xuXG5cdFx0Ly9wb2JpZXJhbXkgaSB3Y3p5dHVqZW15IGRhbmUgbyBjYW52YXNpZSBkbyBvYmlla3R1XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBkYXRhWzBdWzBdO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBkYXRhWzBdWzFdO1xuXHRcdHBvaW50ZXJzLnBhZGRpbmdfeCA9IGRhdGFbMF1bMl07XG5cdFx0cG9pbnRlcnMucGFkZGluZ195ID0gZGF0YVswXVszXTtcblx0XHRwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvID0gZGF0YVswXVs0XTtcblx0XHRwb2ludGVycy5zaXplID0gZGF0YVswXVs1XTtcblx0XHRwb2ludGVycy5tYWluX2tpbmQgPSBkYXRhWzBdWzZdO1xuXHRcdGNhbnZhcy50aXRsZV9wcm9qZWN0ID0gZGF0YVswXVs3XTtcblxuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ194XCJdJykudmFsKCBkYXRhWzBdWzJdICk7XG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3lcIl0nKS52YWwoIGRhdGFbMF1bM10gKTtcblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInNpemVfcG9pbnRlclwiXScpLnZhbCggZGF0YVswXVs1XSApO1xuXHRcdCQoJ2lucHV0W25hbWU9XCJ0aXRsZV9wcm9qZWN0XCJdJykudmFsKCBkYXRhWzBdWzddICk7XG5cblx0XHRpZiggZGF0YVswXVs0XSApe1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdH1cblxuXHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmh0bWwoJycpO1xuXG5cdFx0cG9pbnRlcnMua2luZHMuZm9yRWFjaChmdW5jdGlvbihraW5kKXtcblxuXHRcdFx0aWYoa2luZCA9PSBkYXRhWzBdWzZdKXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIHNlbGVjdGVkPVwic2VsZWN0ZWRcIiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgbyBwb2ludGVyYWNoXG5cdFx0cG9pbnRlcnMucG9pbnRlcnMgPSBkYXRhWzFdO1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIGthdGVnb3JpYWNoXG5cdFx0dmFyIGNhdGVnb3JpZXMgPSB7fTtcblx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5ID0gZGF0YVsyXTtcblxuXG5cdFx0Ly9wbyB3Y3p5dGFuaXUgbWFweSBha3R5YWxpenVqZW15IGRhbmUgZG90eWN6xIVjxIUga2F0ZWdvcmlpIGkga29sb3LDs3dcblx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzWzBdID0gW107XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X25hbWUgPSBbXTtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gY2F0ZWdvcmllcy5jYXRlZ29yeS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGxheWVycy5jYXRlZ29yeV9uYW1lLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVswXSk7XG5cdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzWzBdLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVsxXSk7XG5cdFx0fVxuXG5cdFx0Ly9wb2JpZXJhbmllIGRhbnljaCBvIHpkasSZY2l1IGplxbxlbGkgaXN0bmllamVcblx0XHRpZiggZGF0YVszXS5sZW5ndGggPiAyKXtcblx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0aW1hZ2Uub2JqLnNyYyA9IGRhdGFbM11bMF07XG5cdFx0XHRpbWFnZS54ID0gcGFyc2VJbnQoIGRhdGFbM11bMV0gKTtcblx0XHRcdGltYWdlLnkgPSBwYXJzZUludCggZGF0YVszXVsyXSApO1xuXHRcdFx0aW1hZ2Uud2lkdGggPSBwYXJzZUludCggZGF0YVszXVszXSApO1xuXHRcdFx0aW1hZ2UuaGVpZ2h0ID0gcGFyc2VJbnQoIGRhdGFbM11bNF0gKTtcblx0XHRcdGltYWdlLmFscGhhID0gcGFyc2VJbnQoIGRhdGFbM11bNV0gKTtcblxuXHRcdFx0Ly96YXpuYWN6ZW5pZSBvZHBvd2llZG5pZWdvIHNlbGVjdGEgYWxwaGEgdyBtZW51IHRvcFxuXHRcdFx0JCgnI2FscGhhX2ltYWdlIG9wdGlvbltuYW1lPVwiJytcdGltYWdlLmFscGhhICsnXCJdJykuYXR0cignc2VsZWN0ZWQnLHRydWUpO1xuXG5cdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7IGNhbnZhcy5kcmF3KCk7IH07XG5cdFx0fVxuXG5cdFx0Ly96YWt0dWFsaXpvd2FuaWUgZGFueWNoIHcgaW5wdXRhY2hcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsIGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JywgY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzpjYW52YXMud2lkdGhfY2FudmFzKydweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMrJ3B4J30pO1xuXG5cdFx0Ly9jYW52YXMuZHJhdygpO1xuXG5cdH0sXG5cblx0c2V0X3Byb2plY3QgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vd2N6eXR1amVteSBkYW5lIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMuc2V0X21hcCggSlNPTi5wYXJzZShkYXRhLm1hcF9qc29uKSApO1xuXHRcdGV4Y2VsLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEuZXhjZWwpO1xuXG5cdFx0ZGF0YS5wcm9qZWN0ID0gSlNPTi5wYXJzZShkYXRhLnByb2plY3QpOyAgXG5cdFx0ZGF0YS5sYXllcnMgPSBKU09OLnBhcnNlKGRhdGEubGF5ZXJzKTsgXG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIHByb2pla3R1XG5cdFx0bGF5ZXJzLnBhbGV0c19hY3RpdmUgPSBkYXRhLmxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdGxheWVycy52YWx1ZSA9IGRhdGEubGF5ZXJzLnZhbHVlO1xuXHRcdGxheWVycy5jb2xvcnNfcG9zID0gZGF0YS5sYXllcnMuY29sb3JzX3Bvcztcblx0XHRsYXllcnMuY29sb3JzX2FjdGl2ZSA9IGRhdGEubGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0bGF5ZXJzLm1pbl92YWx1ZSA9IGRhdGEubGF5ZXJzLm1pbl92YWx1ZTtcblx0XHRsYXllcnMubWF4X3ZhbHVlID0gZGF0YS5sYXllcnMubWF4X3ZhbHVlO1xuXHRcdGxheWVycy5jbG91ZCA9IGRhdGEubGF5ZXJzLmNsb3VkO1xuXHRcdGxheWVycy5jbG91ZF9wYXJzZXIgPSBkYXRhLmxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0bGF5ZXJzLmxlZ2VuZHMgPSBkYXRhLmxheWVycy5sZWdlbmRzO1xuXHRcdGxheWVycy5sYWJlbHMgPSBkYXRhLmxheWVycy5sYWJlbHM7XG5cdCBcdGxheWVycy5jYXRlZ29yeSA9IFx0ZGF0YS5sYXllcnMuY2F0ZWdvcnk7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZSA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0bGF5ZXJzLmxpc3QgPSBkYXRhLmxheWVycy5saXN0O1xuXG5cdFx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRcdGxheWVycy5wcm9qZWN0X25hbWUgPSBkYXRhLnByb2plY3QubmFtZTtcblx0XHRsYXllcnMuc291cmNlID0gZGF0YS5wcm9qZWN0LnNvdXJjZTtcblxuXHRcdC8vY29uc29sZS5sb2coIGRhdGEubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyApO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cInByb2plY3RfbmFtZVwiXScpLnZhbChsYXllcnMucHJvamVjdF9uYW1lKTtcblxuXHRcdGxlZ2VuZHMuc2hvdygpOyBcblx0XHRsYWJlbHMuc2hvdygpO1xuXHRcdGxheWVycy5zaG93KCk7XG5cdFx0c291cmNlLnNob3coKTtcblxuXHRcdHZhciBvZmZzZXQgPSAkKCcjY2FudmFzX2JveCcpLm9mZnNldCgpO1xuICBcdGNhbnZhcy5vZmZzZXRfbGVmdCA9IG9mZnNldC5sZWZ0O1xuICBcdGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuXHR9LFxuXG5cdC8vcG9iaWVyYW5pZSBwcm9qZWt0dSB6IGJhenkgZGFueWNoIGkgd2N6eXRhbmllXG5cdGdldF9wcm9qZWN0IDogZnVuY3Rpb24oKXtcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiAnL2FwaS9wcm9qZWN0LycgKyBjcnVkLnByb2plY3RfaGFzaCxcblx0XHQgIHR5cGU6IFwiR0VUXCIsXG5cdFx0ICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKGZ1bmN0aW9uKCBkYXRhICkgeyBjcnVkLnNldF9wcm9qZWN0KCBkYXRhLmRhdGEgKTsgIH0pO1xuXHR9XG5cbn1cbiIsInZhciBleGNlbCA9IHt9OyAgICBcbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cblx0fVxufVxuIiwiLy9nxYLDs3duZSB6ZGrEmWNpZSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxudmFyIGltYWdlID0ge1xuXHRvYmogOiB1bmRlZmluZWQsXG5cdHggOiBudWxsLFxuXHR5IDogbnVsbCxcblx0d2lkdGggOiBudWxsLFxuXHRoZWlnaHQgOiBudWxsLFxuXHRhbHBoYSA6IDEwLCBcblxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IHRoaXMuYWxwaGEvMTA7XG5cdFx0Y2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMub2JqLHRoaXMueCx0aGlzLnksdGhpcy53aWR0aCx0aGlzLmhlaWdodCk7XG5cblx0XHQkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuY3NzKHsnaGVpZ2h0Jzp0aGlzLmhlaWdodCwndG9wJzp0aGlzLnkrJ3B4JywnbGVmdCc6KHRoaXMueCt0aGlzLndpZHRoKSsncHgnfSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBwb21vY25pY3phIGtvbndlcnR1asSFY2EgZGF0YVVSSSBuYSBwbGlrXG5cdGRhdGFVUkl0b0Jsb2IgOiBmdW5jdGlvbihkYXRhVVJJKSB7XG4gICAgdmFyIGJpbmFyeSA9IGF0b2IoZGF0YVVSSS5zcGxpdCgnLCcpWzFdKTtcbiAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFycmF5LnB1c2goYmluYXJ5LmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJsb2IoW25ldyBVaW50OEFycmF5KGFycmF5KV0sIHt0eXBlOiAnaW1hZ2UvcG5nJ30pO1xuXHR9XG5cbn1cbiIsInZhciBkYXRhX2lucHV0ID0ge1xuXG5cdC8vcG9iaWVyYW5pZSBpbmZvcm1hY2ppIHogaW5wdXTDs3cgaSB6YXBpc2FuaWUgZG8gb2JpZWt0dSBtYXBfc3ZnXG5cdGdldCA6IGZ1bmN0aW9uKCl7XG5cdFx0bWFwLm5hbWUgPSAkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoKTtcblx0XHRtYXAucGF0aCA9ICQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCgpLnJlcGxhY2UoL1wiL2csIFwiJ1wiKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9LFxuXG5cdC8vcG9icmFuaWUgaW5mb3JtYWNqaSB6IG9iaWVrdHUgbWFwX3N2ZyBpIHphcGlzYW5pZSBkbyBpbnB1dMOzd1xuXHRzZXQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCggbWFwLm5hbWUgKTtcblx0XHQkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoIG1hcC5wYXRoICk7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fVxuXG59XG4iLCJsYWJlbHMgPSB7XG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNsYWJlbHMnKS5odG1sKCBsYXllcnMubGFiZWxzW2xheWVycy5hY3RpdmVdICk7XG5cdH1cbn0iLCJ2YXIgbGF5ZXJzID0ge1xuXG5cdGxpc3QgOiBbJ3pha8WCYWRrYSAxJ10sXG5cdGFjdGl2ZSA6IDAsXG5cblx0Ly90YWJsaWNhIHogcG9kc3Rhd293eXdtaSBkYW55bWkgemFncmVnb3dhbnltaSBkbGEga2HFvGRlaiB3YXJzdHd5XG5cdHBhbGV0c19hY3RpdmUgOiBbMF0sIFxuXG5cdHZhbHVlIDogWy0xXSxcblx0Y29sb3JzX3BvcyA6IFtbMSwxLDEsMSwxLDEsMSwxLDFdXSxcblx0Y29sb3JzX2FjdGl2ZSA6IFtbXCIjZjdmY2ZkXCIsIFwiI2U1ZjVmOVwiLCBcIiNjY2VjZTZcIiwgXCIjOTlkOGM5XCIsIFwiIzY2YzJhNFwiLCBcIiM0MWFlNzZcIiwgXCIjMjM4YjQ1XCIsIFwiIzAwNmQyY1wiLCBcIiMwMDQ0MWJcIl1dLFxuXHRtaW5fdmFsdWUgOiBbMF0sXG5cdG1heF92YWx1ZSA6IFswXSxcblx0Y2xvdWQgOiBbXCJcIl0sXG5cdGNsb3VkX3BhcnNlciA6IFtcIlwiXSxcblx0bGVnZW5kcyA6IFtbXV0sXG5cdGxhYmVscyA6IFtcIlwiXSxcblx0Y2F0ZWdvcnkgOiBbLTFdLFxuXHRjYXRlZ29yeV9jb2xvcnMgOiBbXSxcblx0Y2F0ZWdvcnlfbmFtZSA6IFtdLFxuXG5cdC8vem1pZW5uZSBnbG9iYWxuZSBkb3R5Y3rEhWNlIGNhxYJlZ28gcHJvamVrdHVcblx0cHJvamVjdF9uYW1lIDogJ25vd3kgcHJvamVrdCcsXG5cdHNvdXJjZSA6ICcnLFxuXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0aWYoIHRoaXMubGlzdC5sZW5ndGggPiAxICl7XG5cdFx0XHR2YXIgaHRtbCA9IFwiXCI7XG5cdFx0XHRodG1sICs9ICc8c3BhbiBudW09XCInKzArJ1wiIGNsYXNzPVwiYWN0aXZlXCI+JyArIHRoaXMubGlzdFswXSArICc8L3NwYW4+Jztcblx0XHRcdFxuXHRcdFx0Zm9yKHZhciBpID0gMSwgaV9tYXggPSB0aGlzLmxpc3QubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdGh0bWwgKz0gJzxzcGFuIG51bT1cIicraSsnXCI+JyArIHRoaXMubGlzdFtpXSArICc8L3NwYW4+Jztcblx0XHRcdH1cblxuXHRcdFx0JCgnI2FyZWEnKS5odG1sKGh0bWwpO1xuXHRcdFx0JCgnI2FyZWEgc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7IGxheWVycy5zZWxlY3QodGhpcyk7IH0pO1xuXHRcdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQkKCcjYXJlYScpLmNzcygnZGlzcGxheScsJ25vbmUnKTtcblx0XHR9XG5cblx0fSxcblxuXHRzZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0JCgnI2FyZWEgc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHQkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdFx0Y29uc29sZS5sb2cob2JqKTtcblxuXHRcdGxheWVycy5hY3RpdmUgPSAkKG9iaikuaW5kZXgoKTtcblxuXHRcdGxlZ2VuZHMuc2hvdygpOyBcblx0XHRsYWJlbHMuc2hvdygpO1xuXHRcdC8vbGF5ZXJzLnNob3coKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHRcblx0fVxufSIsIi8vb2JpZWt0IGRvdHljesSFc3kgd3lzd2lldGxhbmlhIGFrdXRhbGl6YWNqaSBpIGVkeWNqaSBwYW5lbHUgbGVnZW5kXG5sZWdlbmRzID0ge1xuXHQvL3d5xZt3aWV0bGFteSB3c3p5c3RraWUgbGVnZW5keSB3IHBhbmVsdSBtYXBcblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG4gIFx0XHR2YXIgaHRtbCA9IFwiXCI7XG4gIFx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICBcdFx0XHRodG1sICs9IFwiPGRpdj4gPHNwYW4gc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bM10rXCInPjwvc3Bhbj48c3Bhbj5cIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVsyXStcIjwvc3Bhbj48L2Rpdj5cIjtcbiAgXHRcdH1cbiAgICAgICQoJyNsZWdlbmRzJykuaHRtbChodG1sKTtcblx0fVxufSIsIi8qXG4gICAgX19fXyAgIF9fX18gX19fXyAgICBfXyAgX19fIF9fXyAgICAgX19fXyAgICAgX19fX18gICAgX19fXyBcbiAgIC8gX18gKSAvICBfLy8gX18gXFwgIC8gIHwvICAvLyAgIHwgICAvIF9fIFxcICAgfF9fICAvICAgLyBfXyBcXFxuICAvIF9fICB8IC8gLyAvIC8gLyAvIC8gL3xfLyAvLyAvfCB8ICAvIC9fLyAvICAgIC9fIDwgICAvIC8gLyAvXG4gLyAvXy8gL18vIC8gLyAvXy8gLyAvIC8gIC8gLy8gX19fIHwgLyBfX19fLyAgIF9fXy8gL18gLyAvXy8gLyBcbi9fX19fXy8vX19fLyBcXF9fX1xcX1xcL18vICAvXy8vXy8gIHxffC9fLyAgICAgICAvX19fXy8oXylcXF9fX18vICBcblxudmFyc2lvbiAzLjAgYnkgTWFyY2luIEfEmWJhbGFcblxubGlzdGEgb2JpZWt0w7N3OlxuXG4gY2FudmFzID0gY2FudmFzKCkgLSBvYmlla3QgY2FudmFzYVxuIGNydWQgPSBjcnVkKCkgLSBvYmlla3QgY2FudmFzYVxuIGltYWdlID0gaW1hZ2UoKSAtIG9iaWVrdCB6ZGrEmWNpYSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxuIG1vdXNlID0gbW91c2UoKVxuIG1vZGVscyA9IG1vZGVscygpXG4gZ2xvYmFsID0gZ2xvYmFsKCkgLSBmdW5rY2plIG5pZSBwcnp5cGlzYW55IGRvIGlubnljaCBvYmlla3TDs3dcbiBjYXRlZ29yaWVzID0gY2F0ZWdvcmllcygpXG4gcG9pbnRlcnMgPSBwb2ludGVycygpXG4gY29sb3JwaWNrZXIgPSBjb2xvcnBpY2tlcigpXG4gbWVudV90b3AgPSBtZW51X3RvcCgpXG4gZmlndXJlcyA9IGZpZ3VyZXMoKVxuXG4qL1xuICBcbi8vcG8ga2xpa25pxJljaXUgem1pZW5pYXkgYWt0dWFsbnkgcGFuZWxcbiQoJy5ib3ggPiB1bCA+IGxpJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2JveCh0aGlzKSB9KTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRcdC8vcHJ6eXBpc2FuaWUgcG9kc3Rhd293b3d5Y2ggZGFueWNoIGRvIG9iaWVrdHUgY2FudmFzXG5cdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcbiAgY2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnKSApO1xuICBjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnKSApO1xuICB2YXIgb2Zmc2V0ID0gJCgnI2NhbnZhc19ib3gnKS5vZmZzZXQoKTtcbiAgY2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuICAvL3R3b3J6eW15IHRhYmxpY2UgcG9pbnRlcsOzd1xuXHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblxuXHQvL29kem5hY3plbmllIHNlbGVjdGEgcHJ6eSB6bWlhbmllXG5cdC8vJC8vKCcjY2hhbmdlX2NhdGVnb3J5JykuY2hhbmdlKGZ1bmN0aW9uKCl7ICQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5ibHVyKCk7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgcHVzY3plbmlhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpeyBtb3VzZS5tb3VzZV9kb3duID0gZmFsc2U7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgd2NpxZtuacSZY2lhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblx0XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy/FgmF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTtcblx0XG5cdH0pO1xuXG5cdC8vd3l3b8WCYW5pZSBmdW5rY2ppIHBvZGN6YXMgcG9ydXN6YW5pYSBteXN6a8SFXG5cdCQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRpZihtb3VzZS5tb3VzZV9kb3duKSBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXHRcdGlmKG1lbnVfdG9wLmF1dG9fZHJhdyl7IG1vdXNlLmNsaWNrX29iaiA9IFwiY2FudmFzXCI7IG1vdXNlLm1vdXNlbW92ZShldmVudCk7fVxuXHRcblx0fSk7XG5cblx0JCgnI21haW5fY2FudmFzJykubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTsvL3phcmVqZXN0cm93YW5pZSBvYmlla3R1dyAga3TDs3J5IGtsaWthbXlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXtcblxuXHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0XHRwb2ludGVycy5sYXN0X3JvdyA9IG51bGw7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IGNhbnZhcy5jb250ZXh0X25ld194O1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSBjYW52YXMuY29udGV4dF9uZXdfeTtcblxuXHR9KTtcblxuXHRjcnVkLmdldF9wcm9qZWN0KCk7XG5cbiAgLy9wYXJlbnQucG9zdE1lc3NhZ2UoJCgnYm9keScpLmhlaWdodCgpLCdodHRwOi8vJytsb2NhdGlvbi5ocmVmLnNwbGl0KCAnLycgKVsyXSk7XG59KTtcbiAgIFxuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCl7ICQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTsgfSk7XG5cbiQoJyNjYW52YXNfd3JhcHBlcicpLm1vdXNlbW92ZShmdW5jdGlvbigpe1xuICB2YXIgdGV4dCA9IG9uX2NhdGVnb3J5LmdldF9uYW1lKCkgXG4gIGNsb3VkLnVwZGF0ZV90ZXh0KHRleHQgKTsgXG59KTtcblxuJChcIiNjYW52YXNfY2xvdWRcIikubW91c2Vtb3ZlKGZ1bmN0aW9uKCl7IGNsb3VkLnNldF9wb3NpdGlvbigpOyB9KTtcbiIsIi8vb2JpZWt0IG1lbnVfdG9wXG5tZW51X3RvcCA9IHtcblxuXHRtb3ZlX2ltYWdlIDogZmFsc2UsXG5cdG1vdmVfY2FudmFzIDogZmFsc2UsXG5cdGF1dG9fZHJhdyA6IGZhbHNlLFxuXHRtb2RlX2tleSA6IHRydWUsXG5cdGNhdGVnb3J5IDogMCxcblx0ZGlzYWJsZV9zZWxlY3QgOiBmYWxzZSxcblxuXHQvL3ptaWFuYSBha3R1YWxuZWogemFrxYJhZGtpXG5cdGNoYW5nZV9ib3ggOiBmdW5jdGlvbihvYmope1xuXHRcdGNvbnNvbGUubG9nKG9iaik7XG5cdFx0JChvYmopLnBhcmVudCgpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHQkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdFx0dmFyIGNhdGVnb3J5ID0gJChvYmopLmF0dHIoJ2NhdGVnb3J5Jyk7XG5cdFx0JChvYmopLnBhcmVudCgpLnBhcmVudCgpLmNoaWxkcmVuKCdkaXYnKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcblx0XHRcdCQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5jaGlsZHJlbignIycrY2F0ZWdvcnkpLmRlbGF5KDEwMCkuZmFkZUluKDUwMCk7XG5cdFx0fSk7XG5cdFxuXHQgXG5cdH0sXG5cblx0Ly9mdW5rY2phIHPFgnXFvMSFY2EgZG8gcG9iaWVyYW5pYSBkYW55Y2ggZG90eWN6xIVjeWNoIG1hcFxuXHRnZXRfbWFwcyA6IGZ1bmN0aW9uKCl7XG5cdFxuXHRcdCQuYWpheCh7XG4gICBcdFx0dXJsOiAnL2FwaS9tYXBzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBtYXAgdyBwYW5lbHUgdSBnw7NyeVxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IFwib2tcIil7XG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICc8b3B0aW9uIGlkPVwic2VsZWN0X21hcFwiPnd5YmllcnogbWFwxJk8L29wdGlvbj4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXHRcdFx0XHRcdGlmKHJlc3BvbnNlLmRhdGFbaV0uX2lkID09IGNydWQubWFwX2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdCQoJyN0b29sYmFyX3RvcCBzZWxlY3Quc2VsZWN0X21hcCcpLmh0bWwoIGFkZF9odG1sICk7XG5cblx0XHRcdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIG1hcCBcblx0XHRcdFx0JCgnLnNlbGVjdF9tYXAnKS5jaGFuZ2UoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQvL3NwcmF3ZHphbXkgY3p5IHd5YnJhbGnFm215IHBvbGUgeiBoYXNoZW0gbWFweVxuXHRcdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgIT0gJ3NlbGVjdF9tYXAnKXtcblx0XHRcdFx0XHRcdC8vamXFm2xpIHRhayB0byBzcHJhd2R6YW15IGN6eSB3Y3p5dHVqZW15IG1hcMSZIHBvIHJheiBwaWVyd3N6eSBjenkgZHJ1Z2lcblx0XHRcdFx0XHRcdGlmKGNydWQubWFwX2hhc2ggIT0gbnVsbCl7XG5cdFx0XHRcdFx0XHRcdC8vamXFm2xpIHdjenl0dWplbXkgcG8gcmF6IGtvbGVqbnkgdG8gcHl0YW15IGN6eSBuYXBld25vIGNoY2VteSBqxIUgd2N6eXRhxIdcblx0XHRcdFx0XHRcdFx0aWYgKGNvbmZpcm0oJ0N6eSBjaGNlc3ogd2N6eXRhxIcgbm93xIUgbWFwxJkgPycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y3J1ZC5tYXBfaGFzaCA9ICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKTtcblx0XHRcdFx0XHRcdFx0XHRjcnVkLmdldF9tYXAoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0JCgnLnNlbGVjdF9tYXAgb3B0aW9uJykuZXEoMCkucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdGNydWQubWFwX2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdGNydWQuZ2V0X21hcCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGFsZXJ0KCduaWUgbW9nxJkgcG9icmHEhyBsaXN0eSBtYXAnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXG5cblx0fSxcblxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X3Byb2plY3RzIDogZnVuY3Rpb24oKXtcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvcHJvamVjdHMnLFxuICAgIFx0dHlwZTogXCJHRVRcIixcbiAgICBcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoIGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblxuXHRcdFx0Ly93ecWbd2lldGxhbXkgbGlzdMSZIHByb2pla3TDs3cgdyBwYW5lbHUgdSBnw7NyeVxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IFwib2tcIil7XG5cblx0XHRcdFx0dmFyIGFkZF9odG1sID0gJzxvcHRpb24gaWQ9XCJuZXdfcHJvamVjdFwiPm5vd3kgcHJvamVrdDwvb3B0aW9uPic7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBpX21heCA9IHJlc3BvbnNlLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXggO2krKyl7XG5cblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLnByb2plY3RfaGFzaCl7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBzZWxlY3RlZCBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLnByb2plY3QpLm5hbWUgKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ucHJvamVjdCkubmFtZSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9wcm9qZWN0JykuaHRtbCggYWRkX2h0bWwgKTtcblx0XHRcdFxuXHRcdFx0XHQvL2RvZGFqZW11IHpkYXJ6ZW5pZSBjaGFuZ2UgcHJvamVjdCBcblx0XHRcdFx0JCgnLnNlbGVjdF9wcm9qZWN0JykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0aWYgKGNvbmZpcm0oJ0N6eSBjaGNlc3ogd2N6eXRhxIcgbm93eSBwcm9qZWt0ID8nKSkge1xuXHRcdFx0XHRcdFx0aWYoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSA9PSAnbmV3X3Byb2plY3QnICl7XG5cdFx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0Y3J1ZC5wcm9qZWN0X2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdGNydWQuZ2V0X3Byb2plY3QoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRhbGVydCgnbmllIG1vZ8SZIHBvYnJhxIcgbGlzdHkgcHJvamVrdMOzdycpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKTtcblx0XHRcdH1cblxuXHRcdH0pO1xuXHR9LFxuXG5cdHVwZGF0ZV9jYW52YXNfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLnNjYWxlID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCgpICk7XG5cdFx0Y2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCkgKTtcblx0XHRjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCgpICk7XG5cblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoIGNhbnZhcy5zY2FsZSArICclJyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoIGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnICk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoIGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4JyApO1xuXG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCAjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRjaGFuZ2VfYWxwaGEgOiBmdW5jdGlvbigpe1xuXHRcdGltYWdlLmFscGhhID0gJCgnI2FscGhhX2ltYWdlJykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0YWRkX2ltYWdlIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vamVzbGkgcG9kYW55IHBhcmFtZXRyIG5pZSBqZXN0IHB1c3R5XG5cdFx0dmFyIHNyY19pbWFnZSA9IHByb21wdChcIlBvZGFqIMWbY2llxbxrxJkgZG8gemRqxJljaWE6IFwiKTtcblxuXHRcdGlmKHNyY19pbWFnZSl7XG5cdFx0XHRpZihzcmNfaW1hZ2UubGVuZ3RoID4gMCl7XG5cblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cblx0XHRcdFx0Ly93Y3p5dGFuaWUgemRqxJljaWE6XG5cdFx0XHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdGltYWdlLndpZHRoID0gaW1hZ2Uub2JqLndpZHRoO1xuXHQgICAgXHRcdGltYWdlLmhlaWdodCA9IGltYWdlLm9iai5oZWlnaHQ7XG5cdCAgICBcdFx0aW1hZ2UuZHJhdygpO1xuXHQgIFx0XHR9O1xuXG5cdFx0XHQgIGltYWdlLnggPSAwO1xuXHRcdFx0ICBpbWFnZS55ID0gMDtcblx0XHRcdCAgaW1hZ2Uub2JqLnNyYyA9IHNyY19pbWFnZTtcblx0XHRcdFx0Ly9zaW1hZ2Uub2JqLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNob3dfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHBhcnNlSW50KGNhbnZhcy5zY2FsZSkgKyAnJScpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwocGFyc2VJbnQoY2FudmFzLndpZHRoX2NhbnZhcykgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbChwYXJzZUludChjYW52YXMuaGVpZ2h0X2NhbnZhcykgKyAncHgnKTtcblx0fVxuXG59XG4iLCIvL29iaWVrdCBteXN6a2kgKGRvIG9nYXJuaWVjaWEpXG52YXIgbW91c2UgPSB7XG5cdG1vdXNlX2Rvd24gOiBmYWxzZSxcblx0Y2xpY2tfb2JqIDogbnVsbCxcblxuXHR0bXBfbW91c2VfeCA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cdHRtcF9tb3VzZV95IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblxuXHRsZWZ0IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpXG5cdHRvcCA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praVxuXHRwYWRkaW5nX3ggOiBudWxsLCAvL3BvenljamEgeCBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0cGFkZGluZ195IDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdG9mZnNldF94IDogbnVsbCwgLy9vZmZzZXQgeCBvYmlla3R1IGtsaWtuacSZdGVnb1xuXHRvZmZzZXRfeSA6IG51bGwsIC8vb2Zmc2V0IHkgb2JpZWt0dSBrbGlrbmnEmXRlZ29cblxuXHQvL2Z1bmNramEgd3lrcnl3YWrEhWNhIHcgY28ga2xpa25pxJl0byBwb2JpZXJhasSFY2EgcGFkZGluZyBrbGlrbmnEmWNpYSBvcmF6IHphcGlzdWrEhWNhIGtsaWtuacSZY2llXG5cdHNldF9tb3VzZV9kb3duIDogZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0dmFyIG9iaiA9IGV2ZW50LnRhcmdldDtcblxuXHRcdC8vamXFm2xpIGVsZW1lbnQgbmEga3TDs3J5IGtsaWtuacSZdG8gbWEgYXRyeWJ1dCBuYW1lY2xpY2sgcHJ6eXBpc3VqZW15IGdvIGRvIG9iaWVrdHUgbXlzemtpXG5cdFx0aWYodHlwZW9mKCQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHR0aGlzLmNsaWNrX29iaiA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKTtcblxuXHRcdFx0dmFyIHBvc2l0aW9uID0gJChvYmopLm9mZnNldCgpO1xuXHRcdFx0dGhpcy5vZmZzZXRfeCA9IHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLm9mZnNldF95ID0gcG9zaXRpb24udG9wO1xuXHRcdFx0dGhpcy5wYWRkaW5nX3ggPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5wYWRkaW5nX3kgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDtcblx0XHRcdG1vdXNlLm1vdXNlX2Rvd24gPSB0cnVlO1xuXG5cdFx0XHR0aGlzLnRtcF9tb3VzZV94ID0gaW1hZ2UueDtcblx0XHRcdHRoaXMudG1wX21vdXNlX3kgPSBpbWFnZS55O1xuXHRcdH1cblx0fSxcblxuXHRzZXRfcG9zaXRpb24gOiBmdW5jdGlvbihldmVudCl7XG5cdFx0dGhpcy5sZWZ0ID0gZXZlbnQucGFnZVgsXG5cdFx0dGhpcy50b3AgPSBldmVudC5wYWdlWVxuXHR9LFxuXG5cdC8vZnVua2NqYSB3eWtvbnl3YW5hIHBvZGN6YXMgd2NpxZtuaWVjaWEgcHJ6eWNpa3NrdSBteXN6a2kgKHcgemFsZcW8bm/Fm2NpIG9kIGtsaWtuacSZdGVnbyBlbGVtZW50dSB3eWtvbnVqZW15IHLDs8W8bmUgcnplY3p5KVxuXHRtb3VzZW1vdmUgOiBmdW5jdGlvbigpe1xuXHRcdHN3aXRjaCh0aGlzLmNsaWNrX29iail7XG5cdFx0XHRjYXNlICdyaWdodF9yZXNpemUnOlxuXHRcdFx0XHQvL3JvenN6ZXJ6YW5pZSBjYW52YXNhIHcgcHJhd29cblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHR2YXIgbmV3X3dpZHRoID0gdGhpcy5sZWZ0IC0gdGhpcy5wYWRkaW5nX3ggLSBwb3NpdGlvbi5sZWZ0XG5cdFx0XHRcdGlmKG5ld193aWR0aCA8IHNjcmVlbi53aWR0aCAtIDEwMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhbnZhcy5yZXNpemVfd2lkdGgobmV3X3dpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2JvdHRvbV9yZXNpemUnOlxuXHRcdFx0XHQvL3ptaWVuaWFteSB3eXNva2/Fm8SHIGNhbnZhc2Fcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRjYW52YXMucmVzaXplX2hlaWdodCh0aGlzLnRvcCAtIHRoaXMucGFkZGluZ195IC0gcG9zaXRpb24udG9wKTtcblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdpbWFnZV9yZXNpemUnOlxuXG5cdFx0XHRcdGlmKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0XHR2YXIgeF9hY3R1YWwgPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1x0Ly9ha3R1YWxuYSBwb3p5Y2phIG15c3praVxuXHRcdFx0XHRcdHZhciBzdWJzdHJhY3QgPSBpbWFnZS54ICsgaW1hZ2Uud2lkdGggLSB4X2FjdHVhbCArIHRoaXMucGFkZGluZ194O1xuXHRcdFx0XHRcdHZhciBmYWNvciA9IGltYWdlLndpZHRoIC8gaW1hZ2UuaGVpZ2h0O1xuXG5cdFx0XHRcdFx0aWYgKGltYWdlLndpZHRoIC0gc3Vic3RyYWN0ID4gMTAwKXtcblx0XHRcdFx0XHRcdGltYWdlLndpZHRoIC09IHN1YnN0cmFjdDtcblx0XHRcdFx0XHRcdGltYWdlLmhlaWdodCAtPSBzdWJzdHJhY3QvZmFjb3I7XG5cdFx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG4iLCIvL29iaWVrdCBtw7N3acSFY3kgbmFtIG5hZCBqYWvEhSBrYXRlZ29yaWEgamVzdGXFm215XG52YXIgb25fY2F0ZWdvcnkgPSB7XG5cdFxuXHRjYW52YXNfb2Zmc2V0X3RvcCA6ICQoJyNjYW52YXNfd3JhcHBlcicpLm9mZnNldCgpLnRvcCxcblx0Y2FudmFzX29mZnNldF9sZWZ0IDogJCgnI2NhbnZhc193cmFwcGVyJykub2Zmc2V0KCkubGVmdCxcblxuXHQvL2Z1bmtjamEgendyYWNhasSFY2EgYWt0dWFsbsSFIGthdGVnb3JpxJkgbmFkIGt0w7NyxIUgem5hamR1amUgc2nEmSBrdXJzb3Jcblx0Z2V0X25hbWUgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGxlZnQgPSBtb3VzZS5sZWZ0IC0gY2FudmFzLm9mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSBjYW52YXMub2Zmc2V0X3RvcDtcblx0XHQvL2NvbnNvbGUubG9nKGxlZnQsdG9wKTtcblx0XHR2YXIgcm93ID0gTWF0aC5jZWlsKCB0b3AgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHQvL2NvbnNvbGUubG9nKGxlZnQsdG9wLHRoaXMuY2FudmFzX29mZnNldF9sZWZ0LHRoaXMuY2FudmFzX29mZnNldF90b3ApO1xuXHRcdGlmKChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSAmJiAocm93ICUgMiAhPSAwKSl7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCAobGVmdCArIChwb2ludGVycy5zaXplLzIpKS8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICkgLSAxO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggbGVmdCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXHRcdH1cblx0XHRcblx0XHR0cnl7XG5cblx0XHRcdHZhciBjYXRlZ29yeV9udW0gPSBwb2ludGVycy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdO1xuXHRcdFx0dmFyIGNhdGVnb3J5X25hbWUgPSBsYXllcnMuY2F0ZWdvcnlfbmFtZVtjYXRlZ29yeV9udW1dO1xuXHRcdFx0Ly9jb25zb2xlLmxvZygndGVzdCcsY2F0ZWdvcnlfbmFtZSk7XG5cblx0XHR9XG5cdFx0Y2F0Y2goZSl7XG5cdFx0XHRyZXR1cm4gJ251bGwnO1xuXHRcdH1cblx0XHRcblx0XHRpZigoY2F0ZWdvcnlfbmFtZSA9PSAncHVzdHknKSB8fCAoY2F0ZWdvcnlfbmFtZSA9PSAnZ3VtdWonKSl7XG5cdFx0XHRyZXR1cm4gJ251bGwnO1xuXHRcdH0gXG5cdFx0ZWxzZXtcblx0XHRcdHJldHVybiBjYXRlZ29yeV9uYW1lO1x0XHRcblx0XHR9XG5cblx0fVxuXG59XG4vKlxuJCgnZG9jdW1lbnQnKS5yZWFkeShmdW5jdGlvbigpe1xuXHRvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X3RvcCA9IDtcblx0b25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF9sZWZ0ID0gO1xufSk7XG5cbiovIiwicGFsZXRzID0ge30iLCIvL21lbnUgcG9pbnRlclxudmFyIHBvaW50ZXJzID0ge1xuXHRzaG93X2FsbF9wb2ludCA6IHRydWUsXG5cdHBhZGRpbmdfeCA6IDEsXG5cdHBhZGRpbmdfeSA6IDEsXG5cdHRyYW5zbGF0ZV9tb2R1bG8gOiBmYWxzZSxcblx0c2l6ZSA6IDEwLFxuXHRtYWluX2tpbmQgOiAnc3F1YXJlJyxcblx0a2luZHMgOiBBcnJheSgnc3F1YXJlJywnY2lyY2xlJywnaGV4YWdvbicsJ2hleGFnb24yJyksXG5cblx0cG9pbnRlcnMgOiBBcnJheSgpLCAvL3BvaW50ZXJzLnBvaW50ZXJzW3J6YWRdW2tvbHVtbmFdIDoga2F0ZWdvcmlhW251bWVyXVxuXG5cdGxhc3RfY29sdW1uIDogbnVsbCxcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0bGFzdF9yb3cgOiBudWxsLFx0Ly93aWVyc3ogcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cblx0Ly9yeXNvd2FuaWUgd3N6eXN0a2ljaCBwdW5rdMOzd1xuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHQvL2NvbnNvbGUubG9nKCdkcmF3Jyx0aGlzLnNpemUsbGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyk7IFxuXHRcdHZhciB3aWR0aF9wb2ludGVyID0gdGhpcy5zaXplICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0dmFyIGhlaWdodF9wb2ludGVyID0gdGhpcy5zaXplICsgdGhpcy5wYWRkaW5nX3k7XG5cdFx0dmFyIG5vbmVfY29sb3IgPSBcInJnYmEoMCwwLDAsMClcIjtcblxuXHRcdC8vaWYodGhpcy5zaG93X2FsbF9wb2ludCkgbm9uZV9jb2xvciA9IFwicmdiYSgxMjgsMTI4LDEyOCwxKVwiO1xuXG5cdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93Kyspe1xuXHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspe1xuXG5cdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IDApe1xuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IG5vbmVfY29sb3I7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjU7IFxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0aWYoICh0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSAhPSBtZW51X3RvcC5jYXRlZ29yeSkgJiYgKG1lbnVfdG9wLmNhdGVnb3J5ICE9IDApICl7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IGxheWVycy5jYXRlZ29yeV9jb2xvcnNbbGF5ZXJzLmFjdGl2ZV1bIHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dIF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoKGUpe1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ0VSUk9SIDM5IExJTkUgISAnLHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dLHJvdyxjb2x1bW4pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCAocm93ICUgMiA9PSAwKSAmJiAocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgKXtcblx0XHRcdFx0XHR3aW5kb3dbJ2ZpZ3VyZXMnXVt0aGlzLm1haW5fa2luZF0oIGNvbHVtbip3aWR0aF9wb2ludGVyICsgd2lkdGhfcG9pbnRlci8yICwgcm93KmhlaWdodF9wb2ludGVyICwgdGhpcy5zaXplKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0Ly90d29yenlteSB0YWJsaWNlIHBvbnRlcsOzdyAoamXFm2xpIGpha2nFmyBwb250ZXIgaXN0bmllamUgem9zdGF3aWFteSBnbywgdyBwcnp5cGFka3UgZ2R5IHBvaW50ZXJhIG5pZSBtYSB0d29yenlteSBnbyBuYSBub3dvKVxuXHRjcmVhdGVfYXJyYXkgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5hY3RpdmVfcm93ID0gcGFyc2VJbnQoIGNhbnZhcy5oZWlnaHRfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3kpICk7XG5cdFx0Y2FudmFzLmFjdGl2ZV9jb2x1bW4gPSBwYXJzZUludCggY2FudmFzLndpZHRoX2NhbnZhcyAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXG5cdFx0aWYoICh0aGlzLnBvaW50ZXJzLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfcm93KSB8fCAodGhpcy5wb2ludGVyc1swXS5sZW5ndGggPCBjYW52YXMuYWN0aXZlX2NvbHVtbikgKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddID09IHVuZGVmaW5lZCkgdGhpcy5wb2ludGVyc1tyb3ddID0gbmV3IEFycmF5KCk7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gdW5kZWZpbmVkKVx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZV9wb2ludCA6IGZ1bmN0aW9uKHkseCx5X2xhc3QseF9sYXN0KXtcblxuXHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblxuXHRcdC8vd3l6bmFjemVuaWUgcsOzd25hbmlhIHByb3N0ZWpcblx0XHRpZiggKCh5X2xhc3QgIT0geSkgfHwgKHhfbGFzdCAhPSB4KSkgJiYgKHlfbGFzdCAhPSBudWxsKSAmJiAoeF9sYXN0ICE9IG51bGwpICl7XG5cdFx0XHR2YXIgYSA9ICh5X2xhc3QgLSB5KSAvICh4X2xhc3QgLSB4KTtcblx0XHRcdHZhciBiID0geSAtIGEqeDtcblxuXHRcdFx0aWYoeF9sYXN0ID4geCl7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHg7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIGNvbF90byA9IHg7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHhfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0aWYoeV9sYXN0ID4geSl7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHk7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHJvd190byA9IHk7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHlfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJvdyA9IG51bGw7XG5cdFx0XHRmb3IodmFyIGNvbCA9IGNvbF9mcm9tOyBjb2wgPD0gY29sX3RvOyBjb2wrKylcblx0XHRcdHtcblx0XHRcdFx0cm93ID0gcGFyc2VJbnQoIGEqY29sK2IgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHJvdykpIHJvdyA9IHk7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjb2wgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciByb3cgPSByb3dfZnJvbTsgcm93IDw9IHJvd190bzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbCA9IHBhcnNlSW50KCAocm93LWIpL2EgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKGNvbCkpIGNvbCA9IHg7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0fVxuXHR9XG59XG4iLCJ2YXIgc291cmNlID0ge1xyXG4gIHNob3cgOiBmdW5jdGlvbigpe1xyXG4gICAgLy9jb25zb2xlLmxvZyggbGF5ZXJzLnNvdXJjZSApO1xyXG4gICAgJCgnI3NvdXJjZScpLmh0bWwoIGxheWVycy5zb3VyY2UgKTsgXHJcbiAgfVxyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
