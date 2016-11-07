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
	update_text : function(){

		if((on_category.name != "") && (on_category.name != 'null')){

			var tmp_row = null;
			var find = 0;
			for( var i_row = 0, i_row_max = excel.data.length; i_row < i_row_max; i_row++ ){
				if(String(on_category.name).toLowerCase() == String(excel.data[i_row][layers.category[layers.active]]).toLowerCase()){
					
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

		if(typeof data[0][8] == undefined){
			pointers.color_border = "#000";
		}else{
			pointers.color_border = data[0][8];
		}

		if(typeof data[0][9] == undefined){
			pointers.show_border = false;
		}else{
			pointers.show_border = data[0][9];
		}

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

	},

  square_border : function(data){

    if(data.border.top){
      canvas.context.fillRect(
        data.x-data.line_width_x,
        data.y-data.line_width_y,
        data.size+2*data.line_width_x,
        data.line_width_y
      );
    }

    if(data.border.top_left){
      canvas.context.fillRect(
        data.x,
        data.y-data.line_width_y,
        Math.ceil(data.size/2),
        data.line_width_y
      );
    }

    if(data.border.top_right){
      canvas.context.fillRect(
        data.x+Math.floor(data.size/2),
        data.y-data.line_width_y,
        Math.ceil(data.size/2)+data.line_width_x,
        data.line_width_y
      );
    }

    if(data.border.right){
      canvas.context.fillRect(
        data.x+data.size,
        data.y-data.line_width_y,
        data.line_width_x,
        data.size+2*data.line_width_y
        );
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
  on_category.set();
  cloud.update_text(); 
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
	name : null,
	number : null,

	//funkcja zwracająca aktualną kategorię nad którą znajduje się kursor
	set : function(){

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
			this.name = null;
			this.number = null;
		}
		
		if((category_name == 'pusty') || (category_name == 'gumuj')){
			this.name = null;
			this.number = null;
		} 
		else{

			this.name = category_name;
			this.number = category_num;
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
	show_border : false,
	color_border: '#333',
	translate_modulo : false,
	size : 10,
	main_kind : 'square',
	kinds : Array('square','circle','hexagon','hexagon2'),

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

var source = {
  show : function(){
    //console.log( layers.source );
    $('#source').html( layers.source ); 
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyIsInNvdXJjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSkE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImVtYmVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9jenlzemN6ZW5pZSBpIHJ5c293YW5pZSBwbyBjYW52YXNpZVxudmFyIGNhbnZhcyA9IHtcblx0XG5cdHNjYWxlIDogMTAwLFxuXHR3aWR0aF9jYW52YXMgOiA3MDAsXG5cdGhlaWdodF9jYW52YXMgOiA0MDAsXG5cdGNhbnZhcyA6IG51bGwsXG5cdGNvbnRleHQgOiBudWxsLFxuXHR0aHVtYm5haWwgOiBudWxsLFxuXHR0aXRsZV9wcm9qZWN0IDogJ25vd3kgcHJvamVrdCcsXG5cblx0Y29udGV4dF94IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfeSA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeVxuXHRjb250ZXh0X25ld194IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X25ld195IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeVxuXG5cdG9mZnNldF9sZWZ0IDogbnVsbCxcblx0b2Zmc2V0X3RvcCA6IG51bGwsXG5cdGFjdGl2ZV9yb3cgOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXHRhY3RpdmVfY29sdW1uIDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblxuXHR0aHVtYm5haWwgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5fY2FudmFzXCIpO1xuXHRcdHZhciBkYXRhVVJMID0gY2FudmFzLnRvRGF0YVVSTCgpO1xuXHRcdGNvbnNvbGUubG9nKGRhdGFVUkwpO1xuXHR9LFxuXG5cdC8vcnlzdWplbXkgY2FudmFzIHplIHpkasSZY2llbVxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHQvL2NvbnNvbGUubG9nKCdjYW52YXMgZHJhdycpO1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGlmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkgIGltYWdlLmRyYXcoKTtcblx0fSxcblxuXHRkcmF3X3RodW1uYWlsIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy50aHVtYm5haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdH0sXG5cblx0Ly9yZXNldHVqZW15IHTFgm8gemRqxJljaWFcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHR9LFxuXG5cdC8vIGN6ecWbY2lteSBjYcWCZSB6ZGrEmWNpZSBuYSBjYW52YXNpZVxuXHRjbGVhciA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0XHQvL3RoaXMuY29udGV4dC5maWxsUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0fSxcblxuXHRyZXNpemVfd2lkdGggOiBmdW5jdGlvbihuZXdfd2lkdGgpe1xuXHRcdHRoaXMud2lkdGhfY2FudmFzID0gbmV3X3dpZHRoO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyx0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IHRoaXMud2lkdGhfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwodGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlICsgJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0fSxcblxuXHRyZXNpemVfaGVpZ2h0IDogZnVuY3Rpb24obmV3X2hlaWdodCl7XG5cdFx0dGhpcy5oZWlnaHRfY2FudmFzID0gbmV3X2hlaWdodDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3MoeydoZWlnaHQnOiB0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwodGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSsnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpOyAvLyBha3R1YWxpenVqZW15IGRhbmUgb2Rub8WbbmllIHJvem1pYXLDs3cgY2FudmFzYSB3IG1lbnUgdSBnw7NyeVxuXHRcdC8vdGhpcy5kcmF3KCk7IC8vcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0fSxcblxuXHRzZXRfZGVmYXVsdCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cblx0XHRjYW52YXMuc2NhbGUgPSAxMDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdC8vY2FudmFzLmRyYXcoKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0XHQvL2NhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IGthdGVnb3JpaSBkb2RhbmllIC8gYWt0dWFsaXphY2phIC8gdXN1bmnEmWNpZSAvIHBva2F6YW5pZSBrYXRlZ29yaWlcbnZhciBjYXRlZ29yaWVzID0ge307XG4vKlx0XG5cblx0Ly9jYXRlZ29yeSA6IG5ldyBBcnJheShbJ3B1c3R5JywnIzgwODA4MCddKSxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBuYW1lID0gQXJyYXkoJCgnI2NhdGVnb3J5X2JveCBpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykudmFsKCksJyNmZjAwMDAnKTtcblx0XHQkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoJycpO1xuXG5cdFx0dGhpcy5jYXRlZ29yeS5wdXNoKG5hbWUpO1xuXHRcdG1lbnVfdG9wLmNhdGVnb3J5ID0gKHRoaXMuY2F0ZWdvcnkubGVuZ3RoLTEpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblx0dXBkYXRlIDogZnVuY3Rpb24oaW5kZXgsbmFtZSl7XG5cdFx0dGhpcy5jYXRlZ29yeVtpbmRleF1bMF0gPSBuYW1lO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblxuXHQvL2FrdHVhbGl6dWplbXkgdGFibGljxJkga29sb3LDs3dcblx0dXBkYXRlX2NvbG9yIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vbW/FvGxpd2EgYWt0dWFsaXphY2phIGplZHluaWUgdyBwcnp5cGFka3Ugd3licmFuaWEga29ua3JldG5laiBrb2x1bW55IHdhcnRvxZtjaSBpIGthdGVnb3JpaSB3IGV4Y2VsdVxuXHRcdGlmKChjcnVkLm1hcF9qc29uLmxlbmd0aCA+IDApICYmIChleGNlbC5kYXRhLmxlbmd0aCA+IDApICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcblxuXHRcdFx0Zm9yICh2YXIgaV9jYXRlZ29yeSA9IDAsIGlfY2F0ZWdvcnlfbWF4ID1cdGxheWVycy5jYXRlZ29yeV9uYW1lLmxlbmd0aDsgaV9jYXRlZ29yeSA8IGlfY2F0ZWdvcnlfbWF4OyBpX2NhdGVnb3J5Kyspe1xuXHRcdFx0XHR2YXIgbmFtZSA9IGxheWVycy5jYXRlZ29yeV9uYW1lW2lfY2F0ZWdvcnldO1xuXG5cdFx0XHRcdGZvciAodmFyIGlfZXhlbCA9IDAsIGlfZXhlbF9tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaV9leGVsIDwgaV9leGVsX21heDsgaV9leGVsKyspe1xuXHRcdFx0XHRcdGlmKCBleGNlbC5kYXRhW2lfZXhlbF1bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSA9PSBuYW1lKXtcblx0XHRcdFx0XHRcdC8vamXFm2xpIHpuYWxlxbpsacWbbXkga2F0ZWdvcmnEmSB3IGV4Y2VsdVxuXHRcdFx0XHRcdFx0dmFyIHZhbHVlID0gZXhjZWwuZGF0YVtpX2V4ZWxdW2xheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXV07XG5cblx0XHRcdFx0XHRcdGZvciAoIHZhciBpX2xlZ2VuZHMgPSAwLCBpX2xlZ2VuZHNfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpX2xlZ2VuZHMgPCBpX2xlZ2VuZHNfbWF4OyBpX2xlZ2VuZHMrKyApe1xuXHRcdFx0XHRcdFx0XHRpZiggKHZhbHVlID49IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2lfbGVnZW5kc11bMF0pICYmICh2YWx1ZSA8PSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNdWzFdKSApe1xuXHRcdFx0XHRcdFx0XHRcdC8vamXFm2xpIHpuYWxlxbpsaXNteVxuXHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbbGF5ZXJzLmFjdGl2ZV1baV9jYXRlZ29yeV0gPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNdWzNdO1xuXHRcdFx0XHRcdFx0XHRcdGlfbGVnZW5kcyA9IGlfbGVnZW5kc19tYXg7XG5cdFx0XHRcdFx0XHRcdFx0aV9leGVsID0gaV9leGVsX21heDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvL2plxZtsaSB3YXJ0b8WbxIcgd3ljaG9kemkgcG96YSBza2FsZSB1IHRhayBwcnp5cGlzdWplbXkgamVqIG9kcG93aWVkbmkga29sb3Jcblx0XHRcdFx0XHRcdGlmKHZhbHVlIDwgbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1bMF1bMF0pe1xuXHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2xheWVycy5hY3RpdmVdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1bMF1bM107XG5cdFx0XHRcdFx0XHR9XHRcblxuXHRcdFx0XHRcdFx0aWYodmFsdWUgPiBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpX2xlZ2VuZHNfbWF4LTFdWzFdKXtcblx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2lfbGVnZW5kc19tYXgtMV1bM107XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL3BvIHpha3R1YWxpem93YW5pdSBrb2xvcsOzdyB3IGthdGVnb3JpYWNoIHJ5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdFx0Y2FudmFzLmRyYXcoKTtcblxuXG5cdH0sXG59Ki9cbiIsImNsb3VkID0ge1xuXG5cdHNldF90ZXh0YXJlYSA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2Nsb3VkIC5jbG91ZF90ZXh0JykudmFsKCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0fSxcblxuXHQvL3VzdGF3aWFteSBwb3ByYXduxIUgcG96eWNqxJkgZHlta2Fcblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgbGVmdCA9IG1vdXNlLmxlZnQgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X2xlZnQ7XG5cdFx0dmFyIHRvcCA9IG1vdXNlLnRvcCAtIG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfdG9wO1xuXHRcdHZhciB3aWR0aCA9ICQoXCIjY2FudmFzX2Nsb3VkXCIpLndpZHRoKCk7XG5cblx0XHRpZigobGVmdCArIHdpZHRoKSA+ICQoXCJib2R5XCIpLndpZHRoKCktMjApe1xuXHRcdFx0bGVmdCA9IGxlZnQgLSB3aWR0aC0yMDtcblx0XHR9XG5cbiBcblx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5jc3Moe3RvcDpwYXJzZUludCh0b3AgLSAkKFwiI2NhbnZhc19jbG91ZFwiKS5oZWlnaHQoKSkrJ3B4JyxsZWZ0OmxlZnQrJ3B4J30pO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB3ecWbd2lldGxlbmllIGR5bWthIHogb2Rwb3dpZWRuacSFIHphd2FydG/Fm2NpxIVcblx0dXBkYXRlX3RleHQgOiBmdW5jdGlvbigpe1xuXG5cdFx0aWYoKG9uX2NhdGVnb3J5Lm5hbWUgIT0gXCJcIikgJiYgKG9uX2NhdGVnb3J5Lm5hbWUgIT0gJ251bGwnKSl7XG5cblx0XHRcdHZhciB0bXBfcm93ID0gbnVsbDtcblx0XHRcdHZhciBmaW5kID0gMDtcblx0XHRcdGZvciggdmFyIGlfcm93ID0gMCwgaV9yb3dfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfcm93IDwgaV9yb3dfbWF4OyBpX3JvdysrICl7XG5cdFx0XHRcdGlmKFN0cmluZyhvbl9jYXRlZ29yeS5uYW1lKS50b0xvd2VyQ2FzZSgpID09IFN0cmluZyhleGNlbC5kYXRhW2lfcm93XVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dKS50b0xvd2VyQ2FzZSgpKXtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR0aGlzLnNldF9wb3NpdGlvbigpO1xuXHRcdFx0XHRcdHZhciB0ZXh0X3RtcCA9IGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXTtcblxuXHRcdFx0XHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0XHRcdHRleHRfdG1wID0gdGV4dF90bXAucmVwbGFjZSgneycrZXhjZWwuZGF0YVswXVtpXSsnfScsZXhjZWwuZGF0YVtpX3Jvd11baV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvL2RvcGllcm8gamXFm2xpIGR5bWVrIG1hIG1pZcSHIGpha2HFmyBrb25rcmV0bsSFIHphd2FydG/Fm8SHIHd5xZt3aWV0bGFteSBnb1xuXHRcdFx0XHRcdGlmKCh0ZXh0X3RtcCE9XCJcIikgJiYgKCBleGNlbC5kYXRhW2lfcm93XVtsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV1dICE9IG51bGwgKSl7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlSW4oMCk7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5odG1sKHRleHRfdG1wKTtcblx0XHRcdFx0XHRcdGZpbmQgPSAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2plxZtsaSBuaWUgem5hbGV6aW9ubyBvZHBvd2llZG5pZWoga2F0ZWdvcmlpXG5cdFx0XHRpZiAoIWZpbmQpIHsgXG5cdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMCk7XG5cdFx0fVxuXHR9XG5cbn1cbiIsIi8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB0d29yemVuaWUgemFwaXN5d2FuaWUgaSBha3R1YWxpemFjamUgZGFueWNoIGRvdHljesSFxIdjeWggbWFweVxuLy92YXIgY3J1ZCA9IGNydWQgfHwge31cbmNydWQgPSB7XG5cblx0bWFwX2pzb24gOiBBcnJheSgpLCAvL2fFgsOzd25hIHptaWVubmEgcHJ6ZWNob3d1asSFY2Egd3N6eXN0a2llIGRhbmVcblx0bWFwX2hhc2ggOm51bGwsXG5cdGxheWVycyA6IHt9LFxuXHRleGNlbCA6IEFycmF5KCksXG5cdHByb2plY3QgOiB7fSxcblx0cHJvamVjdF9oYXNoIDogcHJvamVjdF9oYXNoLCAvL2fFgsOzd255IGhhc2ggZG90eWN6xIVjeSBuYXN6ZWdvIHByb2pla3R1XG4gXG5cdC8vd2N6eXRhbmllIHptaWVubnljaCBkbyBvYmlla3TDs3cgbWFweVxuXG5cdHNldF9tYXAgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vcG8gemFwaXNhbml1IGRhbnljaCBkbyBiYXp5IGFrdHVhbGl6dWplbXkgaWQgKHcgcHJ6eXBhZGt1IGplxZtsaSBpc3RuaWVqZSBuYWRwaXN1amVteSBqZSlcblx0XHR0aGlzLm1hcF9qc29uID0gZGF0YTtcblxuXHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gZGF0YVswXVswXTtcblx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gZGF0YVswXVsxXTtcblx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSBkYXRhWzBdWzJdO1xuXHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IGRhdGFbMF1bM107XG5cdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IGRhdGFbMF1bNF07XG5cdFx0cG9pbnRlcnMuc2l6ZSA9IGRhdGFbMF1bNV07XG5cdFx0cG9pbnRlcnMubWFpbl9raW5kID0gZGF0YVswXVs2XTtcblx0XHRjYW52YXMudGl0bGVfcHJvamVjdCA9IGRhdGFbMF1bN107XG5cblx0XHRpZih0eXBlb2YgZGF0YVswXVs4XSA9PSB1bmRlZmluZWQpe1xuXHRcdFx0cG9pbnRlcnMuY29sb3JfYm9yZGVyID0gXCIjMDAwXCI7XG5cdFx0fWVsc2V7XG5cdFx0XHRwb2ludGVycy5jb2xvcl9ib3JkZXIgPSBkYXRhWzBdWzhdO1xuXHRcdH1cblxuXHRcdGlmKHR5cGVvZiBkYXRhWzBdWzldID09IHVuZGVmaW5lZCl7XG5cdFx0XHRwb2ludGVycy5zaG93X2JvcmRlciA9IGZhbHNlO1xuXHRcdH1lbHNle1xuXHRcdFx0cG9pbnRlcnMuc2hvd19ib3JkZXIgPSBkYXRhWzBdWzldO1xuXHRcdH1cblxuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ194XCJdJykudmFsKCBkYXRhWzBdWzJdICk7XG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3lcIl0nKS52YWwoIGRhdGFbMF1bM10gKTtcblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInNpemVfcG9pbnRlclwiXScpLnZhbCggZGF0YVswXVs1XSApO1xuXHRcdCQoJ2lucHV0W25hbWU9XCJ0aXRsZV9wcm9qZWN0XCJdJykudmFsKCBkYXRhWzBdWzddICk7XG5cblx0XHRpZiggZGF0YVswXVs0XSApe1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdH1cblxuXHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmh0bWwoJycpO1xuXG5cdFx0cG9pbnRlcnMua2luZHMuZm9yRWFjaChmdW5jdGlvbihraW5kKXtcblxuXHRcdFx0aWYoa2luZCA9PSBkYXRhWzBdWzZdKXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIHNlbGVjdGVkPVwic2VsZWN0ZWRcIiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgbyBwb2ludGVyYWNoXG5cdFx0cG9pbnRlcnMucG9pbnRlcnMgPSBkYXRhWzFdO1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIGthdGVnb3JpYWNoXG5cdFx0dmFyIGNhdGVnb3JpZXMgPSB7fTtcblx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5ID0gZGF0YVsyXTtcblxuXG5cdFx0Ly9wbyB3Y3p5dGFuaXUgbWFweSBha3R5YWxpenVqZW15IGRhbmUgZG90eWN6xIVjxIUga2F0ZWdvcmlpIGkga29sb3LDs3dcblx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzWzBdID0gW107XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X25hbWUgPSBbXTtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gY2F0ZWdvcmllcy5jYXRlZ29yeS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGxheWVycy5jYXRlZ29yeV9uYW1lLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVswXSk7XG5cdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzWzBdLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVsxXSk7XG5cdFx0fVxuXG5cdFx0Ly9wb2JpZXJhbmllIGRhbnljaCBvIHpkasSZY2l1IGplxbxlbGkgaXN0bmllamVcblx0XHRpZiggZGF0YVszXS5sZW5ndGggPiAyKXtcblx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0aW1hZ2Uub2JqLnNyYyA9IGRhdGFbM11bMF07XG5cdFx0XHRpbWFnZS54ID0gcGFyc2VJbnQoIGRhdGFbM11bMV0gKTtcblx0XHRcdGltYWdlLnkgPSBwYXJzZUludCggZGF0YVszXVsyXSApO1xuXHRcdFx0aW1hZ2Uud2lkdGggPSBwYXJzZUludCggZGF0YVszXVszXSApO1xuXHRcdFx0aW1hZ2UuaGVpZ2h0ID0gcGFyc2VJbnQoIGRhdGFbM11bNF0gKTtcblx0XHRcdGltYWdlLmFscGhhID0gcGFyc2VJbnQoIGRhdGFbM11bNV0gKTtcblxuXHRcdFx0Ly96YXpuYWN6ZW5pZSBvZHBvd2llZG5pZWdvIHNlbGVjdGEgYWxwaGEgdyBtZW51IHRvcFxuXHRcdFx0JCgnI2FscGhhX2ltYWdlIG9wdGlvbltuYW1lPVwiJytcdGltYWdlLmFscGhhICsnXCJdJykuYXR0cignc2VsZWN0ZWQnLHRydWUpO1xuXG5cdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7IGNhbnZhcy5kcmF3KCk7IH07XG5cdFx0fVxuXG5cdFx0Ly96YWt0dWFsaXpvd2FuaWUgZGFueWNoIHcgaW5wdXRhY2hcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsIGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JywgY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzpjYW52YXMud2lkdGhfY2FudmFzKydweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMrJ3B4J30pO1xuXG5cdFx0Ly9jYW52YXMuZHJhdygpO1xuXG5cdH0sXG5cblx0c2V0X3Byb2plY3QgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vd2N6eXR1amVteSBkYW5lIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMuc2V0X21hcCggSlNPTi5wYXJzZShkYXRhLm1hcF9qc29uKSApO1xuXHRcdGV4Y2VsLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEuZXhjZWwpO1xuXG5cdFx0ZGF0YS5wcm9qZWN0ID0gSlNPTi5wYXJzZShkYXRhLnByb2plY3QpOyAgXG5cdFx0ZGF0YS5sYXllcnMgPSBKU09OLnBhcnNlKGRhdGEubGF5ZXJzKTsgXG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIHByb2pla3R1XG5cdFx0bGF5ZXJzLnBhbGV0c19hY3RpdmUgPSBkYXRhLmxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdGxheWVycy52YWx1ZSA9IGRhdGEubGF5ZXJzLnZhbHVlO1xuXHRcdGxheWVycy5jb2xvcnNfcG9zID0gZGF0YS5sYXllcnMuY29sb3JzX3Bvcztcblx0XHRsYXllcnMuY29sb3JzX2FjdGl2ZSA9IGRhdGEubGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0bGF5ZXJzLm1pbl92YWx1ZSA9IGRhdGEubGF5ZXJzLm1pbl92YWx1ZTtcblx0XHRsYXllcnMubWF4X3ZhbHVlID0gZGF0YS5sYXllcnMubWF4X3ZhbHVlO1xuXHRcdGxheWVycy5jbG91ZCA9IGRhdGEubGF5ZXJzLmNsb3VkO1xuXHRcdGxheWVycy5jbG91ZF9wYXJzZXIgPSBkYXRhLmxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0bGF5ZXJzLmxlZ2VuZHMgPSBkYXRhLmxheWVycy5sZWdlbmRzO1xuXHRcdGxheWVycy5sYWJlbHMgPSBkYXRhLmxheWVycy5sYWJlbHM7XG5cdCBcdGxheWVycy5jYXRlZ29yeSA9IFx0ZGF0YS5sYXllcnMuY2F0ZWdvcnk7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZSA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0bGF5ZXJzLmxpc3QgPSBkYXRhLmxheWVycy5saXN0O1xuXG5cdFx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRcdGxheWVycy5wcm9qZWN0X25hbWUgPSBkYXRhLnByb2plY3QubmFtZTtcblx0XHRsYXllcnMuc291cmNlID0gZGF0YS5wcm9qZWN0LnNvdXJjZTtcblxuXHRcdC8vY29uc29sZS5sb2coIGRhdGEubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyApO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cInByb2plY3RfbmFtZVwiXScpLnZhbChsYXllcnMucHJvamVjdF9uYW1lKTtcblxuXHRcdGxlZ2VuZHMuc2hvdygpOyBcblx0XHRsYWJlbHMuc2hvdygpO1xuXHRcdGxheWVycy5zaG93KCk7XG5cdFx0c291cmNlLnNob3coKTtcblxuXHRcdHZhciBvZmZzZXQgPSAkKCcjY2FudmFzX2JveCcpLm9mZnNldCgpO1xuICBcdGNhbnZhcy5vZmZzZXRfbGVmdCA9IG9mZnNldC5sZWZ0O1xuICBcdGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuXHR9LFxuXG5cdC8vcG9iaWVyYW5pZSBwcm9qZWt0dSB6IGJhenkgZGFueWNoIGkgd2N6eXRhbmllXG5cdGdldF9wcm9qZWN0IDogZnVuY3Rpb24oKXtcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiAnL2FwaS9wcm9qZWN0LycgKyBjcnVkLnByb2plY3RfaGFzaCxcblx0XHQgIHR5cGU6IFwiR0VUXCIsXG5cdFx0ICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKGZ1bmN0aW9uKCBkYXRhICkgeyBjcnVkLnNldF9wcm9qZWN0KCBkYXRhLmRhdGEgKTsgIH0pO1xuXHR9XG5cbn1cbiIsInZhciBleGNlbCA9IHt9OyAgICBcbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cblx0fSxcblxuICBzcXVhcmVfYm9yZGVyIDogZnVuY3Rpb24oZGF0YSl7XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3Ape1xuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueC1kYXRhLmxpbmVfd2lkdGhfeCxcbiAgICAgICAgZGF0YS55LWRhdGEubGluZV93aWR0aF95LFxuICAgICAgICBkYXRhLnNpemUrMipkYXRhLmxpbmVfd2lkdGhfeCxcbiAgICAgICAgZGF0YS5saW5lX3dpZHRoX3lcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS5ib3JkZXIudG9wX2xlZnQpe1xuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueCxcbiAgICAgICAgZGF0YS55LWRhdGEubGluZV93aWR0aF95LFxuICAgICAgICBNYXRoLmNlaWwoZGF0YS5zaXplLzIpLFxuICAgICAgICBkYXRhLmxpbmVfd2lkdGhfeVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3BfcmlnaHQpe1xuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueCtNYXRoLmZsb29yKGRhdGEuc2l6ZS8yKSxcbiAgICAgICAgZGF0YS55LWRhdGEubGluZV93aWR0aF95LFxuICAgICAgICBNYXRoLmNlaWwoZGF0YS5zaXplLzIpK2RhdGEubGluZV93aWR0aF94LFxuICAgICAgICBkYXRhLmxpbmVfd2lkdGhfeVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci5yaWdodCl7XG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K2RhdGEuc2l6ZSxcbiAgICAgICAgZGF0YS55LWRhdGEubGluZV93aWR0aF95LFxuICAgICAgICBkYXRhLmxpbmVfd2lkdGhfeCxcbiAgICAgICAgZGF0YS5zaXplKzIqZGF0YS5saW5lX3dpZHRoX3lcbiAgICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8vZ8WCw7N3bmUgemRqxJljaWUgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbnZhciBpbWFnZSA9IHtcblx0b2JqIDogdW5kZWZpbmVkLFxuXHR4IDogbnVsbCxcblx0eSA6IG51bGwsXG5cdHdpZHRoIDogbnVsbCxcblx0aGVpZ2h0IDogbnVsbCxcblx0YWxwaGEgOiAxMCwgXG5cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhLzEwO1xuXHRcdGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLm9iaix0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpO1xuXG5cdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmNzcyh7J2hlaWdodCc6dGhpcy5oZWlnaHQsJ3RvcCc6dGhpcy55KydweCcsJ2xlZnQnOih0aGlzLngrdGhpcy53aWR0aCkrJ3B4J30pO1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcblx0fSxcblxuXHQvL2Z1bmtjamEgcG9tb2NuaWN6YSBrb253ZXJ0dWrEhWNhIGRhdGFVUkkgbmEgcGxpa1xuXHRkYXRhVVJJdG9CbG9iIDogZnVuY3Rpb24oZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheS5wdXNoKGJpbmFyeS5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7dHlwZTogJ2ltYWdlL3BuZyd9KTtcblx0fVxuXG59XG4iLCJ2YXIgZGF0YV9pbnB1dCA9IHtcblxuXHQvL3BvYmllcmFuaWUgaW5mb3JtYWNqaSB6IGlucHV0w7N3IGkgemFwaXNhbmllIGRvIG9iaWVrdHUgbWFwX3N2Z1xuXHRnZXQgOiBmdW5jdGlvbigpe1xuXHRcdG1hcC5uYW1lID0gJCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCk7XG5cdFx0bWFwLnBhdGggPSAkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoKS5yZXBsYWNlKC9cIi9nLCBcIidcIik7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fSxcblxuXHQvL3BvYnJhbmllIGluZm9ybWFjamkgeiBvYmlla3R1IG1hcF9zdmcgaSB6YXBpc2FuaWUgZG8gaW5wdXTDs3dcblx0c2V0IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoIG1hcC5uYW1lICk7XG5cdFx0JCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCBtYXAucGF0aCApO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH1cblxufVxuIiwibGFiZWxzID0ge1xuXHRzaG93IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbGFiZWxzJykuaHRtbCggbGF5ZXJzLmxhYmVsc1tsYXllcnMuYWN0aXZlXSApO1xuXHR9XG59IiwidmFyIGxheWVycyA9IHtcblxuXHRsaXN0IDogWyd6YWvFgmFka2EgMSddLFxuXHRhY3RpdmUgOiAwLFxuXG5cdC8vdGFibGljYSB6IHBvZHN0YXdvd3l3bWkgZGFueW1pIHphZ3JlZ293YW55bWkgZGxhIGthxbxkZWogd2Fyc3R3eVxuXHRwYWxldHNfYWN0aXZlIDogWzBdLCBcblxuXHR2YWx1ZSA6IFstMV0sXG5cdGNvbG9yc19wb3MgOiBbWzEsMSwxLDEsMSwxLDEsMSwxXV0sXG5cdGNvbG9yc19hY3RpdmUgOiBbW1wiI2Y3ZmNmZFwiLCBcIiNlNWY1ZjlcIiwgXCIjY2NlY2U2XCIsIFwiIzk5ZDhjOVwiLCBcIiM2NmMyYTRcIiwgXCIjNDFhZTc2XCIsIFwiIzIzOGI0NVwiLCBcIiMwMDZkMmNcIiwgXCIjMDA0NDFiXCJdXSxcblx0bWluX3ZhbHVlIDogWzBdLFxuXHRtYXhfdmFsdWUgOiBbMF0sXG5cdGNsb3VkIDogW1wiXCJdLFxuXHRjbG91ZF9wYXJzZXIgOiBbXCJcIl0sXG5cdGxlZ2VuZHMgOiBbW11dLFxuXHRsYWJlbHMgOiBbXCJcIl0sXG5cdGNhdGVnb3J5IDogWy0xXSxcblx0Y2F0ZWdvcnlfY29sb3JzIDogW10sXG5cdGNhdGVnb3J5X25hbWUgOiBbXSxcblxuXHQvL3ptaWVubmUgZ2xvYmFsbmUgZG90eWN6xIVjZSBjYcWCZWdvIHByb2pla3R1XG5cdHByb2plY3RfbmFtZSA6ICdub3d5IHByb2pla3QnLFxuXHRzb3VyY2UgOiAnJyxcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblxuXHRcdGlmKCB0aGlzLmxpc3QubGVuZ3RoID4gMSApe1xuXHRcdFx0dmFyIGh0bWwgPSBcIlwiO1xuXHRcdFx0aHRtbCArPSAnPHNwYW4gbnVtPVwiJyswKydcIiBjbGFzcz1cImFjdGl2ZVwiPicgKyB0aGlzLmxpc3RbMF0gKyAnPC9zcGFuPic7XG5cdFx0XHRcblx0XHRcdGZvcih2YXIgaSA9IDEsIGlfbWF4ID0gdGhpcy5saXN0Lmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRodG1sICs9ICc8c3BhbiBudW09XCInK2krJ1wiPicgKyB0aGlzLmxpc3RbaV0gKyAnPC9zcGFuPic7XG5cdFx0XHR9XG5cblx0XHRcdCQoJyNhcmVhJykuaHRtbChodG1sKTtcblx0XHRcdCQoJyNhcmVhIHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBsYXllcnMuc2VsZWN0KHRoaXMpOyB9KTtcblx0XHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JCgnI2FyZWEnKS5jc3MoJ2Rpc3BsYXknLCdub25lJyk7XG5cdFx0fVxuXG5cdH0sXG5cblx0c2VsZWN0IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdCQoJyNhcmVhIHNwYW4nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0JChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuXHRcdGNvbnNvbGUubG9nKG9iaik7XG5cblx0XHRsYXllcnMuYWN0aXZlID0gJChvYmopLmluZGV4KCk7XG5cblx0XHRsZWdlbmRzLnNob3coKTsgXG5cdFx0bGFiZWxzLnNob3coKTtcblx0XHQvL2xheWVycy5zaG93KCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0XG5cdH1cbn0iLCIvL29iaWVrdCBkb3R5Y3rEhXN5IHd5c3dpZXRsYW5pYSBha3V0YWxpemFjamkgaSBlZHljamkgcGFuZWx1IGxlZ2VuZFxubGVnZW5kcyA9IHtcblx0Ly93ecWbd2lldGxhbXkgd3N6eXN0a2llIGxlZ2VuZHkgdyBwYW5lbHUgbWFwXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuICBcdFx0dmFyIGh0bWwgPSBcIlwiO1xuICBcdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgXHRcdFx0aHRtbCArPSBcIjxkaXY+IDxzcGFuIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzNdK1wiJz48L3NwYW4+PHNwYW4+XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMl0rXCI8L3NwYW4+PC9kaXY+XCI7XG4gIFx0XHR9XG4gICAgICAkKCcjbGVnZW5kcycpLmh0bWwoaHRtbCk7XG5cdH1cbn0iLCIvKlxuICAgIF9fX18gICBfX19fIF9fX18gICAgX18gIF9fXyBfX18gICAgIF9fX18gICAgIF9fX19fICAgIF9fX18gXG4gICAvIF9fICkgLyAgXy8vIF9fIFxcICAvICB8LyAgLy8gICB8ICAgLyBfXyBcXCAgIHxfXyAgLyAgIC8gX18gXFxcbiAgLyBfXyAgfCAvIC8gLyAvIC8gLyAvIC98Xy8gLy8gL3wgfCAgLyAvXy8gLyAgICAvXyA8ICAgLyAvIC8gL1xuIC8gL18vIC9fLyAvIC8gL18vIC8gLyAvICAvIC8vIF9fXyB8IC8gX19fXy8gICBfX18vIC9fIC8gL18vIC8gXG4vX19fX18vL19fXy8gXFxfX19cXF9cXC9fLyAgL18vL18vICB8X3wvXy8gICAgICAgL19fX18vKF8pXFxfX19fLyAgXG5cbnZhcnNpb24gMy4wIGJ5IE1hcmNpbiBHxJliYWxhXG5cbmxpc3RhIG9iaWVrdMOzdzpcblxuIGNhbnZhcyA9IGNhbnZhcygpIC0gb2JpZWt0IGNhbnZhc2FcbiBjcnVkID0gY3J1ZCgpIC0gb2JpZWt0IGNhbnZhc2FcbiBpbWFnZSA9IGltYWdlKCkgLSBvYmlla3QgemRqxJljaWEgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbiBtb3VzZSA9IG1vdXNlKClcbiBtb2RlbHMgPSBtb2RlbHMoKVxuIGdsb2JhbCA9IGdsb2JhbCgpIC0gZnVua2NqZSBuaWUgcHJ6eXBpc2FueSBkbyBpbm55Y2ggb2JpZWt0w7N3XG4gY2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMoKVxuIHBvaW50ZXJzID0gcG9pbnRlcnMoKVxuIGNvbG9ycGlja2VyID0gY29sb3JwaWNrZXIoKVxuIG1lbnVfdG9wID0gbWVudV90b3AoKVxuIGZpZ3VyZXMgPSBmaWd1cmVzKClcblxuKi9cbiAgXG4vL3BvIGtsaWtuacSZY2l1IHptaWVuaWF5IGFrdHVhbG55IHBhbmVsXG4kKCcuYm94ID4gdWwgPiBsaScpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9ib3godGhpcykgfSk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0XHQvL3ByenlwaXNhbmllIHBvZHN0YXdvd293eWNoIGRhbnljaCBkbyBvYmlla3R1IGNhbnZhc1xuXHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5fY2FudmFzJyk7XG4gIGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBjYW52YXMud2lkdGhfY2FudmFzID0gcGFyc2VJbnQoICQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJykgKTtcbiAgY2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JykgKTtcbiAgdmFyIG9mZnNldCA9ICQoJyNjYW52YXNfYm94Jykub2Zmc2V0KCk7XG4gIGNhbnZhcy5vZmZzZXRfbGVmdCA9IG9mZnNldC5sZWZ0O1xuICBjYW52YXMub2Zmc2V0X3RvcCA9IG9mZnNldC50b3A7XG5cbiAgLy90d29yenlteSB0YWJsaWNlIHBvaW50ZXLDs3dcblx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cblx0Ly9vZHpuYWN6ZW5pZSBzZWxlY3RhIHByenkgem1pYW5pZVxuXHQvLyQvLygnI2NoYW5nZV9jYXRlZ29yeScpLmNoYW5nZShmdW5jdGlvbigpeyAkKCcjY2hhbmdlX2NhdGVnb3J5JykuYmx1cigpOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHB1c2N6ZW5pYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgbW91c2UubW91c2VfZG93biA9IGZhbHNlOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHdjacWbbmnEmWNpYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cdFxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vxYJhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7XG5cdFxuXHR9KTtcblxuXHQvL3d5d2/FgmFuaWUgZnVua2NqaSBwb2RjemFzIHBvcnVzemFuaWEgbXlzemvEhVxuXHQkKGRvY3VtZW50KS5tb3VzZW1vdmUoZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0aWYobW91c2UubW91c2VfZG93bikgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblx0XHRpZihtZW51X3RvcC5hdXRvX2RyYXcpeyBtb3VzZS5jbGlja19vYmogPSBcImNhbnZhc1wiOyBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO31cblx0XG5cdH0pO1xuXG5cdCQoJyNtYWluX2NhbnZhcycpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7Ly96YXJlamVzdHJvd2FuaWUgb2JpZWt0dXcgIGt0w7NyeSBrbGlrYW15XG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0bW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblxuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7XG5cblx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdFx0cG9pbnRlcnMubGFzdF9yb3cgPSBudWxsO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSBjYW52YXMuY29udGV4dF9uZXdfeDtcblx0XHRjYW52YXMuY29udGV4dF95ID0gY2FudmFzLmNvbnRleHRfbmV3X3k7XG5cblx0fSk7XG5cblx0Y3J1ZC5nZXRfcHJvamVjdCgpO1xuXG4gIC8vcGFyZW50LnBvc3RNZXNzYWdlKCQoJ2JvZHknKS5oZWlnaHQoKSwnaHR0cDovLycrbG9jYXRpb24uaHJlZi5zcGxpdCggJy8nIClbMl0pO1xufSk7XG4gICBcblxuJCgnI2NhbnZhc193cmFwcGVyJykubW91c2VsZWF2ZShmdW5jdGlvbigpeyAkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDIwMCk7IH0pO1xuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXtcbiAgb25fY2F0ZWdvcnkuc2V0KCk7XG4gIGNsb3VkLnVwZGF0ZV90ZXh0KCk7IFxufSk7XG5cbiQoXCIjY2FudmFzX2Nsb3VkXCIpLm1vdXNlbW92ZShmdW5jdGlvbigpeyBjbG91ZC5zZXRfcG9zaXRpb24oKTsgfSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxubWVudV90b3AgPSB7XG5cblx0bW92ZV9pbWFnZSA6IGZhbHNlLFxuXHRtb3ZlX2NhbnZhcyA6IGZhbHNlLFxuXHRhdXRvX2RyYXcgOiBmYWxzZSxcblx0bW9kZV9rZXkgOiB0cnVlLFxuXHRjYXRlZ29yeSA6IDAsXG5cdGRpc2FibGVfc2VsZWN0IDogZmFsc2UsXG5cblx0Ly96bWlhbmEgYWt0dWFsbmVqIHpha8WCYWRraVxuXHRjaGFuZ2VfYm94IDogZnVuY3Rpb24ob2JqKXtcblx0XHRjb25zb2xlLmxvZyhvYmopO1xuXHRcdCQob2JqKS5wYXJlbnQoKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0JChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuXHRcdHZhciBjYXRlZ29yeSA9ICQob2JqKS5hdHRyKCdjYXRlZ29yeScpO1xuXHRcdCQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5jaGlsZHJlbignZGl2JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJyMnK2NhdGVnb3J5KS5kZWxheSgxMDApLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcblx0IFxuXHR9LFxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X21hcHMgOiBmdW5jdGlvbigpe1xuXHRcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvbWFwcycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgbWFwIHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnPG9wdGlvbiBpZD1cInNlbGVjdF9tYXBcIj53eWJpZXJ6IG1hcMSZPC9vcHRpb24+Jztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXAnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0XHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBtYXAgXG5cdFx0XHRcdCQoJy5zZWxlY3RfbWFwJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Ly9zcHJhd2R6YW15IGN6eSB3eWJyYWxpxZtteSBwb2xlIHogaGFzaGVtIG1hcHlcblx0XHRcdFx0XHRpZiggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpICE9ICdzZWxlY3RfbWFwJyl7XG5cdFx0XHRcdFx0XHQvL2plxZtsaSB0YWsgdG8gc3ByYXdkemFteSBjenkgd2N6eXR1amVteSBtYXDEmSBwbyByYXogcGllcndzenkgY3p5IGRydWdpXG5cdFx0XHRcdFx0XHRpZihjcnVkLm1hcF9oYXNoICE9IG51bGwpe1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB3Y3p5dHVqZW15IHBvIHJheiBrb2xlam55IHRvIHB5dGFteSBjenkgbmFwZXdubyBjaGNlbXkgasSFIHdjenl0YcSHXG5cdFx0XHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd8SFIG1hcMSZID8nKSkge1xuXHRcdFx0XHRcdFx0XHRcdGNydWQubWFwX2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdFx0Y3J1ZC5nZXRfbWFwKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdCQoJy5zZWxlY3RfbWFwIG9wdGlvbicpLmVxKDApLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLm1hcF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9tYXAoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRhbGVydCgnbmllIG1vZ8SZIHBvYnJhxIcgbGlzdHkgbWFwJyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblxuXG5cdH0sXG5cblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9wcm9qZWN0cyA6IGZ1bmN0aW9uKCl7XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL3Byb2plY3RzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBwcm9qZWt0w7N3IHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICc8b3B0aW9uIGlkPVwibmV3X3Byb2plY3RcIj5ub3d5IHByb2pla3Q8L29wdGlvbj4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5wcm9qZWN0X2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5wcm9qZWN0KS5uYW1lICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLnByb2plY3QpLm5hbWUgKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfcHJvamVjdCcpLmh0bWwoIGFkZF9odG1sICk7XG5cdFx0XHRcblx0XHRcdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIHByb2plY3QgXG5cdFx0XHRcdCQoJy5zZWxlY3RfcHJvamVjdCcpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd3kgcHJvamVrdCA/JykpIHtcblx0XHRcdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19wcm9qZWN0JyApe1xuXHRcdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGNydWQucHJvamVjdF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9wcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0YWxlcnQoJ25pZSBtb2fEmSBwb2JyYcSHIGxpc3R5IHByb2pla3TDs3cnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0fSxcblxuXHR1cGRhdGVfY2FudmFzX2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5zY2FsZSA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoKSApO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCgpICk7XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoKSApO1xuXG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCBjYW52YXMuc2NhbGUgKyAnJScgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCBjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcgKTtcblxuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyxjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JyxjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0Y2hhbmdlX2FscGhhIDogZnVuY3Rpb24oKXtcblx0XHRpbWFnZS5hbHBoYSA9ICQoJyNhbHBoYV9pbWFnZScpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGFkZF9pbWFnZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2plc2xpIHBvZGFueSBwYXJhbWV0ciBuaWUgamVzdCBwdXN0eVxuXHRcdHZhciBzcmNfaW1hZ2UgPSBwcm9tcHQoXCJQb2RhaiDFm2NpZcW8a8SZIGRvIHpkasSZY2lhOiBcIik7XG5cblx0XHRpZihzcmNfaW1hZ2Upe1xuXHRcdFx0aWYoc3JjX2ltYWdlLmxlbmd0aCA+IDApe1xuXG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0XHRcdC8vd2N6eXRhbmllIHpkasSZY2lhOlxuXHRcdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHRpbWFnZS53aWR0aCA9IGltYWdlLm9iai53aWR0aDtcblx0ICAgIFx0XHRpbWFnZS5oZWlnaHQgPSBpbWFnZS5vYmouaGVpZ2h0O1xuXHQgICAgXHRcdGltYWdlLmRyYXcoKTtcblx0ICBcdFx0fTtcblxuXHRcdFx0ICBpbWFnZS54ID0gMDtcblx0XHRcdCAgaW1hZ2UueSA9IDA7XG5cdFx0XHQgIGltYWdlLm9iai5zcmMgPSBzcmNfaW1hZ2U7XG5cdFx0XHRcdC8vc2ltYWdlLm9iai5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzaG93X2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbChwYXJzZUludChjYW52YXMuc2NhbGUpICsgJyUnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHBhcnNlSW50KGNhbnZhcy53aWR0aF9jYW52YXMpICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwocGFyc2VJbnQoY2FudmFzLmhlaWdodF9jYW52YXMpICsgJ3B4Jyk7XG5cdH1cblxufVxuIiwiLy9vYmlla3QgbXlzemtpIChkbyBvZ2FybmllY2lhKVxudmFyIG1vdXNlID0ge1xuXHRtb3VzZV9kb3duIDogZmFsc2UsXG5cdGNsaWNrX29iaiA6IG51bGwsXG5cblx0dG1wX21vdXNlX3ggOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXHR0bXBfbW91c2VfeSA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cblx0bGVmdCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praVxuXHR0b3AgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2lcblx0cGFkZGluZ194IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdHBhZGRpbmdfeSA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRvZmZzZXRfeCA6IG51bGwsIC8vb2Zmc2V0IHggb2JpZWt0dSBrbGlrbmnEmXRlZ29cblx0b2Zmc2V0X3kgOiBudWxsLCAvL29mZnNldCB5IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cblx0Ly9mdW5ja2phIHd5a3J5d2FqxIVjYSB3IGNvIGtsaWtuacSZdG8gcG9iaWVyYWrEhWNhIHBhZGRpbmcga2xpa25pxJljaWEgb3JheiB6YXBpc3VqxIVjYSBrbGlrbmnEmWNpZVxuXHRzZXRfbW91c2VfZG93biA6IGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdHZhciBvYmogPSBldmVudC50YXJnZXQ7XG5cblx0XHQvL2plxZtsaSBlbGVtZW50IG5hIGt0w7NyeSBrbGlrbmnEmXRvIG1hIGF0cnlidXQgbmFtZWNsaWNrIHByenlwaXN1amVteSBnbyBkbyBvYmlla3R1IG15c3praVxuXHRcdGlmKHR5cGVvZigkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJykpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0dGhpcy5jbGlja19vYmogPSAkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJyk7XG5cblx0XHRcdHZhciBwb3NpdGlvbiA9ICQob2JqKS5vZmZzZXQoKTtcblx0XHRcdHRoaXMub2Zmc2V0X3ggPSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5vZmZzZXRfeSA9IHBvc2l0aW9uLnRvcDtcblx0XHRcdHRoaXMucGFkZGluZ194ID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMucGFkZGluZ195ID0gdGhpcy50b3AgLSBwb3NpdGlvbi50b3A7XG5cdFx0XHRtb3VzZS5tb3VzZV9kb3duID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy50bXBfbW91c2VfeCA9IGltYWdlLng7XG5cdFx0XHR0aGlzLnRtcF9tb3VzZV95ID0gaW1hZ2UueTtcblx0XHR9XG5cdH0sXG5cblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdHRoaXMubGVmdCA9IGV2ZW50LnBhZ2VYLFxuXHRcdHRoaXMudG9wID0gZXZlbnQucGFnZVlcblx0fSxcblxuXHQvL2Z1bmtjamEgd3lrb255d2FuYSBwb2RjemFzIHdjacWbbmllY2lhIHByenljaWtza3UgbXlzemtpICh3IHphbGXFvG5vxZtjaSBvZCBrbGlrbmnEmXRlZ28gZWxlbWVudHUgd3lrb251amVteSByw7PFvG5lIHJ6ZWN6eSlcblx0bW91c2Vtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHRzd2l0Y2godGhpcy5jbGlja19vYmope1xuXHRcdFx0Y2FzZSAncmlnaHRfcmVzaXplJzpcblx0XHRcdFx0Ly9yb3pzemVyemFuaWUgY2FudmFzYSB3IHByYXdvXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0dmFyIG5ld193aWR0aCA9IHRoaXMubGVmdCAtIHRoaXMucGFkZGluZ194IC0gcG9zaXRpb24ubGVmdFxuXHRcdFx0XHRpZihuZXdfd2lkdGggPCBzY3JlZW4ud2lkdGggLSAxMDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYW52YXMucmVzaXplX3dpZHRoKG5ld193aWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdib3R0b21fcmVzaXplJzpcblx0XHRcdFx0Ly96bWllbmlhbXkgd3lzb2tvxZvEhyBjYW52YXNhXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0Y2FudmFzLnJlc2l6ZV9oZWlnaHQodGhpcy50b3AgLSB0aGlzLnBhZGRpbmdfeSAtIHBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnaW1hZ2VfcmVzaXplJzpcblxuXHRcdFx0XHRpZihpbWFnZS5vYmogIT09IHVuZGVmaW5lZCl7XG5cblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdFx0dmFyIHhfYWN0dWFsID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcdC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgc3Vic3RyYWN0ID0gaW1hZ2UueCArIGltYWdlLndpZHRoIC0geF9hY3R1YWwgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHRcdFx0XHR2YXIgZmFjb3IgPSBpbWFnZS53aWR0aCAvIGltYWdlLmhlaWdodDtcblxuXHRcdFx0XHRcdGlmIChpbWFnZS53aWR0aCAtIHN1YnN0cmFjdCA+IDEwMCl7XG5cdFx0XHRcdFx0XHRpbWFnZS53aWR0aCAtPSBzdWJzdHJhY3Q7XG5cdFx0XHRcdFx0XHRpbWFnZS5oZWlnaHQgLT0gc3Vic3RyYWN0L2ZhY29yO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuIiwiLy9vYmlla3QgbcOzd2nEhWN5IG5hbSBuYWQgamFrxIUga2F0ZWdvcmlhIGplc3RlxZtteVxudmFyIG9uX2NhdGVnb3J5ID0ge1xuXHRcblx0Y2FudmFzX29mZnNldF90b3AgOiAkKCcjY2FudmFzX3dyYXBwZXInKS5vZmZzZXQoKS50b3AsXG5cdGNhbnZhc19vZmZzZXRfbGVmdCA6ICQoJyNjYW52YXNfd3JhcHBlcicpLm9mZnNldCgpLmxlZnQsXG5cdG5hbWUgOiBudWxsLFxuXHRudW1iZXIgOiBudWxsLFxuXG5cdC8vZnVua2NqYSB6d3JhY2FqxIVjYSBha3R1YWxuxIUga2F0ZWdvcmnEmSBuYWQga3TDs3LEhSB6bmFqZHVqZSBzacSZIGt1cnNvclxuXHRzZXQgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGxlZnQgPSBtb3VzZS5sZWZ0IC0gY2FudmFzLm9mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSBjYW52YXMub2Zmc2V0X3RvcDtcblx0XHQvL2NvbnNvbGUubG9nKGxlZnQsdG9wKTtcblx0XHR2YXIgcm93ID0gTWF0aC5jZWlsKCB0b3AgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHQvL2NvbnNvbGUubG9nKGxlZnQsdG9wLHRoaXMuY2FudmFzX29mZnNldF9sZWZ0LHRoaXMuY2FudmFzX29mZnNldF90b3ApO1xuXHRcdGlmKChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSAmJiAocm93ICUgMiAhPSAwKSl7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCAobGVmdCArIChwb2ludGVycy5zaXplLzIpKS8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICkgLSAxO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggbGVmdCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXHRcdH1cblx0XHRcblx0XHR0cnl7XG5cblx0XHRcdHZhciBjYXRlZ29yeV9udW0gPSBwb2ludGVycy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdO1xuXHRcdFx0dmFyIGNhdGVnb3J5X25hbWUgPSBsYXllcnMuY2F0ZWdvcnlfbmFtZVtjYXRlZ29yeV9udW1dO1xuXHRcdFx0Ly9jb25zb2xlLmxvZygndGVzdCcsY2F0ZWdvcnlfbmFtZSk7XG5cblx0XHR9XG5cdFx0Y2F0Y2goZSl7XG5cdFx0XHR0aGlzLm5hbWUgPSBudWxsO1xuXHRcdFx0dGhpcy5udW1iZXIgPSBudWxsO1xuXHRcdH1cblx0XHRcblx0XHRpZigoY2F0ZWdvcnlfbmFtZSA9PSAncHVzdHknKSB8fCAoY2F0ZWdvcnlfbmFtZSA9PSAnZ3VtdWonKSl7XG5cdFx0XHR0aGlzLm5hbWUgPSBudWxsO1xuXHRcdFx0dGhpcy5udW1iZXIgPSBudWxsO1xuXHRcdH0gXG5cdFx0ZWxzZXtcblxuXHRcdFx0dGhpcy5uYW1lID0gY2F0ZWdvcnlfbmFtZTtcblx0XHRcdHRoaXMubnVtYmVyID0gY2F0ZWdvcnlfbnVtO1xuXHRcdH1cblxuXHR9XG5cbn1cbi8qXG4kKCdkb2N1bWVudCcpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cdG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfdG9wID0gO1xuXHRvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X2xlZnQgPSA7XG59KTtcblxuKi8iLCJwYWxldHMgPSB7fSIsIi8vbWVudSBwb2ludGVyXG52YXIgcG9pbnRlcnMgPSB7XG5cdHNob3dfYWxsX3BvaW50IDogdHJ1ZSxcblx0cGFkZGluZ194IDogMSxcblx0cGFkZGluZ195IDogMSxcblx0c2hvd19ib3JkZXIgOiBmYWxzZSxcblx0Y29sb3JfYm9yZGVyOiAnIzMzMycsXG5cdHRyYW5zbGF0ZV9tb2R1bG8gOiBmYWxzZSxcblx0c2l6ZSA6IDEwLFxuXHRtYWluX2tpbmQgOiAnc3F1YXJlJyxcblx0a2luZHMgOiBBcnJheSgnc3F1YXJlJywnY2lyY2xlJywnaGV4YWdvbicsJ2hleGFnb24yJyksXG5cblx0cG9pbnRlcnMgOiBBcnJheSgpLCAvL3BvaW50ZXJzLnBvaW50ZXJzW3J6YWRdW2tvbHVtbmFdIDoga2F0ZWdvcmlhW251bWVyXVxuXG5cdGxhc3RfY29sdW1uIDogbnVsbCxcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0bGFzdF9yb3cgOiBudWxsLFx0Ly93aWVyc3ogcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cblx0XHRkcmF3X2JvcmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ194LFxuXHRcdFx0XHRoZWlnaHRfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ195LFxuXHRcdFx0XHRub25lX2NvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCIsXG5cdFx0XHRcdGJvcmRlciA9IHt9LFxuXHRcdFx0XHRkYXRhID0ge307XG5cblx0XHRpZigodGhpcy5tYWluX2tpbmQgPT0gJ3NxdWFyZScpIHx8ICh0aGlzLm1haW5fa2luZCA9PSAnY2lyY2xlJykgfHwgKHRoaXMubWFpbl9raW5kID09ICdoZXhhZ29uJykpe1xuXHRcdFx0XHRcblx0XHRcdGNhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3JfYm9yZGVyO1xuXG5cdFx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKXtcblxuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IDApe1xuXG5cdFx0XHRcdFx0XHRib3JkZXIgPSB7XG5cdFx0XHRcdFx0XHRcdHRvcDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHRvcF9sZWZ0IDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHRvcF9yaWdodCA6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRyaWdodDogZmFsc2Vcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdC8vcnlzdWplbXkgcG/FgsOzd2thbWlcblx0XHRcdFx0XHRcdC8vc3ByYXdkemFteSBjenkgbWFteSB3xYLEhWN6b27EhSBvcGNqZSBtb2R1bG9cblx0XHRcdFx0XHRcdGlmKHJvdy0xID49IDApe1xuXHRcdFx0XHRcdFx0XHRpZighcG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyl7XG5cdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgbmllIHRvIHNwcmF3ZHphbXkgdHJhZHljeWpuaWUgd8WCxIVjem9uxIUgZ3JhbmljxJkgbmFkIFxuXHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyLnRvcCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgdGFrIHRvOiBzcHJhd2R6YW15IGN6eSB3aWVyc3ogamVzdCBwcnplc3VuacSZdHlcblx0XHRcdFx0XHRcdFx0XHRpZihyb3cgJSAyID09IDApe1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKGNvbHVtbi0xKSA+IDApe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbl0gIT0gdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pKXtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wX2xlZnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uKzFdICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uKzFdICE9IHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfcmlnaHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbi0xXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbi0xXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wX2xlZnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKGNvbHVtbisxKSA8PSBjYW52YXMuYWN0aXZlX2NvbHVtbil7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfcmlnaHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XHRcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYoKGNvbHVtbisxKSA8PSBjYW52YXMuYWN0aXZlX2NvbHVtbil7XG5cdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uKzFdICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbisxXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdGJvcmRlci5yaWdodCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0eCA6IGNvbHVtbip3aWR0aF9wb2ludGVyLFxuXHRcdFx0XHRcdFx0XHR5IDogcm93KmhlaWdodF9wb2ludGVyLFxuXHRcdFx0XHRcdFx0XHRzaXplIDogdGhpcy5zaXplLFxuXHRcdFx0XHRcdFx0XHRib3JkZXIgOiBib3JkZXIsXG5cdFx0XHRcdFx0XHRcdGxpbmVfd2lkdGhfeCA6IHBvaW50ZXJzLnBhZGRpbmdfeCxcblx0XHRcdFx0XHRcdFx0bGluZV93aWR0aF95IDogcG9pbnRlcnMucGFkZGluZ195LFxuXHRcdFx0XHRcdFx0XHR0X21vZHVsbyA6IGZhbHNlXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmKCAocm93ICUgMiA9PSAwKSAmJiAocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgKXtcblx0XHRcdFx0XHRcdFx0ZGF0YS54ID0gY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGZpZ3VyZXMuc3F1YXJlX2JvcmRlcihkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cdFxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL3J5c293YW5pZSB3c3p5c3RraWNoIHB1bmt0w7N3XG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdC8vY29uc29sZS5sb2coJ2RyYXcnLHRoaXMuc2l6ZSxsYXllcnMuY2F0ZWdvcnlfY29sb3JzKTsgXG5cdFx0dmFyIHdpZHRoX3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHR2YXIgaGVpZ2h0X3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiO1xuXG5cdFx0Ly9pZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTsgXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRpZiggKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IG1lbnVfdG9wLmNhdGVnb3J5KSAmJiAobWVudV90b3AuY2F0ZWdvcnkgIT0gMCkgKXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC4yXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKHRoaXMuc2hvd19ib3JkZXIpe1xuXHRcdFx0dGhpcy5kcmF3X2JvcmRlcigpO1xuXHRcdH1cblx0XHRcblx0fSxcblxuXHQvL3R3b3J6eW15IHRhYmxpY2UgcG9udGVyw7N3IChqZcWbbGkgamFracWbIHBvbnRlciBpc3RuaWVqZSB6b3N0YXdpYW15IGdvLCB3IHByenlwYWRrdSBnZHkgcG9pbnRlcmEgbmllIG1hIHR3b3J6eW15IGdvIG5hIG5vd28pXG5cdGNyZWF0ZV9hcnJheSA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmFjdGl2ZV9yb3cgPSBwYXJzZUludCggY2FudmFzLmhlaWdodF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHRjYW52YXMuYWN0aXZlX2NvbHVtbiA9IHBhcnNlSW50KCBjYW52YXMud2lkdGhfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cblx0XHRpZiggKHRoaXMucG9pbnRlcnMubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9yb3cpIHx8ICh0aGlzLnBvaW50ZXJzWzBdLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfY29sdW1uKSApXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd10gPT0gdW5kZWZpbmVkKSB0aGlzLnBvaW50ZXJzW3Jvd10gPSBuZXcgQXJyYXkoKTtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSB1bmRlZmluZWQpXHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlX3BvaW50IDogZnVuY3Rpb24oeSx4LHlfbGFzdCx4X2xhc3Qpe1xuXG5cdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXG5cdFx0Ly93eXpuYWN6ZW5pZSByw7N3bmFuaWEgcHJvc3RlalxuXHRcdGlmKCAoKHlfbGFzdCAhPSB5KSB8fCAoeF9sYXN0ICE9IHgpKSAmJiAoeV9sYXN0ICE9IG51bGwpICYmICh4X2xhc3QgIT0gbnVsbCkgKXtcblx0XHRcdHZhciBhID0gKHlfbGFzdCAtIHkpIC8gKHhfbGFzdCAtIHgpO1xuXHRcdFx0dmFyIGIgPSB5IC0gYSp4O1xuXG5cdFx0XHRpZih4X2xhc3QgPiB4KXtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geDtcblx0XHRcdFx0dmFyIGNvbF90byA9IHhfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgY29sX3RvID0geDtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geF9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZih5X2xhc3QgPiB5KXtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geTtcblx0XHRcdFx0dmFyIHJvd190byA9IHlfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgcm93X3RvID0geTtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geV9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcm93ID0gbnVsbDtcblx0XHRcdGZvcih2YXIgY29sID0gY29sX2Zyb207IGNvbCA8PSBjb2xfdG87IGNvbCsrKVxuXHRcdFx0e1xuXHRcdFx0XHRyb3cgPSBwYXJzZUludCggYSpjb2wrYiApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMocm93KSkgcm93ID0geTtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGNvbCA9IG51bGw7XG5cdFx0XHRmb3IodmFyIHJvdyA9IHJvd19mcm9tOyByb3cgPD0gcm93X3RvOyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Y29sID0gcGFyc2VJbnQoIChyb3ctYikvYSApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMoY29sKSkgY29sID0geDtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHR9XG5cdH1cbn1cbiIsInZhciBzb3VyY2UgPSB7XHJcbiAgc2hvdyA6IGZ1bmN0aW9uKCl7XHJcbiAgICAvL2NvbnNvbGUubG9nKCBsYXllcnMuc291cmNlICk7XHJcbiAgICAkKCcjc291cmNlJykuaHRtbCggbGF5ZXJzLnNvdXJjZSApOyBcclxuICB9XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
