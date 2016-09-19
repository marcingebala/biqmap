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
		console.log('draw');
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

		$("#canvas_cloud").css({top:parseInt(top - $("#canvas_cloud").height()-30)+'px',left:left+10+'px'});
	},

	//funkcja odpowiedzialna za wyświetlenie dymka z odpowiednią zawartością
	update_text : function(name){

		if(name != "null"){

			var tmp_row = null;
			var find = 0;
			for( var i_row = 0, i_row_max = excel.data.length; i_row < i_row_max; i_row++ ){
				if(name == excel.data[i_row][layers.category[layers.active]]){
					
					this.set_position();
					var text_tmp = layers.cloud[layers.active];

					for(var i = 0, i_max = excel.data[0].length; i < i_max; i++){
						text_tmp = text_tmp.replace('{'+excel.data[0][i]+'}',excel.data[i_row][i]);
					}
					
					//dopiero jeśli dymek ma mieć jakaś konkretną zawartość wyświetlamy go
					if(text_tmp!=""){
						$("#canvas_cloud").fadeIn(200);
						$("#canvas_cloud").html(text_tmp);
						find = 1;
					}
				}
			}

			//jeśli nie znaleziono odpowiedniej kategorii
			if (!find) { 
				$("#canvas_cloud").fadeOut(200);
			}

		}
		else{
			$("#canvas_cloud").fadeOut(200);
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
		pointers.size_pointer = data[0][5];
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

		canvas.draw();

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

		$('input[name="project_name"]').val(layers.project_name);

		legends.show(); 
		labels.show();
		layers.show();

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
		layers.active = $(obj).index();

		legends.show(); 
		labels.show();
		layers.show();
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

console.log( text)
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
		console.log(left,top);
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
			console.log('test',category_name);

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

		var width_pointer = this.size + this.padding_x;
		var height_pointer = this.size + this.padding_y;
		var none_color = "rgba(0,0,0,0)"

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hKQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJlbWJlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vY3p5c3pjemVuaWUgaSByeXNvd2FuaWUgcG8gY2FudmFzaWVcbnZhciBjYW52YXMgPSB7XG5cdFxuXHRzY2FsZSA6IDEwMCxcblx0d2lkdGhfY2FudmFzIDogNzAwLFxuXHRoZWlnaHRfY2FudmFzIDogNDAwLFxuXHRjYW52YXMgOiBudWxsLFxuXHRjb250ZXh0IDogbnVsbCxcblx0dGh1bWJuYWlsIDogbnVsbCxcblx0dGl0bGVfcHJvamVjdCA6ICdub3d5IHByb2pla3QnLFxuXG5cdGNvbnRleHRfeCA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X3kgOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHlcblx0Y29udGV4dF9uZXdfeCA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF9uZXdfeSA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHlcblxuXHRvZmZzZXRfbGVmdCA6IG51bGwsXG5cdG9mZnNldF90b3AgOiBudWxsLFxuXHRhY3RpdmVfcm93IDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblx0YWN0aXZlX2NvbHVtbiA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cblx0dGh1bWJuYWlsIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluX2NhbnZhc1wiKTtcblx0XHR2YXIgZGF0YVVSTCA9IGNhbnZhcy50b0RhdGFVUkwoKTtcblx0XHRjb25zb2xlLmxvZyhkYXRhVVJMKTtcblx0fSxcblxuXHQvL3J5c3VqZW15IGNhbnZhcyB6ZSB6ZGrEmWNpZW1cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y29uc29sZS5sb2coJ2RyYXcnKTtcblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblx0XHRwb2ludGVycy5kcmF3KCk7XG5cblx0XHRpZiAoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpICBpbWFnZS5kcmF3KCk7XG5cdH0sXG5cblx0ZHJhd190aHVtbmFpbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMudGh1bWJuYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHR9LFxuXG5cdC8vcmVzZXR1amVteSB0xYJvIHpkasSZY2lhXG5cdHJlc2V0IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblx0fSxcblxuXHQvLyBjennFm2NpbXkgY2HFgmUgemRqxJljaWUgbmEgY2FudmFzaWVcblx0Y2xlYXIgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5jbGVhclJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdFx0Ly90aGlzLmNvbnRleHQuZmlsbFJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdH0sXG5cblx0cmVzaXplX3dpZHRoIDogZnVuY3Rpb24obmV3X3dpZHRoKXtcblx0XHR0aGlzLndpZHRoX2NhbnZhcyA9IG5ld193aWR0aDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsdGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiB0aGlzLndpZHRoX2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHRoaXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSArICclJyk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdH0sXG5cblx0cmVzaXplX2hlaWdodCA6IGZ1bmN0aW9uKG5ld19oZWlnaHQpe1xuXHRcdHRoaXMuaGVpZ2h0X2NhbnZhcyA9IG5ld19oZWlnaHQ7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0Jyx0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnaGVpZ2h0JzogdGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdHRoaXMuc2NhbGUgPSAxMDA7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHRoaXMuc2NhbGUrJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTsgLy8gYWt0dWFsaXp1amVteSBkYW5lIG9kbm/Fm25pZSByb3ptaWFyw7N3IGNhbnZhc2EgdyBtZW51IHUgZ8Ozcnlcblx0XHQvL3RoaXMuZHJhdygpOyAvL3J5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdH0sXG5cblx0c2V0X2RlZmF1bHQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfYm94ICNyaWdodF9yZXNpemUsICNjYW52YXNfYm94ICNib3R0b21fcmVzaXplJykuZmFkZUluKDUwMCk7XG5cdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXG5cdFx0Y2FudmFzLnNjYWxlID0gMTAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblxuXHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdHZhciBuZXdfaGVpZ2h0ID0gY2FudmFzLmhlaWdodF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cih7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JzogbmV3X2hlaWdodCArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IGthdGVnb3JpaSBkb2RhbmllIC8gYWt0dWFsaXphY2phIC8gdXN1bmnEmWNpZSAvIHBva2F6YW5pZSBrYXRlZ29yaWlcbnZhciBjYXRlZ29yaWVzID0ge31cbi8qXHRcblxuXHQvL2NhdGVnb3J5IDogbmV3IEFycmF5KFsncHVzdHknLCcjODA4MDgwJ10pLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWUgPSBBcnJheSgkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoKSwnI2ZmMDAwMCcpO1xuXHRcdCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgnJyk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2gobmFtZSk7XG5cdFx0bWVudV90b3AuY2F0ZWdvcnkgPSAodGhpcy5jYXRlZ29yeS5sZW5ndGgtMSk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbihpbmRleCxuYW1lKXtcblx0XHR0aGlzLmNhdGVnb3J5W2luZGV4XVswXSA9IG5hbWU7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXG5cdC8vYWt0dWFsaXp1amVteSB0YWJsaWPEmSBrb2xvcsOzd1xuXHR1cGRhdGVfY29sb3IgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9tb8W8bGl3YSBha3R1YWxpemFjamEgamVkeW5pZSB3IHByenlwYWRrdSB3eWJyYW5pYSBrb25rcmV0bmVqIGtvbHVtbnkgd2FydG/Fm2NpIGkga2F0ZWdvcmlpIHcgZXhjZWx1XG5cdFx0aWYoKGNydWQubWFwX2pzb24ubGVuZ3RoID4gMCkgJiYgKGV4Y2VsLmRhdGEubGVuZ3RoID4gMCkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuXG5cdFx0XHRmb3IgKHZhciBpX2NhdGVnb3J5ID0gMCwgaV9jYXRlZ29yeV9tYXggPVx0bGF5ZXJzLmNhdGVnb3J5X25hbWUubGVuZ3RoOyBpX2NhdGVnb3J5IDwgaV9jYXRlZ29yeV9tYXg7IGlfY2F0ZWdvcnkrKyl7XG5cdFx0XHRcdHZhciBuYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWVbaV9jYXRlZ29yeV07XG5cblx0XHRcdFx0Zm9yICh2YXIgaV9leGVsID0gMCwgaV9leGVsX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpX2V4ZWwgPCBpX2V4ZWxfbWF4OyBpX2V4ZWwrKyl7XG5cdFx0XHRcdFx0aWYoIGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dID09IG5hbWUpe1xuXHRcdFx0XHRcdFx0Ly9qZcWbbGkgem5hbGXFumxpxZtteSBrYXRlZ29yacSZIHcgZXhjZWx1XG5cdFx0XHRcdFx0XHR2YXIgdmFsdWUgPSBleGNlbC5kYXRhW2lfZXhlbF1bbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdXTtcblxuXHRcdFx0XHRcdFx0Zm9yICggdmFyIGlfbGVnZW5kcyA9IDAsIGlfbGVnZW5kc19tYXggPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGlfbGVnZW5kcyA8IGlfbGVnZW5kc19tYXg7IGlfbGVnZW5kcysrICl7XG5cdFx0XHRcdFx0XHRcdGlmKCAodmFsdWUgPj0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV9sZWdlbmRzXVswXSkgJiYgKHZhbHVlIDw9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2lfbGVnZW5kc11bMV0pICl7XG5cdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgem5hbGXFumxpc215XG5cdFx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2lfbGVnZW5kc11bM107XG5cdFx0XHRcdFx0XHRcdFx0aV9sZWdlbmRzID0gaV9sZWdlbmRzX21heDtcblx0XHRcdFx0XHRcdFx0XHRpX2V4ZWwgPSBpX2V4ZWxfbWF4O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vamXFm2xpIHdhcnRvxZvEhyB3eWNob2R6aSBwb3phIHNrYWxlIHUgdGFrIHByenlwaXN1amVteSBqZWogb2Rwb3dpZWRuaSBrb2xvclxuXHRcdFx0XHRcdFx0aWYodmFsdWUgPCBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVswXVswXSl7XG5cdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbbGF5ZXJzLmFjdGl2ZV1baV9jYXRlZ29yeV0gPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVswXVszXTtcblx0XHRcdFx0XHRcdH1cdFxuXG5cdFx0XHRcdFx0XHRpZih2YWx1ZSA+IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2lfbGVnZW5kc19tYXgtMV1bMV0pe1xuXHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2xheWVycy5hY3RpdmVdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV9sZWdlbmRzX21heC0xXVszXTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vcG8gemFrdHVhbGl6b3dhbml1IGtvbG9yw7N3IHcga2F0ZWdvcmlhY2ggcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0XHRjYW52YXMuZHJhdygpO1xuXG5cblx0fSxcbn0qL1xuIiwiY2xvdWQgPSB7XG5cblx0c2V0X3RleHRhcmVhIDogZnVuY3Rpb24oKXtcblx0XHQkKCcjY2xvdWQgLmNsb3VkX3RleHQnKS52YWwoIGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSApO1xuXHR9LFxuXG5cdC8qZ2V0X3RleHRhcmVhIDogZnVuY3Rpb24odGV4dF90bXApe1xuXG5cdFx0Ly92YXIgdGV4dF90bXAgPSAkKG9iaikudmFsKCk7XG5cblx0XHRsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gPSB0ZXh0X3RtcDtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0bGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdID0gbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdLnJlcGxhY2UoJ3snK2V4Y2VsLmRhdGFbMF1baV0rJ30nLCdcIitleGNlbC5kYXRhW3RtcF9yb3ddWycraSsnXVwiKycpO1xuXHRcdH1cblxuXHRcdGxheWVycy5jbG91ZF9wYXJzZXJbbGF5ZXJzLmFjdGl2ZV0gPSAnXCInK3RleHRfdG1wKydcIic7XG5cdH0sKi9cblxuXHQvL3VzdGF3aWFteSBwb3ByYXduxIUgcG96eWNqxJkgZHlta2Fcblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgbGVmdCA9IG1vdXNlLmxlZnQgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X2xlZnQ7XG5cdFx0dmFyIHRvcCA9IG1vdXNlLnRvcCAtIG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfdG9wO1xuXG5cdFx0JChcIiNjYW52YXNfY2xvdWRcIikuY3NzKHt0b3A6cGFyc2VJbnQodG9wIC0gJChcIiNjYW52YXNfY2xvdWRcIikuaGVpZ2h0KCktMzApKydweCcsbGVmdDpsZWZ0KzEwKydweCd9KTtcblx0fSxcblxuXHQvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgd3nFm3dpZXRsZW5pZSBkeW1rYSB6IG9kcG93aWVkbmnEhSB6YXdhcnRvxZtjacSFXG5cdHVwZGF0ZV90ZXh0IDogZnVuY3Rpb24obmFtZSl7XG5cblx0XHRpZihuYW1lICE9IFwibnVsbFwiKXtcblxuXHRcdFx0dmFyIHRtcF9yb3cgPSBudWxsO1xuXHRcdFx0dmFyIGZpbmQgPSAwO1xuXHRcdFx0Zm9yKCB2YXIgaV9yb3cgPSAwLCBpX3Jvd19tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaV9yb3cgPCBpX3Jvd19tYXg7IGlfcm93KysgKXtcblx0XHRcdFx0aWYobmFtZSA9PSBleGNlbC5kYXRhW2lfcm93XVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dKXtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR0aGlzLnNldF9wb3NpdGlvbigpO1xuXHRcdFx0XHRcdHZhciB0ZXh0X3RtcCA9IGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXTtcblxuXHRcdFx0XHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0XHRcdHRleHRfdG1wID0gdGV4dF90bXAucmVwbGFjZSgneycrZXhjZWwuZGF0YVswXVtpXSsnfScsZXhjZWwuZGF0YVtpX3Jvd11baV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvL2RvcGllcm8gamXFm2xpIGR5bWVrIG1hIG1pZcSHIGpha2HFmyBrb25rcmV0bsSFIHphd2FydG/Fm8SHIHd5xZt3aWV0bGFteSBnb1xuXHRcdFx0XHRcdGlmKHRleHRfdG1wIT1cIlwiKXtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuaHRtbCh0ZXh0X3RtcCk7XG5cdFx0XHRcdFx0XHRmaW5kID0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9qZcWbbGkgbmllIHpuYWxlemlvbm8gb2Rwb3dpZWRuaWVqIGthdGVnb3JpaVxuXHRcdFx0aWYgKCFmaW5kKSB7IFxuXHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDIwMCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTtcblx0XHR9XG5cdH1cblxufVxuXG4vKlxuJCgnI2Nsb3VkIC5jbG91ZF90ZXh0Jykua2V5dXAoZnVuY3Rpb24oKXtcblxuXHRjbG91ZC5nZXRfdGV4dGFyZWEodGhpcyk7XG5cbn0pIDsqLyIsIi8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB0d29yemVuaWUgemFwaXN5d2FuaWUgaSBha3R1YWxpemFjamUgZGFueWNoIGRvdHljesSFxIdjeWggbWFweVxuLy92YXIgY3J1ZCA9IGNydWQgfHwge31cbmNydWQgPSB7XG5cblx0bWFwX2pzb24gOiBBcnJheSgpLCAvL2fFgsOzd25hIHptaWVubmEgcHJ6ZWNob3d1asSFY2Egd3N6eXN0a2llIGRhbmVcblx0bWFwX2hhc2ggOm51bGwsXG5cdGxheWVycyA6IHt9LFxuXHRleGNlbCA6IEFycmF5KCksXG5cdHByb2plY3QgOiB7fSxcblx0cHJvamVjdF9oYXNoIDogcHJvamVjdF9oYXNoLCAvL2fFgsOzd255IGhhc2ggZG90eWN6xIVjeSBuYXN6ZWdvIHByb2pla3R1XG5cblx0Ly93Y3p5dGFuaWUgem1pZW5ueWNoIGRvIG9iaWVrdMOzdyBtYXB5XG5cblx0c2V0X21hcCA6IGZ1bmN0aW9uKGRhdGEpe1xuXG5cdFx0Ly9wbyB6YXBpc2FuaXUgZGFueWNoIGRvIGJhenkgYWt0dWFsaXp1amVteSBpZCAodyBwcnp5cGFka3UgamXFm2xpIGlzdG5pZWplIG5hZHBpc3VqZW15IGplKVxuXHRcdHRoaXMubWFwX2pzb24gPSBkYXRhO1xuXG5cdFx0Ly9wb2JpZXJhbXkgaSB3Y3p5dHVqZW15IGRhbmUgbyBjYW52YXNpZSBkbyBvYmlla3R1XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBkYXRhWzBdWzBdO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBkYXRhWzBdWzFdO1xuXHRcdHBvaW50ZXJzLnBhZGRpbmdfeCA9IGRhdGFbMF1bMl07XG5cdFx0cG9pbnRlcnMucGFkZGluZ195ID0gZGF0YVswXVszXTtcblx0XHRwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvID0gZGF0YVswXVs0XTtcblx0XHRwb2ludGVycy5zaXplX3BvaW50ZXIgPSBkYXRhWzBdWzVdO1xuXHRcdHBvaW50ZXJzLm1haW5fa2luZCA9IGRhdGFbMF1bNl07XG5cdFx0Y2FudmFzLnRpdGxlX3Byb2plY3QgPSBkYXRhWzBdWzddO1xuXG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3hcIl0nKS52YWwoIGRhdGFbMF1bMl0gKTtcblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeVwiXScpLnZhbCggZGF0YVswXVszXSApO1xuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwic2l6ZV9wb2ludGVyXCJdJykudmFsKCBkYXRhWzBdWzVdICk7XG5cdFx0JCgnaW5wdXRbbmFtZT1cInRpdGxlX3Byb2plY3RcIl0nKS52YWwoIGRhdGFbMF1bN10gKTtcblxuXHRcdGlmKCBkYXRhWzBdWzRdICl7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0fVxuXG5cdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuaHRtbCgnJyk7XG5cblx0XHRwb2ludGVycy5raW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGtpbmQpe1xuXG5cdFx0XHRpZihraW5kID09IGRhdGFbMF1bNl0pe1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5hcHBlbmQoJzxvcHRpb24gc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5hcHBlbmQoJzxvcHRpb24gbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIHBvaW50ZXJhY2hcblx0XHRwb2ludGVycy5wb2ludGVycyA9IGRhdGFbMV07XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIG8ga2F0ZWdvcmlhY2hcblx0XHR2YXIgY2F0ZWdvcmllcyA9IHt9O1xuXHRcdGNhdGVnb3JpZXMuY2F0ZWdvcnkgPSBkYXRhWzJdO1xuXG5cblx0XHQvL3BvIHdjenl0YW5pdSBtYXB5IGFrdHlhbGl6dWplbXkgZGFuZSBkb3R5Y3rEhWPEhSBrYXRlZ29yaWkgaSBrb2xvcsOzd1xuXHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbMF0gPSBbXTtcblx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZSA9IFtdO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBjYXRlZ29yaWVzLmNhdGVnb3J5Lmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0bGF5ZXJzLmNhdGVnb3J5X25hbWUucHVzaChjYXRlZ29yaWVzLmNhdGVnb3J5W2ldWzBdKTtcblx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbMF0ucHVzaChjYXRlZ29yaWVzLmNhdGVnb3J5W2ldWzFdKTtcblx0XHR9XG5cblx0XHQvL3BvYmllcmFuaWUgZGFueWNoIG8gemRqxJljaXUgamXFvGVsaSBpc3RuaWVqZVxuXHRcdGlmKCBkYXRhWzNdLmxlbmd0aCA+IDIpe1xuXHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cdFx0XHRpbWFnZS5vYmouc3JjID0gZGF0YVszXVswXTtcblx0XHRcdGltYWdlLnggPSBwYXJzZUludCggZGF0YVszXVsxXSApO1xuXHRcdFx0aW1hZ2UueSA9IHBhcnNlSW50KCBkYXRhWzNdWzJdICk7XG5cdFx0XHRpbWFnZS53aWR0aCA9IHBhcnNlSW50KCBkYXRhWzNdWzNdICk7XG5cdFx0XHRpbWFnZS5oZWlnaHQgPSBwYXJzZUludCggZGF0YVszXVs0XSApO1xuXHRcdFx0aW1hZ2UuYWxwaGEgPSBwYXJzZUludCggZGF0YVszXVs1XSApO1xuXG5cdFx0XHQvL3phem5hY3plbmllIG9kcG93aWVkbmllZ28gc2VsZWN0YSBhbHBoYSB3IG1lbnUgdG9wXG5cdFx0XHQkKCcjYWxwaGFfaW1hZ2Ugb3B0aW9uW25hbWU9XCInK1x0aW1hZ2UuYWxwaGEgKydcIl0nKS5hdHRyKCdzZWxlY3RlZCcsdHJ1ZSk7XG5cblx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHsgY2FudmFzLmRyYXcoKTsgfTtcblx0XHR9XG5cblx0XHQvL3pha3R1YWxpem93YW5pZSBkYW55Y2ggdyBpbnB1dGFjaFxuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJywgY2FudmFzLndpZHRoX2NhbnZhcysncHgnKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLCBjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOmNhbnZhcy53aWR0aF9jYW52YXMrJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnfSk7XG5cblx0XHRjYW52YXMuZHJhdygpO1xuXG5cdH0sXG5cblx0c2V0X3Byb2plY3QgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vd2N6eXR1amVteSBkYW5lIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMuc2V0X21hcCggSlNPTi5wYXJzZShkYXRhLm1hcF9qc29uKSApO1xuXHRcdGV4Y2VsLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEuZXhjZWwpO1xuXG5cdFx0ZGF0YS5wcm9qZWN0ID0gSlNPTi5wYXJzZShkYXRhLnByb2plY3QpOyAgXG5cdFx0ZGF0YS5sYXllcnMgPSBKU09OLnBhcnNlKGRhdGEubGF5ZXJzKTsgXG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIHByb2pla3R1XG5cdFx0bGF5ZXJzLnBhbGV0c19hY3RpdmUgPSBkYXRhLmxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdGxheWVycy52YWx1ZSA9IGRhdGEubGF5ZXJzLnZhbHVlO1xuXHRcdGxheWVycy5jb2xvcnNfcG9zID0gZGF0YS5sYXllcnMuY29sb3JzX3Bvcztcblx0XHRsYXllcnMuY29sb3JzX2FjdGl2ZSA9IGRhdGEubGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0bGF5ZXJzLm1pbl92YWx1ZSA9IGRhdGEubGF5ZXJzLm1pbl92YWx1ZTtcblx0XHRsYXllcnMubWF4X3ZhbHVlID0gZGF0YS5sYXllcnMubWF4X3ZhbHVlO1xuXHRcdGxheWVycy5jbG91ZCA9IGRhdGEubGF5ZXJzLmNsb3VkO1xuXHRcdGxheWVycy5jbG91ZF9wYXJzZXIgPSBkYXRhLmxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0bGF5ZXJzLmxlZ2VuZHMgPSBkYXRhLmxheWVycy5sZWdlbmRzO1xuXHRcdGxheWVycy5sYWJlbHMgPSBkYXRhLmxheWVycy5sYWJlbHM7XG5cdCBcdGxheWVycy5jYXRlZ29yeSA9IFx0ZGF0YS5sYXllcnMuY2F0ZWdvcnk7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZSA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0bGF5ZXJzLmxpc3QgPSBkYXRhLmxheWVycy5saXN0O1xuXG5cdFx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRcdGxheWVycy5wcm9qZWN0X25hbWUgPSBkYXRhLnByb2plY3QubmFtZTtcblx0XHRsYXllcnMuc291cmNlID0gZGF0YS5wcm9qZWN0LnNvdXJjZTtcblxuXHRcdCQoJ2lucHV0W25hbWU9XCJwcm9qZWN0X25hbWVcIl0nKS52YWwobGF5ZXJzLnByb2plY3RfbmFtZSk7XG5cblx0XHRsZWdlbmRzLnNob3coKTsgXG5cdFx0bGFiZWxzLnNob3coKTtcblx0XHRsYXllcnMuc2hvdygpO1xuXG5cdFx0dmFyIG9mZnNldCA9ICQoJyNjYW52YXNfYm94Jykub2Zmc2V0KCk7XG4gIFx0Y2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIFx0Y2FudmFzLm9mZnNldF90b3AgPSBvZmZzZXQudG9wO1xuXG5cdH0sXG5cblx0Ly9wb2JpZXJhbmllIHByb2pla3R1IHogYmF6eSBkYW55Y2ggaSB3Y3p5dGFuaWVcblx0Z2V0X3Byb2plY3QgOiBmdW5jdGlvbigpe1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6ICcvYXBpL3Byb2plY3QvJyArIGNydWQucHJvamVjdF9oYXNoLFxuXHRcdCAgdHlwZTogXCJHRVRcIixcblx0XHQgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoZnVuY3Rpb24oIGRhdGEgKSB7IGNvbnNvbGUubG9nKGRhdGEuZGF0YSk7IGNydWQuc2V0X3Byb2plY3QoIGRhdGEuZGF0YSApOyAgfSk7XG5cdH0sXG5cbn1cbiIsInZhciBleGNlbCA9IHt9XG4iLCIvL2Z1bmtjamUgcnlzdWrEhWNlIHBvamVkecWEY3p5IHB1bmt0IChwb2ludGVyKVxudmFyIGZpZ3VyZXMgPSB7XG5cblx0c3F1YXJlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KHgseSxzaXplLHNpemUpO1xuXHR9LFxuXG5cdGNpcmNsZSA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgc2l6ZSA9IHNpemUgLyAyO1xuXHRcdHZhciBjZW50ZXJfeCA9IHggKyBzaXplO1xuXHRcdHZhciBjZW50ZXJfeSA9IHkgKyBzaXplO1xuXHRcdGNhbnZhcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmFyYyhjZW50ZXJfeCwgY2VudGVyX3ksIHNpemUsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cblx0aGV4YWdvbiAgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIGEgPSBzaXplLzQ7XG5cdFx0dmFyIGEyID0gc2l6ZS8yO1xuXHRcdHZhciBoID0gc2l6ZS8yKk1hdGguc3FydCgzKS8yO1xuXG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubW92ZVRvKHgseSthMik7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyLWgpO1xuICBcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2ErYTIseSthMi1oKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCtzaXplLHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUtYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EseSthMitoKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCx5K2EyKTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cblx0aGV4YWdvbjIgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIGEgPSBzaXplLzQ7XG5cdFx0dmFyIGEyID0gc2l6ZS8yO1xuXHRcdHZhciBoID0gc2l6ZS8yKk1hdGguc3FydCgzKS8yO1xuXG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubW92ZVRvKHgrYTIseSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EpO1xuICBcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyK2gseSthMithKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5K3NpemUpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthMithKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMi1oLHkrYSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIseSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbCgpO1xuXG5cdH1cbn1cbiIsIi8vZ8WCw7N3bmUgemRqxJljaWUgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbnZhciBpbWFnZSA9IHtcblx0b2JqIDogdW5kZWZpbmVkLFxuXHR4IDogbnVsbCxcblx0eSA6IG51bGwsXG5cdHdpZHRoIDogbnVsbCxcblx0aGVpZ2h0IDogbnVsbCxcblx0YWxwaGEgOiAxMCwgXG5cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhLzEwO1xuXHRcdGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLm9iaix0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpO1xuXG5cdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmNzcyh7J2hlaWdodCc6dGhpcy5oZWlnaHQsJ3RvcCc6dGhpcy55KydweCcsJ2xlZnQnOih0aGlzLngrdGhpcy53aWR0aCkrJ3B4J30pO1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcblx0fSxcblxuXHQvL2Z1bmtjamEgcG9tb2NuaWN6YSBrb253ZXJ0dWrEhWNhIGRhdGFVUkkgbmEgcGxpa1xuXHRkYXRhVVJJdG9CbG9iIDogZnVuY3Rpb24oZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheS5wdXNoKGJpbmFyeS5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7dHlwZTogJ2ltYWdlL3BuZyd9KTtcblx0fVxuXG59XG4iLCJ2YXIgZGF0YV9pbnB1dCA9IHtcblxuXHQvL3BvYmllcmFuaWUgaW5mb3JtYWNqaSB6IGlucHV0w7N3IGkgemFwaXNhbmllIGRvIG9iaWVrdHUgbWFwX3N2Z1xuXHRnZXQgOiBmdW5jdGlvbigpe1xuXHRcdG1hcC5uYW1lID0gJCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCk7XG5cdFx0bWFwLnBhdGggPSAkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoKS5yZXBsYWNlKC9cIi9nLCBcIidcIik7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fSxcblxuXHQvL3BvYnJhbmllIGluZm9ybWFjamkgeiBvYmlla3R1IG1hcF9zdmcgaSB6YXBpc2FuaWUgZG8gaW5wdXTDs3dcblx0c2V0IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoIG1hcC5uYW1lICk7XG5cdFx0JCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCBtYXAucGF0aCApO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH1cblxufVxuIiwibGFiZWxzID0ge1xuXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNsYWJlbHMnKS5odG1sKCBsYXllcnMubGFiZWxzW2xheWVycy5hY3RpdmVdICk7XG5cdH0sXG5cbn1cblxuXG4iLCJ2YXIgbGF5ZXJzID0ge1xuXG5cdGxpc3QgOiBbJ3pha8WCYWRrYSAxJ10sXG5cdGFjdGl2ZSA6IDAsXG5cblx0Ly90YWJsaWNhIHogcG9kc3Rhd293eXdtaSBkYW55bWkgemFncmVnb3dhbnltaSBkbGEga2HFvGRlaiB3YXJzdHd5XG5cdHBhbGV0c19hY3RpdmUgOiBbMF0sXG5cblx0dmFsdWUgOiBbLTFdLFxuXHRjb2xvcnNfcG9zIDogW1sxLDEsMSwxLDEsMSwxLDEsMV1dLFxuXHRjb2xvcnNfYWN0aXZlIDogW1tcIiNmN2ZjZmRcIiwgXCIjZTVmNWY5XCIsIFwiI2NjZWNlNlwiLCBcIiM5OWQ4YzlcIiwgXCIjNjZjMmE0XCIsIFwiIzQxYWU3NlwiLCBcIiMyMzhiNDVcIiwgXCIjMDA2ZDJjXCIsIFwiIzAwNDQxYlwiXV0sXG5cdG1pbl92YWx1ZSA6IFswXSxcblx0bWF4X3ZhbHVlIDogWzBdLFxuXHRjbG91ZCA6IFtcIlwiXSxcblx0Y2xvdWRfcGFyc2VyIDogW1wiXCJdLFxuXHRsZWdlbmRzIDogW1tdXSxcblx0bGFiZWxzIDogW1wiXCJdLFxuXHRjYXRlZ29yeSA6IFstMV0sXG5cdGNhdGVnb3J5X2NvbG9ycyA6IFtdLFxuXHRjYXRlZ29yeV9uYW1lIDogW10sXG5cblx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRwcm9qZWN0X25hbWUgOiAnbm93eSBwcm9qZWt0Jyxcblx0c291cmNlIDogJycsXG5cblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgaHRtbCA9IFwiXCI7XG5cdFx0aHRtbCArPSAnPHNwYW4gbnVtPVwiJyswKydcIiBjbGFzcz1cImFjdGl2ZVwiPicgKyB0aGlzLmxpc3RbMF0gKyAnPC9zcGFuPic7XG5cdFx0XG5cdFx0Zm9yKHZhciBpID0gMSwgaV9tYXggPSB0aGlzLmxpc3QubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRodG1sICs9ICc8c3BhbiBudW09XCInK2krJ1wiPicgKyB0aGlzLmxpc3RbaV0gKyAnPC9zcGFuPic7XG5cdFx0fVxuXG5cdFx0JCgnI2FyZWEnKS5odG1sKGh0bWwpO1xuXHRcdCQoJyNhcmVhIHNwYW4nKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdFx0bGF5ZXJzLnNlbGVjdCh0aGlzKTtcblx0XHR9KTtcblx0fSxcblxuXHRzZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0JCgnI2FyZWEgc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHQkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdGxheWVycy5hY3RpdmUgPSAkKG9iaikuaW5kZXgoKTtcblxuXHRcdGxlZ2VuZHMuc2hvdygpOyBcblx0XHRsYWJlbHMuc2hvdygpO1xuXHRcdGxheWVycy5zaG93KCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0XG5cdH0sXG5cblxufSIsIi8vb2JpZWt0IGRvdHljesSFc3kgd3lzd2lldGxhbmlhIGFrdXRhbGl6YWNqaSBpIGVkeWNqaSBwYW5lbHUgbGVnZW5kXG5sZWdlbmRzID0ge1xuXG5cdC8vd3nFm3dpZXRsYW15IHdzenlzdGtpZSBsZWdlbmR5IHcgcGFuZWx1IG1hcFxuXHRzaG93IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBodG1sID0gXCJcIjtcblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0aHRtbCArPSBcIjxkaXY+IDxzcGFuIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzNdK1wiJz48L3NwYW4+PHNwYW4+XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMl0rXCI8L3NwYW4+PC9kaXY+XCI7XG5cdFx0fVxuXHRcdFxuXHRcdCQoJyNsZWdlbmRzJykuaHRtbChodG1sKTtcblx0fVxufVxuXG5cbiIsIi8qXG4gICAgX19fXyAgIF9fX18gX19fXyAgICBfXyAgX19fIF9fXyAgICAgX19fXyAgICAgX19fX18gICAgX19fXyBcbiAgIC8gX18gKSAvICBfLy8gX18gXFwgIC8gIHwvICAvLyAgIHwgICAvIF9fIFxcICAgfF9fICAvICAgLyBfXyBcXFxuICAvIF9fICB8IC8gLyAvIC8gLyAvIC8gL3xfLyAvLyAvfCB8ICAvIC9fLyAvICAgIC9fIDwgICAvIC8gLyAvXG4gLyAvXy8gL18vIC8gLyAvXy8gLyAvIC8gIC8gLy8gX19fIHwgLyBfX19fLyAgIF9fXy8gL18gLyAvXy8gLyBcbi9fX19fXy8vX19fLyBcXF9fX1xcX1xcL18vICAvXy8vXy8gIHxffC9fLyAgICAgICAvX19fXy8oXylcXF9fX18vICBcblxudmFyc2lvbiAzLjAgYnkgTWFyY2luIEfEmWJhbGFcblxubGlzdGEgb2JpZWt0w7N3OlxuXG4gY2FudmFzID0gY2FudmFzKCkgLSBvYmlla3QgY2FudmFzYVxuIGNydWQgPSBjcnVkKCkgLSBvYmlla3QgY2FudmFzYVxuIGltYWdlID0gaW1hZ2UoKSAtIG9iaWVrdCB6ZGrEmWNpYSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxuIG1vdXNlID0gbW91c2UoKVxuIG1vZGVscyA9IG1vZGVscygpXG4gZ2xvYmFsID0gZ2xvYmFsKCkgLSBmdW5rY2plIG5pZSBwcnp5cGlzYW55IGRvIGlubnljaCBvYmlla3TDs3dcbiBjYXRlZ29yaWVzID0gY2F0ZWdvcmllcygpXG4gcG9pbnRlcnMgPSBwb2ludGVycygpXG4gY29sb3JwaWNrZXIgPSBjb2xvcnBpY2tlcigpXG4gbWVudV90b3AgPSBtZW51X3RvcCgpXG4gZmlndXJlcyA9IGZpZ3VyZXMoKVxuXG4qL1xuICBcbi8vcG8ga2xpa25pxJljaXUgem1pZW5pYXkgYWt0dWFsbnkgcGFuZWxcbiQoJy5ib3ggPiB1bCA+IGxpJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2JveCh0aGlzKSB9KTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRcdC8vcHJ6eXBpc2FuaWUgcG9kc3Rhd293b3d5Y2ggZGFueWNoIGRvIG9iaWVrdHUgY2FudmFzXG5cdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcbiAgY2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnKSApO1xuICBjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnKSApO1xuICB2YXIgb2Zmc2V0ID0gJCgnI2NhbnZhc19ib3gnKS5vZmZzZXQoKTtcbiAgY2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuICAvL3R3b3J6eW15IHRhYmxpY2UgcG9pbnRlcsOzd1xuXHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblxuXHQvL29kem5hY3plbmllIHNlbGVjdGEgcHJ6eSB6bWlhbmllXG5cdC8vJC8vKCcjY2hhbmdlX2NhdGVnb3J5JykuY2hhbmdlKGZ1bmN0aW9uKCl7ICQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5ibHVyKCk7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgcHVzY3plbmlhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpeyBtb3VzZS5tb3VzZV9kb3duID0gZmFsc2U7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgd2NpxZtuacSZY2lhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblx0XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy/FgmF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTtcblx0XG5cdH0pO1xuXG5cdC8vd3l3b8WCYW5pZSBmdW5rY2ppIHBvZGN6YXMgcG9ydXN6YW5pYSBteXN6a8SFXG5cdCQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRpZihtb3VzZS5tb3VzZV9kb3duKSBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXHRcdGlmKG1lbnVfdG9wLmF1dG9fZHJhdyl7IG1vdXNlLmNsaWNrX29iaiA9IFwiY2FudmFzXCI7IG1vdXNlLm1vdXNlbW92ZShldmVudCk7fVxuXHRcblx0fSk7XG5cblx0JCgnI21haW5fY2FudmFzJykubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTsvL3phcmVqZXN0cm93YW5pZSBvYmlla3R1dyAga3TDs3J5IGtsaWthbXlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXtcblxuXHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0XHRwb2ludGVycy5sYXN0X3JvdyA9IG51bGw7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IGNhbnZhcy5jb250ZXh0X25ld194O1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSBjYW52YXMuY29udGV4dF9uZXdfeTtcblxuXHR9KTtcblxuXHRjcnVkLmdldF9wcm9qZWN0KCk7XG5cblxufSk7XG5cbiQoJyNjYW52YXNfd3JhcHBlcicpLm1vdXNlbGVhdmUoZnVuY3Rpb24oKXsgJChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgyMDApOyB9KTtcbiQoJyNjYW52YXNfd3JhcHBlcicpLm1vdXNlbW92ZShmdW5jdGlvbigpe1xudmFyIHRleHQgPSBvbl9jYXRlZ29yeS5nZXRfbmFtZSgpIFxuXG5jb25zb2xlLmxvZyggdGV4dClcbiBjbG91ZC51cGRhdGVfdGV4dCh0ZXh0ICk7IFxufSk7XG4kKFwiI2NhbnZhc19jbG91ZFwiKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgY2xvdWQuc2V0X3Bvc2l0aW9uKCk7IH0pO1xuIiwiLy9vYmlla3QgbWVudV90b3Bcbm1lbnVfdG9wID0ge1xuXG5cdG1vdmVfaW1hZ2UgOiBmYWxzZSxcblx0bW92ZV9jYW52YXMgOiBmYWxzZSxcblx0YXV0b19kcmF3IDogZmFsc2UsXG5cdG1vZGVfa2V5IDogdHJ1ZSxcblx0Y2F0ZWdvcnkgOiAwLFxuXHRkaXNhYmxlX3NlbGVjdCA6IGZhbHNlLFxuXG5cdC8vem1pYW5hIGFrdHVhbG5laiB6YWvFgmFka2lcblx0Y2hhbmdlX2JveCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0JChvYmopLnBhcmVudCgpLmNoaWxkcmVuKCdsaScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHQkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdFx0dmFyIGNhdGVnb3J5ID0gJChvYmopLmF0dHIoJ2NhdGVnb3J5Jyk7XG5cdFx0JChvYmopLnBhcmVudCgpLnBhcmVudCgpLmNoaWxkcmVuKCdkaXYnKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcblx0XHRcdCQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5jaGlsZHJlbignIycrY2F0ZWdvcnkpLmRlbGF5KDEwMCkuZmFkZUluKDUwMCk7XG5cdFx0fSk7XG5cdFxuXHRcblx0fSxcblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9tYXBzIDogZnVuY3Rpb24oKXtcblx0XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL21hcHMnLFxuICAgIFx0dHlwZTogXCJHRVRcIixcbiAgICBcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoIGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblx0XHRcdFxuXHRcdFx0Ly93ecWbd2lldGxhbXkgbGlzdMSZIG1hcCB3IHBhbmVsdSB1IGfDs3J5XG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gXCJva1wiKXtcblx0XHRcdFx0dmFyIGFkZF9odG1sID0gJzxvcHRpb24gaWQ9XCJzZWxlY3RfbWFwXCI+d3liaWVyeiBtYXDEmTwvb3B0aW9uPic7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBpX21heCA9IHJlc3BvbnNlLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXggO2krKyl7XG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5tYXBfaGFzaCl7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBzZWxlY3RlZCBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfbWFwJykuaHRtbCggYWRkX2h0bWwgKTtcblxuXHRcdFx0XHQvL2RvZGFqZW11IHpkYXJ6ZW5pZSBjaGFuZ2UgbWFwIFxuXHRcdFx0XHQkKCcuc2VsZWN0X21hcCcpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdC8vc3ByYXdkemFteSBjenkgd3licmFsacWbbXkgcG9sZSB6IGhhc2hlbSBtYXB5XG5cdFx0XHRcdFx0aWYoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSAhPSAnc2VsZWN0X21hcCcpe1xuXHRcdFx0XHRcdFx0Ly9qZcWbbGkgdGFrIHRvIHNwcmF3ZHphbXkgY3p5IHdjenl0dWplbXkgbWFwxJkgcG8gcmF6IHBpZXJ3c3p5IGN6eSBkcnVnaVxuXHRcdFx0XHRcdFx0aWYoY3J1ZC5tYXBfaGFzaCAhPSBudWxsKXtcblx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgd2N6eXR1amVteSBwbyByYXoga29sZWpueSB0byBweXRhbXkgY3p5IG5hcGV3bm8gY2hjZW15IGrEhSB3Y3p5dGHEh1xuXHRcdFx0XHRcdFx0XHRpZiAoY29uZmlybSgnQ3p5IGNoY2VzeiB3Y3p5dGHEhyBub3fEhSBtYXDEmSA/JykpIHtcblx0XHRcdFx0XHRcdFx0XHRjcnVkLm1hcF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRcdGNydWQuZ2V0X21hcCgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHQkKCcuc2VsZWN0X21hcCBvcHRpb24nKS5lcSgwKS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdFx0Y3J1ZC5tYXBfaGFzaCA9ICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKTtcblx0XHRcdFx0XHRcdFx0Y3J1ZC5nZXRfbWFwKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0YWxlcnQoJ25pZSBtb2fEmSBwb2JyYcSHIGxpc3R5IG1hcCcpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKTtcblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cblxuXHR9LFxuXG5cblx0Ly9mdW5rY2phIHPFgnXFvMSFY2EgZG8gcG9iaWVyYW5pYSBkYW55Y2ggZG90eWN6xIVjeWNoIG1hcFxuXHRnZXRfcHJvamVjdHMgOiBmdW5jdGlvbigpe1xuXHRcdCQuYWpheCh7XG4gICBcdFx0dXJsOiAnL2FwaS9wcm9qZWN0cycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgcHJvamVrdMOzdyB3IHBhbmVsdSB1IGfDs3J5XG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gXCJva1wiKXtcblxuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnPG9wdGlvbiBpZD1cIm5ld19wcm9qZWN0XCI+bm93eSBwcm9qZWt0PC9vcHRpb24+Jztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlLmRhdGFbaV0uX2lkID09IGNydWQucHJvamVjdF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ucHJvamVjdCkubmFtZSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5wcm9qZWN0KS5uYW1lICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoJyN0b29sYmFyX3RvcCBzZWxlY3Quc2VsZWN0X3Byb2plY3QnKS5odG1sKCBhZGRfaHRtbCApO1xuXHRcdFx0XG5cdFx0XHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBwcm9qZWN0IFxuXHRcdFx0XHQkKCcuc2VsZWN0X3Byb2plY3QnKS5jaGFuZ2UoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZiAoY29uZmlybSgnQ3p5IGNoY2VzeiB3Y3p5dGHEhyBub3d5IHByb2pla3QgPycpKSB7XG5cdFx0XHRcdFx0XHRpZiggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpID09ICduZXdfcHJvamVjdCcgKXtcblx0XHRcdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRjcnVkLnByb2plY3RfaGFzaCA9ICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKTtcblx0XHRcdFx0XHRcdFx0Y3J1ZC5nZXRfcHJvamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGFsZXJ0KCduaWUgbW9nxJkgcG9icmHEhyBsaXN0eSBwcm9qZWt0w7N3Jyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cdH0sXG5cblx0dXBkYXRlX2NhbnZhc19pbmZvIDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuc2NhbGUgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCkgKTtcblx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoKSApO1xuXHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCkgKTtcblxuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCggY2FudmFzLnNjYWxlICsgJyUnICk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCggY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCggY2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnICk7XG5cblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCAjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsY2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGNoYW5nZV9hbHBoYSA6IGZ1bmN0aW9uKCl7XG5cdFx0aW1hZ2UuYWxwaGEgPSAkKCcjYWxwaGFfaW1hZ2UnKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCduYW1lJyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRhZGRfaW1hZ2UgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9qZXNsaSBwb2RhbnkgcGFyYW1ldHIgbmllIGplc3QgcHVzdHlcblx0XHR2YXIgc3JjX2ltYWdlID0gcHJvbXB0KFwiUG9kYWogxZtjaWXFvGvEmSBkbyB6ZGrEmWNpYTogXCIpO1xuXG5cdFx0aWYoc3JjX2ltYWdlKXtcblx0XHRcdGlmKHNyY19pbWFnZS5sZW5ndGggPiAwKXtcblxuXHRcdFx0XHRpbWFnZS5vYmogPSBuZXcgSW1hZ2UoKTtcblxuXHRcdFx0XHQvL3djenl0YW5pZSB6ZGrEmWNpYTpcblx0XHRcdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0aW1hZ2Uud2lkdGggPSBpbWFnZS5vYmoud2lkdGg7XG5cdCAgICBcdFx0aW1hZ2UuaGVpZ2h0ID0gaW1hZ2Uub2JqLmhlaWdodDtcblx0ICAgIFx0XHRpbWFnZS5kcmF3KCk7XG5cdCAgXHRcdH07XG5cblx0XHRcdCAgaW1hZ2UueCA9IDA7XG5cdFx0XHQgIGltYWdlLnkgPSAwO1xuXHRcdFx0ICBpbWFnZS5vYmouc3JjID0gc3JjX2ltYWdlO1xuXHRcdFx0XHQvL3NpbWFnZS5vYmouc2V0QXR0cmlidXRlKCdjcm9zc09yaWdpbicsICdhbm9ueW1vdXMnKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0c2hvd19pbmZvIDogZnVuY3Rpb24oKXtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwocGFyc2VJbnQoY2FudmFzLnNjYWxlKSArICclJyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbChwYXJzZUludChjYW52YXMud2lkdGhfY2FudmFzKSArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHBhcnNlSW50KGNhbnZhcy5oZWlnaHRfY2FudmFzKSArICdweCcpO1xuXHR9XG5cbn1cbiIsIi8vb2JpZWt0IG15c3praSAoZG8gb2dhcm5pZWNpYSlcbnZhciBtb3VzZSA9IHtcblx0bW91c2VfZG93biA6IGZhbHNlLFxuXHRjbGlja19vYmogOiBudWxsLFxuXG5cdHRtcF9tb3VzZV94IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblx0dG1wX21vdXNlX3kgOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXG5cdGxlZnQgOiBudWxsLCAvL3BvenljamEgeCBteXN6a2lcblx0dG9wIDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpXG5cdHBhZGRpbmdfeCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRwYWRkaW5nX3kgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0b2Zmc2V0X3ggOiBudWxsLCAvL29mZnNldCB4IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cdG9mZnNldF95IDogbnVsbCwgLy9vZmZzZXQgeSBvYmlla3R1IGtsaWtuacSZdGVnb1xuXG5cdC8vZnVuY2tqYSB3eWtyeXdhasSFY2EgdyBjbyBrbGlrbmnEmXRvIHBvYmllcmFqxIVjYSBwYWRkaW5nIGtsaWtuacSZY2lhIG9yYXogemFwaXN1asSFY2Ega2xpa25pxJljaWVcblx0c2V0X21vdXNlX2Rvd24gOiBmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHR2YXIgb2JqID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0Ly9qZcWbbGkgZWxlbWVudCBuYSBrdMOzcnkga2xpa25pxJl0byBtYSBhdHJ5YnV0IG5hbWVjbGljayBwcnp5cGlzdWplbXkgZ28gZG8gb2JpZWt0dSBteXN6a2lcblx0XHRpZih0eXBlb2YoJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdHRoaXMuY2xpY2tfb2JqID0gJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpO1xuXG5cdFx0XHR2YXIgcG9zaXRpb24gPSAkKG9iaikub2Zmc2V0KCk7XG5cdFx0XHR0aGlzLm9mZnNldF94ID0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMub2Zmc2V0X3kgPSBwb3NpdGlvbi50b3A7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeSA9IHRoaXMudG9wIC0gcG9zaXRpb24udG9wO1xuXHRcdFx0bW91c2UubW91c2VfZG93biA9IHRydWU7XG5cblx0XHRcdHRoaXMudG1wX21vdXNlX3ggPSBpbWFnZS54O1xuXHRcdFx0dGhpcy50bXBfbW91c2VfeSA9IGltYWdlLnk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR0aGlzLmxlZnQgPSBldmVudC5wYWdlWCxcblx0XHR0aGlzLnRvcCA9IGV2ZW50LnBhZ2VZXG5cdH0sXG5cblx0Ly9mdW5rY2phIHd5a29ueXdhbmEgcG9kY3phcyB3Y2nFm25pZWNpYSBwcnp5Y2lrc2t1IG15c3praSAodyB6YWxlxbxub8WbY2kgb2Qga2xpa25pxJl0ZWdvIGVsZW1lbnR1IHd5a29udWplbXkgcsOzxbxuZSByemVjenkpXG5cdG1vdXNlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0c3dpdGNoKHRoaXMuY2xpY2tfb2JqKXtcblx0XHRcdGNhc2UgJ3JpZ2h0X3Jlc2l6ZSc6XG5cdFx0XHRcdC8vcm96c3plcnphbmllIGNhbnZhc2EgdyBwcmF3b1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdHZhciBuZXdfd2lkdGggPSB0aGlzLmxlZnQgLSB0aGlzLnBhZGRpbmdfeCAtIHBvc2l0aW9uLmxlZnRcblx0XHRcdFx0aWYobmV3X3dpZHRoIDwgc2NyZWVuLndpZHRoIC0gMTAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2l6ZV93aWR0aChuZXdfd2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYm90dG9tX3Jlc2l6ZSc6XG5cdFx0XHRcdC8vem1pZW5pYW15IHd5c29rb8WbxIcgY2FudmFzYVxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdGNhbnZhcy5yZXNpemVfaGVpZ2h0KHRoaXMudG9wIC0gdGhpcy5wYWRkaW5nX3kgLSBwb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2ltYWdlX3Jlc2l6ZSc6XG5cblx0XHRcdFx0aWYoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XHQvL2FrdHVhbG5hIHBvenljamEgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHN1YnN0cmFjdCA9IGltYWdlLnggKyBpbWFnZS53aWR0aCAtIHhfYWN0dWFsICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0XHRcdFx0dmFyIGZhY29yID0gaW1hZ2Uud2lkdGggLyBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdFx0XHRpZiAoaW1hZ2Uud2lkdGggLSBzdWJzdHJhY3QgPiAxMDApe1xuXHRcdFx0XHRcdFx0aW1hZ2Uud2lkdGggLT0gc3Vic3RyYWN0O1xuXHRcdFx0XHRcdFx0aW1hZ2UuaGVpZ2h0IC09IHN1YnN0cmFjdC9mYWNvcjtcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cbiIsIi8vb2JpZWt0IG3Ds3dpxIVjeSBuYW0gbmFkIGpha8SFIGthdGVnb3JpYSBqZXN0ZcWbbXlcbnZhciBvbl9jYXRlZ29yeSA9IHtcblx0XG5cdGNhbnZhc19vZmZzZXRfdG9wIDogJCgnI2NhbnZhc193cmFwcGVyJykub2Zmc2V0KCkudG9wLFxuXHRjYW52YXNfb2Zmc2V0X2xlZnQgOiAkKCcjY2FudmFzX3dyYXBwZXInKS5vZmZzZXQoKS5sZWZ0LFxuXG5cdC8vZnVua2NqYSB6d3JhY2FqxIVjYSBha3R1YWxuxIUga2F0ZWdvcmnEmSBuYWQga3TDs3LEhSB6bmFqZHVqZSBzacSZIGt1cnNvclxuXHRnZXRfbmFtZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgbGVmdCA9IG1vdXNlLmxlZnQgLSBjYW52YXMub2Zmc2V0X2xlZnQ7XG5cdFx0dmFyIHRvcCA9IG1vdXNlLnRvcCAtIGNhbnZhcy5vZmZzZXRfdG9wO1xuXHRcdGNvbnNvbGUubG9nKGxlZnQsdG9wKTtcblx0XHR2YXIgcm93ID0gTWF0aC5jZWlsKCB0b3AgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHQvL2NvbnNvbGUubG9nKGxlZnQsdG9wLHRoaXMuY2FudmFzX29mZnNldF9sZWZ0LHRoaXMuY2FudmFzX29mZnNldF90b3ApO1xuXHRcdGlmKChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSAmJiAocm93ICUgMiAhPSAwKSl7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCAobGVmdCArIChwb2ludGVycy5zaXplLzIpKS8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICkgLSAxO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggbGVmdCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXHRcdH1cblx0XHRcblx0XHR0cnl7XG5cblx0XHRcdHZhciBjYXRlZ29yeV9udW0gPSBwb2ludGVycy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdO1xuXHRcdFx0dmFyIGNhdGVnb3J5X25hbWUgPSBsYXllcnMuY2F0ZWdvcnlfbmFtZVtjYXRlZ29yeV9udW1dO1xuXHRcdFx0Y29uc29sZS5sb2coJ3Rlc3QnLGNhdGVnb3J5X25hbWUpO1xuXG5cdFx0fVxuXHRcdGNhdGNoKGUpe1xuXHRcdFx0cmV0dXJuICdudWxsJztcblx0XHR9XG5cdFx0XG5cdFx0aWYoIGNhdGVnb3J5X25hbWUgPT0gJ3B1c3R5Jyl7XG5cdFx0XHRyZXR1cm4gJ251bGwnO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0cmV0dXJuIGNhdGVnb3J5X25hbWU7XHRcdFxuXHRcdH1cblxuXHR9XG5cbn1cbi8qXG4kKCdkb2N1bWVudCcpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cdG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfdG9wID0gO1xuXHRvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X2xlZnQgPSA7XG59KTtcblxuKi8iLCJwYWxldHMgPSB7fSIsIi8vbWVudSBwb2ludGVyXG52YXIgcG9pbnRlcnMgPSB7XG5cdHNob3dfYWxsX3BvaW50IDogdHJ1ZSxcblx0cGFkZGluZ194IDogMSxcblx0cGFkZGluZ195IDogMSxcblx0dHJhbnNsYXRlX21vZHVsbyA6IGZhbHNlLFxuXHRzaXplIDogMTAsXG5cdG1haW5fa2luZCA6ICdzcXVhcmUnLFxuXHRraW5kcyA6IEFycmF5KCdzcXVhcmUnLCdjaXJjbGUnLCdoZXhhZ29uJywnaGV4YWdvbjInKSxcblxuXHRwb2ludGVycyA6IEFycmF5KCksIC8vcG9pbnRlcnMucG9pbnRlcnNbcnphZF1ba29sdW1uYV0gOiBrYXRlZ29yaWFbbnVtZXJdXG5cblx0bGFzdF9jb2x1bW4gOiBudWxsLFx0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRsYXN0X3JvdyA6IG51bGwsXHQvL3dpZXJzeiBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblxuXG5cdC8vcnlzb3dhbmllIHdzenlzdGtpY2ggcHVua3TDs3dcblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ194O1xuXHRcdHZhciBoZWlnaHRfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ195O1xuXHRcdHZhciBub25lX2NvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCJcblxuXHRcdC8vaWYodGhpcy5zaG93X2FsbF9wb2ludCkgbm9uZV9jb2xvciA9IFwicmdiYSgxMjgsMTI4LDEyOCwxKVwiO1xuXG5cdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93Kyspe1xuXHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspe1xuXG5cdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IDApe1xuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IG5vbmVfY29sb3I7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRpZiggKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IG1lbnVfdG9wLmNhdGVnb3J5KSAmJiAobWVudV90b3AuY2F0ZWdvcnkgIT0gMCkgKXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC4yXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL3R3b3J6eW15IHRhYmxpY2UgcG9udGVyw7N3IChqZcWbbGkgamFracWbIHBvbnRlciBpc3RuaWVqZSB6b3N0YXdpYW15IGdvLCB3IHByenlwYWRrdSBnZHkgcG9pbnRlcmEgbmllIG1hIHR3b3J6eW15IGdvIG5hIG5vd28pXG5cdGNyZWF0ZV9hcnJheSA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmFjdGl2ZV9yb3cgPSBwYXJzZUludCggY2FudmFzLmhlaWdodF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHRjYW52YXMuYWN0aXZlX2NvbHVtbiA9IHBhcnNlSW50KCBjYW52YXMud2lkdGhfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cblx0XHRpZiggKHRoaXMucG9pbnRlcnMubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9yb3cpIHx8ICh0aGlzLnBvaW50ZXJzWzBdLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfY29sdW1uKSApXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd10gPT0gdW5kZWZpbmVkKSB0aGlzLnBvaW50ZXJzW3Jvd10gPSBuZXcgQXJyYXkoKTtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSB1bmRlZmluZWQpXHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlX3BvaW50IDogZnVuY3Rpb24oeSx4LHlfbGFzdCx4X2xhc3Qpe1xuXG5cdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXG5cdFx0Ly93eXpuYWN6ZW5pZSByw7N3bmFuaWEgcHJvc3RlalxuXHRcdGlmKCAoKHlfbGFzdCAhPSB5KSB8fCAoeF9sYXN0ICE9IHgpKSAmJiAoeV9sYXN0ICE9IG51bGwpICYmICh4X2xhc3QgIT0gbnVsbCkgKXtcblx0XHRcdHZhciBhID0gKHlfbGFzdCAtIHkpIC8gKHhfbGFzdCAtIHgpO1xuXHRcdFx0dmFyIGIgPSB5IC0gYSp4O1xuXG5cdFx0XHRpZih4X2xhc3QgPiB4KXtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geDtcblx0XHRcdFx0dmFyIGNvbF90byA9IHhfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgY29sX3RvID0geDtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geF9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZih5X2xhc3QgPiB5KXtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geTtcblx0XHRcdFx0dmFyIHJvd190byA9IHlfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgcm93X3RvID0geTtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geV9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcm93ID0gbnVsbDtcblx0XHRcdGZvcih2YXIgY29sID0gY29sX2Zyb207IGNvbCA8PSBjb2xfdG87IGNvbCsrKVxuXHRcdFx0e1xuXHRcdFx0XHRyb3cgPSBwYXJzZUludCggYSpjb2wrYiApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMocm93KSkgcm93ID0geTtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGNvbCA9IG51bGw7XG5cdFx0XHRmb3IodmFyIHJvdyA9IHJvd19mcm9tOyByb3cgPD0gcm93X3RvOyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Y29sID0gcGFyc2VJbnQoIChyb3ctYikvYSApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMoY29sKSkgY29sID0geDtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHR9XG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
