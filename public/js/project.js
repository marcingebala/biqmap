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
				var find = false;

				for (var i_layers = 0, i_layers_max = layers.list.length; i_layers < i_layers_max; i_layers++){
					for (var i_exel = 0, i_exel_max = excel.data.length; i_exel < i_exel_max; i_exel++){
						if(( String(excel.data[i_exel][layers.category[i_layers]]).toLowerCase() == String(name).toLowerCase()) && (excel.data[i_exel][layers.category[i_layers]] != '')){

							find = true;
							//jeśli znaleźliśmy kategorię w excelu
							var value = String(excel.data[i_exel][layers.value[i_layers]]).replace(',','.');
							//console.log(excel.data[i_exel][layers.value[i_layers]]+' | '+value);
							
							for ( var i_legends = 0, i_legends_max = layers.legends[i_layers].length; i_legends < i_legends_max; i_legends++ ){
								if( (value >= layers.legends[i_layers][i_legends][0]) && (value <= layers.legends[i_layers][i_legends][1]) ){
									//jeśli znaleźlismy
									layers.category_colors[i_layers][i_category] = layers.legends[i_layers][i_legends][3];
									i_legends = i_legends_max;
									i_exel = i_exel_max;
								}
							}

							//jeśli wartość wychodzi poza skale u tak przypisujemy jej odpowiedni kolor
							if(value < layers.legends[i_layers][0][0]){
								layers.category_colors[i_layers][i_category] = layers.legends[i_layers][0][3];
							}	

							if(value > layers.legends[i_layers][i_legends_max-1][1]){
								layers.category_colors[i_layers][i_category] = layers.legends[i_layers][i_legends_max-1][3];
							}
							
							//jeśli dany kraj w excelu ma wartość null domyślnie otrzymuje kolor biały
							if(value == null){
								layers.category_colors[i_layers][i_category] = '#fff';
							}

						}
					}

					//w przypadku gdy dany kraj nie występuje w pliku excel otrzymuje kolor biały
					if(!find){
						layers.category_colors[i_layers][i_category] = '#fff';
					}
				}


			}
		}

		//po zaktualizowaniu kolorów w kategoriach rysujemy na nowo canvas
		canvas.draw();

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

		$("#canvas_cloud").css({top:parseInt(top - $("#canvas_cloud").height()-30)+'px',left:left+'px'});
	},

	//funkcja odpowiedzialna za wyświetlenie dymka z odpowiednią zawartością
	update_text : function(){
		
		if((on_category.name != "") && (on_category.name != 'null')){

			var tmp_row = null;
			var find = 0;
			for(var i_row = 0, i_row_max = excel.data.length; i_row < i_row_max; i_row++ ){
				if(String(on_category.name).toLowerCase() == String(excel.data[i_row][layers.category[layers.active]]).toLowerCase()){
					
					this.set_position();
					var text_tmp = layers.cloud[layers.active];

					for(var i = 0, i_max = excel.data[0].length; i < i_max; i++){
						text_tmp = text_tmp.replace('{'+excel.data[0][i]+'}',excel.data[i_row][i]);
					}

					//dopiero jeśli dymek ma mieć jakaś konkretną zawartość wyświetlamy go
					if(text_tmp!=""){
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
//sama nazwa wiele tłumaczy po prostu colorpicker
var colorpicker = {

	row : null,
	col_num : null,

	add : function(){
		$('.colorpicker_box').ColorPicker({

			color: '#ff0000',
			
			onShow: function (colpkr) {
				if($(colpkr).css('display')=='none'){
					$(colpkr).fadeIn(200);
					colorpicker.row = $(this).attr('row');
					colorpicker.col_num = $(this).attr('col_num');
				}
				return false;
			},
			
			onHide: function (colpkr) {
				$(colpkr).fadeOut(200);
				return false;
			},
			
			onChange: function (hsb, hex, rgb) {
				$('#legends tr td[row="'+colorpicker.row+'"]').css('backgroundColor', '#' + hex);
				
 					palets.color_arr[ palets.color_arr.length-1 ] = palets.color_arr[ layers.palets_active[layers.active] ].slice()
					palets.color_arr[ palets.color_arr.length-1 ][colorpicker.col_num] = '#' + hex;
					//layers.palets_active[layers.active] = layers.palets_active[layers.active]
					
					layers.palets_active[layers.active] = palets.color_arr.length -1;
					layers.colors_active[layers.active][colorpicker.row] =  '#' + hex;
					layers.legends[layers.active][colorpicker.row][3] =  '#' + hex;

					palets.show();
      		categories.update_color();
			}
		});
	},

	color_border : function(){
		$('.color_border').ColorPicker({

		onBeforeShow: function () {
			$(this).ColorPickerSetColor(pointers.color_border);
		},
				
			onShow: function (colpkr) {
				if($(colpkr).css('display')=='none'){
					$(colpkr).fadeIn(200);
					//colorpicker.row = $(this).attr('row');
					//colorpicker.col_num = $(this).attr('col_num');
				}
				return false;
			},
			
			onHide: function (colpkr) {
				$(colpkr).fadeOut(200);
				return false;
			},
			
			onChange: function (hsb, hex, rgb) {
				
				pointers.color_border =  '#' + hex;

				$('.color_border').css('backgroundColor', '#' + hex);
				
				if(pointers.show_border){
					pointers.draw_border(false);
				}

			}
		});
	}
}

//funkcja odpowiedzialna za tworzenie zapisywanie i aktualizacje danych dotycząćcyh mapy
var crud = {

	map_json : Array(), //główna zmienna przechowująca wszystkie dane
	map_hash :null,
	layers : {},
	excel : Array(),
	project : {},
	project_hash : null, //główny hash dotyczący naszego projektu

	//pobieramy dane z porojektu i zapisujemy je do json-a
	parse_data : function(){

		//pobieramy dane dotyczące mapy (canvasa)

		//zerujemy na nowo całą tablicę pointerów
		this.map_json = Array();

		//data[x] = zmienne podstawowe dotyczące mapy
		this.map_json[0] = Array();
		this.map_json[0][0] = canvas.height_canvas;
		this.map_json[0][1] = canvas.width_canvas;
		this.map_json[0][2] = pointers.padding_x;
		this.map_json[0][3] = pointers.padding_y;
		this.map_json[0][4] = pointers.translate_modulo;
		this.map_json[0][5] = pointers.size;
		this.map_json[0][6] = pointers.main_kind;
		this.map_json[0][7] = canvas.title_project;
		this.map_json[0][8] = pointers.color_border;
		this.map_json[0][9] = pointers.show_border;

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

		//pobieramy dane dotyczące projektów (layers)
		//tworzymy obiekt warstwy zawierający wszystkie dane dotyczące projektu

		this.layers.palets_active = layers.palets_active;
		this.layers.value = layers.value;
		this.layers.colors_pos = layers.colors_pos;
		this.layers.colors_active = layers.colors_active;
		this.layers.min_value = layers.min_value;
		this.layers.max_value = layers.max_value;
		this.layers.cloud = layers.cloud;
		this.layers.cloud_parser = layers.cloud_parser;
		this.layers.legends = layers.legends;
		this.layers.labels = layers.labels;
		this.layers.category = layers.category;
		this.layers.category_colors = layers.category_colors;
		this.layers.category_name = layers.category_name;
		this.layers.list = layers.list;

		//zmienne globalne dotyczące całego projektu
		this.project.name = layers.project_name;
		this.project.source = layers.source;

		//tworzymy obiekt excela
		this.excel = excel.data;


	},

	publish : function(event){
		if(crud.project_hash != null){
			if (!event) {event = window.event;} //łata dla mozilli
			if( ($('.publish .embed').css('display') == 'block') && ($(event.target).hasClass('publish')) ){
				$('.publish .embed').fadeOut(500);
			}
			else{
				$('.publish .embed').html('<iframe width="100%" height="'+canvas.height_canvas+'px" border="0" frameborder="0" border="0" allowtransparency="true" vspace="0" hspace="0" src="http://'+location.href.split( '/' )[2]+'/embed/'+crud.project_hash+'"></iframe>');
				$('#iframe').html('<iframe  onload="crud.publish_getSize(this)" width="100%" height="'+canvas.height_canvas+'px" border="0" frameborder="0" border="0" allowtransparency="true" vspace="0" hspace="0" src="http://'+location.href.split( '/' )[2]+'/embed/'+crud.project_hash+'"></iframe>');

				$('.publish .embed').fadeIn(500);
			}
		}
		else{
			alert('najpierw zapisz projekt a następnie go publikuj');
		}
	},

	publish_getSize : function(obj){
		console.log(obj.contentWindow.document.body);
		console.log($(obj.contentWindow.document.body).height() ,$(obj.contentWindow.document.body).width());
    //obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
	},


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
		
		if(typeof data[0][8] == 'undefined'){
			pointers.color_border = "#000";
		}else{
			pointers.color_border = data[0][8];
		}

		if(typeof data[0][9] == 'undefined'){
			pointers.show_border = false;
		}else{
			pointers.show_border = data[0][9];
		}
 
 		$('#pointer_box .color_border').css('background-color',pointers.color_border);

		$('#pointer_box input[name="padding_x"]').val( data[0][2] );
		$('#pointer_box input[name="padding_y"]').val( data[0][3] );
		$('#pointer_box input[name="size"]').val( data[0][5] );
		$('input[name="title_project"]').val( data[0][7] );

		if( data[0][4] ){
			$('#pointer_box div[name="translate_modulo"]').removeClass('switch-off');
			$('#pointer_box div[name="translate_modulo"]').addClass('switch-on');
		}

		if( pointers.show_border ){
			$('#pointer_box div[name="show_border"]').removeClass('switch-off');
			$('#pointer_box div[name="show_border"]').addClass('switch-on');
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
		categories.category = data[2];


		//po wczytaniu mapy aktyalizujemy dane dotyczącą kategorii i kolorów
		layers.category_colors[0] = [];
		layers.category_name = [];

		for(var i = 0, i_max = categories.category.length; i < i_max; i++){
			console.log( categories.category[i][0] );
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
		categories.show_list();

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

		tinyMCE.editors[0].setContent( layers.cloud[layers.active] );
		tinyMCE.editors[1].setContent( layers.source );

		excel.show();
		palets.show();
		legends.show();
		layers.show();
		labels.show();

	},

	//pobranie mapy z bazy danych i przekazujemy do wczytania do obiektów mapy
	get_map : function(){
		var th = this;
		$.ajax({
			  url: '/api/map/' + th.map_hash,
		  	type: "GET",
		    contentType: "application/json"
			}).done(function( data ) { th.set_map( JSON.parse(data.data[0].map_json) ); });
	},

	//pobieranie projektu z bazy danych i wczytanie
	get_project : function(){
		
		var th = this;
			$.ajax({
				  url: '/api/project/' + th.project_hash,
			  	type: "GET",
			    contentType: "application/json"
				}).done(function( data ) { 
					//console.log(data.data);
					if(data.status == 'ok'){
						th.set_project( data.data ); 
					}
					else{
						alert('nie udało się wczytać projektu');
						console.log(data);
					}

				});
		},

	//tworzymy nowy projekt
	create_project : function(){

		//aktualizujemy jsona do wysłania ajaxem
		this.parse_data();
		var th = this; //zmienna pomocnicza

		var data = {
			map_json : JSON.stringify(th.map_json),
			map_hash : th.map_hash,
			layers : JSON.stringify(th.layers),
			excel : JSON.stringify(th.excel),
			project : JSON.stringify(th.project)
		}

		jQuery.ajax({
			url: "api/projects",
			data: data,
			type: 'POST',
			success: function(response){
				if(response.status == 'ok'){
					alert('zapisano nowy projekt');
					th.project_hash = response.project_hash;
					menu_top.get_projects();
				}
				else{
					alert('błąd podczas zapisu');
					//console.log(response);
				}
			}
		});

	},

	//aktualizujemy już istniejący projekt
	update_project : function(){ 

		//aktualizujemy jsona do wysłania ajaxem
		this.parse_data();
		var th = this; //zmienna pomocnicza

		var data = {
			map_json : JSON.stringify(th.map_json),
			map_hash : th.map_hash,
			project_hash : th.project_hash,
			layers : JSON.stringify(th.layers),
			excel : JSON.stringify(th.excel),
			project : JSON.stringify(th.project)
		}

		jQuery.ajax({
			url: "api/projects",
			data: data,
			type: 'PUT',
			success: function(response){
				if(response.status == 'ok'){
					menu_top.get_projects();
					alert('zaktualizowano projekt');
				}
				else{
					alert('błąd podczas aktualizacji');
					console.log(response);
				}
			}
		});

	},

	//usuwamy mapę z bazy danych
	delete_project : function(){

		var th = this; //zmienna pomocnicza

		//sprawdzamy czy mapa do usunięcia posiada swoje id
		if(this.project_hash != null){			

			jQuery.ajax({
				url: "api/project/"+th.project_hash,
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

var excel = {
	
	alpha : ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','w','x','y','z'],
	data : [["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]],
	min_row : 12,
	min_col : 6,

	init : function(){
		//dodanie eventów przy kliknięciu excela
		$('#excel_box button').click(function(){ $('#excel_box input').click(); });
		$('#excel_box input').change(function(){ excel.send_file(); });

		//funkcja tymczasowa do narysowania tabelki excela
		this.show();
	},

	//funkcja odpowiedziala za poprawne podpisanie osi
	show : function(){

		add_html = '';

		//jeśli ilośc wierszy jest większa aktualizujemy wielkość tablicy
		if(excel.data.length >= excel.min_row) excel.min_row = excel.data.length;
		if(excel.data[0].length >= excel.min_col) excel.min_col = excel.data[0].length+1;

		//renderujemy całą tablicę excel
		for(var i = 0;i < this.min_row; i++){
			add_html += '<tr class="tr">';
			for(var j = 0;j < this.min_col; j++){
				if((j == 0) && (i > 0)){
					add_html += '<td class="td" row="' + i + '" col="' + j + '" >'+ i +'</td>';
				}
				else{
					try{
						if(typeof(excel.data[i][(j-1)]) != "undefined"){
							add_html += '<td class="td" contenteditable="false" row="' + i + '" col="' + j + '">'+excel.data[i][(j-1)]+'</td>';
						}
						else{
							add_html += '<td class="td"  row="' + i + '" col="' + j + '"></td>';
						}
						//console.log(excel.data[i][(j+1)]);
					}catch(error){
						console.log(error,i,j);
						add_html += '<td class="td" row="' + i + '" col="' + j + '"></td>';
					}
				}

			}
			add_html += '</tr>';
		}

		$('#excel_box .table').html( add_html );

		$('#excel_box .table .td').dblclick(function(){ $(this).attr('contenteditable','true'); $(this).selectText(); });

		//dodajemy możliwość edycji excela
		$('#excel_box .table .td').keyup(function(){ excel.edit(this); });

		$('#excel_box .table .td').blur(function(){ $(this).attr('contenteditable','false');  palets.show_select(); });

	},

	//funkcja umożliwiająca edycje zawartości komórki
	edit : function(obj){	
		
		var val = $(obj).html()
		if($.isNumeric(val)) { val = parseFloat(val); }
		
		excel.data[$(obj).attr('row')][($(obj).attr('col')-1)] = val;
		categories.update_color();
	},

	//pobieramy plik, z inputa i wyłamy do backendu w celu sparsowania a następnie przypisujemy do tablicy i wyświetlamyw formie tabelski
	send_file : function() {
	
		var excel_form = new FormData(); 
		excel_form.append("excel_file", $("#excel_box input")[0].files[0]);

 		$.ajax( {
      
      url: '/api/projects/excel_parse',
      type: 'POST',
      data: excel_form,
      processData: false,
      contentType: false

    }).done(function( response ) {
    	//$("#excel_box input")[0].files[0].reset();

			$("#excel_box input").remove();
			$("#excel_box").append('<input type="file" />')
			$('#excel_box input').change(function(){ excel.send_file(); });

    	//po wczytaniu pliku excel przypisujemy dane rysujemy na nowo tabelę oraz wyświetlamy wszystkie palety kolorów
			console.log( response )
    	excel.data = response.excel[0].data;
    	excel.transition();
    	excel.show();
    	palets.show_select();
    });
	},

	//funckja zamieniająca krtopki na przecinki przy komórkach liczbowych
	transition : function(){
		for(var i = 0, i_max = excel.data.length; i < i_max; i++){
			for(var j = 0, j_max = excel.data[0].length; j < j_max; j++){
				
				//usuwamy spacje występujące za lub przed tekstem
				excel.data[i][j] = $.trim(excel.data[i][j])

				//jeśli mamy pustą wartość null zamieniamy ją na zamknięty string
				if(excel.data[i][j] == null){ excel.data[i][j] = ''; }
				
				if($.isNumeric( excel.data[i][j] )){
					//console.log(excel.data[i][j])
					excel.data[i][j] = String(excel.data[i][j]).replace('.',',');
				}

			}
		}
	}
}

excel.init();

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

  square_border_small : function(data){

  if(data.line_width_y < 2){
    y_trans = -2;
  }
  else{
    y_trans = -3;
  }

  if(data.line_width_x < 3){
    x_trans = -2;
  }
  else{
    x_trans = -1*data.line_width_x;
  }

  if(data.border.top){
    canvas.context.fillRect(
      data.x+x_trans+1,
      data.y+y_trans+1,
      data.size+data.line_width_x+1,
      1
    );
  }

    if(data.border.top_left){
      canvas.context.fillRect(
        data.x+x_trans+1,
        data.y+y_trans+1,
        parseInt((data.size+data.line_width_x+1)/2),
        1
      );
    }

    if(data.border.top_right){
      canvas.context.fillRect(
        data.x+x_trans+1+parseInt((data.size+data.line_width_x+1)/2),
        data.y+y_trans+1,
        Math.ceil((data.size+data.line_width_x+1)/2),
        1
      );
    }

    if(data.border.right){
      if(data.line_width_x < 2){
        x_trans = -1;
      }
      else{
        x_trans = 0;
      }

      if(data.line_width_y < 2){
        y_trans = 2;
      }
      else{
        y_trans = data.line_width_y;
      }

      canvas.context.fillRect(
        data.x+data.size+x_trans+1,
        data.y-1,
        1,
        data.size+y_trans 
      );
    }
  },
square_border_big : function(data){

  if(data.line_width_y < 2){
    y_trans = -2;
  }
  else{
    y_trans = -3;
  }

  if(data.line_width_x < 3){
    x_trans = -2;
  }
  else{
    x_trans = -1*data.line_width_x;
  }

  if(data.border.top){
    canvas.context.fillRect(
      data.x+x_trans,
      data.y+y_trans,
      data.size+data.line_width_x+3,
      3
    );
  }

    if(data.border.top_left){
      canvas.context.fillRect(
        data.x+x_trans,
        data.y+y_trans,
        parseInt((data.size+data.line_width_x+3)/2),
        3
      );
    }

    if(data.border.top_right){
      canvas.context.fillRect(
        data.x+x_trans+parseInt((data.size+data.line_width_x+3)/2),
        data.y+y_trans,
        Math.ceil((data.size+data.line_width_x+3)/2),
        3
      );
    }

    if(data.border.right){
      if(data.line_width_x < 2){
        x_trans = -1;
      }
      else{
        x_trans = 0;
      }

      if(data.line_width_y < 2){
        y_trans = 2;
      }
      else{
        y_trans = data.line_width_y;
      }

      canvas.context.fillRect(
        data.x+data.size+x_trans,
        data.y,
        3,
        data.size+y_trans 
      );
    }
  }
}

//funkcje globalne kontener na wszystko i nic ;)
var global = {
	toogle_right  : function(obj){
		//panel jest z prawej strony
		if( $(obj).parent().css('right') == '0px' ){
			$(obj).parent().animate({right: [-$(obj).parent().width()-20,"swing"]}, 1000, function() {});
    }
    else{
    	 $(obj).parent().animate({right: ["0px","swing"]}, 1000, function() {});
    } 
	},
	toogle_left  : function(obj){
		//panel jest z lewej strony
		if( $(obj).parent().css('left') == '0px' ){
			$(obj).parent().animate({left: [-$(obj).parent().width()-20,"swing"]}, 1000, function() {});
    }
    else{
    	 $(obj).parent().animate({left: ["0px","swing"]}, 1000, function() {});
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
		$('#layers .label_layer').val( layers.labels[layers.active] );
	},

	edit : function(obj) {
		layers.labels[layers.active] = $(obj).val();
	}
}

$('#layers .label_layer').keyup(function(){
	labels.edit(this);
}); 

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

	//tablica pól uzależnionych od aktualnej warstwy
	db_name : ["list","palets_active","category","category_colors","category_name","value","colors_pos","colors_active","min_value","max_value","cloud","cloud_parser","legends","labels"],

	show : function(){

		var html = "";

		for(var i = 0, i_max = this.list.length; i < i_max; i++){
			if(i == this.active){
				html += '<span num="'+i+'" contenteditable="true" class="active">' + this.list[i] + '</span>';
			}
			else{
				html += '<span num="'+i+'" contenteditable="true" >' + this.list[i] + '</span>';
			}
		}

		html += '<button class="add"> + </button><button class="remove"> - </button>';

		$('#layers > div').html(html);


		//dodajemy zdarzenia do edycji / zmiany kolejnosci i aktualizowania warstwy
		$('#layers .add').click(function(){layers.add();});
		
		$('#layers .remove').click(function(){
			if(confirm('Czy chcesz usunąć warstwę ?')){
				layers.remove();
			};
		});
		
		$('#layers span').click(function(){ layers.select(this); });

		$( "#layers > div span" ).keyup(function(){
			layers.list[layers.active] = $(this).html();
		});

		$( "#layers > div span" ).dblclick(function(){
			$(this).addClass('contenteditable');
			$(this).blur(function(){ $(this).removeClass('contenteditable') });
		});

		$( "#layers > div" ).sortable({ 
			axis: 'x',
		 	update: function( event, ui ) {
				$( "#layers > div span" ).each(function(index,obj){
					if(index != $(obj).attr('num')){
						layers.change_order($(obj).attr('num'),index)
						return false;
					}
				});
		 	},
		 	cancel: '.add,.remove,.contenteditable'
		});
	},

	select : function(obj){
		$('#layers span').removeClass('active');
		$(obj).addClass('active');
		layers.active = $(obj).index();

		tinyMCE.editors[0].setContent( layers.cloud[layers.active] );
		palets.show();
		cloud.set_textarea();
		labels.show();
		legends.show();
		canvas.draw();
	},

	//zmiana kolejnjości warstw
	change_order : function(last,next){
		for (var i= 0, i_max = this.db_name.length; i < i_max; i++) {
			var tmp = this[this.db_name[i]][next];
			this[this.db_name[i]][next] = this[this.db_name[i]][last]
			this[this.db_name[i]][last] = tmp;
		}
	},

	//dodajemy nową warstwę
	add : function(){

		this.list.push( 'zakładka ' + parseInt(this.list.length+1));

		this.category.push(-1);
		this.category_colors.push( this.category_colors[this.category_colors.length-1].slice() );
		this.value.push(-1);
		this.palets_active.push(0);
		this.colors_active.push(['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b']);
		this.colors_pos.push([1,1,1,1,1,1,1,1,1]);
		this.min_value.push(0);
		this.max_value.push(0);
		this.cloud.push("");
		this.cloud_parser.push("");
		this.legends.push([]);
		this.labels.push("");
		this.show();

	},

	//usuwamy aktualną warstwę
	remove : function(){
		if(this.active > 0){
			if(this.active == (this.list.length-1)){
				var i_tmp = this.list.length-1;
				this.select( $('#layers span').eq( i_tmp ) );
			} 

			//pobieramy numer ostatniej zakładki
			for (var i_layers= this.active, i_layers_max = layers.list.length-1; i_layers < i_layers_max; i_layers++) {
				for (var i= 0, i_max = this.db_name.length; i < i_max; i++) {
					this[this.db_name[i]][i_layers] = this[this.db_name[i]][i_layers+1];
				}
			}

			//usuwamy ostatnią zakładkę / warstwę
			var last_i = layers.list.length - 1;
			for (var i= 0, i_max = this.db_name.length; i < i_max; i++) {
				this[this.db_name[i]].pop()
				console.log(this[this.db_name[i]][last_i]);
			}

			this.show();
			this.select($('#layers span.active')); 
		}
	}
}

//zmiana nazwy projektu przy wpisaniu nowej nazwy do inputa
$('#pointers .project_name').keyup(function(){ layers.project_name = $(this).val(); });

//zmienne pomocnicze
$.fn.selectText = function(){
    var doc = document;
    var element = this[0];
    //console.log(this, element);
    if (doc.body.createTextRange) {
    	var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
    	var selection = window.getSelection();        
      var range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
};

//obiekt dotycząsy wyswietlania akutalizacji i edycji panelu legend
legends = {

	//wyświetlamy wszystkie legendy w panelu map
	show : function(){

		var html = "<table><tr><th>kolor:</th><th>od:</th><th>do:</th><th>opis:</th></tr>";

		for(var i = 0, i_max = layers.legends[layers.active].length; i < i_max; i++){
			html += "<tr row='"+i+"'><td row='"+i+"' col_num='' style='background-color:"+layers.legends[layers.active][i][3]+"' class='color colorpicker_box'></td><td class='from' name='from' contenteditable='true'>"+layers.legends[layers.active][i][0]+"</td><td class='to' name='to' contenteditable='true'>"+layers.legends[layers.active][i][1]+"</td><td class='description' name='description' contenteditable='true'>"+layers.legends[layers.active][i][2]+"</td></tr>";
		}

		html += "</table>";
		$('#legends').html(html);

		var row = 1;
		for(var i = 0, i_max = layers.colors_pos[layers.active].length; i < i_max; i++){
			if( layers.colors_pos[layers.active][i] == 1){
				$('#legends table tr').eq(row).children('td').eq(0).attr('col_num', i);
				row++;
			}
		}

		if(18 == layers.palets_active[layers.active]) {
			var row = 0;
			for(var i = 0, i_max = layers.colors_pos[layers.active].length; i < i_max; i++){
				if( layers.colors_pos[layers.active][i] == 1){
					palets.color_arr[18][i] = layers.colors_active[layers.active][row];
					row++;
				}
				else{
					palets.color_arr[18][i] = '#fff';
				}
			}
			palets.show()
		}

		colorpicker.add();
	},

	//funkcja akutalizująca kolory w palecie kolorów
	update : function(){
		var color_count = layers.colors_active[layers.active].length //ilosc kolorów
		var diffrent = Math.abs( layers.min_value[layers.active] - layers.max_value[layers.active] ); // color_count;
		
		layers.legends[layers.active] = [];

		for(var i = 0, i_max = layers.colors_active[layers.active].length; i < i_max; i++){

			console.log( parseInt(layers.min_value[layers.active]),layers.max_value[layers.active] );

			var now_tmp = Math.round( (parseInt(layers.min_value[layers.active])+diffrent/color_count*i)*100) / 100
			
			//console.log(layers.min_value[layers.active]+diffrent/color_count*i);


			if(i+1 == i_max ){
				var next_tmp = layers.max_value[layers.active]
			}
			else{
				var next_tmp = Math.round( ((parseInt(layers.min_value[layers.active])+diffrent/color_count*(i+1)) - 0.01)  *100) / 100 
			}
			
			layers.legends[layers.active].push([now_tmp,next_tmp,  String(now_tmp).replace('.',',')+' - '+String(next_tmp).replace('.',','), layers.colors_active[layers.active][i] ]);
		
		}
		this.show();
		categories.update_color();
	},

	edit: function(obj){

		var row = $(obj).parent().attr('row');
		var name = $(obj).attr('name');
		var val = $(obj).html();

		switch(name){
			
			case 'from':
				if(!$.isNumeric(val)) { $(obj).html(parseFloat(val)) } //zabezpieczenie, jeśli wpisano tekst zamieniamy go na liczbę
				layers.legends[layers.active][row][0] = parseFloat(val);
				categories.update_color();
			break;
			
			case 'to':
				if(!$.isNumeric(val)) { $(obj).html(parseFloat(val)) }
				layers.legends[layers.active][row][1] = parseFloat(val);
				categories.update_color();
			break;
			
			case 'description':
				layers.legends[layers.active][row][2] = val;
			break;		
		
		}
	}
}

legends.show(); 


//dodajemy zdarzenie edycji wartości w legendzie
$('#legends').on('keyup','td', function(){ legends.edit(this); });

/*
    ____   ____ ____    __  ___ ___     ____     _____    ____ 
   / __ ) /  _// __ \  /  |/  //   |   / __ \   |__  /   / __ \
  / __  | / / / / / / / /|_/ // /| |  / /_/ /    /_ <   / / / /
 / /_/ /_/ / / /_/ / / /  / // ___ | / ____/   ___/ /_ / /_/ / 
/_____//___/ \___\_\/_/  /_//_/  |_|/_/       /____/(_)\____/  

varsion 3.0 by Marcin Gębala

lista obiektów:
canvas - obiekt canvasa
categories
cloud
color_picker
crud - obiekt canvasa
excel
figures
global
image - obiekt zdjęcia od którego odrysowujemy mapy
input
labels
layers
legends
main
menu_top
models
mouse
on_category
palets
pointers

*/


// Create IE + others compatible event handler
var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

// Listen to message from child window
eventer(messageEvent,function(e) {
  console.log('parent received message!:  ',e.data);
},false);
 
//dodajemy tinymce do 2 textarea (dymek źródło)
tinymce.init({
	menubar:false,
  selector: '.tinyedit',  // change this value according to your HTML
  toolbar: 'bold italic | link image',
    setup: function (editor) {
      editor.on('change', function (e) {
        var target = $(editor.targetElm).attr('name');
        
        //jeśli aktualizujemy dymek
        if(target == 'cloud'){
          console.log()
        	layers.cloud[layers.active] = editor.getContent();
        	//cloud.get_textarea( editor.getContent() );
        }

        //jeśli aktualizujemy żródło projektu
        if(target == 'source'){
   				layers.source = editor.getContent();
        }

      });
    }
});

window.onbeforeunload = function (evt) {
 	if (typeof evt == 'undefined') {
  	evt = window.event;
 	}
 	if (evt) {
  	if(!confirm('Czy chcesz opuścić tę stronę')) return false
	}
}

//po kliknięciu zmieniay aktualny panel
$('.box > ul > li').click(function(){ menu_top.change_box(this) });

$(document).ready(function(){

	menu_top.get_maps();
	menu_top.get_projects();
  layers.show();
  palets.show();

  colorpicker.color_border();

	//zablokowanie możliwości zaznaczania buttonów podczas edycji pola
	$(document).on("focusin","input",function(){ menu_top.disable_select = true; });
	$(document).on("focusout","input",function(){ menu_top.disable_select = false; });

	//zaznaczenie dymka do publikacji po kliknięciu
	$('.publish .embed').click(function(){	$(this).select();	});
	$('.publish').click(function(event){ crud.publish(event); });

	//jeśli chcemy zapisać / zaktualizować / opublikować projekt
	$('#toolbar_top button.save').click(function(){ 
		if(typeof crud.project_hash == 'string'){	crud.update_project(); }
		else{ crud.create_project(); }
	});

	//jeśli chcemy usunąć projekt
	$('#toolbar_top button.delete').click(function(){ 
		if(confirm('Czy chcesz usunąć projekt ?')){
			crud.delete_project();
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

	//$(document).keypress(function(e) { menu_top.switch_mode( e.which ); });

	//zaktualizowanie kategorii
//	$("#list").delegate("input","focusout", function() { categories.update($(this).attr('id_category') ,$(this).val() ); });
//	$("#list").delegate("input","keypress", function(e) { if(e.which == 13) {categories.update($(this).attr('id_category') ,$(this).val() ); } });

	//usunięcie kategorii
//	$("#list").delegate("button.remove","click", function() { categories.remove($(this).attr('id_category')); });

	//zaktualizowanie kategorii/
//	$("#list").delegate("input","click", function() { menu_top.mode_key = false;  });
//	$("#list").delegate("input","focusout", function() { menu_top.mode_key = true;  });

	//pokazanie / ukrycie panelu kategorii
	$('#excel_box h2').click(function(){ global.toogle_left(this); });
  $('#pointer_box h2').click(function(){ global.toogle_right(this); }); 
  $('#palets_box h2').click(function(){ global.toogle_right(this); });

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

	//$('#alpha_image').change(function(){ menu_top.change_alpha() });

	//$('input').click(function(){ menu_top.mode_key = false; });
	//$('input').focusout(function(){ menu_top.mode_key = true; });

	//$(document).mouseup(function(){ canvas.draw(); });
	canvas.draw(); //rysowanie canvas

});

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
				if(new_width < screen.width - 100){
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
	
	canvas_offset_top : 187,
	canvas_offset_left : 10,
	name : null,
	number : null,

	//funkcja zwracająca aktualną kategorię nad którą znajduje się kursor
	set : function(){
		
		var left = mouse.left - this.canvas_offset_left;
		var top = mouse.top - this.canvas_offset_top;
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
			var category_name = categories.category[category_num][0];
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

$('#canvas_wrapper').mouseleave(function(){ $("#canvas_cloud").fadeOut(200); });

$('#canvas_wrapper').mousemove(function(){ 
	on_category.set();
	cloud.update_text();
	cloud.set_position();
});


var palets = {
  //val_max : null,
  //val_min : null,
  //val_interval : null,   
  //palets_active : 0,
  //value : -1, 
  //category : -1,

  //podstawowe palety kolorów ( ostatnia paleta jest naszą własną do zdefiniowania )
  color_arr : [
    ['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b'],
    ['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c','#4d004b'],
    ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081'],
    ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000'],
    ['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858'],
    ['#fff7fb','#ece2f0','#d0d1e6','#a6bddb','#67a9cf','#3690c0','#02818a','#016c59','#014636'],
    ['#f7f4f9','#e7e1ef','#d4b9da','#c994c7','#df65b0','#e7298a','#ce1256','#980043','#67001f'],
    ['#fff7f3','#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a'],
    ['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#006837','#004529'],
    ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'],
    ['#ffffe5','#fff7bc','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#993404','#662506'],
    ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'],
    ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'],
    ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b'],
    ['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000'],
    ['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704'],
    ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'],
    ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d'],
    ['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff']
  ],

  show : function(){
    this.show_color();
    this.show_palets();
    this.show_select();
    //layers.data.color_active[layers.active] = layers.colors_active[layers.active];
  },

  show_select : function(){

    //wyświetlamy panel do wyboru kolumny kategorii
    add_html = '<option col="-1">wybierz</option>';
    for(var i = 0, i_max = excel.data[0].length;  i < i_max; i++){
      if(excel.data[0][i]!= ''){
        if(i == layers.category[layers.active]){
          add_html += '<option col="'+i+'" selected>' +excel.data[0][i]+ '</option>';  
        }
        else{
          add_html += '<option col="'+i+'">' +excel.data[0][i]+ '</option>';  
        }
      }
    }

    $('#excel_box select.category').html( add_html );

    //wyświetlamy panel do wyboru kolumny wartości
    add_html = '<option col="-1">wybierz</option>';
    for(var i = 0, i_max = excel.data[0].length;  i < i_max; i++){
      if(excel.data[0][i]!= ''){
        if(i == layers.value[layers.active]){
          add_html += '<option col="'+i+'" selected>' +excel.data[0][i]+ '</option>';  
        }
        else{
          add_html += '<option col="'+i+'">' +excel.data[0][i]+ '</option>';  
        }
      }
    }
    $('#excel_box select.value').html( add_html );

    //kolorujemy odpowiednio excela
    $('#excel_wrapper .td').removeClass("value");
    $('#excel_wrapper .td').removeClass("category");
    
    if( layers.value[layers.active] != -1){
      $('#excel_wrapper .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
    }

    if( layers.category[layers.active] != -1){
      $('#excel_wrapper .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    }
  },

  //wybieramy kolumnę kategorii (obszarów)
  set_category : function(obj){
    layers.category[layers.active] = parseFloat($("#excel_box select.category option:selected").attr('col'));
    $('#excel_wrapper .td').removeClass("category");
    $('#excel_wrapper .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    //categories.update_color();
  }, 

  //wybieramy kolumne wartości i ustawiamy najmniejszą i największą wartość
  set_value : function(obj){

    var value_tmp = parseFloat($("#excel_box select.value option:selected").attr('col'));


    //zabezpieczenie przed wybraniem kolumny zawierającej tekst
    var check = true;
    for(var i = 1, i_max = excel.data.length; i < i_max; i++){
      if ((!$.isNumeric(String(excel.data[i][value_tmp]).replace(',','.'))) &&  (excel.data[i][value_tmp] != '')){ 

        check = false;
        console.log('to nie jest liczba!: '+excel.data[i][value_tmp]);
       }
    }

    //sprawdzamy czy w zaznaczonej kolumnie znajduje się wiersz z tekstem
    if(check){
      //jesli nie wybieramy daną kolumnę
      layers.value[layers.active] = value_tmp;
      $('#excel_wrapper .td').removeClass("value");
      $('#excel_wrapper .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
      this.set_min_max_value();
    }
    else{
      //jeśli tak zwracamy błąd
      alert('wybrana kolumna zawiera wartości tekstowe')
      this.show_select();
    }

  },

  set_min_max_value : function(){ 
    var tmp_value = layers.value[layers.active];
    if(tmp_value != -1){
      //wyszukujemy najmniejsza i największą wartość w kolumnie wartości
      if( layers.value[tmp_value] != -1 ){
        
        var tmp_min = parseFloat(String(excel.data[1][tmp_value]).replace(',','.'));
        var tmp_max =  parseFloat(String(excel.data[1][tmp_value]).replace(',','.'));

        for(var i = 1, i_max = excel.data.length; i < i_max; i++){

          var num_tmp = parseFloat(String(excel.data[i][tmp_value]).replace(',','.'));

          if((tmp_min > num_tmp) && (num_tmp != "")){ tmp_min = num_tmp; }
          if((tmp_max < num_tmp) && (num_tmp != "")){ tmp_max = num_tmp; }
        }
        //console.log("min max value: ",tmp_min, tmp_max);
      }
      
      console.log('wynik: ',tmp_min,tmp_max);

      layers.min_value[layers.active] = tmp_min
      layers.max_value[layers.active] = tmp_max;

      //aktualizujemy tablicę legend
      legends.update();
    }
  },

  show_color : function(){
    //wyświetlamy pierwszalistę kolorów
    var html = '';

    for (var i = 0, i_max = this.color_arr[0].length; i<i_max; i++){
      
      if(layers.colors_pos[layers.active][i] == 1){
        html += '<span class="active" style="background:'+this.color_arr[layers.palets_active[layers.active]][i]+'"></span>';
      }
      else{
        html += '<span style="background:'+this.color_arr[layers.palets_active[layers.active]][i]+'"></span>';
      }
    }

    $('#palets #select').html( html );
    
    $('#palets #select > span').click(function(){ palets.select_color(this); });

  },

  show_palets : function(){
    
    //wyswietlamy wszystkie palety
    var html = '';
    for (var i = 0, i_max = this.color_arr.length;i < i_max; i++){
      
      if(i == layers.palets_active[layers.active]){
        html += '<span class="active">';
      }
      else{
        html += '<span>';
      }

      for (var j = 0, j_max = this.color_arr[0].length; j < j_max; j++){
        html += '<span style="background:' + this.color_arr[i][j] + '"></span>';
      }
      html += '</span>';

    }
    $('#palets #all').html( html );
    $('#palets #all > span').click(function(){ palets.select_palets(this);});
 
  },

  //zaznaczamy konkretne kolory do wyświetlenia
  select_color : function(obj){
    if((layers.value[layers.active] != -1) && (layers.category[layers.active] != -1)){
      if( $(obj).hasClass('active') ){
        layers.colors_pos[layers.active][$(obj).index()] = 0;
        $(obj).removeClass('active');
      }
      else{
        layers.colors_pos[layers.active][$(obj).index()] = 1;
        $(obj).addClass('active');
      }
      this.parse_color();
      palets.set_min_max_value();
    }
  },

  //dodajemy do tablicy aktywnych kolorów te które są zaznaczone
  parse_color : function(){
    layers.colors_active[layers.active] = [];
     for (var i = 0, i_max = this.color_arr[0].length; i<i_max; i++){

      if( $('#palets #select span').eq(i).hasClass('active') ){
        layers.colors_active[layers.active].push( rgb2hex($('#palets #select span').eq(i).css('background-color')) );
      }
     }
    //categories.color_from_excel();
    //funkcja pomocnicza
    function rgb2hex(rgb) {
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      
      function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
      }
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    legends.update();
  },

  //zaznaczamy palete kolorów
  select_palets : function(obj){
    if((layers.value[layers.active] != -1) && (layers.category[layers.active] != -1)){
      $('#palets #all > span').removeClass('active');
      $(obj).addClass('active');
      layers.palets_active[layers.active] = $(obj).index();
      
      //aktualizujemy paletę aktywnych kolorów
      layers.colors_active[layers.active] = [];
      for(var i = 0, i_max = layers.colors_pos[layers.active].length; i < i_max; i++){
        if(layers.colors_pos[layers.active][i] == 1){
          layers.colors_active[layers.active].push( palets.color_arr[layers.palets_active[layers.active]][i] );
        }
      }

      //aktualizujemy kolory w legendzie
      for(var i = 0, i_max = layers.legends[layers.active].length; i < i_max; i++){
        layers.legends[layers.active][i][3] = layers.colors_active[layers.active][i];
      }

      //wyświetlamy okna kolorów do zaznaczenia
      palets.show_color();
      //wyświetlamy okno z legendami
      legends.show();

      //aktualizujemy kolory na mapie
      categories.update_color();
    }
  }
}

//zdarzenia dotyczące palet
$('#excel_box select.category').change(function(){ palets.set_category(this); });
$('#excel_box select.value').change(function(){ palets.set_value(this); });
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

	draw_border: function(next){

		var width_pointer = this.size + this.padding_x,
				height_pointer = this.size + this.padding_y,
				none_color = "rgba(0,0,0,0)",
				border = {},
				data = {};
		
		var next = next || false;

		if((this.main_kind == 'square') || (this.main_kind == 'circle') || (this.main_kind == 'hexagon')){
				
			//canvas.context.fillStyle = this.color_border;
			canvas.context.globalAlpha=1;
			//canvas.context.fillStyle = 'rgba(128,0,0,1)';

			if(!next){
				//canvas.context.globalAlpha=1;
				canvas.context.fillStyle = 'rgba(255,255,255,1)';
			}
			else{
				//canvas.context.globalAlpha=0.5;
				canvas.context.fillStyle = this.color_border;
			}



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

						if(!next){
							figures.square_border_big(data);
						}
						else{
							figures.square_border_small(data);
						}
					}
				}	
			}
		}

		if(!next){
			this.draw_border(true);
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
			this.draw_border(false);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNvbG9yX3BpY2tlci5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJnbG9iYWwuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vZGVscy5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdlhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InByb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2N6eXN6Y3plbmllIGkgcnlzb3dhbmllIHBvIGNhbnZhc2llXG52YXIgY2FudmFzID0ge1xuXHRcblx0c2NhbGUgOiAxMDAsXG5cdHdpZHRoX2NhbnZhcyA6IDcwMCxcblx0aGVpZ2h0X2NhbnZhcyA6IDQwMCxcblx0Y2FudmFzIDogbnVsbCxcblx0Y29udGV4dCA6IG51bGwsXG5cdHRodW1ibmFpbCA6IG51bGwsXG5cdHRpdGxlX3Byb2plY3QgOiAnbm93eSBwcm9qZWt0JyxcblxuXHRjb250ZXh0X3ggOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF95IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB5XG5cdGNvbnRleHRfbmV3X3ggOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfbmV3X3kgOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB5XG5cblx0b2Zmc2V0X2xlZnQgOiBudWxsLFxuXHRvZmZzZXRfdG9wIDogbnVsbCxcblx0YWN0aXZlX3JvdyA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cdGFjdGl2ZV9jb2x1bW4gOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXG5cdHRodW1ibmFpbCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbl9jYW52YXNcIik7XG5cdFx0dmFyIGRhdGFVUkwgPSBjYW52YXMudG9EYXRhVVJMKCk7XG5cdFx0Y29uc29sZS5sb2coZGF0YVVSTCk7XG5cdH0sXG5cblx0Ly9yeXN1amVteSBjYW52YXMgemUgemRqxJljaWVtXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGlmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkgIGltYWdlLmRyYXcoKTtcblx0fSxcblxuXHRkcmF3X3RodW1uYWlsIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy50aHVtYm5haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdH0sXG5cblx0Ly9yZXNldHVqZW15IHTFgm8gemRqxJljaWFcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHR9LFxuXG5cdC8vIGN6ecWbY2lteSBjYcWCZSB6ZGrEmWNpZSBuYSBjYW52YXNpZVxuXHRjbGVhciA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0XHQvL3RoaXMuY29udGV4dC5maWxsUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0fSxcblxuXHRyZXNpemVfd2lkdGggOiBmdW5jdGlvbihuZXdfd2lkdGgpe1xuXHRcdHRoaXMud2lkdGhfY2FudmFzID0gbmV3X3dpZHRoO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyx0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IHRoaXMud2lkdGhfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwodGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlICsgJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0fSxcblxuXHRyZXNpemVfaGVpZ2h0IDogZnVuY3Rpb24obmV3X2hlaWdodCl7XG5cdFx0dGhpcy5oZWlnaHRfY2FudmFzID0gbmV3X2hlaWdodDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3MoeydoZWlnaHQnOiB0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwodGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSsnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpOyAvLyBha3R1YWxpenVqZW15IGRhbmUgb2Rub8WbbmllIHJvem1pYXLDs3cgY2FudmFzYSB3IG1lbnUgdSBnw7NyeVxuXHRcdC8vdGhpcy5kcmF3KCk7IC8vcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0fSxcblxuXHRzZXRfZGVmYXVsdCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cblx0XHRjYW52YXMuc2NhbGUgPSAxMDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3Qga2F0ZWdvcmlpIGRvZGFuaWUgLyBha3R1YWxpemFjamEgLyB1c3VuacSZY2llIC8gcG9rYXphbmllIGthdGVnb3JpaVxudmFyIGNhdGVnb3JpZXMgPSB7XG5cdFxuXHQvL2NhdGVnb3J5IDogbmV3IEFycmF5KFsncHVzdHknLCcjODA4MDgwJ10pLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWUgPSBBcnJheSgkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoKSwnI2ZmMDAwMCcpO1xuXHRcdCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgnJyk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2gobmFtZSk7XG5cdFx0bWVudV90b3AuY2F0ZWdvcnkgPSAodGhpcy5jYXRlZ29yeS5sZW5ndGgtMSk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbihpbmRleCxuYW1lKXtcblx0XHR0aGlzLmNhdGVnb3J5W2luZGV4XVswXSA9IG5hbWU7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXG5cdC8vYWt0dWFsaXp1amVteSB0YWJsaWPEmSBrb2xvcsOzd1xuXHR1cGRhdGVfY29sb3IgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9tb8W8bGl3YSBha3R1YWxpemFjamEgamVkeW5pZSB3IHByenlwYWRrdSB3eWJyYW5pYSBrb25rcmV0bmVqIGtvbHVtbnkgd2FydG/Fm2NpIGkga2F0ZWdvcmlpIHcgZXhjZWx1XG5cdFx0aWYoKGNydWQubWFwX2pzb24ubGVuZ3RoID4gMCkgJiYgKGV4Y2VsLmRhdGEubGVuZ3RoID4gMCkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuXG5cdFx0XHRmb3IgKHZhciBpX2NhdGVnb3J5ID0gMCwgaV9jYXRlZ29yeV9tYXggPVx0bGF5ZXJzLmNhdGVnb3J5X25hbWUubGVuZ3RoOyBpX2NhdGVnb3J5IDwgaV9jYXRlZ29yeV9tYXg7IGlfY2F0ZWdvcnkrKyl7XG5cdFx0XHRcdHZhciBuYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWVbaV9jYXRlZ29yeV07XG5cdFx0XHRcdHZhciBmaW5kID0gZmFsc2U7XG5cblx0XHRcdFx0Zm9yICh2YXIgaV9sYXllcnMgPSAwLCBpX2xheWVyc19tYXggPSBsYXllcnMubGlzdC5sZW5ndGg7IGlfbGF5ZXJzIDwgaV9sYXllcnNfbWF4OyBpX2xheWVycysrKXtcblx0XHRcdFx0XHRmb3IgKHZhciBpX2V4ZWwgPSAwLCBpX2V4ZWxfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfZXhlbCA8IGlfZXhlbF9tYXg7IGlfZXhlbCsrKXtcblx0XHRcdFx0XHRcdGlmKCggU3RyaW5nKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMuY2F0ZWdvcnlbaV9sYXllcnNdXSkudG9Mb3dlckNhc2UoKSA9PSBTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSkgJiYgKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMuY2F0ZWdvcnlbaV9sYXllcnNdXSAhPSAnJykpe1xuXG5cdFx0XHRcdFx0XHRcdGZpbmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB6bmFsZcW6bGnFm215IGthdGVnb3JpxJkgdyBleGNlbHVcblx0XHRcdFx0XHRcdFx0dmFyIHZhbHVlID0gU3RyaW5nKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMudmFsdWVbaV9sYXllcnNdXSkucmVwbGFjZSgnLCcsJy4nKTtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2lfZXhlbF1bbGF5ZXJzLnZhbHVlW2lfbGF5ZXJzXV0rJyB8ICcrdmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIGlfbGVnZW5kcyA9IDAsIGlfbGVnZW5kc19tYXggPSBsYXllcnMubGVnZW5kc1tpX2xheWVyc10ubGVuZ3RoOyBpX2xlZ2VuZHMgPCBpX2xlZ2VuZHNfbWF4OyBpX2xlZ2VuZHMrKyApe1xuXHRcdFx0XHRcdFx0XHRcdGlmKCAodmFsdWUgPj0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdW2lfbGVnZW5kc11bMF0pICYmICh2YWx1ZSA8PSBsYXllcnMubGVnZW5kc1tpX2xheWVyc11baV9sZWdlbmRzXVsxXSkgKXtcblx0XHRcdFx0XHRcdFx0XHRcdC8vamXFm2xpIHpuYWxlxbpsaXNteVxuXHRcdFx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tpX2xheWVyc11baV9jYXRlZ29yeV0gPSBsYXllcnMubGVnZW5kc1tpX2xheWVyc11baV9sZWdlbmRzXVszXTtcblx0XHRcdFx0XHRcdFx0XHRcdGlfbGVnZW5kcyA9IGlfbGVnZW5kc19tYXg7XG5cdFx0XHRcdFx0XHRcdFx0XHRpX2V4ZWwgPSBpX2V4ZWxfbWF4O1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vamXFm2xpIHdhcnRvxZvEhyB3eWNob2R6aSBwb3phIHNrYWxlIHUgdGFrIHByenlwaXN1amVteSBqZWogb2Rwb3dpZWRuaSBrb2xvclxuXHRcdFx0XHRcdFx0XHRpZih2YWx1ZSA8IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVswXVswXSl7XG5cdFx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tpX2xheWVyc11baV9jYXRlZ29yeV0gPSBsYXllcnMubGVnZW5kc1tpX2xheWVyc11bMF1bM107XG5cdFx0XHRcdFx0XHRcdH1cdFxuXG5cdFx0XHRcdFx0XHRcdGlmKHZhbHVlID4gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdW2lfbGVnZW5kc19tYXgtMV1bMV0pe1xuXHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdW2lfbGVnZW5kc19tYXgtMV1bM107XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdC8vamXFm2xpIGRhbnkga3JhaiB3IGV4Y2VsdSBtYSB3YXJ0b8WbxIcgbnVsbCBkb215xZtsbmllIG90cnp5bXVqZSBrb2xvciBiaWHFgnlcblx0XHRcdFx0XHRcdFx0aWYodmFsdWUgPT0gbnVsbCl7XG5cdFx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tpX2xheWVyc11baV9jYXRlZ29yeV0gPSAnI2ZmZic7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vdyBwcnp5cGFka3UgZ2R5IGRhbnkga3JhaiBuaWUgd3lzdMSZcHVqZSB3IHBsaWt1IGV4Y2VsIG90cnp5bXVqZSBrb2xvciBiaWHFgnlcblx0XHRcdFx0XHRpZighZmluZCl7XG5cdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2lfbGF5ZXJzXVtpX2NhdGVnb3J5XSA9ICcjZmZmJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9wbyB6YWt0dWFsaXpvd2FuaXUga29sb3LDs3cgdyBrYXRlZ29yaWFjaCByeXN1amVteSBuYSBub3dvIGNhbnZhc1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbihpZCl7XG5cdFx0dmFyIHRoID0gdGhpcztcblxuXHRcdCQuZWFjaCh0aGlzLmNhdGVnb3J5LGZ1bmN0aW9uKGluZGV4LHZhbHVlKXtcblx0XHRcdGlmKGluZGV4ID49IGlkKXtcblx0XHRcdFx0dGguY2F0ZWdvcnlbaW5kZXhdID0gdGguY2F0ZWdvcnlbaW5kZXgrMV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IHBvaW50ZXJzLnBvaW50ZXJzLmxlbmd0aDsgcm93Kyspe1xuXHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBwb2ludGVycy5wb2ludGVyc1tyb3ddLmxlbmd0aDsgY29sdW1uKyspe1xuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gMDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA+IGlkKXtcblx0XHRcdFx0XHRwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSBwYXJzZUludChwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pIC0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5jYXRlZ29yeS5wb3AoKTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXG5cdFx0Ly9yeXN1amVteSBuYSBub3fEhSBjYW52YXNcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHNob3dfbGlzdCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgYWRkX2NhdGVnb3J5ID0gXCI8dGFibGU+XCI7XG5cdFx0Ly92YXIgYWRkX3NlbGVjdCA9JzxvcHRpb24gbmFtZT1cIjBcIj5wdXN0eTwvb3B0aW9uPic7XG5cdFx0dmFyIGFkZF9zZWxlY3QgPSAnJztcblxuXHRcdGZvcih2YXIgaSA9IHRoaXMuY2F0ZWdvcnkubGVuZ3RoOyBpID4gMTsgaS0tKXtcblx0XHRcdGFkZF9jYXRlZ29yeSArPSAnPHRyPjx0ZD48c3Bhbj4nKyhpLTEpKyc8L3NwYW4+PC90ZD48dGQ+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImNhdGVnb3J5X25hbWVcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiIHZhbHVlPVwiJyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnXCIgLz48L3RkPjx0ZD48ZGl2IGNsYXNzPVwiY29sb3JwaWNrZXJfYm94XCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMV0rJ1wiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+PC9kaXY+PC90ZD48dGQ+PGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+dXN1bjwvYnV0dG9uPjwvdGQ+PC90cj4nO1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiJysoaS0xKSsnXCI+Jyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cblx0XHRpZihtZW51X3RvcC5jYXRlZ29yeSA9PSAwKXtcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gc2VsZWN0ZWQgbmFtZT1cIjBcIj4nK3RoaXMuY2F0ZWdvcnlbMF1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblxuXHRcdGFkZF9jYXRlZ29yeSArPSBcIjwvdGFibGU+XCI7XG5cblx0XHQkKCcjY2F0ZWdvcnlfYm94ICNsaXN0JykuaHRtbChhZGRfY2F0ZWdvcnkpO1xuXHRcdCQoJ3NlbGVjdCNjaGFuZ2VfY2F0ZWdvcnknKS5odG1sKGFkZF9zZWxlY3QpO1xuXG5cdFx0Y29sb3JwaWNrZXIuYWRkKCk7XG5cdH1cbn1cbiIsImNsb3VkID0ge1xuXG5cdHNldF90ZXh0YXJlYSA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2Nsb3VkIC5jbG91ZF90ZXh0JykudmFsKCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0fSxcblxuXHQvKmdldF90ZXh0YXJlYSA6IGZ1bmN0aW9uKHRleHRfdG1wKXtcblxuXHRcdC8vdmFyIHRleHRfdG1wID0gJChvYmopLnZhbCgpO1xuXG5cdFx0bGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdID0gdGV4dF90bXA7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSA9IGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXS5yZXBsYWNlKCd7JytleGNlbC5kYXRhWzBdW2ldKyd9JywnXCIrZXhjZWwuZGF0YVt0bXBfcm93XVsnK2krJ11cIisnKTtcblx0XHR9XG5cblx0XHRsYXllcnMuY2xvdWRfcGFyc2VyW2xheWVycy5hY3RpdmVdID0gJ1wiJyt0ZXh0X3RtcCsnXCInO1xuXHR9LCovXG5cblx0Ly91c3Rhd2lhbXkgcG9wcmF3bsSFIHBvenljasSZIGR5bWthXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGxlZnQgPSBtb3VzZS5sZWZ0IC0gb25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X3RvcDtcblxuXHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmNzcyh7dG9wOnBhcnNlSW50KHRvcCAtICQoXCIjY2FudmFzX2Nsb3VkXCIpLmhlaWdodCgpLTMwKSsncHgnLGxlZnQ6bGVmdCsncHgnfSk7XG5cdH0sXG5cblx0Ly9mdW5rY2phIG9kcG93aWVkemlhbG5hIHphIHd5xZt3aWV0bGVuaWUgZHlta2EgeiBvZHBvd2llZG5pxIUgemF3YXJ0b8WbY2nEhVxuXHR1cGRhdGVfdGV4dCA6IGZ1bmN0aW9uKCl7XG5cdFx0XG5cdFx0aWYoKG9uX2NhdGVnb3J5Lm5hbWUgIT0gXCJcIikgJiYgKG9uX2NhdGVnb3J5Lm5hbWUgIT0gJ251bGwnKSl7XG5cblx0XHRcdHZhciB0bXBfcm93ID0gbnVsbDtcblx0XHRcdHZhciBmaW5kID0gMDtcblx0XHRcdGZvcih2YXIgaV9yb3cgPSAwLCBpX3Jvd19tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaV9yb3cgPCBpX3Jvd19tYXg7IGlfcm93KysgKXtcblx0XHRcdFx0aWYoU3RyaW5nKG9uX2NhdGVnb3J5Lm5hbWUpLnRvTG93ZXJDYXNlKCkgPT0gU3RyaW5nKGV4Y2VsLmRhdGFbaV9yb3ddW2xheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXV0pLnRvTG93ZXJDYXNlKCkpe1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRoaXMuc2V0X3Bvc2l0aW9uKCk7XG5cdFx0XHRcdFx0dmFyIHRleHRfdG1wID0gbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdO1xuXG5cdFx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRcdFx0dGV4dF90bXAgPSB0ZXh0X3RtcC5yZXBsYWNlKCd7JytleGNlbC5kYXRhWzBdW2ldKyd9JyxleGNlbC5kYXRhW2lfcm93XVtpXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9kb3BpZXJvIGplxZtsaSBkeW1layBtYSBtaWXEhyBqYWthxZsga29ua3JldG7EhSB6YXdhcnRvxZvEhyB3ecWbd2lldGxhbXkgZ29cblx0XHRcdFx0XHRpZih0ZXh0X3RtcCE9XCJcIil7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlSW4oMCk7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5odG1sKHRleHRfdG1wKTtcblx0XHRcdFx0XHRcdGZpbmQgPSAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2plxZtsaSBuaWUgem5hbGV6aW9ubyBvZHBvd2llZG5pZWoga2F0ZWdvcmlpXG5cdFx0XHRpZiAoIWZpbmQpIHsgXG5cdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMCk7XG5cdFx0fVxuXHR9XG5cbn1cblxuLypcbiQoJyNjbG91ZCAuY2xvdWRfdGV4dCcpLmtleXVwKGZ1bmN0aW9uKCl7XG5cblx0Y2xvdWQuZ2V0X3RleHRhcmVhKHRoaXMpO1xuXG59KSA7Ki8iLCIvL3NhbWEgbmF6d2Egd2llbGUgdMWCdW1hY3p5IHBvIHByb3N0dSBjb2xvcnBpY2tlclxudmFyIGNvbG9ycGlja2VyID0ge1xuXG5cdHJvdyA6IG51bGwsXG5cdGNvbF9udW0gOiBudWxsLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnLmNvbG9ycGlja2VyX2JveCcpLkNvbG9yUGlja2VyKHtcblxuXHRcdFx0Y29sb3I6ICcjZmYwMDAwJyxcblx0XHRcdFxuXHRcdFx0b25TaG93OiBmdW5jdGlvbiAoY29scGtyKSB7XG5cdFx0XHRcdGlmKCQoY29scGtyKS5jc3MoJ2Rpc3BsYXknKT09J25vbmUnKXtcblx0XHRcdFx0XHQkKGNvbHBrcikuZmFkZUluKDIwMCk7XG5cdFx0XHRcdFx0Y29sb3JwaWNrZXIucm93ID0gJCh0aGlzKS5hdHRyKCdyb3cnKTtcblx0XHRcdFx0XHRjb2xvcnBpY2tlci5jb2xfbnVtID0gJCh0aGlzKS5hdHRyKCdjb2xfbnVtJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdFxuXHRcdFx0b25IaWRlOiBmdW5jdGlvbiAoY29scGtyKSB7XG5cdFx0XHRcdCQoY29scGtyKS5mYWRlT3V0KDIwMCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRcblx0XHRcdG9uQ2hhbmdlOiBmdW5jdGlvbiAoaHNiLCBoZXgsIHJnYikge1xuXHRcdFx0XHQkKCcjbGVnZW5kcyB0ciB0ZFtyb3c9XCInK2NvbG9ycGlja2VyLnJvdysnXCJdJykuY3NzKCdiYWNrZ3JvdW5kQ29sb3InLCAnIycgKyBoZXgpO1xuXHRcdFx0XHRcbiBcdFx0XHRcdFx0cGFsZXRzLmNvbG9yX2FyclsgcGFsZXRzLmNvbG9yX2Fyci5sZW5ndGgtMSBdID0gcGFsZXRzLmNvbG9yX2FyclsgbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gXS5zbGljZSgpXG5cdFx0XHRcdFx0cGFsZXRzLmNvbG9yX2FyclsgcGFsZXRzLmNvbG9yX2Fyci5sZW5ndGgtMSBdW2NvbG9ycGlja2VyLmNvbF9udW1dID0gJyMnICsgaGV4O1xuXHRcdFx0XHRcdC8vbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gcGFsZXRzLmNvbG9yX2Fyci5sZW5ndGggLTE7XG5cdFx0XHRcdFx0bGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1bY29sb3JwaWNrZXIucm93XSA9ICAnIycgKyBoZXg7XG5cdFx0XHRcdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1bY29sb3JwaWNrZXIucm93XVszXSA9ICAnIycgKyBoZXg7XG5cblx0XHRcdFx0XHRwYWxldHMuc2hvdygpO1xuICAgICAgXHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0Y29sb3JfYm9yZGVyIDogZnVuY3Rpb24oKXtcblx0XHQkKCcuY29sb3JfYm9yZGVyJykuQ29sb3JQaWNrZXIoe1xuXG5cdFx0b25CZWZvcmVTaG93OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHQkKHRoaXMpLkNvbG9yUGlja2VyU2V0Q29sb3IocG9pbnRlcnMuY29sb3JfYm9yZGVyKTtcblx0XHR9LFxuXHRcdFx0XHRcblx0XHRcdG9uU2hvdzogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHRpZigkKGNvbHBrcikuY3NzKCdkaXNwbGF5Jyk9PSdub25lJyl7XG5cdFx0XHRcdFx0JChjb2xwa3IpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdC8vY29sb3JwaWNrZXIucm93ID0gJCh0aGlzKS5hdHRyKCdyb3cnKTtcblx0XHRcdFx0XHQvL2NvbG9ycGlja2VyLmNvbF9udW0gPSAkKHRoaXMpLmF0dHIoJ2NvbF9udW0nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0XG5cdFx0XHRvbkhpZGU6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0JChjb2xwa3IpLmZhZGVPdXQoMjAwKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdFxuXHRcdFx0b25DaGFuZ2U6IGZ1bmN0aW9uIChoc2IsIGhleCwgcmdiKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRwb2ludGVycy5jb2xvcl9ib3JkZXIgPSAgJyMnICsgaGV4O1xuXG5cdFx0XHRcdCQoJy5jb2xvcl9ib3JkZXInKS5jc3MoJ2JhY2tncm91bmRDb2xvcicsICcjJyArIGhleCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZihwb2ludGVycy5zaG93X2JvcmRlcil7XG5cdFx0XHRcdFx0cG9pbnRlcnMuZHJhd19ib3JkZXIoZmFsc2UpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuIiwiLy9mdW5rY2phIG9kcG93aWVkemlhbG5hIHphIHR3b3J6ZW5pZSB6YXBpc3l3YW5pZSBpIGFrdHVhbGl6YWNqZSBkYW55Y2ggZG90eWN6xIXEh2N5aCBtYXB5XG52YXIgY3J1ZCA9IHtcblxuXHRtYXBfanNvbiA6IEFycmF5KCksIC8vZ8WCw7N3bmEgem1pZW5uYSBwcnplY2hvd3VqxIVjYSB3c3p5c3RraWUgZGFuZVxuXHRtYXBfaGFzaCA6bnVsbCxcblx0bGF5ZXJzIDoge30sXG5cdGV4Y2VsIDogQXJyYXkoKSxcblx0cHJvamVjdCA6IHt9LFxuXHRwcm9qZWN0X2hhc2ggOiBudWxsLCAvL2fFgsOzd255IGhhc2ggZG90eWN6xIVjeSBuYXN6ZWdvIHByb2pla3R1XG5cblx0Ly9wb2JpZXJhbXkgZGFuZSB6IHBvcm9qZWt0dSBpIHphcGlzdWplbXkgamUgZG8ganNvbi1hXG5cdHBhcnNlX2RhdGEgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBkb3R5Y3rEhWNlIG1hcHkgKGNhbnZhc2EpXG5cblx0XHQvL3plcnVqZW15IG5hIG5vd28gY2HFgsSFIHRhYmxpY8SZIHBvaW50ZXLDs3dcblx0XHR0aGlzLm1hcF9qc29uID0gQXJyYXkoKTtcblxuXHRcdC8vZGF0YVt4XSA9IHptaWVubmUgcG9kc3Rhd293ZSBkb3R5Y3rEhWNlIG1hcHlcblx0XHR0aGlzLm1hcF9qc29uWzBdID0gQXJyYXkoKTtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzBdID0gY2FudmFzLmhlaWdodF9jYW52YXM7XG5cdFx0dGhpcy5tYXBfanNvblswXVsxXSA9IGNhbnZhcy53aWR0aF9jYW52YXM7XG5cdFx0dGhpcy5tYXBfanNvblswXVsyXSA9IHBvaW50ZXJzLnBhZGRpbmdfeDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzNdID0gcG9pbnRlcnMucGFkZGluZ195O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNF0gPSBwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNV0gPSBwb2ludGVycy5zaXplO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNl0gPSBwb2ludGVycy5tYWluX2tpbmQ7XG5cdFx0dGhpcy5tYXBfanNvblswXVs3XSA9IGNhbnZhcy50aXRsZV9wcm9qZWN0O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bOF0gPSBwb2ludGVycy5jb2xvcl9ib3JkZXI7XG5cdFx0dGhpcy5tYXBfanNvblswXVs5XSA9IHBvaW50ZXJzLnNob3dfYm9yZGVyO1xuXG5cdFx0Ly8gZGF0YVsxXSA9IHRhYmxpY2EgcHVua3TDs3cgKHBvaW50ZXJzLnBvaW50ZXJzKSBbd2llcnN6XVtrb2x1bW5hXSA9IFwibm9uZVwiIHx8IChudW1lciBrYXRlZ29yaWkpXG5cdFx0dGhpcy5tYXBfanNvblsxXSA9IHBvaW50ZXJzLnBvaW50ZXJzO1xuXG5cdFx0Ly8gZGF0YVsyXSA9IHRhYmxpY2Ega2F0ZWdvcmlpXG5cdFx0dGhpcy5tYXBfanNvblsyXSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnk7XG5cblx0XHQvL2RhdGFbM10gPSB0YWJsaWNhIHd6b3JjYSAoemRqxJljaWEgdyB0bGUgZG8gb2RyeXNvd2FuaWEpXG5cdFx0dGhpcy5tYXBfanNvblszXSA9IEFycmF5KCk7XG5cblx0XHRpZihpbWFnZS5vYmope1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVswXSA9IGltYWdlLm9iai5zcmM7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzFdID0gaW1hZ2UueDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMl0gPSBpbWFnZS55O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVszXSA9IGltYWdlLndpZHRoO1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs0XSA9IGltYWdlLmhlaWdodDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bNV0gPSBpbWFnZS5hbHBoYTtcblx0XHR9XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIGRvdHljesSFY2UgcHJvamVrdMOzdyAobGF5ZXJzKVxuXHRcdC8vdHdvcnp5bXkgb2JpZWt0IHdhcnN0d3kgemF3aWVyYWrEhWN5IHdzenlzdGtpZSBkYW5lIGRvdHljesSFY2UgcHJvamVrdHVcblxuXHRcdHRoaXMubGF5ZXJzLnBhbGV0c19hY3RpdmUgPSBsYXllcnMucGFsZXRzX2FjdGl2ZTtcblx0XHR0aGlzLmxheWVycy52YWx1ZSA9IGxheWVycy52YWx1ZTtcblx0XHR0aGlzLmxheWVycy5jb2xvcnNfcG9zID0gbGF5ZXJzLmNvbG9yc19wb3M7XG5cdFx0dGhpcy5sYXllcnMuY29sb3JzX2FjdGl2ZSA9IGxheWVycy5jb2xvcnNfYWN0aXZlO1xuXHRcdHRoaXMubGF5ZXJzLm1pbl92YWx1ZSA9IGxheWVycy5taW5fdmFsdWU7XG5cdFx0dGhpcy5sYXllcnMubWF4X3ZhbHVlID0gbGF5ZXJzLm1heF92YWx1ZTtcblx0XHR0aGlzLmxheWVycy5jbG91ZCA9IGxheWVycy5jbG91ZDtcblx0XHR0aGlzLmxheWVycy5jbG91ZF9wYXJzZXIgPSBsYXllcnMuY2xvdWRfcGFyc2VyO1xuXHRcdHRoaXMubGF5ZXJzLmxlZ2VuZHMgPSBsYXllcnMubGVnZW5kcztcblx0XHR0aGlzLmxheWVycy5sYWJlbHMgPSBsYXllcnMubGFiZWxzO1xuXHRcdHRoaXMubGF5ZXJzLmNhdGVnb3J5ID0gbGF5ZXJzLmNhdGVnb3J5O1xuXHRcdHRoaXMubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyA9IGxheWVycy5jYXRlZ29yeV9jb2xvcnM7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnlfbmFtZSA9IGxheWVycy5jYXRlZ29yeV9uYW1lO1xuXHRcdHRoaXMubGF5ZXJzLmxpc3QgPSBsYXllcnMubGlzdDtcblxuXHRcdC8vem1pZW5uZSBnbG9iYWxuZSBkb3R5Y3rEhWNlIGNhxYJlZ28gcHJvamVrdHVcblx0XHR0aGlzLnByb2plY3QubmFtZSA9IGxheWVycy5wcm9qZWN0X25hbWU7XG5cdFx0dGhpcy5wcm9qZWN0LnNvdXJjZSA9IGxheWVycy5zb3VyY2U7XG5cblx0XHQvL3R3b3J6eW15IG9iaWVrdCBleGNlbGFcblx0XHR0aGlzLmV4Y2VsID0gZXhjZWwuZGF0YTtcblxuXG5cdH0sXG5cblx0cHVibGlzaCA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZihjcnVkLnByb2plY3RfaGFzaCAhPSBudWxsKXtcblx0XHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vxYJhdGEgZGxhIG1vemlsbGlcblx0XHRcdGlmKCAoJCgnLnB1Ymxpc2ggLmVtYmVkJykuY3NzKCdkaXNwbGF5JykgPT0gJ2Jsb2NrJykgJiYgKCQoZXZlbnQudGFyZ2V0KS5oYXNDbGFzcygncHVibGlzaCcpKSApe1xuXHRcdFx0XHQkKCcucHVibGlzaCAuZW1iZWQnKS5mYWRlT3V0KDUwMCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHQkKCcucHVibGlzaCAuZW1iZWQnKS5odG1sKCc8aWZyYW1lIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIicrY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4XCIgYm9yZGVyPVwiMFwiIGZyYW1lYm9yZGVyPVwiMFwiIGJvcmRlcj1cIjBcIiBhbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIiB2c3BhY2U9XCIwXCIgaHNwYWNlPVwiMFwiIHNyYz1cImh0dHA6Ly8nK2xvY2F0aW9uLmhyZWYuc3BsaXQoICcvJyApWzJdKycvZW1iZWQvJytjcnVkLnByb2plY3RfaGFzaCsnXCI+PC9pZnJhbWU+Jyk7XG5cdFx0XHRcdCQoJyNpZnJhbWUnKS5odG1sKCc8aWZyYW1lICBvbmxvYWQ9XCJjcnVkLnB1Ymxpc2hfZ2V0U2l6ZSh0aGlzKVwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIicrY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4XCIgYm9yZGVyPVwiMFwiIGZyYW1lYm9yZGVyPVwiMFwiIGJvcmRlcj1cIjBcIiBhbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIiB2c3BhY2U9XCIwXCIgaHNwYWNlPVwiMFwiIHNyYz1cImh0dHA6Ly8nK2xvY2F0aW9uLmhyZWYuc3BsaXQoICcvJyApWzJdKycvZW1iZWQvJytjcnVkLnByb2plY3RfaGFzaCsnXCI+PC9pZnJhbWU+Jyk7XG5cblx0XHRcdFx0JCgnLnB1Ymxpc2ggLmVtYmVkJykuZmFkZUluKDUwMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhbGVydCgnbmFqcGllcncgemFwaXN6IHByb2pla3QgYSBuYXN0xJlwbmllIGdvIHB1Ymxpa3VqJyk7XG5cdFx0fVxuXHR9LFxuXG5cdHB1Ymxpc2hfZ2V0U2l6ZSA6IGZ1bmN0aW9uKG9iail7XG5cdFx0Y29uc29sZS5sb2cob2JqLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuYm9keSk7XG5cdFx0Y29uc29sZS5sb2coJChvYmouY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5KS5oZWlnaHQoKSAsJChvYmouY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5KS53aWR0aCgpKTtcbiAgICAvL29iai5zdHlsZS5oZWlnaHQgPSBvYmouY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCArICdweCc7XG5cdH0sXG5cblxuXHQvL3djenl0YW5pZSB6bWllbm55Y2ggZG8gb2JpZWt0w7N3IG1hcHlcblxuXHRzZXRfbWFwIDogZnVuY3Rpb24oZGF0YSl7XG5cblx0XHQvL3BvIHphcGlzYW5pdSBkYW55Y2ggZG8gYmF6eSBha3R1YWxpenVqZW15IGlkICh3IHByenlwYWRrdSBqZcWbbGkgaXN0bmllamUgbmFkcGlzdWplbXkgamUpXG5cdFx0dGhpcy5tYXBfanNvbiA9IGRhdGE7XG5cblx0XHQvL3BvYmllcmFteSBpIHdjenl0dWplbXkgZGFuZSBvIGNhbnZhc2llIGRvIG9iaWVrdHVcblx0XHRjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IGRhdGFbMF1bMF07XG5cdFx0Y2FudmFzLndpZHRoX2NhbnZhcyA9IGRhdGFbMF1bMV07XG5cdFx0cG9pbnRlcnMucGFkZGluZ194ID0gZGF0YVswXVsyXTtcblx0XHRwb2ludGVycy5wYWRkaW5nX3kgPSBkYXRhWzBdWzNdO1xuXHRcdHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8gPSBkYXRhWzBdWzRdO1xuXHRcdHBvaW50ZXJzLnNpemUgPSBkYXRhWzBdWzVdO1xuXHRcdHBvaW50ZXJzLm1haW5fa2luZCA9IGRhdGFbMF1bNl07XG5cdFx0Y2FudmFzLnRpdGxlX3Byb2plY3QgPSBkYXRhWzBdWzddO1xuXHRcdFxuXHRcdGlmKHR5cGVvZiBkYXRhWzBdWzhdID09ICd1bmRlZmluZWQnKXtcblx0XHRcdHBvaW50ZXJzLmNvbG9yX2JvcmRlciA9IFwiIzAwMFwiO1xuXHRcdH1lbHNle1xuXHRcdFx0cG9pbnRlcnMuY29sb3JfYm9yZGVyID0gZGF0YVswXVs4XTtcblx0XHR9XG5cblx0XHRpZih0eXBlb2YgZGF0YVswXVs5XSA9PSAndW5kZWZpbmVkJyl7XG5cdFx0XHRwb2ludGVycy5zaG93X2JvcmRlciA9IGZhbHNlO1xuXHRcdH1lbHNle1xuXHRcdFx0cG9pbnRlcnMuc2hvd19ib3JkZXIgPSBkYXRhWzBdWzldO1xuXHRcdH1cbiBcbiBcdFx0JCgnI3BvaW50ZXJfYm94IC5jb2xvcl9ib3JkZXInKS5jc3MoJ2JhY2tncm91bmQtY29sb3InLHBvaW50ZXJzLmNvbG9yX2JvcmRlcik7XG5cblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeFwiXScpLnZhbCggZGF0YVswXVsyXSApO1xuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ195XCJdJykudmFsKCBkYXRhWzBdWzNdICk7XG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJzaXplXCJdJykudmFsKCBkYXRhWzBdWzVdICk7XG5cdFx0JCgnaW5wdXRbbmFtZT1cInRpdGxlX3Byb2plY3RcIl0nKS52YWwoIGRhdGFbMF1bN10gKTtcblxuXHRcdGlmKCBkYXRhWzBdWzRdICl7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0fVxuXG5cdFx0aWYoIHBvaW50ZXJzLnNob3dfYm9yZGVyICl7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJzaG93X2JvcmRlclwiXScpLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJzaG93X2JvcmRlclwiXScpLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHR9XG5cblx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5odG1sKCcnKTtcblxuXHRcdHBvaW50ZXJzLmtpbmRzLmZvckVhY2goZnVuY3Rpb24oa2luZCl7XG5cblx0XHRcdGlmKGtpbmQgPT0gZGF0YVswXVs2XSl7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBzZWxlY3RlZD1cInNlbGVjdGVkXCIgbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIG8gcG9pbnRlcmFjaFxuXHRcdHBvaW50ZXJzLnBvaW50ZXJzID0gZGF0YVsxXTtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgbyBrYXRlZ29yaWFjaFxuXHRcdGNhdGVnb3JpZXMuY2F0ZWdvcnkgPSBkYXRhWzJdO1xuXG5cblx0XHQvL3BvIHdjenl0YW5pdSBtYXB5IGFrdHlhbGl6dWplbXkgZGFuZSBkb3R5Y3rEhWPEhSBrYXRlZ29yaWkgaSBrb2xvcsOzd1xuXHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbMF0gPSBbXTtcblx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZSA9IFtdO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBjYXRlZ29yaWVzLmNhdGVnb3J5Lmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0Y29uc29sZS5sb2coIGNhdGVnb3JpZXMuY2F0ZWdvcnlbaV1bMF0gKTtcblx0XHRcdGxheWVycy5jYXRlZ29yeV9uYW1lLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVswXSk7XG5cdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzWzBdLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVsxXSk7XG5cdFx0fVxuXG5cdFx0Ly9wb2JpZXJhbmllIGRhbnljaCBvIHpkasSZY2l1IGplxbxlbGkgaXN0bmllamVcblx0XHRpZiggZGF0YVszXS5sZW5ndGggPiAyKXtcblx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0aW1hZ2Uub2JqLnNyYyA9IGRhdGFbM11bMF07XG5cdFx0XHRpbWFnZS54ID0gcGFyc2VJbnQoIGRhdGFbM11bMV0gKTtcblx0XHRcdGltYWdlLnkgPSBwYXJzZUludCggZGF0YVszXVsyXSApO1xuXHRcdFx0aW1hZ2Uud2lkdGggPSBwYXJzZUludCggZGF0YVszXVszXSApO1xuXHRcdFx0aW1hZ2UuaGVpZ2h0ID0gcGFyc2VJbnQoIGRhdGFbM11bNF0gKTtcblx0XHRcdGltYWdlLmFscGhhID0gcGFyc2VJbnQoIGRhdGFbM11bNV0gKTtcblxuXHRcdFx0Ly96YXpuYWN6ZW5pZSBvZHBvd2llZG5pZWdvIHNlbGVjdGEgYWxwaGEgdyBtZW51IHRvcFxuXHRcdFx0JCgnI2FscGhhX2ltYWdlIG9wdGlvbltuYW1lPVwiJytcdGltYWdlLmFscGhhICsnXCJdJykuYXR0cignc2VsZWN0ZWQnLHRydWUpO1xuXG5cdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7IGNhbnZhcy5kcmF3KCk7IH07XG5cdFx0fVxuXG5cdFx0Ly96YWt0dWFsaXpvd2FuaWUgZGFueWNoIHcgaW5wdXRhY2hcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsIGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JywgY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzpjYW52YXMud2lkdGhfY2FudmFzKydweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMrJ3B4J30pO1xuXG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRjYXRlZ29yaWVzLnNob3dfbGlzdCgpO1xuXG5cdH0sXG5cblx0c2V0X3Byb2plY3QgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vd2N6eXR1amVteSBkYW5lIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMuc2V0X21hcCggSlNPTi5wYXJzZShkYXRhLm1hcF9qc29uKSApO1xuXHRcdFxuXHRcdGV4Y2VsLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEuZXhjZWwpO1xuXG5cdFx0ZGF0YS5wcm9qZWN0ID0gSlNPTi5wYXJzZShkYXRhLnByb2plY3QpOyAgXG5cdFx0ZGF0YS5sYXllcnMgPSBKU09OLnBhcnNlKGRhdGEubGF5ZXJzKTsgXG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIHByb2pla3R1XG5cdFx0bGF5ZXJzLnBhbGV0c19hY3RpdmUgPSBkYXRhLmxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdGxheWVycy52YWx1ZSA9IGRhdGEubGF5ZXJzLnZhbHVlO1xuXHRcdGxheWVycy5jb2xvcnNfcG9zID0gZGF0YS5sYXllcnMuY29sb3JzX3Bvcztcblx0XHRsYXllcnMuY29sb3JzX2FjdGl2ZSA9IGRhdGEubGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0bGF5ZXJzLm1pbl92YWx1ZSA9IGRhdGEubGF5ZXJzLm1pbl92YWx1ZTtcblx0XHRsYXllcnMubWF4X3ZhbHVlID0gZGF0YS5sYXllcnMubWF4X3ZhbHVlO1xuXHRcdGxheWVycy5jbG91ZCA9IGRhdGEubGF5ZXJzLmNsb3VkO1xuXHRcdGxheWVycy5jbG91ZF9wYXJzZXIgPSBkYXRhLmxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0bGF5ZXJzLmxlZ2VuZHMgPSBkYXRhLmxheWVycy5sZWdlbmRzO1xuXHRcdGxheWVycy5sYWJlbHMgPSBkYXRhLmxheWVycy5sYWJlbHM7XG5cdCBcdGxheWVycy5jYXRlZ29yeSA9IFx0ZGF0YS5sYXllcnMuY2F0ZWdvcnk7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZSA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0bGF5ZXJzLmxpc3QgPSBkYXRhLmxheWVycy5saXN0O1xuXG5cblxuXHRcdC8vem1pZW5uZSBnbG9iYWxuZSBkb3R5Y3rEhWNlIGNhxYJlZ28gcHJvamVrdHVcblx0XHRsYXllcnMucHJvamVjdF9uYW1lID0gZGF0YS5wcm9qZWN0Lm5hbWU7XG5cdFx0bGF5ZXJzLnNvdXJjZSA9IGRhdGEucHJvamVjdC5zb3VyY2U7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwicHJvamVjdF9uYW1lXCJdJykudmFsKGxheWVycy5wcm9qZWN0X25hbWUpO1xuXG5cdFx0dGlueU1DRS5lZGl0b3JzWzBdLnNldENvbnRlbnQoIGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSApO1xuXHRcdHRpbnlNQ0UuZWRpdG9yc1sxXS5zZXRDb250ZW50KCBsYXllcnMuc291cmNlICk7XG5cblx0XHRleGNlbC5zaG93KCk7XG5cdFx0cGFsZXRzLnNob3coKTtcblx0XHRsZWdlbmRzLnNob3coKTtcblx0XHRsYXllcnMuc2hvdygpO1xuXHRcdGxhYmVscy5zaG93KCk7XG5cblx0fSxcblxuXHQvL3BvYnJhbmllIG1hcHkgeiBiYXp5IGRhbnljaCBpIHByemVrYXp1amVteSBkbyB3Y3p5dGFuaWEgZG8gb2JpZWt0w7N3IG1hcHlcblx0Z2V0X21hcCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHRoID0gdGhpcztcblx0XHQkLmFqYXgoe1xuXHRcdFx0ICB1cmw6ICcvYXBpL21hcC8nICsgdGgubWFwX2hhc2gsXG5cdFx0ICBcdHR5cGU6IFwiR0VUXCIsXG5cdFx0ICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdFx0fSkuZG9uZShmdW5jdGlvbiggZGF0YSApIHsgdGguc2V0X21hcCggSlNPTi5wYXJzZShkYXRhLmRhdGFbMF0ubWFwX2pzb24pICk7IH0pO1xuXHR9LFxuXG5cdC8vcG9iaWVyYW5pZSBwcm9qZWt0dSB6IGJhenkgZGFueWNoIGkgd2N6eXRhbmllXG5cdGdldF9wcm9qZWN0IDogZnVuY3Rpb24oKXtcblx0XHRcblx0XHR2YXIgdGggPSB0aGlzO1xuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0ICB1cmw6ICcvYXBpL3Byb2plY3QvJyArIHRoLnByb2plY3RfaGFzaCxcblx0XHRcdCAgXHR0eXBlOiBcIkdFVFwiLFxuXHRcdFx0ICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdFx0XHR9KS5kb25lKGZ1bmN0aW9uKCBkYXRhICkgeyBcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEuZGF0YSk7XG5cdFx0XHRcdFx0aWYoZGF0YS5zdGF0dXMgPT0gJ29rJyl7XG5cdFx0XHRcdFx0XHR0aC5zZXRfcHJvamVjdCggZGF0YS5kYXRhICk7IFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0YWxlcnQoJ25pZSB1ZGHFgm8gc2nEmSB3Y3p5dGHEhyBwcm9qZWt0dScpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXHRcdH0sXG5cblx0Ly90d29yenlteSBub3d5IHByb2pla3Rcblx0Y3JlYXRlX3Byb2plY3QgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9ha3R1YWxpenVqZW15IGpzb25hIGRvIHd5c8WCYW5pYSBhamF4ZW1cblx0XHR0aGlzLnBhcnNlX2RhdGEoKTtcblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRtYXBfanNvbiA6IEpTT04uc3RyaW5naWZ5KHRoLm1hcF9qc29uKSxcblx0XHRcdG1hcF9oYXNoIDogdGgubWFwX2hhc2gsXG5cdFx0XHRsYXllcnMgOiBKU09OLnN0cmluZ2lmeSh0aC5sYXllcnMpLFxuXHRcdFx0ZXhjZWwgOiBKU09OLnN0cmluZ2lmeSh0aC5leGNlbCksXG5cdFx0XHRwcm9qZWN0IDogSlNPTi5zdHJpbmdpZnkodGgucHJvamVjdClcblx0XHR9XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IFwiYXBpL3Byb2plY3RzXCIsXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gJ29rJyl7XG5cdFx0XHRcdFx0YWxlcnQoJ3phcGlzYW5vIG5vd3kgcHJvamVrdCcpO1xuXHRcdFx0XHRcdHRoLnByb2plY3RfaGFzaCA9IHJlc3BvbnNlLnByb2plY3RfaGFzaDtcblx0XHRcdFx0XHRtZW51X3RvcC5nZXRfcHJvamVjdHMoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyB6YXBpc3UnKTtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0Ly9ha3R1YWxpenVqZW15IGp1xbwgaXN0bmllasSFY3kgcHJvamVrdFxuXHR1cGRhdGVfcHJvamVjdCA6IGZ1bmN0aW9uKCl7IFxuXG5cdFx0Ly9ha3R1YWxpenVqZW15IGpzb25hIGRvIHd5c8WCYW5pYSBhamF4ZW1cblx0XHR0aGlzLnBhcnNlX2RhdGEoKTtcblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRtYXBfanNvbiA6IEpTT04uc3RyaW5naWZ5KHRoLm1hcF9qc29uKSxcblx0XHRcdG1hcF9oYXNoIDogdGgubWFwX2hhc2gsXG5cdFx0XHRwcm9qZWN0X2hhc2ggOiB0aC5wcm9qZWN0X2hhc2gsXG5cdFx0XHRsYXllcnMgOiBKU09OLnN0cmluZ2lmeSh0aC5sYXllcnMpLFxuXHRcdFx0ZXhjZWwgOiBKU09OLnN0cmluZ2lmeSh0aC5leGNlbCksXG5cdFx0XHRwcm9qZWN0IDogSlNPTi5zdHJpbmdpZnkodGgucHJvamVjdClcblx0XHR9XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IFwiYXBpL3Byb2plY3RzXCIsXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0dHlwZTogJ1BVVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAnb2snKXtcblx0XHRcdFx0XHRtZW51X3RvcC5nZXRfcHJvamVjdHMoKTtcblx0XHRcdFx0XHRhbGVydCgnemFrdHVhbGl6b3dhbm8gcHJvamVrdCcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoJ2LFgsSFZCBwb2RjemFzIGFrdHVhbGl6YWNqaScpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0Ly91c3V3YW15IG1hcMSZIHogYmF6eSBkYW55Y2hcblx0ZGVsZXRlX3Byb2plY3QgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblxuXHRcdC8vc3ByYXdkemFteSBjenkgbWFwYSBkbyB1c3VuacSZY2lhIHBvc2lhZGEgc3dvamUgaWRcblx0XHRpZih0aGlzLnByb2plY3RfaGFzaCAhPSBudWxsKXtcdFx0XHRcblxuXHRcdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0XHR1cmw6IFwiYXBpL3Byb2plY3QvXCIrdGgucHJvamVjdF9oYXNoLFxuXHRcdFx0XHR0eXBlOiAnREVMRVRFJyxcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAnb2snKXtcblx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0YWxlcnQoJ2LFgsSFZCBwb2RjemFzIHVzdXdhbmlhJyk7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGFsZXJ0KCdicmFrIGlkZW50eWZpa2F0b3JhIHByb2pla3R1Jyk7XG5cdFx0fVxuXHR9XG59XG4iLCJ2YXIgZXhjZWwgPSB7XG5cdFxuXHRhbHBoYSA6IFsnYScsJ2InLCdjJywnZCcsJ2UnLCdmJywnZycsJ2gnLCdpJywnaicsJ2snLCdsJywnbScsJ24nLCdvJywncCcsJ3EnLCdyJywncycsJ3QnLCd1JywndycsJ3gnLCd5JywneiddLFxuXHRkYXRhIDogW1tcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdLFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdXSxcblx0bWluX3JvdyA6IDEyLFxuXHRtaW5fY29sIDogNixcblxuXHRpbml0IDogZnVuY3Rpb24oKXtcblx0XHQvL2RvZGFuaWUgZXZlbnTDs3cgcHJ6eSBrbGlrbmnEmWNpdSBleGNlbGFcblx0XHQkKCcjZXhjZWxfYm94IGJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCl7ICQoJyNleGNlbF9ib3ggaW5wdXQnKS5jbGljaygpOyB9KTtcblx0XHQkKCcjZXhjZWxfYm94IGlucHV0JykuY2hhbmdlKGZ1bmN0aW9uKCl7IGV4Y2VsLnNlbmRfZmlsZSgpOyB9KTtcblxuXHRcdC8vZnVua2NqYSB0eW1jemFzb3dhIGRvIG5hcnlzb3dhbmlhIHRhYmVsa2kgZXhjZWxhXG5cdFx0dGhpcy5zaG93KCk7XG5cdH0sXG5cblx0Ly9mdW5rY2phIG9kcG93aWVkemlhbGEgemEgcG9wcmF3bmUgcG9kcGlzYW5pZSBvc2lcblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHRhZGRfaHRtbCA9ICcnO1xuXG5cdFx0Ly9qZcWbbGkgaWxvxZtjIHdpZXJzenkgamVzdCB3acSZa3N6YSBha3R1YWxpenVqZW15IHdpZWxrb8WbxIcgdGFibGljeVxuXHRcdGlmKGV4Y2VsLmRhdGEubGVuZ3RoID49IGV4Y2VsLm1pbl9yb3cpIGV4Y2VsLm1pbl9yb3cgPSBleGNlbC5kYXRhLmxlbmd0aDtcblx0XHRpZihleGNlbC5kYXRhWzBdLmxlbmd0aCA+PSBleGNlbC5taW5fY29sKSBleGNlbC5taW5fY29sID0gZXhjZWwuZGF0YVswXS5sZW5ndGgrMTtcblxuXHRcdC8vcmVuZGVydWplbXkgY2HFgsSFIHRhYmxpY8SZIGV4Y2VsXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdGhpcy5taW5fcm93OyBpKyspe1xuXHRcdFx0YWRkX2h0bWwgKz0gJzx0ciBjbGFzcz1cInRyXCI+Jztcblx0XHRcdGZvcih2YXIgaiA9IDA7aiA8IHRoaXMubWluX2NvbDsgaisrKXtcblx0XHRcdFx0aWYoKGogPT0gMCkgJiYgKGkgPiAwKSl7XG5cdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzx0ZCBjbGFzcz1cInRkXCIgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCIgPicrIGkgKyc8L3RkPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHR0cnl7XG5cdFx0XHRcdFx0XHRpZih0eXBlb2YoZXhjZWwuZGF0YVtpXVsoai0xKV0pICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiBjb250ZW50ZWRpdGFibGU9XCJmYWxzZVwiIHJvdz1cIicgKyBpICsgJ1wiIGNvbD1cIicgKyBqICsgJ1wiPicrZXhjZWwuZGF0YVtpXVsoai0xKV0rJzwvdGQ+Jztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8dGQgY2xhc3M9XCJ0ZFwiICByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj48L3RkPic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGV4Y2VsLmRhdGFbaV1bKGorMSldKTtcblx0XHRcdFx0XHR9Y2F0Y2goZXJyb3Ipe1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IsaSxqKTtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8dGQgY2xhc3M9XCJ0ZFwiIHJvdz1cIicgKyBpICsgJ1wiIGNvbD1cIicgKyBqICsgJ1wiPjwvdGQ+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdFx0YWRkX2h0bWwgKz0gJzwvdHI+Jztcblx0XHR9XG5cblx0XHQkKCcjZXhjZWxfYm94IC50YWJsZScpLmh0bWwoIGFkZF9odG1sICk7XG5cblx0XHQkKCcjZXhjZWxfYm94IC50YWJsZSAudGQnKS5kYmxjbGljayhmdW5jdGlvbigpeyAkKHRoaXMpLmF0dHIoJ2NvbnRlbnRlZGl0YWJsZScsJ3RydWUnKTsgJCh0aGlzKS5zZWxlY3RUZXh0KCk7IH0pO1xuXG5cdFx0Ly9kb2RhamVteSBtb8W8bGl3b8WbxIcgZWR5Y2ppIGV4Y2VsYVxuXHRcdCQoJyNleGNlbF9ib3ggLnRhYmxlIC50ZCcpLmtleXVwKGZ1bmN0aW9uKCl7IGV4Y2VsLmVkaXQodGhpcyk7IH0pO1xuXG5cdFx0JCgnI2V4Y2VsX2JveCAudGFibGUgLnRkJykuYmx1cihmdW5jdGlvbigpeyAkKHRoaXMpLmF0dHIoJ2NvbnRlbnRlZGl0YWJsZScsJ2ZhbHNlJyk7ICBwYWxldHMuc2hvd19zZWxlY3QoKTsgfSk7XG5cblx0fSxcblxuXHQvL2Z1bmtjamEgdW1vxbxsaXdpYWrEhWNhIGVkeWNqZSB6YXdhcnRvxZtjaSBrb23Ds3JraVxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKXtcdFxuXHRcdFxuXHRcdHZhciB2YWwgPSAkKG9iaikuaHRtbCgpXG5cdFx0aWYoJC5pc051bWVyaWModmFsKSkgeyB2YWwgPSBwYXJzZUZsb2F0KHZhbCk7IH1cblx0XHRcblx0XHRleGNlbC5kYXRhWyQob2JqKS5hdHRyKCdyb3cnKV1bKCQob2JqKS5hdHRyKCdjb2wnKS0xKV0gPSB2YWw7XG5cdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0fSxcblxuXHQvL3BvYmllcmFteSBwbGlrLCB6IGlucHV0YSBpIHd5xYJhbXkgZG8gYmFja2VuZHUgdyBjZWx1IHNwYXJzb3dhbmlhIGEgbmFzdMSZcG5pZSBwcnp5cGlzdWplbXkgZG8gdGFibGljeSBpIHd5xZt3aWV0bGFteXcgZm9ybWllIHRhYmVsc2tpXG5cdHNlbmRfZmlsZSA6IGZ1bmN0aW9uKCkge1xuXHRcblx0XHR2YXIgZXhjZWxfZm9ybSA9IG5ldyBGb3JtRGF0YSgpOyBcblx0XHRleGNlbF9mb3JtLmFwcGVuZChcImV4Y2VsX2ZpbGVcIiwgJChcIiNleGNlbF9ib3ggaW5wdXRcIilbMF0uZmlsZXNbMF0pO1xuXG4gXHRcdCQuYWpheCgge1xuICAgICAgXG4gICAgICB1cmw6ICcvYXBpL3Byb2plY3RzL2V4Y2VsX3BhcnNlJyxcbiAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgIGRhdGE6IGV4Y2VsX2Zvcm0sXG4gICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICBjb250ZW50VHlwZTogZmFsc2VcblxuICAgIH0pLmRvbmUoZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuICAgIFx0Ly8kKFwiI2V4Y2VsX2JveCBpbnB1dFwiKVswXS5maWxlc1swXS5yZXNldCgpO1xuXG5cdFx0XHQkKFwiI2V4Y2VsX2JveCBpbnB1dFwiKS5yZW1vdmUoKTtcblx0XHRcdCQoXCIjZXhjZWxfYm94XCIpLmFwcGVuZCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgLz4nKVxuXHRcdFx0JCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNoYW5nZShmdW5jdGlvbigpeyBleGNlbC5zZW5kX2ZpbGUoKTsgfSk7XG5cbiAgICBcdC8vcG8gd2N6eXRhbml1IHBsaWt1IGV4Y2VsIHByenlwaXN1amVteSBkYW5lIHJ5c3VqZW15IG5hIG5vd28gdGFiZWzEmSBvcmF6IHd5xZt3aWV0bGFteSB3c3p5c3RraWUgcGFsZXR5IGtvbG9yw7N3XG5cdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKVxuICAgIFx0ZXhjZWwuZGF0YSA9IHJlc3BvbnNlLmV4Y2VsWzBdLmRhdGE7XG4gICAgXHRleGNlbC50cmFuc2l0aW9uKCk7XG4gICAgXHRleGNlbC5zaG93KCk7XG4gICAgXHRwYWxldHMuc2hvd19zZWxlY3QoKTtcbiAgICB9KTtcblx0fSxcblxuXHQvL2Z1bmNramEgemFtaWVuaWFqxIVjYSBrcnRvcGtpIG5hIHByemVjaW5raSBwcnp5IGtvbcOzcmthY2ggbGljemJvd3ljaFxuXHR0cmFuc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRmb3IodmFyIGogPSAwLCBqX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBqIDwgal9tYXg7IGorKyl7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL3VzdXdhbXkgc3BhY2plIHd5c3TEmXB1asSFY2UgemEgbHViIHByemVkIHRla3N0ZW1cblx0XHRcdFx0ZXhjZWwuZGF0YVtpXVtqXSA9ICQudHJpbShleGNlbC5kYXRhW2ldW2pdKVxuXG5cdFx0XHRcdC8vamXFm2xpIG1hbXkgcHVzdMSFIHdhcnRvxZvEhyBudWxsIHphbWllbmlhbXkgasSFIG5hIHphbWtuacSZdHkgc3RyaW5nXG5cdFx0XHRcdGlmKGV4Y2VsLmRhdGFbaV1bal0gPT0gbnVsbCl7IGV4Y2VsLmRhdGFbaV1bal0gPSAnJzsgfVxuXHRcdFx0XHRcblx0XHRcdFx0aWYoJC5pc051bWVyaWMoIGV4Y2VsLmRhdGFbaV1bal0gKSl7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2ldW2pdKVxuXHRcdFx0XHRcdGV4Y2VsLmRhdGFbaV1bal0gPSBTdHJpbmcoZXhjZWwuZGF0YVtpXVtqXSkucmVwbGFjZSgnLicsJywnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4Y2VsLmluaXQoKTtcbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cbiAgc3F1YXJlX2JvcmRlcl9zbWFsbCA6IGZ1bmN0aW9uKGRhdGEpe1xuXG4gIGlmKGRhdGEubGluZV93aWR0aF95IDwgMil7XG4gICAgeV90cmFucyA9IC0yO1xuICB9XG4gIGVsc2V7XG4gICAgeV90cmFucyA9IC0zO1xuICB9XG5cbiAgaWYoZGF0YS5saW5lX3dpZHRoX3ggPCAzKXtcbiAgICB4X3RyYW5zID0gLTI7XG4gIH1cbiAgZWxzZXtcbiAgICB4X3RyYW5zID0gLTEqZGF0YS5saW5lX3dpZHRoX3g7XG4gIH1cblxuICBpZihkYXRhLmJvcmRlci50b3Ape1xuICAgIGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KFxuICAgICAgZGF0YS54K3hfdHJhbnMrMSxcbiAgICAgIGRhdGEueSt5X3RyYW5zKzEsXG4gICAgICBkYXRhLnNpemUrZGF0YS5saW5lX3dpZHRoX3grMSxcbiAgICAgIDFcbiAgICApO1xuICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3BfbGVmdCl7XG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K3hfdHJhbnMrMSxcbiAgICAgICAgZGF0YS55K3lfdHJhbnMrMSxcbiAgICAgICAgcGFyc2VJbnQoKGRhdGEuc2l6ZStkYXRhLmxpbmVfd2lkdGhfeCsxKS8yKSxcbiAgICAgICAgMVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3BfcmlnaHQpe1xuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueCt4X3RyYW5zKzErcGFyc2VJbnQoKGRhdGEuc2l6ZStkYXRhLmxpbmVfd2lkdGhfeCsxKS8yKSxcbiAgICAgICAgZGF0YS55K3lfdHJhbnMrMSxcbiAgICAgICAgTWF0aC5jZWlsKChkYXRhLnNpemUrZGF0YS5saW5lX3dpZHRoX3grMSkvMiksXG4gICAgICAgIDFcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS5ib3JkZXIucmlnaHQpe1xuICAgICAgaWYoZGF0YS5saW5lX3dpZHRoX3ggPCAyKXtcbiAgICAgICAgeF90cmFucyA9IC0xO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgeF90cmFucyA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEubGluZV93aWR0aF95IDwgMil7XG4gICAgICAgIHlfdHJhbnMgPSAyO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgeV90cmFucyA9IGRhdGEubGluZV93aWR0aF95O1xuICAgICAgfVxuXG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K2RhdGEuc2l6ZSt4X3RyYW5zKzEsXG4gICAgICAgIGRhdGEueS0xLFxuICAgICAgICAxLFxuICAgICAgICBkYXRhLnNpemUreV90cmFucyBcbiAgICAgICk7XG4gICAgfVxuICB9LFxuc3F1YXJlX2JvcmRlcl9iaWcgOiBmdW5jdGlvbihkYXRhKXtcblxuICBpZihkYXRhLmxpbmVfd2lkdGhfeSA8IDIpe1xuICAgIHlfdHJhbnMgPSAtMjtcbiAgfVxuICBlbHNle1xuICAgIHlfdHJhbnMgPSAtMztcbiAgfVxuXG4gIGlmKGRhdGEubGluZV93aWR0aF94IDwgMyl7XG4gICAgeF90cmFucyA9IC0yO1xuICB9XG4gIGVsc2V7XG4gICAgeF90cmFucyA9IC0xKmRhdGEubGluZV93aWR0aF94O1xuICB9XG5cbiAgaWYoZGF0YS5ib3JkZXIudG9wKXtcbiAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgIGRhdGEueCt4X3RyYW5zLFxuICAgICAgZGF0YS55K3lfdHJhbnMsXG4gICAgICBkYXRhLnNpemUrZGF0YS5saW5lX3dpZHRoX3grMyxcbiAgICAgIDNcbiAgICApO1xuICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3BfbGVmdCl7XG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K3hfdHJhbnMsXG4gICAgICAgIGRhdGEueSt5X3RyYW5zLFxuICAgICAgICBwYXJzZUludCgoZGF0YS5zaXplK2RhdGEubGluZV93aWR0aF94KzMpLzIpLFxuICAgICAgICAzXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmKGRhdGEuYm9yZGVyLnRvcF9yaWdodCl7XG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K3hfdHJhbnMrcGFyc2VJbnQoKGRhdGEuc2l6ZStkYXRhLmxpbmVfd2lkdGhfeCszKS8yKSxcbiAgICAgICAgZGF0YS55K3lfdHJhbnMsXG4gICAgICAgIE1hdGguY2VpbCgoZGF0YS5zaXplK2RhdGEubGluZV93aWR0aF94KzMpLzIpLFxuICAgICAgICAzXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmKGRhdGEuYm9yZGVyLnJpZ2h0KXtcbiAgICAgIGlmKGRhdGEubGluZV93aWR0aF94IDwgMil7XG4gICAgICAgIHhfdHJhbnMgPSAtMTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIHhfdHJhbnMgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmxpbmVfd2lkdGhfeSA8IDIpe1xuICAgICAgICB5X3RyYW5zID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIHlfdHJhbnMgPSBkYXRhLmxpbmVfd2lkdGhfeTtcbiAgICAgIH1cblxuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueCtkYXRhLnNpemUreF90cmFucyxcbiAgICAgICAgZGF0YS55LFxuICAgICAgICAzLFxuICAgICAgICBkYXRhLnNpemUreV90cmFucyBcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCIvL2Z1bmtjamUgZ2xvYmFsbmUga29udGVuZXIgbmEgd3N6eXN0a28gaSBuaWMgOylcbnZhciBnbG9iYWwgPSB7XG5cdHRvb2dsZV9yaWdodCAgOiBmdW5jdGlvbihvYmope1xuXHRcdC8vcGFuZWwgamVzdCB6IHByYXdlaiBzdHJvbnlcblx0XHRpZiggJChvYmopLnBhcmVudCgpLmNzcygncmlnaHQnKSA9PSAnMHB4JyApe1xuXHRcdFx0JChvYmopLnBhcmVudCgpLmFuaW1hdGUoe3JpZ2h0OiBbLSQob2JqKS5wYXJlbnQoKS53aWR0aCgpLTIwLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICBcdCAkKG9iaikucGFyZW50KCkuYW5pbWF0ZSh7cmlnaHQ6IFtcIjBweFwiLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcbiAgICB9IFxuXHR9LFxuXHR0b29nbGVfbGVmdCAgOiBmdW5jdGlvbihvYmope1xuXHRcdC8vcGFuZWwgamVzdCB6IGxld2VqIHN0cm9ueVxuXHRcdGlmKCAkKG9iaikucGFyZW50KCkuY3NzKCdsZWZ0JykgPT0gJzBweCcgKXtcblx0XHRcdCQob2JqKS5wYXJlbnQoKS5hbmltYXRlKHtsZWZ0OiBbLSQob2JqKS5wYXJlbnQoKS53aWR0aCgpLTIwLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICBcdCAkKG9iaikucGFyZW50KCkuYW5pbWF0ZSh7bGVmdDogW1wiMHB4XCIsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuXHQgIH1cblx0fVxufVxuIiwiLy9nxYLDs3duZSB6ZGrEmWNpZSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxudmFyIGltYWdlID0ge1xuXHRvYmogOiB1bmRlZmluZWQsXG5cdHggOiBudWxsLFxuXHR5IDogbnVsbCxcblx0d2lkdGggOiBudWxsLFxuXHRoZWlnaHQgOiBudWxsLFxuXHRhbHBoYSA6IDEwLFxuXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYS8xMDtcblx0XHRjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5vYmosdGhpcy54LHRoaXMueSx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KTtcblxuXHRcdCQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5jc3MoeydoZWlnaHQnOnRoaXMuaGVpZ2h0LCd0b3AnOnRoaXMueSsncHgnLCdsZWZ0JzoodGhpcy54K3RoaXMud2lkdGgpKydweCd9KTtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG5cdH0sXG5cblx0Ly9mdW5rY2phIHBvbW9jbmljemEga29ud2VydHVqxIVjYSBkYXRhVVJJIG5hIHBsaWtcblx0ZGF0YVVSSXRvQmxvYiA6IGZ1bmN0aW9uKGRhdGFVUkkpIHtcbiAgICB2YXIgYmluYXJ5ID0gYXRvYihkYXRhVVJJLnNwbGl0KCcsJylbMV0pO1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXkucHVzaChiaW5hcnkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXSwge3R5cGU6ICdpbWFnZS9wbmcnfSk7XG5cdH1cblxufVxuIiwidmFyIGRhdGFfaW5wdXQgPSB7XG5cblx0Ly9wb2JpZXJhbmllIGluZm9ybWFjamkgeiBpbnB1dMOzdyBpIHphcGlzYW5pZSBkbyBvYmlla3R1IG1hcF9zdmdcblx0Z2V0IDogZnVuY3Rpb24oKXtcblx0XHRtYXAubmFtZSA9ICQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCgpO1xuXHRcdG1hcC5wYXRoID0gJCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCkucmVwbGFjZSgvXCIvZywgXCInXCIpO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBpbmZvcm1hY2ppIHogb2JpZWt0dSBtYXBfc3ZnIGkgemFwaXNhbmllIGRvIGlucHV0w7N3XG5cdHNldCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCBtYXAubmFtZSApO1xuXHRcdCQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCggbWFwLnBhdGggKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9XG5cbn1cbiIsImxhYmVscyA9IHtcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbGF5ZXJzIC5sYWJlbF9sYXllcicpLnZhbCggbGF5ZXJzLmxhYmVsc1tsYXllcnMuYWN0aXZlXSApO1xuXHR9LFxuXG5cdGVkaXQgOiBmdW5jdGlvbihvYmopIHtcblx0XHRsYXllcnMubGFiZWxzW2xheWVycy5hY3RpdmVdID0gJChvYmopLnZhbCgpO1xuXHR9XG59XG5cbiQoJyNsYXllcnMgLmxhYmVsX2xheWVyJykua2V5dXAoZnVuY3Rpb24oKXtcblx0bGFiZWxzLmVkaXQodGhpcyk7XG59KTsgXG4iLCJ2YXIgbGF5ZXJzID0ge1xuXG5cdGxpc3QgOiBbJ3pha8WCYWRrYSAxJ10sXG5cdGFjdGl2ZSA6IDAsXG5cblx0Ly90YWJsaWNhIHogcG9kc3Rhd293eXdtaSBkYW55bWkgemFncmVnb3dhbnltaSBkbGEga2HFvGRlaiB3YXJzdHd5XG5cdHBhbGV0c19hY3RpdmUgOiBbMF0sXG5cblx0dmFsdWUgOiBbLTFdLFxuXHRjb2xvcnNfcG9zIDogW1sxLDEsMSwxLDEsMSwxLDEsMV1dLFxuXHRjb2xvcnNfYWN0aXZlIDogW1tcIiNmN2ZjZmRcIiwgXCIjZTVmNWY5XCIsIFwiI2NjZWNlNlwiLCBcIiM5OWQ4YzlcIiwgXCIjNjZjMmE0XCIsIFwiIzQxYWU3NlwiLCBcIiMyMzhiNDVcIiwgXCIjMDA2ZDJjXCIsIFwiIzAwNDQxYlwiXV0sXG5cdG1pbl92YWx1ZSA6IFswXSxcblx0bWF4X3ZhbHVlIDogWzBdLFxuXHRjbG91ZCA6IFtcIlwiXSxcblx0Y2xvdWRfcGFyc2VyIDogW1wiXCJdLFxuXHRsZWdlbmRzIDogW1tdXSxcblx0bGFiZWxzIDogW1wiXCJdLFxuXHRjYXRlZ29yeSA6IFstMV0sXG5cdGNhdGVnb3J5X2NvbG9ycyA6IFtdLFxuXHRjYXRlZ29yeV9uYW1lIDogW10sXG5cblx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRwcm9qZWN0X25hbWUgOiAnbm93eSBwcm9qZWt0Jyxcblx0c291cmNlIDogJycsXG5cblx0Ly90YWJsaWNhIHDDs2wgdXphbGXFvG5pb255Y2ggb2QgYWt0dWFsbmVqIHdhcnN0d3lcblx0ZGJfbmFtZSA6IFtcImxpc3RcIixcInBhbGV0c19hY3RpdmVcIixcImNhdGVnb3J5XCIsXCJjYXRlZ29yeV9jb2xvcnNcIixcImNhdGVnb3J5X25hbWVcIixcInZhbHVlXCIsXCJjb2xvcnNfcG9zXCIsXCJjb2xvcnNfYWN0aXZlXCIsXCJtaW5fdmFsdWVcIixcIm1heF92YWx1ZVwiLFwiY2xvdWRcIixcImNsb3VkX3BhcnNlclwiLFwibGVnZW5kc1wiLFwibGFiZWxzXCJdLFxuXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmxpc3QubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRpZihpID09IHRoaXMuYWN0aXZlKXtcblx0XHRcdFx0aHRtbCArPSAnPHNwYW4gbnVtPVwiJytpKydcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgY2xhc3M9XCJhY3RpdmVcIj4nICsgdGhpcy5saXN0W2ldICsgJzwvc3Bhbj4nO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0aHRtbCArPSAnPHNwYW4gbnVtPVwiJytpKydcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgPicgKyB0aGlzLmxpc3RbaV0gKyAnPC9zcGFuPic7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImFkZFwiPiArIDwvYnV0dG9uPjxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj4gLSA8L2J1dHRvbj4nO1xuXG5cdFx0JCgnI2xheWVycyA+IGRpdicpLmh0bWwoaHRtbCk7XG5cblxuXHRcdC8vZG9kYWplbXkgemRhcnplbmlhIGRvIGVkeWNqaSAvIHptaWFueSBrb2xlam5vc2NpIGkgYWt0dWFsaXpvd2FuaWEgd2Fyc3R3eVxuXHRcdCQoJyNsYXllcnMgLmFkZCcpLmNsaWNrKGZ1bmN0aW9uKCl7bGF5ZXJzLmFkZCgpO30pO1xuXHRcdFxuXHRcdCQoJyNsYXllcnMgLnJlbW92ZScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjb25maXJtKCdDenkgY2hjZXN6IHVzdW7EhcSHIHdhcnN0d8SZID8nKSl7XG5cdFx0XHRcdGxheWVycy5yZW1vdmUoKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cdFx0XG5cdFx0JCgnI2xheWVycyBzcGFuJykuY2xpY2soZnVuY3Rpb24oKXsgbGF5ZXJzLnNlbGVjdCh0aGlzKTsgfSk7XG5cblx0XHQkKCBcIiNsYXllcnMgPiBkaXYgc3BhblwiICkua2V5dXAoZnVuY3Rpb24oKXtcblx0XHRcdGxheWVycy5saXN0W2xheWVycy5hY3RpdmVdID0gJCh0aGlzKS5odG1sKCk7XG5cdFx0fSk7XG5cblx0XHQkKCBcIiNsYXllcnMgPiBkaXYgc3BhblwiICkuZGJsY2xpY2soZnVuY3Rpb24oKXtcblx0XHRcdCQodGhpcykuYWRkQ2xhc3MoJ2NvbnRlbnRlZGl0YWJsZScpO1xuXHRcdFx0JCh0aGlzKS5ibHVyKGZ1bmN0aW9uKCl7ICQodGhpcykucmVtb3ZlQ2xhc3MoJ2NvbnRlbnRlZGl0YWJsZScpIH0pO1xuXHRcdH0pO1xuXG5cdFx0JCggXCIjbGF5ZXJzID4gZGl2XCIgKS5zb3J0YWJsZSh7IFxuXHRcdFx0YXhpczogJ3gnLFxuXHRcdCBcdHVwZGF0ZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0JCggXCIjbGF5ZXJzID4gZGl2IHNwYW5cIiApLmVhY2goZnVuY3Rpb24oaW5kZXgsb2JqKXtcblx0XHRcdFx0XHRpZihpbmRleCAhPSAkKG9iaikuYXR0cignbnVtJykpe1xuXHRcdFx0XHRcdFx0bGF5ZXJzLmNoYW5nZV9vcmRlcigkKG9iaikuYXR0cignbnVtJyksaW5kZXgpXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHQgXHR9LFxuXHRcdCBcdGNhbmNlbDogJy5hZGQsLnJlbW92ZSwuY29udGVudGVkaXRhYmxlJ1xuXHRcdH0pO1xuXHR9LFxuXG5cdHNlbGVjdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0JCgnI2xheWVycyBzcGFuJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFx0bGF5ZXJzLmFjdGl2ZSA9ICQob2JqKS5pbmRleCgpO1xuXG5cdFx0dGlueU1DRS5lZGl0b3JzWzBdLnNldENvbnRlbnQoIGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSApO1xuXHRcdHBhbGV0cy5zaG93KCk7XG5cdFx0Y2xvdWQuc2V0X3RleHRhcmVhKCk7XG5cdFx0bGFiZWxzLnNob3coKTtcblx0XHRsZWdlbmRzLnNob3coKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdC8vem1pYW5hIGtvbGVqbmpvxZtjaSB3YXJzdHdcblx0Y2hhbmdlX29yZGVyIDogZnVuY3Rpb24obGFzdCxuZXh0KXtcblx0XHRmb3IgKHZhciBpPSAwLCBpX21heCA9IHRoaXMuZGJfbmFtZS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKSB7XG5cdFx0XHR2YXIgdG1wID0gdGhpc1t0aGlzLmRiX25hbWVbaV1dW25leHRdO1xuXHRcdFx0dGhpc1t0aGlzLmRiX25hbWVbaV1dW25leHRdID0gdGhpc1t0aGlzLmRiX25hbWVbaV1dW2xhc3RdXG5cdFx0XHR0aGlzW3RoaXMuZGJfbmFtZVtpXV1bbGFzdF0gPSB0bXA7XG5cdFx0fVxuXHR9LFxuXG5cdC8vZG9kYWplbXkgbm93xIUgd2Fyc3R3xJlcblx0YWRkIDogZnVuY3Rpb24oKXtcblxuXHRcdHRoaXMubGlzdC5wdXNoKCAnemFrxYJhZGthICcgKyBwYXJzZUludCh0aGlzLmxpc3QubGVuZ3RoKzEpKTtcblxuXHRcdHRoaXMuY2F0ZWdvcnkucHVzaCgtMSk7XG5cdFx0dGhpcy5jYXRlZ29yeV9jb2xvcnMucHVzaCggdGhpcy5jYXRlZ29yeV9jb2xvcnNbdGhpcy5jYXRlZ29yeV9jb2xvcnMubGVuZ3RoLTFdLnNsaWNlKCkgKTtcblx0XHR0aGlzLnZhbHVlLnB1c2goLTEpO1xuXHRcdHRoaXMucGFsZXRzX2FjdGl2ZS5wdXNoKDApO1xuXHRcdHRoaXMuY29sb3JzX2FjdGl2ZS5wdXNoKFsnI2Y3ZmNmZCcsJyNlNWY1ZjknLCcjY2NlY2U2JywnIzk5ZDhjOScsJyM2NmMyYTQnLCcjNDFhZTc2JywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10pO1xuXHRcdHRoaXMuY29sb3JzX3Bvcy5wdXNoKFsxLDEsMSwxLDEsMSwxLDEsMV0pO1xuXHRcdHRoaXMubWluX3ZhbHVlLnB1c2goMCk7XG5cdFx0dGhpcy5tYXhfdmFsdWUucHVzaCgwKTtcblx0XHR0aGlzLmNsb3VkLnB1c2goXCJcIik7XG5cdFx0dGhpcy5jbG91ZF9wYXJzZXIucHVzaChcIlwiKTtcblx0XHR0aGlzLmxlZ2VuZHMucHVzaChbXSk7XG5cdFx0dGhpcy5sYWJlbHMucHVzaChcIlwiKTtcblx0XHR0aGlzLnNob3coKTtcblxuXHR9LFxuXG5cdC8vdXN1d2FteSBha3R1YWxuxIUgd2Fyc3R3xJlcblx0cmVtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHRpZih0aGlzLmFjdGl2ZSA+IDApe1xuXHRcdFx0aWYodGhpcy5hY3RpdmUgPT0gKHRoaXMubGlzdC5sZW5ndGgtMSkpe1xuXHRcdFx0XHR2YXIgaV90bXAgPSB0aGlzLmxpc3QubGVuZ3RoLTE7XG5cdFx0XHRcdHRoaXMuc2VsZWN0KCAkKCcjbGF5ZXJzIHNwYW4nKS5lcSggaV90bXAgKSApO1xuXHRcdFx0fSBcblxuXHRcdFx0Ly9wb2JpZXJhbXkgbnVtZXIgb3N0YXRuaWVqIHpha8WCYWRraVxuXHRcdFx0Zm9yICh2YXIgaV9sYXllcnM9IHRoaXMuYWN0aXZlLCBpX2xheWVyc19tYXggPSBsYXllcnMubGlzdC5sZW5ndGgtMTsgaV9sYXllcnMgPCBpX2xheWVyc19tYXg7IGlfbGF5ZXJzKyspIHtcblx0XHRcdFx0Zm9yICh2YXIgaT0gMCwgaV9tYXggPSB0aGlzLmRiX25hbWUubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKykge1xuXHRcdFx0XHRcdHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtpX2xheWVyc10gPSB0aGlzW3RoaXMuZGJfbmFtZVtpXV1baV9sYXllcnMrMV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly91c3V3YW15IG9zdGF0bmnEhSB6YWvFgmFka8SZIC8gd2Fyc3R3xJlcblx0XHRcdHZhciBsYXN0X2kgPSBsYXllcnMubGlzdC5sZW5ndGggLSAxO1xuXHRcdFx0Zm9yICh2YXIgaT0gMCwgaV9tYXggPSB0aGlzLmRiX25hbWUubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKykge1xuXHRcdFx0XHR0aGlzW3RoaXMuZGJfbmFtZVtpXV0ucG9wKClcblx0XHRcdFx0Y29uc29sZS5sb2codGhpc1t0aGlzLmRiX25hbWVbaV1dW2xhc3RfaV0pO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNob3coKTtcblx0XHRcdHRoaXMuc2VsZWN0KCQoJyNsYXllcnMgc3Bhbi5hY3RpdmUnKSk7IFxuXHRcdH1cblx0fVxufVxuXG4vL3ptaWFuYSBuYXp3eSBwcm9qZWt0dSBwcnp5IHdwaXNhbml1IG5vd2VqIG5hend5IGRvIGlucHV0YVxuJCgnI3BvaW50ZXJzIC5wcm9qZWN0X25hbWUnKS5rZXl1cChmdW5jdGlvbigpeyBsYXllcnMucHJvamVjdF9uYW1lID0gJCh0aGlzKS52YWwoKTsgfSk7XG5cbi8vem1pZW5uZSBwb21vY25pY3plXG4kLmZuLnNlbGVjdFRleHQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBkb2MgPSBkb2N1bWVudDtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXNbMF07XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLCBlbGVtZW50KTtcbiAgICBpZiAoZG9jLmJvZHkuY3JlYXRlVGV4dFJhbmdlKSB7XG4gICAgXHR2YXIgcmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgcmFuZ2UubW92ZVRvRWxlbWVudFRleHQoZWxlbWVudCk7XG4gICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICBcdHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7ICAgICAgICBcbiAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cbn07XG4iLCIvL29iaWVrdCBkb3R5Y3rEhXN5IHd5c3dpZXRsYW5pYSBha3V0YWxpemFjamkgaSBlZHljamkgcGFuZWx1IGxlZ2VuZFxubGVnZW5kcyA9IHtcblxuXHQvL3d5xZt3aWV0bGFteSB3c3p5c3RraWUgbGVnZW5keSB3IHBhbmVsdSBtYXBcblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgaHRtbCA9IFwiPHRhYmxlPjx0cj48dGg+a29sb3I6PC90aD48dGg+b2Q6PC90aD48dGg+ZG86PC90aD48dGg+b3Bpczo8L3RoPjwvdHI+XCI7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0aHRtbCArPSBcIjx0ciByb3c9J1wiK2krXCInPjx0ZCByb3c9J1wiK2krXCInIGNvbF9udW09Jycgc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bM10rXCInIGNsYXNzPSdjb2xvciBjb2xvcnBpY2tlcl9ib3gnPjwvdGQ+PHRkIGNsYXNzPSdmcm9tJyBuYW1lPSdmcm9tJyBjb250ZW50ZWRpdGFibGU9J3RydWUnPlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzBdK1wiPC90ZD48dGQgY2xhc3M9J3RvJyBuYW1lPSd0bycgY29udGVudGVkaXRhYmxlPSd0cnVlJz5cIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVsxXStcIjwvdGQ+PHRkIGNsYXNzPSdkZXNjcmlwdGlvbicgbmFtZT0nZGVzY3JpcHRpb24nIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMl0rXCI8L3RkPjwvdHI+XCI7XG5cdFx0fVxuXG5cdFx0aHRtbCArPSBcIjwvdGFibGU+XCI7XG5cdFx0JCgnI2xlZ2VuZHMnKS5odG1sKGh0bWwpO1xuXG5cdFx0dmFyIHJvdyA9IDE7XG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGlmKCBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcblx0XHRcdFx0JCgnI2xlZ2VuZHMgdGFibGUgdHInKS5lcShyb3cpLmNoaWxkcmVuKCd0ZCcpLmVxKDApLmF0dHIoJ2NvbF9udW0nLCBpKTtcblx0XHRcdFx0cm93Kys7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoMTggPT0gbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0pIHtcblx0XHRcdHZhciByb3cgPSAwO1xuXHRcdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0aWYoIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdW2ldID09IDEpe1xuXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbMThdW2ldID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1bcm93XTtcblx0XHRcdFx0XHRyb3crKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbMThdW2ldID0gJyNmZmYnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRwYWxldHMuc2hvdygpXG5cdFx0fVxuXG5cdFx0Y29sb3JwaWNrZXIuYWRkKCk7XG5cdH0sXG5cblx0Ly9mdW5rY2phIGFrdXRhbGl6dWrEhWNhIGtvbG9yeSB3IHBhbGVjaWUga29sb3LDs3dcblx0dXBkYXRlIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgY29sb3JfY291bnQgPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5sZW5ndGggLy9pbG9zYyBrb2xvcsOzd1xuXHRcdHZhciBkaWZmcmVudCA9IE1hdGguYWJzKCBsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdIC0gbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXSApOyAvLyBjb2xvcl9jb3VudDtcblx0XHRcblx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXSA9IFtdO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblxuXHRcdFx0Y29uc29sZS5sb2coIHBhcnNlSW50KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pLGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gKTtcblxuXHRcdFx0dmFyIG5vd190bXAgPSBNYXRoLnJvdW5kKCAocGFyc2VJbnQobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSkrZGlmZnJlbnQvY29sb3JfY291bnQqaSkqMTAwKSAvIDEwMFxuXHRcdFx0XG5cdFx0XHQvL2NvbnNvbGUubG9nKGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0rZGlmZnJlbnQvY29sb3JfY291bnQqaSk7XG5cblxuXHRcdFx0aWYoaSsxID09IGlfbWF4ICl7XG5cdFx0XHRcdHZhciBuZXh0X3RtcCA9IGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV1cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHZhciBuZXh0X3RtcCA9IE1hdGgucm91bmQoICgocGFyc2VJbnQobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSkrZGlmZnJlbnQvY29sb3JfY291bnQqKGkrMSkpIC0gMC4wMSkgICoxMDApIC8gMTAwIFxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5wdXNoKFtub3dfdG1wLG5leHRfdG1wLCAgU3RyaW5nKG5vd190bXApLnJlcGxhY2UoJy4nLCcsJykrJyAtICcrU3RyaW5nKG5leHRfdG1wKS5yZXBsYWNlKCcuJywnLCcpLCBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXVtpXSBdKTtcblx0XHRcblx0XHR9XG5cdFx0dGhpcy5zaG93KCk7XG5cdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0fSxcblxuXHRlZGl0OiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIHJvdyA9ICQob2JqKS5wYXJlbnQoKS5hdHRyKCdyb3cnKTtcblx0XHR2YXIgbmFtZSA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cdFx0dmFyIHZhbCA9ICQob2JqKS5odG1sKCk7XG5cblx0XHRzd2l0Y2gobmFtZSl7XG5cdFx0XHRcblx0XHRcdGNhc2UgJ2Zyb20nOlxuXHRcdFx0XHRpZighJC5pc051bWVyaWModmFsKSkgeyAkKG9iaikuaHRtbChwYXJzZUZsb2F0KHZhbCkpIH0gLy96YWJlenBpZWN6ZW5pZSwgamXFm2xpIHdwaXNhbm8gdGVrc3QgemFtaWVuaWFteSBnbyBuYSBsaWN6YsSZXG5cdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW3Jvd11bMF0gPSBwYXJzZUZsb2F0KHZhbCk7XG5cdFx0XHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y2FzZSAndG8nOlxuXHRcdFx0XHRpZighJC5pc051bWVyaWModmFsKSkgeyAkKG9iaikuaHRtbChwYXJzZUZsb2F0KHZhbCkpIH1cblx0XHRcdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1bcm93XVsxXSA9IHBhcnNlRmxvYXQodmFsKTtcblx0XHRcdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0XG5cdFx0XHRjYXNlICdkZXNjcmlwdGlvbic6XG5cdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW3Jvd11bMl0gPSB2YWw7XG5cdFx0XHRicmVhaztcdFx0XG5cdFx0XG5cdFx0fVxuXHR9XG59XG5cbmxlZ2VuZHMuc2hvdygpOyBcblxuXG4vL2RvZGFqZW15IHpkYXJ6ZW5pZSBlZHljamkgd2FydG/Fm2NpIHcgbGVnZW5kemllXG4kKCcjbGVnZW5kcycpLm9uKCdrZXl1cCcsJ3RkJywgZnVuY3Rpb24oKXsgbGVnZW5kcy5lZGl0KHRoaXMpOyB9KTtcbiIsIi8qXG4gICAgX19fXyAgIF9fX18gX19fXyAgICBfXyAgX19fIF9fXyAgICAgX19fXyAgICAgX19fX18gICAgX19fXyBcbiAgIC8gX18gKSAvICBfLy8gX18gXFwgIC8gIHwvICAvLyAgIHwgICAvIF9fIFxcICAgfF9fICAvICAgLyBfXyBcXFxuICAvIF9fICB8IC8gLyAvIC8gLyAvIC8gL3xfLyAvLyAvfCB8ICAvIC9fLyAvICAgIC9fIDwgICAvIC8gLyAvXG4gLyAvXy8gL18vIC8gLyAvXy8gLyAvIC8gIC8gLy8gX19fIHwgLyBfX19fLyAgIF9fXy8gL18gLyAvXy8gLyBcbi9fX19fXy8vX19fLyBcXF9fX1xcX1xcL18vICAvXy8vXy8gIHxffC9fLyAgICAgICAvX19fXy8oXylcXF9fX18vICBcblxudmFyc2lvbiAzLjAgYnkgTWFyY2luIEfEmWJhbGFcblxubGlzdGEgb2JpZWt0w7N3OlxuY2FudmFzIC0gb2JpZWt0IGNhbnZhc2FcbmNhdGVnb3JpZXNcbmNsb3VkXG5jb2xvcl9waWNrZXJcbmNydWQgLSBvYmlla3QgY2FudmFzYVxuZXhjZWxcbmZpZ3VyZXNcbmdsb2JhbFxuaW1hZ2UgLSBvYmlla3QgemRqxJljaWEgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbmlucHV0XG5sYWJlbHNcbmxheWVyc1xubGVnZW5kc1xubWFpblxubWVudV90b3Bcbm1vZGVsc1xubW91c2Vcbm9uX2NhdGVnb3J5XG5wYWxldHNcbnBvaW50ZXJzXG5cbiovXG5cblxuLy8gQ3JlYXRlIElFICsgb3RoZXJzIGNvbXBhdGlibGUgZXZlbnQgaGFuZGxlclxudmFyIGV2ZW50TWV0aG9kID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgPyBcImFkZEV2ZW50TGlzdGVuZXJcIiA6IFwiYXR0YWNoRXZlbnRcIjtcbnZhciBldmVudGVyID0gd2luZG93W2V2ZW50TWV0aG9kXTtcbnZhciBtZXNzYWdlRXZlbnQgPSBldmVudE1ldGhvZCA9PSBcImF0dGFjaEV2ZW50XCIgPyBcIm9ubWVzc2FnZVwiIDogXCJtZXNzYWdlXCI7XG5cbi8vIExpc3RlbiB0byBtZXNzYWdlIGZyb20gY2hpbGQgd2luZG93XG5ldmVudGVyKG1lc3NhZ2VFdmVudCxmdW5jdGlvbihlKSB7XG4gIGNvbnNvbGUubG9nKCdwYXJlbnQgcmVjZWl2ZWQgbWVzc2FnZSE6ICAnLGUuZGF0YSk7XG59LGZhbHNlKTtcbiBcbi8vZG9kYWplbXkgdGlueW1jZSBkbyAyIHRleHRhcmVhIChkeW1layDFunLDs2TFgm8pXG50aW55bWNlLmluaXQoe1xuXHRtZW51YmFyOmZhbHNlLFxuICBzZWxlY3RvcjogJy50aW55ZWRpdCcsICAvLyBjaGFuZ2UgdGhpcyB2YWx1ZSBhY2NvcmRpbmcgdG8geW91ciBIVE1MXG4gIHRvb2xiYXI6ICdib2xkIGl0YWxpYyB8IGxpbmsgaW1hZ2UnLFxuICAgIHNldHVwOiBmdW5jdGlvbiAoZWRpdG9yKSB7XG4gICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSAkKGVkaXRvci50YXJnZXRFbG0pLmF0dHIoJ25hbWUnKTtcbiAgICAgICAgXG4gICAgICAgIC8vamXFm2xpIGFrdHVhbGl6dWplbXkgZHltZWtcbiAgICAgICAgaWYodGFyZ2V0ID09ICdjbG91ZCcpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKClcbiAgICAgICAgXHRsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gPSBlZGl0b3IuZ2V0Q29udGVudCgpO1xuICAgICAgICBcdC8vY2xvdWQuZ2V0X3RleHRhcmVhKCBlZGl0b3IuZ2V0Q29udGVudCgpICk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2plxZtsaSBha3R1YWxpenVqZW15IMW8csOzZMWCbyBwcm9qZWt0dVxuICAgICAgICBpZih0YXJnZXQgPT0gJ3NvdXJjZScpe1xuICAgXHRcdFx0XHRsYXllcnMuc291cmNlID0gZWRpdG9yLmdldENvbnRlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcbiAgICB9XG59KTtcblxud2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24gKGV2dCkge1xuIFx0aWYgKHR5cGVvZiBldnQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgXHRldnQgPSB3aW5kb3cuZXZlbnQ7XG4gXHR9XG4gXHRpZiAoZXZ0KSB7XG4gIFx0aWYoIWNvbmZpcm0oJ0N6eSBjaGNlc3ogb3B1xZtjacSHIHTEmSBzdHJvbsSZJykpIHJldHVybiBmYWxzZVxuXHR9XG59XG5cbi8vcG8ga2xpa25pxJljaXUgem1pZW5pYXkgYWt0dWFsbnkgcGFuZWxcbiQoJy5ib3ggPiB1bCA+IGxpJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2JveCh0aGlzKSB9KTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRtZW51X3RvcC5nZXRfbWFwcygpO1xuXHRtZW51X3RvcC5nZXRfcHJvamVjdHMoKTtcbiAgbGF5ZXJzLnNob3coKTtcbiAgcGFsZXRzLnNob3coKTtcblxuICBjb2xvcnBpY2tlci5jb2xvcl9ib3JkZXIoKTtcblxuXHQvL3phYmxva293YW5pZSBtb8W8bGl3b8WbY2kgemF6bmFjemFuaWEgYnV0dG9uw7N3IHBvZGN6YXMgZWR5Y2ppIHBvbGFcblx0JChkb2N1bWVudCkub24oXCJmb2N1c2luXCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gdHJ1ZTsgfSk7XG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNvdXRcIixcImlucHV0XCIsZnVuY3Rpb24oKXsgbWVudV90b3AuZGlzYWJsZV9zZWxlY3QgPSBmYWxzZTsgfSk7XG5cblx0Ly96YXpuYWN6ZW5pZSBkeW1rYSBkbyBwdWJsaWthY2ppIHBvIGtsaWtuacSZY2l1XG5cdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmNsaWNrKGZ1bmN0aW9uKCl7XHQkKHRoaXMpLnNlbGVjdCgpO1x0fSk7XG5cdCQoJy5wdWJsaXNoJykuY2xpY2soZnVuY3Rpb24oZXZlbnQpeyBjcnVkLnB1Ymxpc2goZXZlbnQpOyB9KTtcblxuXHQvL2plxZtsaSBjaGNlbXkgemFwaXNhxIcgLyB6YWt0dWFsaXpvd2HEhyAvIG9wdWJsaWtvd2HEhyBwcm9qZWt0XG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCl7IFxuXHRcdGlmKHR5cGVvZiBjcnVkLnByb2plY3RfaGFzaCA9PSAnc3RyaW5nJyl7XHRjcnVkLnVwZGF0ZV9wcm9qZWN0KCk7IH1cblx0XHRlbHNleyBjcnVkLmNyZWF0ZV9wcm9qZWN0KCk7IH1cblx0fSk7XG5cblx0Ly9qZcWbbGkgY2hjZW15IHVzdW7EhcSHIHByb2pla3Rcblx0JCgnI3Rvb2xiYXJfdG9wIGJ1dHRvbi5kZWxldGUnKS5jbGljayhmdW5jdGlvbigpeyBcblx0XHRpZihjb25maXJtKCdDenkgY2hjZXN6IHVzdW7EhcSHIHByb2pla3QgPycpKXtcblx0XHRcdGNydWQuZGVsZXRlX3Byb2plY3QoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vb2R6bmFjemVuaWUgc2VsZWN0YSBwcnp5IHptaWFuaWVcblx0JCgnI2NoYW5nZV9jYXRlZ29yeScpLmNoYW5nZShmdW5jdGlvbigpeyAkKCcjY2hhbmdlX2NhdGVnb3J5JykuYmx1cigpOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHB1c2N6ZW5pYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgbW91c2UubW91c2VfZG93biA9IGZhbHNlOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHdjacWbbmnEmWNpYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cdFxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vxYJhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7XG5cdFxuXHR9KTtcblxuXHQvL3d5d2/FgmFuaWUgZnVua2NqaSBwb2RjemFzIHBvcnVzemFuaWEgbXlzemvEhVxuXHQkKGRvY3VtZW50KS5tb3VzZW1vdmUoZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0aWYobW91c2UubW91c2VfZG93bikgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblx0XHRpZihtZW51X3RvcC5hdXRvX2RyYXcpeyBtb3VzZS5jbGlja19vYmogPSBcImNhbnZhc1wiOyBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO31cblx0XG5cdH0pO1xuXG5cdCQoJyNtYWluX2NhbnZhcycpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7Ly96YXJlamVzdHJvd2FuaWUgb2JpZWt0dXcgIGt0w7NyeSBrbGlrYW15XG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0bW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblxuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7XG5cblx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdFx0cG9pbnRlcnMubGFzdF9yb3cgPSBudWxsO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSBjYW52YXMuY29udGV4dF9uZXdfeDtcblx0XHRjYW52YXMuY29udGV4dF95ID0gY2FudmFzLmNvbnRleHRfbmV3X3k7XG5cblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaVxuXHQkKCcjYWRkX2NhdGVnb3J5JykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuXHR9KTtcblxuXHQvL2RvZGFuaWUgbm93ZWoga2F0ZWdvcmlpIChwbyB3Y2nFm25pxJljaXUgZW50ZXIpXG5cdCQoJ2lucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS5rZXlwcmVzcyhmdW5jdGlvbihlKSB7XG4gICAgXHRpZihlLndoaWNoID09IDEzKSB7XG4gICAgXHRcdGNhdGVnb3JpZXMuYWRkKCk7XG4gICAgXHR9XG5cdH0pO1xuXG5cdC8vJChkb2N1bWVudCkua2V5cHJlc3MoZnVuY3Rpb24oZSkgeyBtZW51X3RvcC5zd2l0Y2hfbW9kZSggZS53aGljaCApOyB9KTtcblxuXHQvL3pha3R1YWxpem93YW5pZSBrYXRlZ29yaWlcbi8vXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKSB7IGNhdGVnb3JpZXMudXBkYXRlKCQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKSAsJCh0aGlzKS52YWwoKSApOyB9KTtcbi8vXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZSkgeyBpZihlLndoaWNoID09IDEzKSB7Y2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0gfSk7XG5cblx0Ly91c3VuacSZY2llIGthdGVnb3JpaVxuLy9cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImJ1dHRvbi5yZW1vdmVcIixcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBjYXRlZ29yaWVzLnJlbW92ZSgkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5JykpOyB9KTtcblxuXHQvL3pha3R1YWxpem93YW5pZSBrYXRlZ29yaWkvXG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyAgfSk7XG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImZvY3Vzb3V0XCIsIGZ1bmN0aW9uKCkgeyBtZW51X3RvcC5tb2RlX2tleSA9IHRydWU7ICB9KTtcblxuXHQvL3Bva2F6YW5pZSAvIHVrcnljaWUgcGFuZWx1IGthdGVnb3JpaVxuXHQkKCcjZXhjZWxfYm94IGgyJykuY2xpY2soZnVuY3Rpb24oKXsgZ2xvYmFsLnRvb2dsZV9sZWZ0KHRoaXMpOyB9KTtcbiAgJCgnI3BvaW50ZXJfYm94IGgyJykuY2xpY2soZnVuY3Rpb24oKXsgZ2xvYmFsLnRvb2dsZV9yaWdodCh0aGlzKTsgfSk7IFxuICAkKCcjcGFsZXRzX2JveCBoMicpLmNsaWNrKGZ1bmN0aW9uKCl7IGdsb2JhbC50b29nbGVfcmlnaHQodGhpcyk7IH0pO1xuXG5cdC8vb2JzxYJ1Z2EgYnV0dG9uw7N3IGRvIGlua3JlbWVudGFjamkgaSBkZWtyZW1lbnRhY2ppIGlucHV0w7N3XG5cdCQoJ2J1dHRvbi5pbmNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2luY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXHQkKCdidXR0b24uZGVjcmVtZW50JykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLmJ1dHRvbl9kZWNyZW1lbnQoICQodGhpcykgKSB9KTtcblxuXHQvL29ixYJ1Z2EgaW5wdXTDs3cgcG9icmFuaWUgZGFueWNoIGkgemFwaXNhbmllIGRvIGJhenlcblx0JCgnLnN3aXRjaCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9zd2l0Y2goICQodGhpcykgKTsgfSk7IC8vcHJ6eWNpc2tpIHN3aXRjaFxuXHQkKCcuaW5wdXRfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXQoICQodGhpcykgKTsgfSk7IC8vdHJhZHljeWpuZSBpbnB1dHlcblx0JCgnLmlucHV0X2Jhc2VfdGV4dCcpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXRfdGV4dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuc2VsZWN0X2Jhc2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3NlbGVjdCggJCh0aGlzKSApOyB9KTsgLy9saXN0eSByb3p3aWphbmUgc2VsZWN0XG5cblx0JCgnI21lbnVfdG9wICNpbmNyZW1lbnRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuaW5jcmVtZW50X3NjYWxlKCk7IH0pO1xuXHQkKCcjbWVudV90b3AgI2RlY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5kZWNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjYWRkX2ltYWdlJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuYWRkX2ltYWdlKCk7IH0pO1xuXG5cdCQoJyNtZW51X3RvcCAjcmVzZXRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgY2FudmFzLnNldF9kZWZhdWx0KCk7IH0pO1xuXG5cdC8vcHJ6eXBpc2FuaWUgcG9kc3Rhd293b3d5Y2ggZGFueWNoIGRvIG9iaWVrdHUgY2FudmFzXG5cdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcbiAgY2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnKSApO1xuICBjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnKSApO1xuICB2YXIgb2Zmc2V0ID0gJCgnI2NhbnZhc19ib3gnKS5vZmZzZXQoKTtcbiAgY2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuICAvL3R3b3J6eW15IHRhYmxpY2UgcG9pbnRlcsOzd1xuXHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblxuICAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuICAkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCwjY2FudmFzX2luZm8gI2hlaWdodCwjY2FudmFzX2luZm8gI3NpemUnKS5jaGFuZ2UoZnVuY3Rpb24oKXttZW51X3RvcC51cGRhdGVfY2FudmFzX2luZm8oKX0pO1xuXG5cdC8vJCgnI2FscGhhX2ltYWdlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9hbHBoYSgpIH0pO1xuXG5cdC8vJCgnaW5wdXQnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyB9KTtcblx0Ly8kKCdpbnB1dCcpLmZvY3Vzb3V0KGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgfSk7XG5cblx0Ly8kKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IGNhbnZhcy5kcmF3KCk7IH0pO1xuXHRjYW52YXMuZHJhdygpOyAvL3J5c293YW5pZSBjYW52YXNcblxufSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxubWVudV90b3AgPSB7XG5cblx0bW92ZV9pbWFnZSA6IGZhbHNlLFxuXHRtb3ZlX2NhbnZhcyA6IGZhbHNlLFxuXHRhdXRvX2RyYXcgOiBmYWxzZSxcblx0bW9kZV9rZXkgOiB0cnVlLFxuXHRjYXRlZ29yeSA6IDAsXG5cdGRpc2FibGVfc2VsZWN0IDogZmFsc2UsXG5cblx0Ly96bWlhbmEgYWt0dWFsbmVqIHpha8WCYWRraVxuXHRjaGFuZ2VfYm94IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKG9iaikucGFyZW50KCkuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHR2YXIgY2F0ZWdvcnkgPSAkKG9iaikuYXR0cignY2F0ZWdvcnknKTtcblx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJ2RpdicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuXHRcdFx0JChvYmopLnBhcmVudCgpLnBhcmVudCgpLmNoaWxkcmVuKCcjJytjYXRlZ29yeSkuZGVsYXkoMTAwKS5mYWRlSW4oNTAwKTtcblx0XHR9KTtcblx0XG5cdFxuXHR9LFxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X21hcHMgOiBmdW5jdGlvbigpe1xuXHRcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvbWFwcycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgbWFwIHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnPG9wdGlvbiBpZD1cInNlbGVjdF9tYXBcIj53eWJpZXJ6IG1hcMSZPC9vcHRpb24+Jztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXAnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0XHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBtYXAgXG5cdFx0XHRcdCQoJy5zZWxlY3RfbWFwJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Ly9zcHJhd2R6YW15IGN6eSB3eWJyYWxpxZtteSBwb2xlIHogaGFzaGVtIG1hcHlcblx0XHRcdFx0XHRpZiggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpICE9ICdzZWxlY3RfbWFwJyl7XG5cdFx0XHRcdFx0XHQvL2plxZtsaSB0YWsgdG8gc3ByYXdkemFteSBjenkgd2N6eXR1amVteSBtYXDEmSBwbyByYXogcGllcndzenkgY3p5IGRydWdpXG5cdFx0XHRcdFx0XHRpZihjcnVkLm1hcF9oYXNoICE9IG51bGwpe1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB3Y3p5dHVqZW15IHBvIHJheiBrb2xlam55IHRvIHB5dGFteSBjenkgbmFwZXdubyBjaGNlbXkgasSFIHdjenl0YcSHXG5cdFx0XHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd8SFIG1hcMSZID8nKSkge1xuXHRcdFx0XHRcdFx0XHRcdGNydWQubWFwX2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdFx0Y3J1ZC5nZXRfbWFwKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdCQoJy5zZWxlY3RfbWFwIG9wdGlvbicpLmVxKDApLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLm1hcF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9tYXAoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRhbGVydCgnbmllIG1vZ8SZIHBvYnJhxIcgbGlzdHkgbWFwJyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblxuXG5cdH0sXG5cblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9wcm9qZWN0cyA6IGZ1bmN0aW9uKCl7XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL3Byb2plY3RzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBwcm9qZWt0w7N3IHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICc8b3B0aW9uIGlkPVwibmV3X3Byb2plY3RcIj5ub3d5IHByb2pla3Q8L29wdGlvbj4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5wcm9qZWN0X2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5wcm9qZWN0KS5uYW1lICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLnByb2plY3QpLm5hbWUgKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfcHJvamVjdCcpLmh0bWwoIGFkZF9odG1sICk7XG5cdFx0XHRcblx0XHRcdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIHByb2plY3QgXG5cdFx0XHRcdCQoJy5zZWxlY3RfcHJvamVjdCcpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd3kgcHJvamVrdCA/JykpIHtcblx0XHRcdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19wcm9qZWN0JyApe1xuXHRcdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGNydWQucHJvamVjdF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9wcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0YWxlcnQoJ25pZSBtb2fEmSBwb2JyYcSHIGxpc3R5IHByb2pla3TDs3cnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0fSxcblxuXHR1cGRhdGVfY2FudmFzX2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5zY2FsZSA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoKSApO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCgpICk7XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoKSApO1xuXG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCBjYW52YXMuc2NhbGUgKyAnJScgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCBjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcgKTtcblxuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyxjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JyxjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0Y2hhbmdlX2FscGhhIDogZnVuY3Rpb24oKXtcblx0XHRpbWFnZS5hbHBoYSA9ICQoJyNhbHBoYV9pbWFnZScpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGFkZF9pbWFnZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2plc2xpIHBvZGFueSBwYXJhbWV0ciBuaWUgamVzdCBwdXN0eVxuXHRcdHZhciBzcmNfaW1hZ2UgPSBwcm9tcHQoXCJQb2RhaiDFm2NpZcW8a8SZIGRvIHpkasSZY2lhOiBcIik7XG5cblx0XHRpZihzcmNfaW1hZ2Upe1xuXHRcdFx0aWYoc3JjX2ltYWdlLmxlbmd0aCA+IDApe1xuXG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0XHRcdC8vd2N6eXRhbmllIHpkasSZY2lhOlxuXHRcdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHRpbWFnZS53aWR0aCA9IGltYWdlLm9iai53aWR0aDtcblx0ICAgIFx0XHRpbWFnZS5oZWlnaHQgPSBpbWFnZS5vYmouaGVpZ2h0O1xuXHQgICAgXHRcdGltYWdlLmRyYXcoKTtcblx0ICBcdFx0fTtcblxuXHRcdFx0ICBpbWFnZS54ID0gMDtcblx0XHRcdCAgaW1hZ2UueSA9IDA7XG5cdFx0XHQgIGltYWdlLm9iai5zcmMgPSBzcmNfaW1hZ2U7XG5cdFx0XHRcdC8vc2ltYWdlLm9iai5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzaG93X2luZm8gOiBmdW5jdGlvbigpeyBcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwocGFyc2VJbnQoY2FudmFzLnNjYWxlKSArICclJyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbChwYXJzZUludChjYW52YXMud2lkdGhfY2FudmFzKSArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHBhcnNlSW50KGNhbnZhcy5oZWlnaHRfY2FudmFzKSArICdweCcpO1xuXHR9XG5cbn1cbiIsIi8vIHBvYmllcmFuaWUgZGFueWNoIHogc2VsZWt0YSBpbnB1dGEgc3dpdGNoeSAoYWt0dWFsaXphY2phIG9iaWVrdMOzdykgYnV0dG9uIGlua3JlbWVudCBpIGRla3JlbWVudFxudmFyIG1vZGVscyA9IHtcblxuXHRidXR0b25faW5jcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgKyAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHRidXR0b25fZGVjcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgLSAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBwYXJzZUludCgkKG9iaikudmFsKCkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21faW5wdXRfdGV4dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikudmFsKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9zZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gJChvYmopLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3N3aXRjaCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0aWYoICQob2JqKS5hdHRyKFwidmFsdWVcIikgPT0gJ2ZhbHNlJyApe1xuXHRcdFx0JChvYmopLmF0dHIoXCJ2YWx1ZVwiLCd0cnVlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQob2JqKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZXsgLy93ecWCxIVjemFteSBwcnplxYLEhWN6bmlrXG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ2ZhbHNlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IG15c3praSAoZG8gb2dhcm5pZWNpYSlcbnZhciBtb3VzZSA9IHtcblx0bW91c2VfZG93biA6IGZhbHNlLFxuXHRjbGlja19vYmogOiBudWxsLFxuXG5cdHRtcF9tb3VzZV94IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblx0dG1wX21vdXNlX3kgOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXG5cdGxlZnQgOiBudWxsLCAvL3BvenljamEgeCBteXN6a2lcblx0dG9wIDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpXG5cdHBhZGRpbmdfeCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRwYWRkaW5nX3kgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0b2Zmc2V0X3ggOiBudWxsLCAvL29mZnNldCB4IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cdG9mZnNldF95IDogbnVsbCwgLy9vZmZzZXQgeSBvYmlla3R1IGtsaWtuacSZdGVnb1xuXG5cdC8vZnVuY2tqYSB3eWtyeXdhasSFY2EgdyBjbyBrbGlrbmnEmXRvIHBvYmllcmFqxIVjYSBwYWRkaW5nIGtsaWtuacSZY2lhIG9yYXogemFwaXN1asSFY2Ega2xpa25pxJljaWVcblx0c2V0X21vdXNlX2Rvd24gOiBmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHR2YXIgb2JqID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0Ly9qZcWbbGkgZWxlbWVudCBuYSBrdMOzcnkga2xpa25pxJl0byBtYSBhdHJ5YnV0IG5hbWVjbGljayBwcnp5cGlzdWplbXkgZ28gZG8gb2JpZWt0dSBteXN6a2lcblx0XHRpZih0eXBlb2YoJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdHRoaXMuY2xpY2tfb2JqID0gJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpO1xuXG5cdFx0XHR2YXIgcG9zaXRpb24gPSAkKG9iaikub2Zmc2V0KCk7XG5cdFx0XHR0aGlzLm9mZnNldF94ID0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMub2Zmc2V0X3kgPSBwb3NpdGlvbi50b3A7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeSA9IHRoaXMudG9wIC0gcG9zaXRpb24udG9wO1xuXHRcdFx0bW91c2UubW91c2VfZG93biA9IHRydWU7XG5cblx0XHRcdHRoaXMudG1wX21vdXNlX3ggPSBpbWFnZS54O1xuXHRcdFx0dGhpcy50bXBfbW91c2VfeSA9IGltYWdlLnk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR0aGlzLmxlZnQgPSBldmVudC5wYWdlWCxcblx0XHR0aGlzLnRvcCA9IGV2ZW50LnBhZ2VZXG5cdH0sXG5cblx0Ly9mdW5rY2phIHd5a29ueXdhbmEgcG9kY3phcyB3Y2nFm25pZWNpYSBwcnp5Y2lrc2t1IG15c3praSAodyB6YWxlxbxub8WbY2kgb2Qga2xpa25pxJl0ZWdvIGVsZW1lbnR1IHd5a29udWplbXkgcsOzxbxuZSByemVjenkpXG5cdG1vdXNlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0c3dpdGNoKHRoaXMuY2xpY2tfb2JqKXtcblx0XHRcdGNhc2UgJ3JpZ2h0X3Jlc2l6ZSc6XG5cdFx0XHRcdC8vcm96c3plcnphbmllIGNhbnZhc2EgdyBwcmF3b1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdHZhciBuZXdfd2lkdGggPSB0aGlzLmxlZnQgLSB0aGlzLnBhZGRpbmdfeCAtIHBvc2l0aW9uLmxlZnRcblx0XHRcdFx0aWYobmV3X3dpZHRoIDwgc2NyZWVuLndpZHRoIC0gMTAwKXtcblx0XHRcdFx0XHRjYW52YXMucmVzaXplX3dpZHRoKG5ld193aWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdib3R0b21fcmVzaXplJzpcblx0XHRcdFx0Ly96bWllbmlhbXkgd3lzb2tvxZvEhyBjYW52YXNhXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0Y2FudmFzLnJlc2l6ZV9oZWlnaHQodGhpcy50b3AgLSB0aGlzLnBhZGRpbmdfeSAtIHBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnaW1hZ2VfcmVzaXplJzpcblxuXHRcdFx0XHRpZihpbWFnZS5vYmogIT09IHVuZGVmaW5lZCl7XG5cblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdFx0dmFyIHhfYWN0dWFsID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcdC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgc3Vic3RyYWN0ID0gaW1hZ2UueCArIGltYWdlLndpZHRoIC0geF9hY3R1YWwgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHRcdFx0XHR2YXIgZmFjb3IgPSBpbWFnZS53aWR0aCAvIGltYWdlLmhlaWdodDtcblxuXHRcdFx0XHRcdGlmIChpbWFnZS53aWR0aCAtIHN1YnN0cmFjdCA+IDEwMCl7XG5cdFx0XHRcdFx0XHRpbWFnZS53aWR0aCAtPSBzdWJzdHJhY3Q7XG5cdFx0XHRcdFx0XHRpbWFnZS5oZWlnaHQgLT0gc3Vic3RyYWN0L2ZhY29yO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuIiwiLy9vYmlla3QgbcOzd2nEhWN5IG5hbSBuYWQgamFrxIUga2F0ZWdvcmlhIGplc3RlxZtteVxudmFyIG9uX2NhdGVnb3J5ID0ge1xuXHRcblx0Y2FudmFzX29mZnNldF90b3AgOiAxODcsXG5cdGNhbnZhc19vZmZzZXRfbGVmdCA6IDEwLFxuXHRuYW1lIDogbnVsbCxcblx0bnVtYmVyIDogbnVsbCxcblxuXHQvL2Z1bmtjamEgendyYWNhasSFY2EgYWt0dWFsbsSFIGthdGVnb3JpxJkgbmFkIGt0w7NyxIUgem5hamR1amUgc2nEmSBrdXJzb3Jcblx0c2V0IDogZnVuY3Rpb24oKXtcblx0XHRcblx0XHR2YXIgbGVmdCA9IG1vdXNlLmxlZnQgLSB0aGlzLmNhbnZhc19vZmZzZXRfbGVmdDtcblx0XHR2YXIgdG9wID0gbW91c2UudG9wIC0gdGhpcy5jYW52YXNfb2Zmc2V0X3RvcDtcblx0XHR2YXIgcm93ID0gTWF0aC5jZWlsKCB0b3AgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHQvL2NvbnNvbGUubG9nKGxlZnQsdG9wLHRoaXMuY2FudmFzX29mZnNldF9sZWZ0LHRoaXMuY2FudmFzX29mZnNldF90b3ApO1xuXHRcdGlmKChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSAmJiAocm93ICUgMiAhPSAwKSl7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCAobGVmdCArIChwb2ludGVycy5zaXplLzIpKS8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICkgLSAxO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggbGVmdCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXHRcdH1cblxuXHRcdHRyeXtcblx0XHRcdHZhciBjYXRlZ29yeV9udW0gPSBwb2ludGVycy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdO1xuXHRcdFx0dmFyIGNhdGVnb3J5X25hbWUgPSBjYXRlZ29yaWVzLmNhdGVnb3J5W2NhdGVnb3J5X251bV1bMF07XG5cdFx0fVxuXHRcdGNhdGNoKGUpe1xuXHRcdFx0dGhpcy5uYW1lID0gbnVsbDtcblx0XHRcdHRoaXMubnVtYmVyID0gbnVsbDtcblx0XHR9XG5cdFx0XG5cdFx0aWYoKGNhdGVnb3J5X25hbWUgPT0gJ3B1c3R5JykgfHwgKGNhdGVnb3J5X25hbWUgPT0gJ2d1bXVqJykpe1xuXHRcdFx0dGhpcy5uYW1lID0gbnVsbDtcblx0XHRcdHRoaXMubnVtYmVyID0gbnVsbDtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMubmFtZSA9IGNhdGVnb3J5X25hbWU7XG5cdFx0XHR0aGlzLm51bWJlciA9IGNhdGVnb3J5X251bTtcblx0XHR9XG5cblx0fVxuXG59XG5cbiQoJyNjYW52YXNfd3JhcHBlcicpLm1vdXNlbGVhdmUoZnVuY3Rpb24oKXsgJChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgyMDApOyB9KTtcblxuJCgnI2NhbnZhc193cmFwcGVyJykubW91c2Vtb3ZlKGZ1bmN0aW9uKCl7IFxuXHRvbl9jYXRlZ29yeS5zZXQoKTtcblx0Y2xvdWQudXBkYXRlX3RleHQoKTtcblx0Y2xvdWQuc2V0X3Bvc2l0aW9uKCk7XG59KTtcblxuIiwidmFyIHBhbGV0cyA9IHtcbiAgLy92YWxfbWF4IDogbnVsbCxcbiAgLy92YWxfbWluIDogbnVsbCxcbiAgLy92YWxfaW50ZXJ2YWwgOiBudWxsLCAgIFxuICAvL3BhbGV0c19hY3RpdmUgOiAwLFxuICAvL3ZhbHVlIDogLTEsIFxuICAvL2NhdGVnb3J5IDogLTEsXG5cbiAgLy9wb2RzdGF3b3dlIHBhbGV0eSBrb2xvcsOzdyAoIG9zdGF0bmlhIHBhbGV0YSBqZXN0IG5hc3rEhSB3xYJhc27EhSBkbyB6ZGVmaW5pb3dhbmlhIClcbiAgY29sb3JfYXJyIDogW1xuICAgIFsnI2Y3ZmNmZCcsJyNlNWY1ZjknLCcjY2NlY2U2JywnIzk5ZDhjOScsJyM2NmMyYTQnLCcjNDFhZTc2JywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10sXG4gICAgWycjZjdmY2ZkJywnI2UwZWNmNCcsJyNiZmQzZTYnLCcjOWViY2RhJywnIzhjOTZjNicsJyM4YzZiYjEnLCcjODg0MTlkJywnIzgxMGY3YycsJyM0ZDAwNGInXSxcbiAgICBbJyNmN2ZjZjAnLCcjZTBmM2RiJywnI2NjZWJjNScsJyNhOGRkYjUnLCcjN2JjY2M0JywnIzRlYjNkMycsJyMyYjhjYmUnLCcjMDg2OGFjJywnIzA4NDA4MSddLFxuICAgIFsnI2ZmZjdlYycsJyNmZWU4YzgnLCcjZmRkNDllJywnI2ZkYmI4NCcsJyNmYzhkNTknLCcjZWY2NTQ4JywnI2Q3MzAxZicsJyNiMzAwMDAnLCcjN2YwMDAwJ10sXG4gICAgWycjZmZmN2ZiJywnI2VjZTdmMicsJyNkMGQxZTYnLCcjYTZiZGRiJywnIzc0YTljZicsJyMzNjkwYzAnLCcjMDU3MGIwJywnIzA0NWE4ZCcsJyMwMjM4NTgnXSxcbiAgICBbJyNmZmY3ZmInLCcjZWNlMmYwJywnI2QwZDFlNicsJyNhNmJkZGInLCcjNjdhOWNmJywnIzM2OTBjMCcsJyMwMjgxOGEnLCcjMDE2YzU5JywnIzAxNDYzNiddLFxuICAgIFsnI2Y3ZjRmOScsJyNlN2UxZWYnLCcjZDRiOWRhJywnI2M5OTRjNycsJyNkZjY1YjAnLCcjZTcyOThhJywnI2NlMTI1NicsJyM5ODAwNDMnLCcjNjcwMDFmJ10sXG4gICAgWycjZmZmN2YzJywnI2ZkZTBkZCcsJyNmY2M1YzAnLCcjZmE5ZmI1JywnI2Y3NjhhMScsJyNkZDM0OTcnLCcjYWUwMTdlJywnIzdhMDE3NycsJyM0OTAwNmEnXSxcbiAgICBbJyNmZmZmZTUnLCcjZjdmY2I5JywnI2Q5ZjBhMycsJyNhZGRkOGUnLCcjNzhjNjc5JywnIzQxYWI1ZCcsJyMyMzg0NDMnLCcjMDA2ODM3JywnIzAwNDUyOSddLFxuICAgIFsnI2ZmZmZkOScsJyNlZGY4YjEnLCcjYzdlOWI0JywnIzdmY2RiYicsJyM0MWI2YzQnLCcjMWQ5MWMwJywnIzIyNWVhOCcsJyMyNTM0OTQnLCcjMDgxZDU4J10sXG4gICAgWycjZmZmZmU1JywnI2ZmZjdiYycsJyNmZWUzOTEnLCcjZmVjNDRmJywnI2ZlOTkyOScsJyNlYzcwMTQnLCcjY2M0YzAyJywnIzk5MzQwNCcsJyM2NjI1MDYnXSxcbiAgICBbJyNmZmZmY2MnLCcjZmZlZGEwJywnI2ZlZDk3NicsJyNmZWIyNGMnLCcjZmQ4ZDNjJywnI2ZjNGUyYScsJyNlMzFhMWMnLCcjYmQwMDI2JywnIzgwMDAyNiddLFxuICAgIFsnI2Y3ZmJmZicsJyNkZWViZjcnLCcjYzZkYmVmJywnIzllY2FlMScsJyM2YmFlZDYnLCcjNDI5MmM2JywnIzIxNzFiNScsJyMwODUxOWMnLCcjMDgzMDZiJ10sXG4gICAgWycjZjdmY2Y1JywnI2U1ZjVlMCcsJyNjN2U5YzAnLCcjYTFkOTliJywnIzc0YzQ3NicsJyM0MWFiNWQnLCcjMjM4YjQ1JywnIzAwNmQyYycsJyMwMDQ0MWInXSxcbiAgICBbJyNmZmZmZmYnLCcjZjBmMGYwJywnI2Q5ZDlkOScsJyNiZGJkYmQnLCcjOTY5Njk2JywnIzczNzM3MycsJyM1MjUyNTInLCcjMjUyNTI1JywnIzAwMDAwMCddLFxuICAgIFsnI2ZmZjVlYicsJyNmZWU2Y2UnLCcjZmRkMGEyJywnI2ZkYWU2YicsJyNmZDhkM2MnLCcjZjE2OTEzJywnI2Q5NDgwMScsJyNhNjM2MDMnLCcjN2YyNzA0J10sXG4gICAgWycjZmNmYmZkJywnI2VmZWRmNScsJyNkYWRhZWInLCcjYmNiZGRjJywnIzllOWFjOCcsJyM4MDdkYmEnLCcjNmE1MWEzJywnIzU0Mjc4ZicsJyMzZjAwN2QnXSxcbiAgICBbJyNmZmY1ZjAnLCcjZmVlMGQyJywnI2ZjYmJhMScsJyNmYzkyNzInLCcjZmI2YTRhJywnI2VmM2IyYycsJyNjYjE4MWQnLCcjYTUwZjE1JywnIzY3MDAwZCddLFxuICAgIFsnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJ11cbiAgXSxcblxuICBzaG93IDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnNob3dfY29sb3IoKTtcbiAgICB0aGlzLnNob3dfcGFsZXRzKCk7XG4gICAgdGhpcy5zaG93X3NlbGVjdCgpO1xuICAgIC8vbGF5ZXJzLmRhdGEuY29sb3JfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV07XG4gIH0sXG5cbiAgc2hvd19zZWxlY3QgOiBmdW5jdGlvbigpe1xuXG4gICAgLy93ecWbd2lldGxhbXkgcGFuZWwgZG8gd3lib3J1IGtvbHVtbnkga2F0ZWdvcmlpXG4gICAgYWRkX2h0bWwgPSAnPG9wdGlvbiBjb2w9XCItMVwiPnd5Ymllcno8L29wdGlvbj4nO1xuICAgIGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7ICBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBpZihleGNlbC5kYXRhWzBdW2ldIT0gJycpe1xuICAgICAgICBpZihpID09IGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSl7XG4gICAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIiBzZWxlY3RlZD4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIj4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCgnI2V4Y2VsX2JveCBzZWxlY3QuY2F0ZWdvcnknKS5odG1sKCBhZGRfaHRtbCApO1xuXG4gICAgLy93ecWbd2lldGxhbXkgcGFuZWwgZG8gd3lib3J1IGtvbHVtbnkgd2FydG/Fm2NpXG4gICAgYWRkX2h0bWwgPSAnPG9wdGlvbiBjb2w9XCItMVwiPnd5Ymllcno8L29wdGlvbj4nO1xuICAgIGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7ICBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBpZihleGNlbC5kYXRhWzBdW2ldIT0gJycpe1xuICAgICAgICBpZihpID09IGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSl7XG4gICAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIiBzZWxlY3RlZD4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIj4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgICQoJyNleGNlbF9ib3ggc2VsZWN0LnZhbHVlJykuaHRtbCggYWRkX2h0bWwgKTtcblxuICAgIC8va29sb3J1amVteSBvZHBvd2llZG5pbyBleGNlbGFcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcInZhbHVlXCIpO1xuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZCcpLnJlbW92ZUNsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgXG4gICAgaWYoIGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSl7XG4gICAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcInZhbHVlXCIpO1xuICAgIH1cblxuICAgIGlmKCBsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpe1xuICAgICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkW2NvbD1cIicrKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJjYXRlZ29yeVwiKTtcbiAgICB9XG4gIH0sXG5cbiAgLy93eWJpZXJhbXkga29sdW1uxJkga2F0ZWdvcmlpIChvYnN6YXLDs3cpXG4gIHNldF9jYXRlZ29yeSA6IGZ1bmN0aW9uKG9iail7XG4gICAgbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdID0gcGFyc2VGbG9hdCgkKFwiI2V4Y2VsX2JveCBzZWxlY3QuY2F0ZWdvcnkgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoJ2NvbCcpKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgLy9jYXRlZ29yaWVzLnVwZGF0ZV9jb2xvcigpO1xuICB9LCBcblxuICAvL3d5YmllcmFteSBrb2x1bW5lIHdhcnRvxZtjaSBpIHVzdGF3aWFteSBuYWptbmllanN6xIUgaSBuYWp3acSZa3N6xIUgd2FydG/Fm8SHXG4gIHNldF92YWx1ZSA6IGZ1bmN0aW9uKG9iail7XG5cbiAgICB2YXIgdmFsdWVfdG1wID0gcGFyc2VGbG9hdCgkKFwiI2V4Y2VsX2JveCBzZWxlY3QudmFsdWUgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoJ2NvbCcpKTtcblxuXG4gICAgLy96YWJlenBpZWN6ZW5pZSBwcnplZCB3eWJyYW5pZW0ga29sdW1ueSB6YXdpZXJhasSFY2VqIHRla3N0XG4gICAgdmFyIGNoZWNrID0gdHJ1ZTtcbiAgICBmb3IodmFyIGkgPSAxLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBpZiAoKCEkLmlzTnVtZXJpYyhTdHJpbmcoZXhjZWwuZGF0YVtpXVt2YWx1ZV90bXBdKS5yZXBsYWNlKCcsJywnLicpKSkgJiYgIChleGNlbC5kYXRhW2ldW3ZhbHVlX3RtcF0gIT0gJycpKXsgXG5cbiAgICAgICAgY2hlY2sgPSBmYWxzZTtcbiAgICAgICAgY29uc29sZS5sb2coJ3RvIG5pZSBqZXN0IGxpY3piYSE6ICcrZXhjZWwuZGF0YVtpXVt2YWx1ZV90bXBdKTtcbiAgICAgICB9XG4gICAgfVxuXG4gICAgLy9zcHJhd2R6YW15IGN6eSB3IHphem5hY3pvbmVqIGtvbHVtbmllIHpuYWpkdWplIHNpxJkgd2llcnN6IHogdGVrc3RlbVxuICAgIGlmKGNoZWNrKXtcbiAgICAgIC8vamVzbGkgbmllIHd5YmllcmFteSBkYW7EhSBrb2x1bW7EmVxuICAgICAgbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdID0gdmFsdWVfdG1wO1xuICAgICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwidmFsdWVcIik7XG4gICAgICB0aGlzLnNldF9taW5fbWF4X3ZhbHVlKCk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICAvL2plxZtsaSB0YWsgendyYWNhbXkgYsWCxIVkXG4gICAgICBhbGVydCgnd3licmFuYSBrb2x1bW5hIHphd2llcmEgd2FydG/Fm2NpIHRla3N0b3dlJylcbiAgICAgIHRoaXMuc2hvd19zZWxlY3QoKTtcbiAgICB9XG5cbiAgfSxcblxuICBzZXRfbWluX21heF92YWx1ZSA6IGZ1bmN0aW9uKCl7IFxuICAgIHZhciB0bXBfdmFsdWUgPSBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV07XG4gICAgaWYodG1wX3ZhbHVlICE9IC0xKXtcbiAgICAgIC8vd3lzenVrdWplbXkgbmFqbW5pZWpzemEgaSBuYWp3acSZa3N6xIUgd2FydG/Fm8SHIHcga29sdW1uaWUgd2FydG/Fm2NpXG4gICAgICBpZiggbGF5ZXJzLnZhbHVlW3RtcF92YWx1ZV0gIT0gLTEgKXtcbiAgICAgICAgXG4gICAgICAgIHZhciB0bXBfbWluID0gcGFyc2VGbG9hdChTdHJpbmcoZXhjZWwuZGF0YVsxXVt0bXBfdmFsdWVdKS5yZXBsYWNlKCcsJywnLicpKTtcbiAgICAgICAgdmFyIHRtcF9tYXggPSAgcGFyc2VGbG9hdChTdHJpbmcoZXhjZWwuZGF0YVsxXVt0bXBfdmFsdWVdKS5yZXBsYWNlKCcsJywnLicpKTtcblxuICAgICAgICBmb3IodmFyIGkgPSAxLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cbiAgICAgICAgICB2YXIgbnVtX3RtcCA9IHBhcnNlRmxvYXQoU3RyaW5nKGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSkucmVwbGFjZSgnLCcsJy4nKSk7XG5cbiAgICAgICAgICBpZigodG1wX21pbiA+IG51bV90bXApICYmIChudW1fdG1wICE9IFwiXCIpKXsgdG1wX21pbiA9IG51bV90bXA7IH1cbiAgICAgICAgICBpZigodG1wX21heCA8IG51bV90bXApICYmIChudW1fdG1wICE9IFwiXCIpKXsgdG1wX21heCA9IG51bV90bXA7IH1cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKFwibWluIG1heCB2YWx1ZTogXCIsdG1wX21pbiwgdG1wX21heCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCd3eW5pazogJyx0bXBfbWluLHRtcF9tYXgpO1xuXG4gICAgICBsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdID0gdG1wX21pblxuICAgICAgbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXSA9IHRtcF9tYXg7XG5cbiAgICAgIC8vYWt0dWFsaXp1amVteSB0YWJsaWPEmSBsZWdlbmRcbiAgICAgIGxlZ2VuZHMudXBkYXRlKCk7XG4gICAgfVxuICB9LFxuXG4gIHNob3dfY29sb3IgOiBmdW5jdGlvbigpe1xuICAgIC8vd3nFm3dpZXRsYW15IHBpZXJ3c3phbGlzdMSZIGtvbG9yw7N3XG4gICAgdmFyIGh0bWwgPSAnJztcblxuICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaTxpX21heDsgaSsrKXtcbiAgICAgIFxuICAgICAgaWYobGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwiYWN0aXZlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcl9hcnJbbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1dW2ldKydcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZDonK3RoaXMuY29sb3JfYXJyW2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXVtpXSsnXCI+PC9zcGFuPic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCgnI3BhbGV0cyAjc2VsZWN0JykuaHRtbCggaHRtbCApO1xuICAgIFxuICAgICQoJyNwYWxldHMgI3NlbGVjdCA+IHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBwYWxldHMuc2VsZWN0X2NvbG9yKHRoaXMpOyB9KTtcblxuICB9LFxuXG4gIHNob3dfcGFsZXRzIDogZnVuY3Rpb24oKXtcbiAgICBcbiAgICAvL3d5c3dpZXRsYW15IHdzenlzdGtpZSBwYWxldHlcbiAgICB2YXIgaHRtbCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyLmxlbmd0aDtpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBcbiAgICAgIGlmKGkgPT0gbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0pe1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cImFjdGl2ZVwiPic7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBodG1sICs9ICc8c3Bhbj4nO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMCwgal9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGogPCBqX21heDsgaisrKXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9yX2FycltpXVtqXSArICdcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICAgIGh0bWwgKz0gJzwvc3Bhbj4nO1xuXG4gICAgfVxuICAgICQoJyNwYWxldHMgI2FsbCcpLmh0bWwoIGh0bWwgKTtcbiAgICAkKCcjcGFsZXRzICNhbGwgPiBzcGFuJykuY2xpY2soZnVuY3Rpb24oKXsgcGFsZXRzLnNlbGVjdF9wYWxldHModGhpcyk7fSk7XG4gXG4gIH0sXG5cbiAgLy96YXpuYWN6YW15IGtvbmtyZXRuZSBrb2xvcnkgZG8gd3nFm3dpZXRsZW5pYVxuICBzZWxlY3RfY29sb3IgOiBmdW5jdGlvbihvYmope1xuICAgIGlmKChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcbiAgICAgIGlmKCAkKG9iaikuaGFzQ2xhc3MoJ2FjdGl2ZScpICl7XG4gICAgICAgIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdWyQob2JqKS5pbmRleCgpXSA9IDA7XG4gICAgICAgICQob2JqKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVskKG9iaikuaW5kZXgoKV0gPSAxO1xuICAgICAgICAkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJzZV9jb2xvcigpO1xuICAgICAgcGFsZXRzLnNldF9taW5fbWF4X3ZhbHVlKCk7XG4gICAgfVxuICB9LFxuXG4gIC8vZG9kYWplbXkgZG8gdGFibGljeSBha3R5d255Y2gga29sb3LDs3cgdGUga3TDs3JlIHPEhSB6YXpuYWN6b25lXG4gIHBhcnNlX2NvbG9yIDogZnVuY3Rpb24oKXtcbiAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IFtdO1xuICAgICBmb3IgKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGk8aV9tYXg7IGkrKyl7XG5cbiAgICAgIGlmKCAkKCcjcGFsZXRzICNzZWxlY3Qgc3BhbicpLmVxKGkpLmhhc0NsYXNzKCdhY3RpdmUnKSApe1xuICAgICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5wdXNoKCByZ2IyaGV4KCQoJyNwYWxldHMgI3NlbGVjdCBzcGFuJykuZXEoaSkuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJykpICk7XG4gICAgICB9XG4gICAgIH1cbiAgICAvL2NhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuICAgIC8vZnVua2NqYSBwb21vY25pY3phXG4gICAgZnVuY3Rpb24gcmdiMmhleChyZ2IpIHtcbiAgICAgIHJnYiA9IHJnYi5tYXRjaCgvXnJnYlxcKChcXGQrKSxcXHMqKFxcZCspLFxccyooXFxkKylcXCkkLyk7XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIGhleCh4KSB7XG4gICAgICAgIHJldHVybiAoXCIwXCIgKyBwYXJzZUludCh4KS50b1N0cmluZygxNikpLnNsaWNlKC0yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIiNcIiArIGhleChyZ2JbMV0pICsgaGV4KHJnYlsyXSkgKyBoZXgocmdiWzNdKTtcbiAgICB9XG4gICAgbGVnZW5kcy51cGRhdGUoKTtcbiAgfSxcblxuICAvL3phem5hY3phbXkgcGFsZXRlIGtvbG9yw7N3XG4gIHNlbGVjdF9wYWxldHMgOiBmdW5jdGlvbihvYmope1xuICAgIGlmKChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcbiAgICAgICQoJyNwYWxldHMgI2FsbCA+IHNwYW4nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSAkKG9iaikuaW5kZXgoKTtcbiAgICAgIFxuICAgICAgLy9ha3R1YWxpenVqZW15IHBhbGV0xJkgYWt0eXdueWNoIGtvbG9yw7N3XG4gICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IFtdO1xuICAgICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgICAgICAgaWYobGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG4gICAgICAgICAgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ucHVzaCggcGFsZXRzLmNvbG9yX2FycltsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXV1baV0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL2FrdHVhbGl6dWplbXkga29sb3J5IHcgbGVnZW5kemllXG4gICAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgICBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVszXSA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW2ldO1xuICAgICAgfVxuXG4gICAgICAvL3d5xZt3aWV0bGFteSBva25hIGtvbG9yw7N3IGRvIHphem5hY3plbmlhXG4gICAgICBwYWxldHMuc2hvd19jb2xvcigpO1xuICAgICAgLy93ecWbd2lldGxhbXkgb2tubyB6IGxlZ2VuZGFtaVxuICAgICAgbGVnZW5kcy5zaG93KCk7XG5cbiAgICAgIC8vYWt0dWFsaXp1amVteSBrb2xvcnkgbmEgbWFwaWVcbiAgICAgIGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG4gICAgfVxuICB9XG59XG5cbi8vemRhcnplbmlhIGRvdHljesSFY2UgcGFsZXRcbiQoJyNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5JykuY2hhbmdlKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZXRfY2F0ZWdvcnkodGhpcyk7IH0pO1xuJCgnI2V4Y2VsX2JveCBzZWxlY3QudmFsdWUnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgcGFsZXRzLnNldF92YWx1ZSh0aGlzKTsgfSk7IiwiLy9tZW51IHBvaW50ZXJcbnZhciBwb2ludGVycyA9IHtcblx0c2hvd19hbGxfcG9pbnQgOiB0cnVlLFxuXHRzaG93X2JvcmRlciA6IGZhbHNlLFxuXHRwYWRkaW5nX3ggOiAxLFxuXHRwYWRkaW5nX3kgOiAxLFxuXHR0cmFuc2xhdGVfbW9kdWxvIDogZmFsc2UsXG5cdHNpemU6IDEwLFxuXHRtYWluX2tpbmQgOiAnc3F1YXJlJyxcblx0a2luZHMgOiBBcnJheSgnc3F1YXJlJywnY2lyY2xlJywnaGV4YWdvbicsJ2hleGFnb24yJyksXG5cdGNvbG9yX2JvcmRlcjogJyMzMzMnLFxuXHRwb2ludGVycyA6IEFycmF5KCksIC8vcG9pbnRlcnMucG9pbnRlcnNbcnphZF1ba29sdW1uYV0gOiBrYXRlZ29yaWFbbnVtZXJdXG5cblx0bGFzdF9jb2x1bW4gOiBudWxsLFx0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRsYXN0X3JvdyA6IG51bGwsXHQvL3dpZXJzeiBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblxuXHRkcmF3X2JvcmRlcjogZnVuY3Rpb24obmV4dCl7XG5cblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ194LFxuXHRcdFx0XHRoZWlnaHRfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ195LFxuXHRcdFx0XHRub25lX2NvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCIsXG5cdFx0XHRcdGJvcmRlciA9IHt9LFxuXHRcdFx0XHRkYXRhID0ge307XG5cdFx0XG5cdFx0dmFyIG5leHQgPSBuZXh0IHx8IGZhbHNlO1xuXG5cdFx0aWYoKHRoaXMubWFpbl9raW5kID09ICdzcXVhcmUnKSB8fCAodGhpcy5tYWluX2tpbmQgPT0gJ2NpcmNsZScpIHx8ICh0aGlzLm1haW5fa2luZCA9PSAnaGV4YWdvbicpKXtcblx0XHRcdFx0XG5cdFx0XHQvL2NhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3JfYm9yZGVyO1xuXHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGE9MTtcblx0XHRcdC8vY2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMTI4LDAsMCwxKSc7XG5cblx0XHRcdGlmKCFuZXh0KXtcblx0XHRcdFx0Ly9jYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYT0xO1xuXHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxKSc7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHQvL2NhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhPTAuNTtcblx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xvcl9ib3JkZXI7XG5cdFx0XHR9XG5cblxuXG5cdFx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKXtcblxuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IDApe1xuXG5cdFx0XHRcdFx0XHRib3JkZXIgPSB7XG5cdFx0XHRcdFx0XHRcdHRvcDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHRvcF9sZWZ0IDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHRvcF9yaWdodCA6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRyaWdodDogZmFsc2Vcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdC8vcnlzdWplbXkgcG/FgsOzd2thbWlcblx0XHRcdFx0XHRcdC8vc3ByYXdkemFteSBjenkgbWFteSB3xYLEhWN6b27EhSBvcGNqZSBtb2R1bG9cblx0XHRcdFx0XHRcdGlmKHJvdy0xID49IDApe1xuXHRcdFx0XHRcdFx0XHRpZighcG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyl7XG5cdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgbmllIHRvIHNwcmF3ZHphbXkgdHJhZHljeWpuaWUgd8WCxIVjem9uxIUgZ3JhbmljxJkgbmFkIFxuXHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyLnRvcCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgdGFrIHRvOiBzcHJhd2R6YW15IGN6eSB3aWVyc3ogamVzdCBwcnplc3VuacSZdHlcblx0XHRcdFx0XHRcdFx0XHRpZihyb3cgJSAyID09IDApe1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKGNvbHVtbi0xKSA+IDApe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbl0gIT0gdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pKXtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wX2xlZnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uKzFdICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uKzFdICE9IHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfcmlnaHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbi0xXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbi0xXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wX2xlZnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKGNvbHVtbisxKSA8PSBjYW52YXMuYWN0aXZlX2NvbHVtbil7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfcmlnaHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XHRcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYoKGNvbHVtbisxKSA8PSBjYW52YXMuYWN0aXZlX2NvbHVtbil7XG5cdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uKzFdICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbisxXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdGJvcmRlci5yaWdodCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0eCA6IGNvbHVtbip3aWR0aF9wb2ludGVyLFxuXHRcdFx0XHRcdFx0XHR5IDogcm93KmhlaWdodF9wb2ludGVyLFxuXHRcdFx0XHRcdFx0XHRzaXplIDogdGhpcy5zaXplLFxuXHRcdFx0XHRcdFx0XHRib3JkZXIgOiBib3JkZXIsXG5cdFx0XHRcdFx0XHRcdGxpbmVfd2lkdGhfeCA6IHBvaW50ZXJzLnBhZGRpbmdfeCxcblx0XHRcdFx0XHRcdFx0bGluZV93aWR0aF95IDogcG9pbnRlcnMucGFkZGluZ195LFxuXHRcdFx0XHRcdFx0XHR0X21vZHVsbyA6IGZhbHNlXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmKCAocm93ICUgMiA9PSAwKSAmJiAocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgKXtcblx0XHRcdFx0XHRcdFx0ZGF0YS54ID0gY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmKCFuZXh0KXtcblx0XHRcdFx0XHRcdFx0ZmlndXJlcy5zcXVhcmVfYm9yZGVyX2JpZyhkYXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGZpZ3VyZXMuc3F1YXJlX2JvcmRlcl9zbWFsbChkYXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cdFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKCFuZXh0KXtcblx0XHRcdHRoaXMuZHJhd19ib3JkZXIodHJ1ZSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vcnlzb3dhbmllIHdzenlzdGtpY2ggcHVua3TDs3dcblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHdpZHRoX3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHR2YXIgaGVpZ2h0X3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiXG5cblx0XHRpZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRcdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93Kyspe1xuXHRcdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1x0XHRcdFx0XG5cblx0XHRcdFx0XHRpZiggKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IG1lbnVfdG9wLmNhdGVnb3J5KSAmJiAobWVudV90b3AuY2F0ZWdvcnkgIT0gMCkgKXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC4yXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKHRoaXMuc2hvd19ib3JkZXIpe1xuXHRcdFx0dGhpcy5kcmF3X2JvcmRlcihmYWxzZSk7XG5cdFx0fVxuXG5cdH0sXG5cblx0Ly90d29yenlteSB0YWJsaWNlIHBvbnRlcsOzdyAoamXFm2xpIGpha2nFmyBwb250ZXIgaXN0bmllamUgem9zdGF3aWFteSBnbywgdyBwcnp5cGFka3UgZ2R5IHBvaW50ZXJhIG5pZSBtYSB0d29yenlteSBnbyBuYSBub3dvKVxuXHRjcmVhdGVfYXJyYXkgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5hY3RpdmVfcm93ID0gcGFyc2VJbnQoIGNhbnZhcy5oZWlnaHRfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3kpICk7XG5cdFx0Y2FudmFzLmFjdGl2ZV9jb2x1bW4gPSBwYXJzZUludCggY2FudmFzLndpZHRoX2NhbnZhcyAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXG5cdFx0aWYoICh0aGlzLnBvaW50ZXJzLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfcm93KSB8fCAodGhpcy5wb2ludGVyc1swXS5sZW5ndGggPCBjYW52YXMuYWN0aXZlX2NvbHVtbikgKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddID09IHVuZGVmaW5lZCkgdGhpcy5wb2ludGVyc1tyb3ddID0gbmV3IEFycmF5KCk7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gdW5kZWZpbmVkKVx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZV9wb2ludCA6IGZ1bmN0aW9uKHkseCx5X2xhc3QseF9sYXN0KXtcblxuXHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblxuXHRcdC8vd3l6bmFjemVuaWUgcsOzd25hbmlhIHByb3N0ZWpcblx0XHRpZiggKCh5X2xhc3QgIT0geSkgfHwgKHhfbGFzdCAhPSB4KSkgJiYgKHlfbGFzdCAhPSBudWxsKSAmJiAoeF9sYXN0ICE9IG51bGwpICl7XG5cdFx0XHR2YXIgYSA9ICh5X2xhc3QgLSB5KSAvICh4X2xhc3QgLSB4KTtcblx0XHRcdHZhciBiID0geSAtIGEqeDtcblxuXHRcdFx0aWYoeF9sYXN0ID4geCl7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHg7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIGNvbF90byA9IHg7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHhfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0aWYoeV9sYXN0ID4geSl7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHk7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHJvd190byA9IHk7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHlfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJvdyA9IG51bGw7XG5cdFx0XHRmb3IodmFyIGNvbCA9IGNvbF9mcm9tOyBjb2wgPD0gY29sX3RvOyBjb2wrKylcblx0XHRcdHtcblx0XHRcdFx0cm93ID0gcGFyc2VJbnQoIGEqY29sK2IgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHJvdykpIHJvdyA9IHk7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjb2wgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciByb3cgPSByb3dfZnJvbTsgcm93IDw9IHJvd190bzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbCA9IHBhcnNlSW50KCAocm93LWIpL2EgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKGNvbCkpIGNvbCA9IHg7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0fVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
