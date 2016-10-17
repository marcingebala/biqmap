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
var categories = {}
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

	/*get_textarea : function(text_tmp){

		//var text_tmp = $(obj).val();

		layers.cloud[layers.active] = text_tmp;

		for(var i = 0, i_max = excel.data[0].length; i < i_max; i++){
				layers.cloud[layers.active] = layers.cloud[layers.active].replace('{'+excel.data[0][i]+'}','"+excel.data[tmp_row]['+i+']"+');
		}

		layers.cloud_parser[layers.active] = '"'+text_tmp+'"';
	},*/

	//ustawiamy poprawną pozycję dymka
	set_position : function(){
		var left = mouse.left - on_category.canvas_offset_left;
		var top = mouse.top - on_category.canvas_offset_top;

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

/*
$('#cloud .cloud_text').keyup(function(){

	cloud.get_textarea(this);

}) ;*/
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

		console.log( data.layers.category_colors );

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
		}).done(function( data ) { console.log(data.data); crud.set_project( data.data );  });
	},

}

var excel = {}

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
	},

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

		var html = "";
		html += '<span num="'+0+'" class="active">' + this.list[0] + '</span>';
		
		for(var i = 1, i_max = this.list.length; i < i_max; i++){
			html += '<span num="'+i+'">' + this.list[i] + '</span>';
		}

		$('#area').html(html);
		$('#area span').click(function(){
			layers.select(this);
		});
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
	
	},


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
		console.log('draw',this.size,layers.category_colors); 
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
    $('#source').html( layers.source ); 
  }
}


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyIsInNvdXJjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25KQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJlbWJlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vY3p5c3pjemVuaWUgaSByeXNvd2FuaWUgcG8gY2FudmFzaWVcbnZhciBjYW52YXMgPSB7XG5cdFxuXHRzY2FsZSA6IDEwMCxcblx0d2lkdGhfY2FudmFzIDogNzAwLFxuXHRoZWlnaHRfY2FudmFzIDogNDAwLFxuXHRjYW52YXMgOiBudWxsLFxuXHRjb250ZXh0IDogbnVsbCxcblx0dGh1bWJuYWlsIDogbnVsbCxcblx0dGl0bGVfcHJvamVjdCA6ICdub3d5IHByb2pla3QnLFxuXG5cdGNvbnRleHRfeCA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X3kgOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHlcblx0Y29udGV4dF9uZXdfeCA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF9uZXdfeSA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHlcblxuXHRvZmZzZXRfbGVmdCA6IG51bGwsXG5cdG9mZnNldF90b3AgOiBudWxsLFxuXHRhY3RpdmVfcm93IDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblx0YWN0aXZlX2NvbHVtbiA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cblx0dGh1bWJuYWlsIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluX2NhbnZhc1wiKTtcblx0XHR2YXIgZGF0YVVSTCA9IGNhbnZhcy50b0RhdGFVUkwoKTtcblx0XHRjb25zb2xlLmxvZyhkYXRhVVJMKTtcblx0fSxcblxuXHQvL3J5c3VqZW15IGNhbnZhcyB6ZSB6ZGrEmWNpZW1cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Ly9jb25zb2xlLmxvZygnY2FudmFzIGRyYXcnKTtcblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblx0XHRwb2ludGVycy5kcmF3KCk7XG5cblx0XHRpZiAoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpICBpbWFnZS5kcmF3KCk7XG5cdH0sXG5cblx0ZHJhd190aHVtbmFpbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMudGh1bWJuYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHR9LFxuXG5cdC8vcmVzZXR1amVteSB0xYJvIHpkasSZY2lhXG5cdHJlc2V0IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblx0fSxcblxuXHQvLyBjennFm2NpbXkgY2HFgmUgemRqxJljaWUgbmEgY2FudmFzaWVcblx0Y2xlYXIgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5jbGVhclJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdFx0Ly90aGlzLmNvbnRleHQuZmlsbFJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdH0sXG5cblx0cmVzaXplX3dpZHRoIDogZnVuY3Rpb24obmV3X3dpZHRoKXtcblx0XHR0aGlzLndpZHRoX2NhbnZhcyA9IG5ld193aWR0aDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsdGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiB0aGlzLndpZHRoX2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHRoaXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSArICclJyk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdH0sXG5cblx0cmVzaXplX2hlaWdodCA6IGZ1bmN0aW9uKG5ld19oZWlnaHQpe1xuXHRcdHRoaXMuaGVpZ2h0X2NhbnZhcyA9IG5ld19oZWlnaHQ7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0Jyx0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnaGVpZ2h0JzogdGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdHRoaXMuc2NhbGUgPSAxMDA7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHRoaXMuc2NhbGUrJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTsgLy8gYWt0dWFsaXp1amVteSBkYW5lIG9kbm/Fm25pZSByb3ptaWFyw7N3IGNhbnZhc2EgdyBtZW51IHUgZ8Ozcnlcblx0XHQvL3RoaXMuZHJhdygpOyAvL3J5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdH0sXG5cblx0c2V0X2RlZmF1bHQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfYm94ICNyaWdodF9yZXNpemUsICNjYW52YXNfYm94ICNib3R0b21fcmVzaXplJykuZmFkZUluKDUwMCk7XG5cdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXG5cdFx0Y2FudmFzLnNjYWxlID0gMTAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblxuXHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdHZhciBuZXdfaGVpZ2h0ID0gY2FudmFzLmhlaWdodF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cih7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JzogbmV3X2hlaWdodCArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHQvL2NhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Ly9jYW52YXMuZHJhdygpO1xuXHR9XG59XG4iLCIvL29iaWVrdCBrYXRlZ29yaWkgZG9kYW5pZSAvIGFrdHVhbGl6YWNqYSAvIHVzdW5pxJljaWUgLyBwb2themFuaWUga2F0ZWdvcmlpXG52YXIgY2F0ZWdvcmllcyA9IHt9XG4vKlx0XG5cblx0Ly9jYXRlZ29yeSA6IG5ldyBBcnJheShbJ3B1c3R5JywnIzgwODA4MCddKSxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBuYW1lID0gQXJyYXkoJCgnI2NhdGVnb3J5X2JveCBpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykudmFsKCksJyNmZjAwMDAnKTtcblx0XHQkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoJycpO1xuXG5cdFx0dGhpcy5jYXRlZ29yeS5wdXNoKG5hbWUpO1xuXHRcdG1lbnVfdG9wLmNhdGVnb3J5ID0gKHRoaXMuY2F0ZWdvcnkubGVuZ3RoLTEpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblx0dXBkYXRlIDogZnVuY3Rpb24oaW5kZXgsbmFtZSl7XG5cdFx0dGhpcy5jYXRlZ29yeVtpbmRleF1bMF0gPSBuYW1lO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblxuXHQvL2FrdHVhbGl6dWplbXkgdGFibGljxJkga29sb3LDs3dcblx0dXBkYXRlX2NvbG9yIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vbW/FvGxpd2EgYWt0dWFsaXphY2phIGplZHluaWUgdyBwcnp5cGFka3Ugd3licmFuaWEga29ua3JldG5laiBrb2x1bW55IHdhcnRvxZtjaSBpIGthdGVnb3JpaSB3IGV4Y2VsdVxuXHRcdGlmKChjcnVkLm1hcF9qc29uLmxlbmd0aCA+IDApICYmIChleGNlbC5kYXRhLmxlbmd0aCA+IDApICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcblxuXHRcdFx0Zm9yICh2YXIgaV9jYXRlZ29yeSA9IDAsIGlfY2F0ZWdvcnlfbWF4ID1cdGxheWVycy5jYXRlZ29yeV9uYW1lLmxlbmd0aDsgaV9jYXRlZ29yeSA8IGlfY2F0ZWdvcnlfbWF4OyBpX2NhdGVnb3J5Kyspe1xuXHRcdFx0XHR2YXIgbmFtZSA9IGxheWVycy5jYXRlZ29yeV9uYW1lW2lfY2F0ZWdvcnldO1xuXG5cdFx0XHRcdGZvciAodmFyIGlfZXhlbCA9IDAsIGlfZXhlbF9tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaV9leGVsIDwgaV9leGVsX21heDsgaV9leGVsKyspe1xuXHRcdFx0XHRcdGlmKCBleGNlbC5kYXRhW2lfZXhlbF1bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSA9PSBuYW1lKXtcblx0XHRcdFx0XHRcdC8vamXFm2xpIHpuYWxlxbpsacWbbXkga2F0ZWdvcmnEmSB3IGV4Y2VsdVxuXHRcdFx0XHRcdFx0dmFyIHZhbHVlID0gZXhjZWwuZGF0YVtpX2V4ZWxdW2xheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXV07XG5cblx0XHRcdFx0XHRcdGZvciAoIHZhciBpX2xlZ2VuZHMgPSAwLCBpX2xlZ2VuZHNfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpX2xlZ2VuZHMgPCBpX2xlZ2VuZHNfbWF4OyBpX2xlZ2VuZHMrKyApe1xuXHRcdFx0XHRcdFx0XHRpZiggKHZhbHVlID49IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2lfbGVnZW5kc11bMF0pICYmICh2YWx1ZSA8PSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNdWzFdKSApe1xuXHRcdFx0XHRcdFx0XHRcdC8vamXFm2xpIHpuYWxlxbpsaXNteVxuXHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbbGF5ZXJzLmFjdGl2ZV1baV9jYXRlZ29yeV0gPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNdWzNdO1xuXHRcdFx0XHRcdFx0XHRcdGlfbGVnZW5kcyA9IGlfbGVnZW5kc19tYXg7XG5cdFx0XHRcdFx0XHRcdFx0aV9leGVsID0gaV9leGVsX21heDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvL2plxZtsaSB3YXJ0b8WbxIcgd3ljaG9kemkgcG96YSBza2FsZSB1IHRhayBwcnp5cGlzdWplbXkgamVqIG9kcG93aWVkbmkga29sb3Jcblx0XHRcdFx0XHRcdGlmKHZhbHVlIDwgbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1bMF1bMF0pe1xuXHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2xheWVycy5hY3RpdmVdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1bMF1bM107XG5cdFx0XHRcdFx0XHR9XHRcblxuXHRcdFx0XHRcdFx0aWYodmFsdWUgPiBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNfbWF4LTFdWzFdKXtcblx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2lfbGVnZW5kc19tYXgtMV1bM107XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL3BvIHpha3R1YWxpem93YW5pdSBrb2xvcsOzdyB3IGthdGVnb3JpYWNoIHJ5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdFx0Y2FudmFzLmRyYXcoKTtcblxuXG5cdH0sXG59Ki9cbiIsImNsb3VkID0ge1xuXG5cdHNldF90ZXh0YXJlYSA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2Nsb3VkIC5jbG91ZF90ZXh0JykudmFsKCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0fSxcblxuXHQvKmdldF90ZXh0YXJlYSA6IGZ1bmN0aW9uKHRleHRfdG1wKXtcblxuXHRcdC8vdmFyIHRleHRfdG1wID0gJChvYmopLnZhbCgpO1xuXG5cdFx0bGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdID0gdGV4dF90bXA7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSA9IGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXS5yZXBsYWNlKCd7JytleGNlbC5kYXRhWzBdW2ldKyd9JywnXCIrZXhjZWwuZGF0YVt0bXBfcm93XVsnK2krJ11cIisnKTtcblx0XHR9XG5cblx0XHRsYXllcnMuY2xvdWRfcGFyc2VyW2xheWVycy5hY3RpdmVdID0gJ1wiJyt0ZXh0X3RtcCsnXCInO1xuXHR9LCovXG5cblx0Ly91c3Rhd2lhbXkgcG9wcmF3bsSFIHBvenljasSZIGR5bWthXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGxlZnQgPSBtb3VzZS5sZWZ0IC0gb25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X3RvcDtcblxuXHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmNzcyh7dG9wOnBhcnNlSW50KHRvcCAtICQoXCIjY2FudmFzX2Nsb3VkXCIpLmhlaWdodCgpKSsncHgnLGxlZnQ6bGVmdCsncHgnfSk7XG5cdH0sXG5cblx0Ly9mdW5rY2phIG9kcG93aWVkemlhbG5hIHphIHd5xZt3aWV0bGVuaWUgZHlta2EgeiBvZHBvd2llZG5pxIUgemF3YXJ0b8WbY2nEhVxuXHR1cGRhdGVfdGV4dCA6IGZ1bmN0aW9uKG5hbWUpe1xuXG5cdFx0aWYoKG5hbWUgIT0gXCJcIikgJiYgKG5hbWUgIT0gJ251bGwnKSl7XG5cblx0XHRcdHZhciB0bXBfcm93ID0gbnVsbDtcblx0XHRcdHZhciBmaW5kID0gMDtcblx0XHRcdGZvciggdmFyIGlfcm93ID0gMCwgaV9yb3dfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfcm93IDwgaV9yb3dfbWF4OyBpX3JvdysrICl7XG5cdFx0XHRcdGlmKFN0cmluZyhuYW1lKS50b0xvd2VyQ2FzZSgpID09IFN0cmluZyhleGNlbC5kYXRhW2lfcm93XVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dKS50b0xvd2VyQ2FzZSgpKXtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR0aGlzLnNldF9wb3NpdGlvbigpO1xuXHRcdFx0XHRcdHZhciB0ZXh0X3RtcCA9IGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXTtcblxuXHRcdFx0XHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0XHRcdHRleHRfdG1wID0gdGV4dF90bXAucmVwbGFjZSgneycrZXhjZWwuZGF0YVswXVtpXSsnfScsZXhjZWwuZGF0YVtpX3Jvd11baV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvL2RvcGllcm8gamXFm2xpIGR5bWVrIG1hIG1pZcSHIGpha2HFmyBrb25rcmV0bsSFIHphd2FydG/Fm8SHIHd5xZt3aWV0bGFteSBnb1xuXHRcdFx0XHRcdGlmKCh0ZXh0X3RtcCE9XCJcIikgJiYgKCBleGNlbC5kYXRhW2lfcm93XVtsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV1dICE9IG51bGwgKSl7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlSW4oMCk7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5odG1sKHRleHRfdG1wKTtcblx0XHRcdFx0XHRcdGZpbmQgPSAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2plxZtsaSBuaWUgem5hbGV6aW9ubyBvZHBvd2llZG5pZWoga2F0ZWdvcmlpXG5cdFx0XHRpZiAoIWZpbmQpIHsgXG5cdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMCk7XG5cdFx0fVxuXHR9XG5cbn1cblxuLypcbiQoJyNjbG91ZCAuY2xvdWRfdGV4dCcpLmtleXVwKGZ1bmN0aW9uKCl7XG5cblx0Y2xvdWQuZ2V0X3RleHRhcmVhKHRoaXMpO1xuXG59KSA7Ki8iLCIvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgdHdvcnplbmllIHphcGlzeXdhbmllIGkgYWt0dWFsaXphY2plIGRhbnljaCBkb3R5Y3rEhcSHY3loIG1hcHlcbi8vdmFyIGNydWQgPSBjcnVkIHx8IHt9XG5jcnVkID0ge1xuXG5cdG1hcF9qc29uIDogQXJyYXkoKSwgLy9nxYLDs3duYSB6bWllbm5hIHByemVjaG93dWrEhWNhIHdzenlzdGtpZSBkYW5lXG5cdG1hcF9oYXNoIDpudWxsLFxuXHRsYXllcnMgOiB7fSxcblx0ZXhjZWwgOiBBcnJheSgpLFxuXHRwcm9qZWN0IDoge30sXG5cdHByb2plY3RfaGFzaCA6IHByb2plY3RfaGFzaCwgLy9nxYLDs3dueSBoYXNoIGRvdHljesSFY3kgbmFzemVnbyBwcm9qZWt0dVxuXG5cdC8vd2N6eXRhbmllIHptaWVubnljaCBkbyBvYmlla3TDs3cgbWFweVxuXG5cdHNldF9tYXAgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vcG8gemFwaXNhbml1IGRhbnljaCBkbyBiYXp5IGFrdHVhbGl6dWplbXkgaWQgKHcgcHJ6eXBhZGt1IGplxZtsaSBpc3RuaWVqZSBuYWRwaXN1amVteSBqZSlcblx0XHR0aGlzLm1hcF9qc29uID0gZGF0YTtcblxuXHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gZGF0YVswXVswXTtcblx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gZGF0YVswXVsxXTtcblx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSBkYXRhWzBdWzJdO1xuXHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IGRhdGFbMF1bM107XG5cdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IGRhdGFbMF1bNF07XG5cdFx0cG9pbnRlcnMuc2l6ZSA9IGRhdGFbMF1bNV07XG5cdFx0cG9pbnRlcnMubWFpbl9raW5kID0gZGF0YVswXVs2XTtcblx0XHRjYW52YXMudGl0bGVfcHJvamVjdCA9IGRhdGFbMF1bN107XG5cblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeFwiXScpLnZhbCggZGF0YVswXVsyXSApO1xuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ195XCJdJykudmFsKCBkYXRhWzBdWzNdICk7XG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJzaXplX3BvaW50ZXJcIl0nKS52YWwoIGRhdGFbMF1bNV0gKTtcblx0XHQkKCdpbnB1dFtuYW1lPVwidGl0bGVfcHJvamVjdFwiXScpLnZhbCggZGF0YVswXVs3XSApO1xuXG5cdFx0aWYoIGRhdGFbMF1bNF0gKXtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHR9XG5cblx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5odG1sKCcnKTtcblxuXHRcdHBvaW50ZXJzLmtpbmRzLmZvckVhY2goZnVuY3Rpb24oa2luZCl7XG5cblx0XHRcdGlmKGtpbmQgPT0gZGF0YVswXVs2XSl7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBzZWxlY3RlZD1cInNlbGVjdGVkXCIgbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIG8gcG9pbnRlcmFjaFxuXHRcdHBvaW50ZXJzLnBvaW50ZXJzID0gZGF0YVsxXTtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgbyBrYXRlZ29yaWFjaFxuXHRcdHZhciBjYXRlZ29yaWVzID0ge307XG5cdFx0Y2F0ZWdvcmllcy5jYXRlZ29yeSA9IGRhdGFbMl07XG5cblxuXHRcdC8vcG8gd2N6eXRhbml1IG1hcHkgYWt0eWFsaXp1amVteSBkYW5lIGRvdHljesSFY8SFIGthdGVnb3JpaSBpIGtvbG9yw7N3XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1swXSA9IFtdO1xuXHRcdGxheWVycy5jYXRlZ29yeV9uYW1lID0gW107XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGNhdGVnb3JpZXMuY2F0ZWdvcnkubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZS5wdXNoKGNhdGVnb3JpZXMuY2F0ZWdvcnlbaV1bMF0pO1xuXHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1swXS5wdXNoKGNhdGVnb3JpZXMuY2F0ZWdvcnlbaV1bMV0pO1xuXHRcdH1cblxuXHRcdC8vcG9iaWVyYW5pZSBkYW55Y2ggbyB6ZGrEmWNpdSBqZcW8ZWxpIGlzdG5pZWplXG5cdFx0aWYoIGRhdGFbM10ubGVuZ3RoID4gMil7XG5cdFx0XHRpbWFnZS5vYmogPSBuZXcgSW1hZ2UoKTtcblx0XHRcdGltYWdlLm9iai5zcmMgPSBkYXRhWzNdWzBdO1xuXHRcdFx0aW1hZ2UueCA9IHBhcnNlSW50KCBkYXRhWzNdWzFdICk7XG5cdFx0XHRpbWFnZS55ID0gcGFyc2VJbnQoIGRhdGFbM11bMl0gKTtcblx0XHRcdGltYWdlLndpZHRoID0gcGFyc2VJbnQoIGRhdGFbM11bM10gKTtcblx0XHRcdGltYWdlLmhlaWdodCA9IHBhcnNlSW50KCBkYXRhWzNdWzRdICk7XG5cdFx0XHRpbWFnZS5hbHBoYSA9IHBhcnNlSW50KCBkYXRhWzNdWzVdICk7XG5cblx0XHRcdC8vemF6bmFjemVuaWUgb2Rwb3dpZWRuaWVnbyBzZWxlY3RhIGFscGhhIHcgbWVudSB0b3Bcblx0XHRcdCQoJyNhbHBoYV9pbWFnZSBvcHRpb25bbmFtZT1cIicrXHRpbWFnZS5hbHBoYSArJ1wiXScpLmF0dHIoJ3NlbGVjdGVkJyx0cnVlKTtcblxuXHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyBjYW52YXMuZHJhdygpOyB9O1xuXHRcdH1cblxuXHRcdC8vemFrdHVhbGl6b3dhbmllIGRhbnljaCB3IGlucHV0YWNoXG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLCBjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsIGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6Y2FudmFzLndpZHRoX2NhbnZhcysncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzKydweCd9KTtcblxuXHRcdC8vY2FudmFzLmRyYXcoKTtcblxuXHR9LFxuXG5cdHNldF9wcm9qZWN0IDogZnVuY3Rpb24oZGF0YSl7XG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIG1hcHlcblx0XHR0aGlzLnNldF9tYXAoIEpTT04ucGFyc2UoZGF0YS5tYXBfanNvbikgKTtcblx0XHRleGNlbC5kYXRhID0gSlNPTi5wYXJzZShkYXRhLmV4Y2VsKTtcblxuXHRcdGRhdGEucHJvamVjdCA9IEpTT04ucGFyc2UoZGF0YS5wcm9qZWN0KTsgIFxuXHRcdGRhdGEubGF5ZXJzID0gSlNPTi5wYXJzZShkYXRhLmxheWVycyk7IFxuXG5cdFx0Ly93Y3p5dHVqZW15IGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0dVxuXHRcdGxheWVycy5wYWxldHNfYWN0aXZlID0gZGF0YS5sYXllcnMucGFsZXRzX2FjdGl2ZTtcblx0XHRsYXllcnMudmFsdWUgPSBkYXRhLmxheWVycy52YWx1ZTtcblx0XHRsYXllcnMuY29sb3JzX3BvcyA9IGRhdGEubGF5ZXJzLmNvbG9yc19wb3M7XG5cdFx0bGF5ZXJzLmNvbG9yc19hY3RpdmUgPSBkYXRhLmxheWVycy5jb2xvcnNfYWN0aXZlO1xuXHRcdGxheWVycy5taW5fdmFsdWUgPSBkYXRhLmxheWVycy5taW5fdmFsdWU7XG5cdFx0bGF5ZXJzLm1heF92YWx1ZSA9IGRhdGEubGF5ZXJzLm1heF92YWx1ZTtcblx0XHRsYXllcnMuY2xvdWQgPSBkYXRhLmxheWVycy5jbG91ZDtcblx0XHRsYXllcnMuY2xvdWRfcGFyc2VyID0gZGF0YS5sYXllcnMuY2xvdWRfcGFyc2VyO1xuXHRcdGxheWVycy5sZWdlbmRzID0gZGF0YS5sYXllcnMubGVnZW5kcztcblx0XHRsYXllcnMubGFiZWxzID0gZGF0YS5sYXllcnMubGFiZWxzO1xuXHQgXHRsYXllcnMuY2F0ZWdvcnkgPSBcdGRhdGEubGF5ZXJzLmNhdGVnb3J5O1xuXHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnMgPSBkYXRhLmxheWVycy5jYXRlZ29yeV9jb2xvcnM7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X25hbWUgPSBkYXRhLmxheWVycy5jYXRlZ29yeV9uYW1lO1xuXHRcdGxheWVycy5saXN0ID0gZGF0YS5sYXllcnMubGlzdDtcblxuXHRcdC8vem1pZW5uZSBnbG9iYWxuZSBkb3R5Y3rEhWNlIGNhxYJlZ28gcHJvamVrdHVcblx0XHRsYXllcnMucHJvamVjdF9uYW1lID0gZGF0YS5wcm9qZWN0Lm5hbWU7XG5cdFx0bGF5ZXJzLnNvdXJjZSA9IGRhdGEucHJvamVjdC5zb3VyY2U7XG5cblx0XHRjb25zb2xlLmxvZyggZGF0YS5sYXllcnMuY2F0ZWdvcnlfY29sb3JzICk7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwicHJvamVjdF9uYW1lXCJdJykudmFsKGxheWVycy5wcm9qZWN0X25hbWUpO1xuXG5cdFx0bGVnZW5kcy5zaG93KCk7IFxuXHRcdGxhYmVscy5zaG93KCk7XG5cdFx0bGF5ZXJzLnNob3coKTtcblx0XHRzb3VyY2Uuc2hvdygpO1xuXG5cdFx0dmFyIG9mZnNldCA9ICQoJyNjYW52YXNfYm94Jykub2Zmc2V0KCk7XG4gIFx0Y2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIFx0Y2FudmFzLm9mZnNldF90b3AgPSBvZmZzZXQudG9wO1xuXG5cdH0sXG5cblx0Ly9wb2JpZXJhbmllIHByb2pla3R1IHogYmF6eSBkYW55Y2ggaSB3Y3p5dGFuaWVcblx0Z2V0X3Byb2plY3QgOiBmdW5jdGlvbigpe1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6ICcvYXBpL3Byb2plY3QvJyArIGNydWQucHJvamVjdF9oYXNoLFxuXHRcdCAgdHlwZTogXCJHRVRcIixcblx0XHQgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoZnVuY3Rpb24oIGRhdGEgKSB7IGNvbnNvbGUubG9nKGRhdGEuZGF0YSk7IGNydWQuc2V0X3Byb2plY3QoIGRhdGEuZGF0YSApOyAgfSk7XG5cdH0sXG5cbn1cbiIsInZhciBleGNlbCA9IHt9XG4iLCIvL2Z1bmtjamUgcnlzdWrEhWNlIHBvamVkecWEY3p5IHB1bmt0IChwb2ludGVyKVxudmFyIGZpZ3VyZXMgPSB7XG5cblx0c3F1YXJlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KHgseSxzaXplLHNpemUpO1xuXHR9LFxuXG5cdGNpcmNsZSA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgc2l6ZSA9IHNpemUgLyAyO1xuXHRcdHZhciBjZW50ZXJfeCA9IHggKyBzaXplO1xuXHRcdHZhciBjZW50ZXJfeSA9IHkgKyBzaXplO1xuXHRcdGNhbnZhcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmFyYyhjZW50ZXJfeCwgY2VudGVyX3ksIHNpemUsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cblx0aGV4YWdvbiAgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIGEgPSBzaXplLzQ7XG5cdFx0dmFyIGEyID0gc2l6ZS8yO1xuXHRcdHZhciBoID0gc2l6ZS8yKk1hdGguc3FydCgzKS8yO1xuXG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubW92ZVRvKHgseSthMik7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyLWgpO1xuICBcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2ErYTIseSthMi1oKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCtzaXplLHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUtYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EseSthMitoKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCx5K2EyKTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cblx0aGV4YWdvbjIgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIGEgPSBzaXplLzQ7XG5cdFx0dmFyIGEyID0gc2l6ZS8yO1xuXHRcdHZhciBoID0gc2l6ZS8yKk1hdGguc3FydCgzKS8yO1xuXG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubW92ZVRvKHgrYTIseSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EpO1xuICBcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyK2gseSthMithKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5K3NpemUpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthMithKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMi1oLHkrYSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIseSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbCgpO1xuXG5cdH1cbn1cbiIsIi8vZ8WCw7N3bmUgemRqxJljaWUgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbnZhciBpbWFnZSA9IHtcblx0b2JqIDogdW5kZWZpbmVkLFxuXHR4IDogbnVsbCxcblx0eSA6IG51bGwsXG5cdHdpZHRoIDogbnVsbCxcblx0aGVpZ2h0IDogbnVsbCxcblx0YWxwaGEgOiAxMCwgXG5cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhLzEwO1xuXHRcdGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLm9iaix0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpO1xuXG5cdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmNzcyh7J2hlaWdodCc6dGhpcy5oZWlnaHQsJ3RvcCc6dGhpcy55KydweCcsJ2xlZnQnOih0aGlzLngrdGhpcy53aWR0aCkrJ3B4J30pO1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcblx0fSxcblxuXHQvL2Z1bmtjamEgcG9tb2NuaWN6YSBrb253ZXJ0dWrEhWNhIGRhdGFVUkkgbmEgcGxpa1xuXHRkYXRhVVJJdG9CbG9iIDogZnVuY3Rpb24oZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheS5wdXNoKGJpbmFyeS5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7dHlwZTogJ2ltYWdlL3BuZyd9KTtcblx0fVxuXG59XG4iLCJ2YXIgZGF0YV9pbnB1dCA9IHtcblxuXHQvL3BvYmllcmFuaWUgaW5mb3JtYWNqaSB6IGlucHV0w7N3IGkgemFwaXNhbmllIGRvIG9iaWVrdHUgbWFwX3N2Z1xuXHRnZXQgOiBmdW5jdGlvbigpe1xuXHRcdG1hcC5uYW1lID0gJCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCk7XG5cdFx0bWFwLnBhdGggPSAkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoKS5yZXBsYWNlKC9cIi9nLCBcIidcIik7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fSxcblxuXHQvL3BvYnJhbmllIGluZm9ybWFjamkgeiBvYmlla3R1IG1hcF9zdmcgaSB6YXBpc2FuaWUgZG8gaW5wdXTDs3dcblx0c2V0IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoIG1hcC5uYW1lICk7XG5cdFx0JCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCBtYXAucGF0aCApO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH1cblxufVxuIiwibGFiZWxzID0ge1xuXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNsYWJlbHMnKS5odG1sKCBsYXllcnMubGFiZWxzW2xheWVycy5hY3RpdmVdICk7XG5cdH0sXG5cbn1cblxuXG4iLCJ2YXIgbGF5ZXJzID0ge1xuXG5cdGxpc3QgOiBbJ3pha8WCYWRrYSAxJ10sXG5cdGFjdGl2ZSA6IDAsXG5cblx0Ly90YWJsaWNhIHogcG9kc3Rhd293eXdtaSBkYW55bWkgemFncmVnb3dhbnltaSBkbGEga2HFvGRlaiB3YXJzdHd5XG5cdHBhbGV0c19hY3RpdmUgOiBbMF0sXG5cblx0dmFsdWUgOiBbLTFdLFxuXHRjb2xvcnNfcG9zIDogW1sxLDEsMSwxLDEsMSwxLDEsMV1dLFxuXHRjb2xvcnNfYWN0aXZlIDogW1tcIiNmN2ZjZmRcIiwgXCIjZTVmNWY5XCIsIFwiI2NjZWNlNlwiLCBcIiM5OWQ4YzlcIiwgXCIjNjZjMmE0XCIsIFwiIzQxYWU3NlwiLCBcIiMyMzhiNDVcIiwgXCIjMDA2ZDJjXCIsIFwiIzAwNDQxYlwiXV0sXG5cdG1pbl92YWx1ZSA6IFswXSxcblx0bWF4X3ZhbHVlIDogWzBdLFxuXHRjbG91ZCA6IFtcIlwiXSxcblx0Y2xvdWRfcGFyc2VyIDogW1wiXCJdLFxuXHRsZWdlbmRzIDogW1tdXSxcblx0bGFiZWxzIDogW1wiXCJdLFxuXHRjYXRlZ29yeSA6IFstMV0sXG5cdGNhdGVnb3J5X2NvbG9ycyA6IFtdLFxuXHRjYXRlZ29yeV9uYW1lIDogW10sXG5cblx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRwcm9qZWN0X25hbWUgOiAnbm93eSBwcm9qZWt0Jyxcblx0c291cmNlIDogJycsXG5cblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgaHRtbCA9IFwiXCI7XG5cdFx0aHRtbCArPSAnPHNwYW4gbnVtPVwiJyswKydcIiBjbGFzcz1cImFjdGl2ZVwiPicgKyB0aGlzLmxpc3RbMF0gKyAnPC9zcGFuPic7XG5cdFx0XG5cdFx0Zm9yKHZhciBpID0gMSwgaV9tYXggPSB0aGlzLmxpc3QubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRodG1sICs9ICc8c3BhbiBudW09XCInK2krJ1wiPicgKyB0aGlzLmxpc3RbaV0gKyAnPC9zcGFuPic7XG5cdFx0fVxuXG5cdFx0JCgnI2FyZWEnKS5odG1sKGh0bWwpO1xuXHRcdCQoJyNhcmVhIHNwYW4nKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdFx0bGF5ZXJzLnNlbGVjdCh0aGlzKTtcblx0XHR9KTtcblx0fSxcblxuXHRzZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0JCgnI2FyZWEgc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHQkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdFx0Y29uc29sZS5sb2cob2JqKTtcblxuXHRcdGxheWVycy5hY3RpdmUgPSAkKG9iaikuaW5kZXgoKTtcblxuXHRcdGxlZ2VuZHMuc2hvdygpOyBcblx0XHRsYWJlbHMuc2hvdygpO1xuXHRcdC8vbGF5ZXJzLnNob3coKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHRcblx0fSxcblxuXG59IiwiLy9vYmlla3QgZG90eWN6xIVzeSB3eXN3aWV0bGFuaWEgYWt1dGFsaXphY2ppIGkgZWR5Y2ppIHBhbmVsdSBsZWdlbmRcbmxlZ2VuZHMgPSB7XG5cblx0Ly93ecWbd2lldGxhbXkgd3N6eXN0a2llIGxlZ2VuZHkgdyBwYW5lbHUgbWFwXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRodG1sICs9IFwiPGRpdj4gPHNwYW4gc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bM10rXCInPjwvc3Bhbj48c3Bhbj5cIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVsyXStcIjwvc3Bhbj48L2Rpdj5cIjtcblx0XHR9XG5cdFx0XG5cdFx0JCgnI2xlZ2VuZHMnKS5odG1sKGh0bWwpO1xuXHR9XG59XG5cblxuIiwiLypcbiAgICBfX19fICAgX19fXyBfX19fICAgIF9fICBfX18gX19fICAgICBfX19fICAgICBfX19fXyAgICBfX19fIFxuICAgLyBfXyApIC8gIF8vLyBfXyBcXCAgLyAgfC8gIC8vICAgfCAgIC8gX18gXFwgICB8X18gIC8gICAvIF9fIFxcXG4gIC8gX18gIHwgLyAvIC8gLyAvIC8gLyAvfF8vIC8vIC98IHwgIC8gL18vIC8gICAgL18gPCAgIC8gLyAvIC9cbiAvIC9fLyAvXy8gLyAvIC9fLyAvIC8gLyAgLyAvLyBfX18gfCAvIF9fX18vICAgX19fLyAvXyAvIC9fLyAvIFxuL19fX19fLy9fX18vIFxcX19fXFxfXFwvXy8gIC9fLy9fLyAgfF98L18vICAgICAgIC9fX19fLyhfKVxcX19fXy8gIFxuXG52YXJzaW9uIDMuMCBieSBNYXJjaW4gR8SZYmFsYVxuXG5saXN0YSBvYmlla3TDs3c6XG5cbiBjYW52YXMgPSBjYW52YXMoKSAtIG9iaWVrdCBjYW52YXNhXG4gY3J1ZCA9IGNydWQoKSAtIG9iaWVrdCBjYW52YXNhXG4gaW1hZ2UgPSBpbWFnZSgpIC0gb2JpZWt0IHpkasSZY2lhIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG4gbW91c2UgPSBtb3VzZSgpXG4gbW9kZWxzID0gbW9kZWxzKClcbiBnbG9iYWwgPSBnbG9iYWwoKSAtIGZ1bmtjamUgbmllIHByenlwaXNhbnkgZG8gaW5ueWNoIG9iaWVrdMOzd1xuIGNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzKClcbiBwb2ludGVycyA9IHBvaW50ZXJzKClcbiBjb2xvcnBpY2tlciA9IGNvbG9ycGlja2VyKClcbiBtZW51X3RvcCA9IG1lbnVfdG9wKClcbiBmaWd1cmVzID0gZmlndXJlcygpXG5cbiovXG4gIFxuLy9wbyBrbGlrbmnEmWNpdSB6bWllbmlheSBha3R1YWxueSBwYW5lbFxuJCgnLmJveCA+IHVsID4gbGknKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5jaGFuZ2VfYm94KHRoaXMpIH0pO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG5cdFx0Ly9wcnp5cGlzYW5pZSBwb2RzdGF3b3dvd3ljaCBkYW55Y2ggZG8gb2JpZWt0dSBjYW52YXNcblx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuICBjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcpICk7XG4gIGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcGFyc2VJbnQoICQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcpICk7XG4gIHZhciBvZmZzZXQgPSAkKCcjY2FudmFzX2JveCcpLm9mZnNldCgpO1xuICBjYW52YXMub2Zmc2V0X2xlZnQgPSBvZmZzZXQubGVmdDtcbiAgY2FudmFzLm9mZnNldF90b3AgPSBvZmZzZXQudG9wO1xuXG4gIC8vdHdvcnp5bXkgdGFibGljZSBwb2ludGVyw7N3XG5cdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXG5cdC8vb2R6bmFjemVuaWUgc2VsZWN0YSBwcnp5IHptaWFuaWVcblx0Ly8kLy8oJyNjaGFuZ2VfY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgJCgnI2NoYW5nZV9jYXRlZ29yeScpLmJsdXIoKTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSBwdXNjemVuaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IG1vdXNlLm1vdXNlX2Rvd24gPSBmYWxzZTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSB3Y2nFm25pxJljaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXHRcblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL8WCYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpO1xuXHRcblx0fSk7XG5cblx0Ly93eXdvxYJhbmllIGZ1bmtjamkgcG9kY3phcyBwb3J1c3phbmlhIG15c3prxIVcblx0JChkb2N1bWVudCkubW91c2Vtb3ZlKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdGlmKG1vdXNlLm1vdXNlX2Rvd24pIG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cdFx0aWYobWVudV90b3AuYXV0b19kcmF3KXsgbW91c2UuY2xpY2tfb2JqID0gXCJjYW52YXNcIjsgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTt9XG5cdFxuXHR9KTtcblxuXHQkKCcjbWFpbl9jYW52YXMnKS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpOy8vemFyZWplc3Ryb3dhbmllIG9iaWVrdHV3ICBrdMOzcnkga2xpa2FteVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cblx0fSk7XG5cblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpe1xuXG5cdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBudWxsO1x0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRjYW52YXMuY29udGV4dF94ID0gY2FudmFzLmNvbnRleHRfbmV3X3g7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IGNhbnZhcy5jb250ZXh0X25ld195O1xuXG5cdH0pO1xuXG5cdGNydWQuZ2V0X3Byb2plY3QoKTtcblxuXG59KTtcblxuJCgnI2NhbnZhc193cmFwcGVyJykubW91c2VsZWF2ZShmdW5jdGlvbigpeyAkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDIwMCk7IH0pO1xuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXtcbiAgdmFyIHRleHQgPSBvbl9jYXRlZ29yeS5nZXRfbmFtZSgpIFxuICBjbG91ZC51cGRhdGVfdGV4dCh0ZXh0ICk7IFxufSk7XG5cbiQoXCIjY2FudmFzX2Nsb3VkXCIpLm1vdXNlbW92ZShmdW5jdGlvbigpeyBjbG91ZC5zZXRfcG9zaXRpb24oKTsgfSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxubWVudV90b3AgPSB7XG5cblx0bW92ZV9pbWFnZSA6IGZhbHNlLFxuXHRtb3ZlX2NhbnZhcyA6IGZhbHNlLFxuXHRhdXRvX2RyYXcgOiBmYWxzZSxcblx0bW9kZV9rZXkgOiB0cnVlLFxuXHRjYXRlZ29yeSA6IDAsXG5cdGRpc2FibGVfc2VsZWN0IDogZmFsc2UsXG5cblx0Ly96bWlhbmEgYWt0dWFsbmVqIHpha8WCYWRraVxuXHRjaGFuZ2VfYm94IDogZnVuY3Rpb24ob2JqKXtcblx0XHRjb25zb2xlLmxvZyhvYmopO1xuXHRcdCQob2JqKS5wYXJlbnQoKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0JChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuXHRcdHZhciBjYXRlZ29yeSA9ICQob2JqKS5hdHRyKCdjYXRlZ29yeScpO1xuXHRcdCQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5jaGlsZHJlbignZGl2JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJyMnK2NhdGVnb3J5KS5kZWxheSgxMDApLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcblx0IFxuXHR9LFxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X21hcHMgOiBmdW5jdGlvbigpe1xuXHRcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvbWFwcycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgbWFwIHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnPG9wdGlvbiBpZD1cInNlbGVjdF9tYXBcIj53eWJpZXJ6IG1hcMSZPC9vcHRpb24+Jztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXAnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0XHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBtYXAgXG5cdFx0XHRcdCQoJy5zZWxlY3RfbWFwJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Ly9zcHJhd2R6YW15IGN6eSB3eWJyYWxpxZtteSBwb2xlIHogaGFzaGVtIG1hcHlcblx0XHRcdFx0XHRpZiggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpICE9ICdzZWxlY3RfbWFwJyl7XG5cdFx0XHRcdFx0XHQvL2plxZtsaSB0YWsgdG8gc3ByYXdkemFteSBjenkgd2N6eXR1amVteSBtYXDEmSBwbyByYXogcGllcndzenkgY3p5IGRydWdpXG5cdFx0XHRcdFx0XHRpZihjcnVkLm1hcF9oYXNoICE9IG51bGwpe1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB3Y3p5dHVqZW15IHBvIHJheiBrb2xlam55IHRvIHB5dGFteSBjenkgbmFwZXdubyBjaGNlbXkgasSFIHdjenl0YcSHXG5cdFx0XHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd8SFIG1hcMSZID8nKSkge1xuXHRcdFx0XHRcdFx0XHRcdGNydWQubWFwX2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdFx0Y3J1ZC5nZXRfbWFwKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdCQoJy5zZWxlY3RfbWFwIG9wdGlvbicpLmVxKDApLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLm1hcF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9tYXAoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRhbGVydCgnbmllIG1vZ8SZIHBvYnJhxIcgbGlzdHkgbWFwJyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblxuXG5cdH0sXG5cblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9wcm9qZWN0cyA6IGZ1bmN0aW9uKCl7XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL3Byb2plY3RzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBwcm9qZWt0w7N3IHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICc8b3B0aW9uIGlkPVwibmV3X3Byb2plY3RcIj5ub3d5IHByb2pla3Q8L29wdGlvbj4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5wcm9qZWN0X2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5wcm9qZWN0KS5uYW1lICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLnByb2plY3QpLm5hbWUgKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfcHJvamVjdCcpLmh0bWwoIGFkZF9odG1sICk7XG5cdFx0XHRcblx0XHRcdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIHByb2plY3QgXG5cdFx0XHRcdCQoJy5zZWxlY3RfcHJvamVjdCcpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd3kgcHJvamVrdCA/JykpIHtcblx0XHRcdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19wcm9qZWN0JyApe1xuXHRcdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGNydWQucHJvamVjdF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9wcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0YWxlcnQoJ25pZSBtb2fEmSBwb2JyYcSHIGxpc3R5IHByb2pla3TDs3cnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0fSxcblxuXHR1cGRhdGVfY2FudmFzX2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5zY2FsZSA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoKSApO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCgpICk7XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoKSApO1xuXG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCBjYW52YXMuc2NhbGUgKyAnJScgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCBjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcgKTtcblxuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyxjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JyxjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0Y2hhbmdlX2FscGhhIDogZnVuY3Rpb24oKXtcblx0XHRpbWFnZS5hbHBoYSA9ICQoJyNhbHBoYV9pbWFnZScpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGFkZF9pbWFnZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2plc2xpIHBvZGFueSBwYXJhbWV0ciBuaWUgamVzdCBwdXN0eVxuXHRcdHZhciBzcmNfaW1hZ2UgPSBwcm9tcHQoXCJQb2RhaiDFm2NpZcW8a8SZIGRvIHpkasSZY2lhOiBcIik7XG5cblx0XHRpZihzcmNfaW1hZ2Upe1xuXHRcdFx0aWYoc3JjX2ltYWdlLmxlbmd0aCA+IDApe1xuXG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0XHRcdC8vd2N6eXRhbmllIHpkasSZY2lhOlxuXHRcdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHRpbWFnZS53aWR0aCA9IGltYWdlLm9iai53aWR0aDtcblx0ICAgIFx0XHRpbWFnZS5oZWlnaHQgPSBpbWFnZS5vYmouaGVpZ2h0O1xuXHQgICAgXHRcdGltYWdlLmRyYXcoKTtcblx0ICBcdFx0fTtcblxuXHRcdFx0ICBpbWFnZS54ID0gMDtcblx0XHRcdCAgaW1hZ2UueSA9IDA7XG5cdFx0XHQgIGltYWdlLm9iai5zcmMgPSBzcmNfaW1hZ2U7XG5cdFx0XHRcdC8vc2ltYWdlLm9iai5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzaG93X2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbChwYXJzZUludChjYW52YXMuc2NhbGUpICsgJyUnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHBhcnNlSW50KGNhbnZhcy53aWR0aF9jYW52YXMpICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwocGFyc2VJbnQoY2FudmFzLmhlaWdodF9jYW52YXMpICsgJ3B4Jyk7XG5cdH1cblxufVxuIiwiLy9vYmlla3QgbXlzemtpIChkbyBvZ2FybmllY2lhKVxudmFyIG1vdXNlID0ge1xuXHRtb3VzZV9kb3duIDogZmFsc2UsXG5cdGNsaWNrX29iaiA6IG51bGwsXG5cblx0dG1wX21vdXNlX3ggOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXHR0bXBfbW91c2VfeSA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cblx0bGVmdCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praVxuXHR0b3AgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2lcblx0cGFkZGluZ194IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdHBhZGRpbmdfeSA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRvZmZzZXRfeCA6IG51bGwsIC8vb2Zmc2V0IHggb2JpZWt0dSBrbGlrbmnEmXRlZ29cblx0b2Zmc2V0X3kgOiBudWxsLCAvL29mZnNldCB5IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cblx0Ly9mdW5ja2phIHd5a3J5d2FqxIVjYSB3IGNvIGtsaWtuacSZdG8gcG9iaWVyYWrEhWNhIHBhZGRpbmcga2xpa25pxJljaWEgb3JheiB6YXBpc3VqxIVjYSBrbGlrbmnEmWNpZVxuXHRzZXRfbW91c2VfZG93biA6IGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdHZhciBvYmogPSBldmVudC50YXJnZXQ7XG5cblx0XHQvL2plxZtsaSBlbGVtZW50IG5hIGt0w7NyeSBrbGlrbmnEmXRvIG1hIGF0cnlidXQgbmFtZWNsaWNrIHByenlwaXN1amVteSBnbyBkbyBvYmlla3R1IG15c3praVxuXHRcdGlmKHR5cGVvZigkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJykpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0dGhpcy5jbGlja19vYmogPSAkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJyk7XG5cblx0XHRcdHZhciBwb3NpdGlvbiA9ICQob2JqKS5vZmZzZXQoKTtcblx0XHRcdHRoaXMub2Zmc2V0X3ggPSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5vZmZzZXRfeSA9IHBvc2l0aW9uLnRvcDtcblx0XHRcdHRoaXMucGFkZGluZ194ID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMucGFkZGluZ195ID0gdGhpcy50b3AgLSBwb3NpdGlvbi50b3A7XG5cdFx0XHRtb3VzZS5tb3VzZV9kb3duID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy50bXBfbW91c2VfeCA9IGltYWdlLng7XG5cdFx0XHR0aGlzLnRtcF9tb3VzZV95ID0gaW1hZ2UueTtcblx0XHR9XG5cdH0sXG5cblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdHRoaXMubGVmdCA9IGV2ZW50LnBhZ2VYLFxuXHRcdHRoaXMudG9wID0gZXZlbnQucGFnZVlcblx0fSxcblxuXHQvL2Z1bmtjamEgd3lrb255d2FuYSBwb2RjemFzIHdjacWbbmllY2lhIHByenljaWtza3UgbXlzemtpICh3IHphbGXFvG5vxZtjaSBvZCBrbGlrbmnEmXRlZ28gZWxlbWVudHUgd3lrb251amVteSByw7PFvG5lIHJ6ZWN6eSlcblx0bW91c2Vtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHRzd2l0Y2godGhpcy5jbGlja19vYmope1xuXHRcdFx0Y2FzZSAncmlnaHRfcmVzaXplJzpcblx0XHRcdFx0Ly9yb3pzemVyemFuaWUgY2FudmFzYSB3IHByYXdvXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0dmFyIG5ld193aWR0aCA9IHRoaXMubGVmdCAtIHRoaXMucGFkZGluZ194IC0gcG9zaXRpb24ubGVmdFxuXHRcdFx0XHRpZihuZXdfd2lkdGggPCBzY3JlZW4ud2lkdGggLSAxMDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYW52YXMucmVzaXplX3dpZHRoKG5ld193aWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdib3R0b21fcmVzaXplJzpcblx0XHRcdFx0Ly96bWllbmlhbXkgd3lzb2tvxZvEhyBjYW52YXNhXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0Y2FudmFzLnJlc2l6ZV9oZWlnaHQodGhpcy50b3AgLSB0aGlzLnBhZGRpbmdfeSAtIHBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnaW1hZ2VfcmVzaXplJzpcblxuXHRcdFx0XHRpZihpbWFnZS5vYmogIT09IHVuZGVmaW5lZCl7XG5cblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdFx0dmFyIHhfYWN0dWFsID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcdC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgc3Vic3RyYWN0ID0gaW1hZ2UueCArIGltYWdlLndpZHRoIC0geF9hY3R1YWwgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHRcdFx0XHR2YXIgZmFjb3IgPSBpbWFnZS53aWR0aCAvIGltYWdlLmhlaWdodDtcblxuXHRcdFx0XHRcdGlmIChpbWFnZS53aWR0aCAtIHN1YnN0cmFjdCA+IDEwMCl7XG5cdFx0XHRcdFx0XHRpbWFnZS53aWR0aCAtPSBzdWJzdHJhY3Q7XG5cdFx0XHRcdFx0XHRpbWFnZS5oZWlnaHQgLT0gc3Vic3RyYWN0L2ZhY29yO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuIiwiLy9vYmlla3QgbcOzd2nEhWN5IG5hbSBuYWQgamFrxIUga2F0ZWdvcmlhIGplc3RlxZtteVxudmFyIG9uX2NhdGVnb3J5ID0ge1xuXHRcblx0Y2FudmFzX29mZnNldF90b3AgOiAkKCcjY2FudmFzX3dyYXBwZXInKS5vZmZzZXQoKS50b3AsXG5cdGNhbnZhc19vZmZzZXRfbGVmdCA6ICQoJyNjYW52YXNfd3JhcHBlcicpLm9mZnNldCgpLmxlZnQsXG5cblx0Ly9mdW5rY2phIHp3cmFjYWrEhWNhIGFrdHVhbG7EhSBrYXRlZ29yacSZIG5hZCBrdMOzcsSFIHpuYWpkdWplIHNpxJkga3Vyc29yXG5cdGdldF9uYW1lIDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdDtcblx0XHR2YXIgdG9wID0gbW91c2UudG9wIC0gY2FudmFzLm9mZnNldF90b3A7XG5cdFx0Ly9jb25zb2xlLmxvZyhsZWZ0LHRvcCk7XG5cdFx0dmFyIHJvdyA9IE1hdGguY2VpbCggdG9wIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3kpICk7XG5cdFx0Ly9jb25zb2xlLmxvZyhsZWZ0LHRvcCx0aGlzLmNhbnZhc19vZmZzZXRfbGVmdCx0aGlzLmNhbnZhc19vZmZzZXRfdG9wKTtcblx0XHRpZigocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgJiYgKHJvdyAlIDIgIT0gMCkpe1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggKGxlZnQgKyAocG9pbnRlcnMuc2l6ZS8yKSkvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApIC0gMTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHZhciBjb2x1bW4gPSBNYXRoLmNlaWwoIGxlZnQgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeCkgKTtcblx0XHR9XG5cdFx0XG5cdFx0dHJ5e1xuXG5cdFx0XHR2YXIgY2F0ZWdvcnlfbnVtID0gcG9pbnRlcnMucG9pbnRlcnNbcm93LTFdW2NvbHVtbi0xXTtcblx0XHRcdHZhciBjYXRlZ29yeV9uYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWVbY2F0ZWdvcnlfbnVtXTtcblx0XHRcdC8vY29uc29sZS5sb2coJ3Rlc3QnLGNhdGVnb3J5X25hbWUpO1xuXG5cdFx0fVxuXHRcdGNhdGNoKGUpe1xuXHRcdFx0cmV0dXJuICdudWxsJztcblx0XHR9XG5cdFx0XG5cdFx0aWYoKGNhdGVnb3J5X25hbWUgPT0gJ3B1c3R5JykgfHwgKGNhdGVnb3J5X25hbWUgPT0gJ2d1bXVqJykpe1xuXHRcdFx0cmV0dXJuICdudWxsJztcblx0XHR9IFxuXHRcdGVsc2V7XG5cdFx0XHRyZXR1cm4gY2F0ZWdvcnlfbmFtZTtcdFx0XG5cdFx0fVxuXG5cdH1cblxufVxuLypcbiQoJ2RvY3VtZW50JykucmVhZHkoZnVuY3Rpb24oKXtcblx0b25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF90b3AgPSA7XG5cdG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfbGVmdCA9IDtcbn0pO1xuXG4qLyIsInBhbGV0cyA9IHt9IiwiLy9tZW51IHBvaW50ZXJcbnZhciBwb2ludGVycyA9IHtcblx0c2hvd19hbGxfcG9pbnQgOiB0cnVlLFxuXHRwYWRkaW5nX3ggOiAxLFxuXHRwYWRkaW5nX3kgOiAxLFxuXHR0cmFuc2xhdGVfbW9kdWxvIDogZmFsc2UsXG5cdHNpemUgOiAxMCxcblx0bWFpbl9raW5kIDogJ3NxdWFyZScsXG5cdGtpbmRzIDogQXJyYXkoJ3NxdWFyZScsJ2NpcmNsZScsJ2hleGFnb24nLCdoZXhhZ29uMicpLFxuXG5cdHBvaW50ZXJzIDogQXJyYXkoKSwgLy9wb2ludGVycy5wb2ludGVyc1tyemFkXVtrb2x1bW5hXSA6IGthdGVnb3JpYVtudW1lcl1cblxuXHRsYXN0X2NvbHVtbiA6IG51bGwsXHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdGxhc3Rfcm93IDogbnVsbCxcdC8vd2llcnN6IHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXG5cdC8vcnlzb3dhbmllIHdzenlzdGtpY2ggcHVua3TDs3dcblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y29uc29sZS5sb2coJ2RyYXcnLHRoaXMuc2l6ZSxsYXllcnMuY2F0ZWdvcnlfY29sb3JzKTsgXG5cdFx0dmFyIHdpZHRoX3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHR2YXIgaGVpZ2h0X3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiO1xuXG5cdFx0Ly9pZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTsgXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRpZiggKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IG1lbnVfdG9wLmNhdGVnb3J5KSAmJiAobWVudV90b3AuY2F0ZWdvcnkgIT0gMCkgKXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC4yXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL3R3b3J6eW15IHRhYmxpY2UgcG9udGVyw7N3IChqZcWbbGkgamFracWbIHBvbnRlciBpc3RuaWVqZSB6b3N0YXdpYW15IGdvLCB3IHByenlwYWRrdSBnZHkgcG9pbnRlcmEgbmllIG1hIHR3b3J6eW15IGdvIG5hIG5vd28pXG5cdGNyZWF0ZV9hcnJheSA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmFjdGl2ZV9yb3cgPSBwYXJzZUludCggY2FudmFzLmhlaWdodF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHRjYW52YXMuYWN0aXZlX2NvbHVtbiA9IHBhcnNlSW50KCBjYW52YXMud2lkdGhfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cblx0XHRpZiggKHRoaXMucG9pbnRlcnMubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9yb3cpIHx8ICh0aGlzLnBvaW50ZXJzWzBdLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfY29sdW1uKSApXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd10gPT0gdW5kZWZpbmVkKSB0aGlzLnBvaW50ZXJzW3Jvd10gPSBuZXcgQXJyYXkoKTtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSB1bmRlZmluZWQpXHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlX3BvaW50IDogZnVuY3Rpb24oeSx4LHlfbGFzdCx4X2xhc3Qpe1xuXG5cdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXG5cdFx0Ly93eXpuYWN6ZW5pZSByw7N3bmFuaWEgcHJvc3RlalxuXHRcdGlmKCAoKHlfbGFzdCAhPSB5KSB8fCAoeF9sYXN0ICE9IHgpKSAmJiAoeV9sYXN0ICE9IG51bGwpICYmICh4X2xhc3QgIT0gbnVsbCkgKXtcblx0XHRcdHZhciBhID0gKHlfbGFzdCAtIHkpIC8gKHhfbGFzdCAtIHgpO1xuXHRcdFx0dmFyIGIgPSB5IC0gYSp4O1xuXG5cdFx0XHRpZih4X2xhc3QgPiB4KXtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geDtcblx0XHRcdFx0dmFyIGNvbF90byA9IHhfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgY29sX3RvID0geDtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geF9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZih5X2xhc3QgPiB5KXtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geTtcblx0XHRcdFx0dmFyIHJvd190byA9IHlfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgcm93X3RvID0geTtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geV9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcm93ID0gbnVsbDtcblx0XHRcdGZvcih2YXIgY29sID0gY29sX2Zyb207IGNvbCA8PSBjb2xfdG87IGNvbCsrKVxuXHRcdFx0e1xuXHRcdFx0XHRyb3cgPSBwYXJzZUludCggYSpjb2wrYiApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMocm93KSkgcm93ID0geTtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGNvbCA9IG51bGw7XG5cdFx0XHRmb3IodmFyIHJvdyA9IHJvd19mcm9tOyByb3cgPD0gcm93X3RvOyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Y29sID0gcGFyc2VJbnQoIChyb3ctYikvYSApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMoY29sKSkgY29sID0geDtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHR9XG5cdH1cbn1cbiIsInZhciBzb3VyY2UgPSB7XHJcbiAgc2hvdyA6IGZ1bmN0aW9uKCl7XHJcbiAgICAkKCcjc291cmNlJykuaHRtbCggbGF5ZXJzLnNvdXJjZSApOyBcclxuICB9XHJcbn1cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
