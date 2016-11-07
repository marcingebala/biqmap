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
							console.log(excel.data[i_exel][layers.value[i_layers]]+' | '+value);
							
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
		if(excel.data.length > excel.min_row) excel.min_row = excel.data.length;
		if(excel.data[0].length > excel.min_col) excel.min_col = excel.data[0].length;

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
							add_html += '<td class="td" contenteditable="true" row="' + i + '" col="' + j + '">'+excel.data[i][(j-1)]+'</td>';
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

		//dodajemy możliwość edycji excela
		$('#excel_box .table .td').keyup(function(){ excel.edit(this); });

		$('#excel_box .table .td').blur(function(){ palets.show_select(); });

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
	toogle_panel  : function(event){
		if (!event) {event = window.event;} //latka dla mozilli
	
		//sprawdzamy z jakim panelem mamy do czynienia (czy pokazującym się z lewej czy z prawej strony)
		if(  parseInt($(event.target).parent().css('left')) > 0 ){
			//panel jest z prawej strony
			if( $(event.target).parent().css('right') == '0px' ){
				$(event.target).parent().animate({right: [-$(event.target).parent().width()-20,"swing"]}, 1000, function() {});
	    }
	    else{
	    	 $(event.target).parent().animate({right: ["0px","swing"]}, 1000, function() {});
	    }
		}
		else{
			//panel jest z lewej strony
			if( $(event.target).parent().css('left') == '0px' ){
				$(event.target).parent().animate({left: [-$(event.target).parent().width()-20,"swing"]}, 1000, function() {});
	    }
	    else{
	    	 $(event.target).parent().animate({left: ["0px","swing"]}, 1000, function() {});
	    }
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

			console.log( parseInt(layers.min_value[layers.active]),layers.min_value[layers.active] );

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
	$('#excel_box h2, #pointer_box h2, #palets_box h2').click(function(event){ global.toogle_panel(event); });

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
        
        var tmp_min = String(excel.data[1][tmp_value]).replace(',','.')
        var tmp_max = String(excel.data[1][tmp_value]).replace(',','.');
        for(var i = 1, i_max = excel.data.length; i < i_max; i++){
          if((tmp_min > String(excel.data[i][tmp_value]).replace(',','.')) &&  (excel.data[i][tmp_value] != "")) tmp_min = String(excel.data[i][tmp_value]).replace(',','.');
          if((tmp_max < String(excel.data[i][tmp_value]).replace(',','.')) &&  (excel.data[i][tmp_value] != "")) tmp_max = String(excel.data[i][tmp_value]).replace(',','.');
        }
        //console.log("min max value: ",tmp_min, tmp_max);
      }

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNvbG9yX3BpY2tlci5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJnbG9iYWwuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vZGVscy5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwcm9qZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9jenlzemN6ZW5pZSBpIHJ5c293YW5pZSBwbyBjYW52YXNpZVxudmFyIGNhbnZhcyA9IHtcblx0XG5cdHNjYWxlIDogMTAwLFxuXHR3aWR0aF9jYW52YXMgOiA3MDAsXG5cdGhlaWdodF9jYW52YXMgOiA0MDAsXG5cdGNhbnZhcyA6IG51bGwsXG5cdGNvbnRleHQgOiBudWxsLFxuXHR0aHVtYm5haWwgOiBudWxsLFxuXHR0aXRsZV9wcm9qZWN0IDogJ25vd3kgcHJvamVrdCcsXG5cblx0Y29udGV4dF94IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfeSA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeVxuXHRjb250ZXh0X25ld194IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X25ld195IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeVxuXG5cdG9mZnNldF9sZWZ0IDogbnVsbCxcblx0b2Zmc2V0X3RvcCA6IG51bGwsXG5cdGFjdGl2ZV9yb3cgOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXHRhY3RpdmVfY29sdW1uIDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblxuXHR0aHVtYm5haWwgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5fY2FudmFzXCIpO1xuXHRcdHZhciBkYXRhVVJMID0gY2FudmFzLnRvRGF0YVVSTCgpO1xuXHRcdGNvbnNvbGUubG9nKGRhdGFVUkwpO1xuXHR9LFxuXG5cdC8vcnlzdWplbXkgY2FudmFzIHplIHpkasSZY2llbVxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblx0XHRwb2ludGVycy5kcmF3KCk7XG5cblx0XHRpZiAoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpICBpbWFnZS5kcmF3KCk7XG5cdH0sXG5cblx0ZHJhd190aHVtbmFpbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMudGh1bWJuYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHR9LFxuXG5cdC8vcmVzZXR1amVteSB0xYJvIHpkasSZY2lhXG5cdHJlc2V0IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblx0fSxcblxuXHQvLyBjennFm2NpbXkgY2HFgmUgemRqxJljaWUgbmEgY2FudmFzaWVcblx0Y2xlYXIgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5jbGVhclJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdFx0Ly90aGlzLmNvbnRleHQuZmlsbFJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdH0sXG5cblx0cmVzaXplX3dpZHRoIDogZnVuY3Rpb24obmV3X3dpZHRoKXtcblx0XHR0aGlzLndpZHRoX2NhbnZhcyA9IG5ld193aWR0aDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsdGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiB0aGlzLndpZHRoX2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHRoaXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSArICclJyk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdH0sXG5cblx0cmVzaXplX2hlaWdodCA6IGZ1bmN0aW9uKG5ld19oZWlnaHQpe1xuXHRcdHRoaXMuaGVpZ2h0X2NhbnZhcyA9IG5ld19oZWlnaHQ7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0Jyx0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnaGVpZ2h0JzogdGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdHRoaXMuc2NhbGUgPSAxMDA7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHRoaXMuc2NhbGUrJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTsgLy8gYWt0dWFsaXp1amVteSBkYW5lIG9kbm/Fm25pZSByb3ptaWFyw7N3IGNhbnZhc2EgdyBtZW51IHUgZ8Ozcnlcblx0XHQvL3RoaXMuZHJhdygpOyAvL3J5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdH0sXG5cblx0c2V0X2RlZmF1bHQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfYm94ICNyaWdodF9yZXNpemUsICNjYW52YXNfYm94ICNib3R0b21fcmVzaXplJykuZmFkZUluKDUwMCk7XG5cdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXG5cdFx0Y2FudmFzLnNjYWxlID0gMTAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblxuXHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdHZhciBuZXdfaGVpZ2h0ID0gY2FudmFzLmhlaWdodF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cih7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JzogbmV3X2hlaWdodCArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IGthdGVnb3JpaSBkb2RhbmllIC8gYWt0dWFsaXphY2phIC8gdXN1bmnEmWNpZSAvIHBva2F6YW5pZSBrYXRlZ29yaWlcbnZhciBjYXRlZ29yaWVzID0ge1xuXHRcblx0Ly9jYXRlZ29yeSA6IG5ldyBBcnJheShbJ3B1c3R5JywnIzgwODA4MCddKSxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBuYW1lID0gQXJyYXkoJCgnI2NhdGVnb3J5X2JveCBpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykudmFsKCksJyNmZjAwMDAnKTtcblx0XHQkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoJycpO1xuXG5cdFx0dGhpcy5jYXRlZ29yeS5wdXNoKG5hbWUpO1xuXHRcdG1lbnVfdG9wLmNhdGVnb3J5ID0gKHRoaXMuY2F0ZWdvcnkubGVuZ3RoLTEpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblx0dXBkYXRlIDogZnVuY3Rpb24oaW5kZXgsbmFtZSl7XG5cdFx0dGhpcy5jYXRlZ29yeVtpbmRleF1bMF0gPSBuYW1lO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblxuXHQvL2FrdHVhbGl6dWplbXkgdGFibGljxJkga29sb3LDs3dcblx0dXBkYXRlX2NvbG9yIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vbW/FvGxpd2EgYWt0dWFsaXphY2phIGplZHluaWUgdyBwcnp5cGFka3Ugd3licmFuaWEga29ua3JldG5laiBrb2x1bW55IHdhcnRvxZtjaSBpIGthdGVnb3JpaSB3IGV4Y2VsdVxuXHRcdGlmKChjcnVkLm1hcF9qc29uLmxlbmd0aCA+IDApICYmIChleGNlbC5kYXRhLmxlbmd0aCA+IDApICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcblxuXHRcdFx0Zm9yICh2YXIgaV9jYXRlZ29yeSA9IDAsIGlfY2F0ZWdvcnlfbWF4ID1cdGxheWVycy5jYXRlZ29yeV9uYW1lLmxlbmd0aDsgaV9jYXRlZ29yeSA8IGlfY2F0ZWdvcnlfbWF4OyBpX2NhdGVnb3J5Kyspe1xuXHRcdFx0XHR2YXIgbmFtZSA9IGxheWVycy5jYXRlZ29yeV9uYW1lW2lfY2F0ZWdvcnldO1xuXHRcdFx0XHR2YXIgZmluZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGZvciAodmFyIGlfbGF5ZXJzID0gMCwgaV9sYXllcnNfbWF4ID0gbGF5ZXJzLmxpc3QubGVuZ3RoOyBpX2xheWVycyA8IGlfbGF5ZXJzX21heDsgaV9sYXllcnMrKyl7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaV9leGVsID0gMCwgaV9leGVsX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpX2V4ZWwgPCBpX2V4ZWxfbWF4OyBpX2V4ZWwrKyl7XG5cdFx0XHRcdFx0XHRpZigoIFN0cmluZyhleGNlbC5kYXRhW2lfZXhlbF1bbGF5ZXJzLmNhdGVnb3J5W2lfbGF5ZXJzXV0pLnRvTG93ZXJDYXNlKCkgPT0gU3RyaW5nKG5hbWUpLnRvTG93ZXJDYXNlKCkpICYmIChleGNlbC5kYXRhW2lfZXhlbF1bbGF5ZXJzLmNhdGVnb3J5W2lfbGF5ZXJzXV0gIT0gJycpKXtcblxuXHRcdFx0XHRcdFx0XHRmaW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgem5hbGXFumxpxZtteSBrYXRlZ29yacSZIHcgZXhjZWx1XG5cdFx0XHRcdFx0XHRcdHZhciB2YWx1ZSA9IFN0cmluZyhleGNlbC5kYXRhW2lfZXhlbF1bbGF5ZXJzLnZhbHVlW2lfbGF5ZXJzXV0pLnJlcGxhY2UoJywnLCcuJyk7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMudmFsdWVbaV9sYXllcnNdXSsnIHwgJyt2YWx1ZSk7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgaV9sZWdlbmRzID0gMCwgaV9sZWdlbmRzX21heCA9IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXS5sZW5ndGg7IGlfbGVnZW5kcyA8IGlfbGVnZW5kc19tYXg7IGlfbGVnZW5kcysrICl7XG5cdFx0XHRcdFx0XHRcdFx0aWYoICh2YWx1ZSA+PSBsYXllcnMubGVnZW5kc1tpX2xheWVyc11baV9sZWdlbmRzXVswXSkgJiYgKHZhbHVlIDw9IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNdWzFdKSApe1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgem5hbGXFumxpc215XG5cdFx0XHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2lfbGF5ZXJzXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNdWzNdO1xuXHRcdFx0XHRcdFx0XHRcdFx0aV9sZWdlbmRzID0gaV9sZWdlbmRzX21heDtcblx0XHRcdFx0XHRcdFx0XHRcdGlfZXhlbCA9IGlfZXhlbF9tYXg7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgd2FydG/Fm8SHIHd5Y2hvZHppIHBvemEgc2thbGUgdSB0YWsgcHJ6eXBpc3VqZW15IGplaiBvZHBvd2llZG5pIGtvbG9yXG5cdFx0XHRcdFx0XHRcdGlmKHZhbHVlIDwgbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdWzBdWzBdKXtcblx0XHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2lfbGF5ZXJzXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVswXVszXTtcblx0XHRcdFx0XHRcdFx0fVx0XG5cblx0XHRcdFx0XHRcdFx0aWYodmFsdWUgPiBsYXllcnMubGVnZW5kc1tpX2xheWVyc11baV9sZWdlbmRzX21heC0xXVsxXSl7XG5cdFx0XHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tpX2xheWVyc11baV9jYXRlZ29yeV0gPSBsYXllcnMubGVnZW5kc1tpX2xheWVyc11baV9sZWdlbmRzX21heC0xXVszXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgZGFueSBrcmFqIHcgZXhjZWx1IG1hIHdhcnRvxZvEhyBudWxsIGRvbXnFm2xuaWUgb3RyenltdWplIGtvbG9yIGJpYcWCeVxuXHRcdFx0XHRcdFx0XHRpZih2YWx1ZSA9PSBudWxsKXtcblx0XHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2lfbGF5ZXJzXVtpX2NhdGVnb3J5XSA9ICcjZmZmJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly93IHByenlwYWRrdSBnZHkgZGFueSBrcmFqIG5pZSB3eXN0xJlwdWplIHcgcGxpa3UgZXhjZWwgb3RyenltdWplIGtvbG9yIGJpYcWCeVxuXHRcdFx0XHRcdGlmKCFmaW5kKXtcblx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gJyNmZmYnO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL3BvIHpha3R1YWxpem93YW5pdSBrb2xvcsOzdyB3IGthdGVnb3JpYWNoIHJ5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdFx0Y2FudmFzLmRyYXcoKTtcblxuXHR9LFxuXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKGlkKXtcblx0XHR2YXIgdGggPSB0aGlzO1xuXG5cdFx0JC5lYWNoKHRoaXMuY2F0ZWdvcnksZnVuY3Rpb24oaW5kZXgsdmFsdWUpe1xuXHRcdFx0aWYoaW5kZXggPj0gaWQpe1xuXHRcdFx0XHR0aC5jYXRlZ29yeVtpbmRleF0gPSB0aC5jYXRlZ29yeVtpbmRleCsxXTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGZvcih2YXIgcm93ID0gMDsgcm93IDwgcG9pbnRlcnMucG9pbnRlcnMubGVuZ3RoOyByb3crKyl7XG5cdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IHBvaW50ZXJzLnBvaW50ZXJzW3Jvd10ubGVuZ3RoOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IGlkKXtcblx0XHRcdFx0XHRwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID4gaWQpe1xuXHRcdFx0XHRcdHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IHBhcnNlSW50KHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkgLSAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmNhdGVnb3J5LnBvcCgpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cblx0XHQvL3J5c3VqZW15IG5hIG5vd8SFIGNhbnZhc1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0c2hvd19saXN0IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBhZGRfY2F0ZWdvcnkgPSBcIjx0YWJsZT5cIjtcblx0XHQvL3ZhciBhZGRfc2VsZWN0ID0nPG9wdGlvbiBuYW1lPVwiMFwiPnB1c3R5PC9vcHRpb24+Jztcblx0XHR2YXIgYWRkX3NlbGVjdCA9ICcnO1xuXG5cdFx0Zm9yKHZhciBpID0gdGhpcy5jYXRlZ29yeS5sZW5ndGg7IGkgPiAxOyBpLS0pe1xuXHRcdFx0YWRkX2NhdGVnb3J5ICs9ICc8dHI+PHRkPjxzcGFuPicrKGktMSkrJzwvc3Bhbj48L3RkPjx0ZD48aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiY2F0ZWdvcnlfbmFtZVwiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCIgdmFsdWU9XCInK3RoaXMuY2F0ZWdvcnlbKGktMSldWzBdKydcIiAvPjwvdGQ+PHRkPjxkaXYgY2xhc3M9XCJjb2xvcnBpY2tlcl9ib3hcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6Jyt0aGlzLmNhdGVnb3J5WyhpLTEpXVsxXSsnXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIj48L2Rpdj48L3RkPjx0ZD48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIj51c3VuPC9idXR0b24+PC90ZD48L3RyPic7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIG5hbWU9XCInKyhpLTEpKydcIj4nK3RoaXMuY2F0ZWdvcnlbKGktMSldWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblxuXHRcdGlmKG1lbnVfdG9wLmNhdGVnb3J5ID09IDApe1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBzZWxlY3RlZCBuYW1lPVwiMFwiPicrdGhpcy5jYXRlZ29yeVswXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gbmFtZT1cIjBcIj4nK3RoaXMuY2F0ZWdvcnlbMF1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXG5cdFx0YWRkX2NhdGVnb3J5ICs9IFwiPC90YWJsZT5cIjtcblxuXHRcdCQoJyNjYXRlZ29yeV9ib3ggI2xpc3QnKS5odG1sKGFkZF9jYXRlZ29yeSk7XG5cdFx0JCgnc2VsZWN0I2NoYW5nZV9jYXRlZ29yeScpLmh0bWwoYWRkX3NlbGVjdCk7XG5cblx0XHRjb2xvcnBpY2tlci5hZGQoKTtcblx0fVxufVxuIiwiY2xvdWQgPSB7XG5cblx0c2V0X3RleHRhcmVhIDogZnVuY3Rpb24oKXtcblx0XHQkKCcjY2xvdWQgLmNsb3VkX3RleHQnKS52YWwoIGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSApO1xuXHR9LFxuXG5cdC8qZ2V0X3RleHRhcmVhIDogZnVuY3Rpb24odGV4dF90bXApe1xuXG5cdFx0Ly92YXIgdGV4dF90bXAgPSAkKG9iaikudmFsKCk7XG5cblx0XHRsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gPSB0ZXh0X3RtcDtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0bGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdID0gbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdLnJlcGxhY2UoJ3snK2V4Y2VsLmRhdGFbMF1baV0rJ30nLCdcIitleGNlbC5kYXRhW3RtcF9yb3ddWycraSsnXVwiKycpO1xuXHRcdH1cblxuXHRcdGxheWVycy5jbG91ZF9wYXJzZXJbbGF5ZXJzLmFjdGl2ZV0gPSAnXCInK3RleHRfdG1wKydcIic7XG5cdH0sKi9cblxuXHQvL3VzdGF3aWFteSBwb3ByYXduxIUgcG96eWNqxJkgZHlta2Fcblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgbGVmdCA9IG1vdXNlLmxlZnQgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X2xlZnQ7XG5cdFx0dmFyIHRvcCA9IG1vdXNlLnRvcCAtIG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfdG9wO1xuXG5cdFx0JChcIiNjYW52YXNfY2xvdWRcIikuY3NzKHt0b3A6cGFyc2VJbnQodG9wIC0gJChcIiNjYW52YXNfY2xvdWRcIikuaGVpZ2h0KCktMzApKydweCcsbGVmdDpsZWZ0KydweCd9KTtcblx0fSxcblxuXHQvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgd3nFm3dpZXRsZW5pZSBkeW1rYSB6IG9kcG93aWVkbmnEhSB6YXdhcnRvxZtjacSFXG5cdHVwZGF0ZV90ZXh0IDogZnVuY3Rpb24oKXtcblx0XHRcblx0XHRpZigob25fY2F0ZWdvcnkubmFtZSAhPSBcIlwiKSAmJiAob25fY2F0ZWdvcnkubmFtZSAhPSAnbnVsbCcpKXtcblxuXHRcdFx0dmFyIHRtcF9yb3cgPSBudWxsO1xuXHRcdFx0dmFyIGZpbmQgPSAwO1xuXHRcdFx0Zm9yKHZhciBpX3JvdyA9IDAsIGlfcm93X21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpX3JvdyA8IGlfcm93X21heDsgaV9yb3crKyApe1xuXHRcdFx0XHRpZihTdHJpbmcob25fY2F0ZWdvcnkubmFtZSkudG9Mb3dlckNhc2UoKSA9PSBTdHJpbmcoZXhjZWwuZGF0YVtpX3Jvd11bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSkudG9Mb3dlckNhc2UoKSl7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dGhpcy5zZXRfcG9zaXRpb24oKTtcblx0XHRcdFx0XHR2YXIgdGV4dF90bXAgPSBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV07XG5cblx0XHRcdFx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdFx0XHR0ZXh0X3RtcCA9IHRleHRfdG1wLnJlcGxhY2UoJ3snK2V4Y2VsLmRhdGFbMF1baV0rJ30nLGV4Y2VsLmRhdGFbaV9yb3ddW2ldKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL2RvcGllcm8gamXFm2xpIGR5bWVrIG1hIG1pZcSHIGpha2HFmyBrb25rcmV0bsSFIHphd2FydG/Fm8SHIHd5xZt3aWV0bGFteSBnb1xuXHRcdFx0XHRcdGlmKHRleHRfdG1wIT1cIlwiKXtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVJbigwKTtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmh0bWwodGV4dF90bXApO1xuXHRcdFx0XHRcdFx0ZmluZCA9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vamXFm2xpIG5pZSB6bmFsZXppb25vIG9kcG93aWVkbmllaiBrYXRlZ29yaWlcblx0XHRcdGlmICghZmluZCkgeyBcblx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgwKTtcblx0XHRcdH1cblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgwKTtcblx0XHR9XG5cdH1cblxufVxuXG4vKlxuJCgnI2Nsb3VkIC5jbG91ZF90ZXh0Jykua2V5dXAoZnVuY3Rpb24oKXtcblxuXHRjbG91ZC5nZXRfdGV4dGFyZWEodGhpcyk7XG5cbn0pIDsqLyIsIi8vc2FtYSBuYXp3YSB3aWVsZSB0xYJ1bWFjenkgcG8gcHJvc3R1IGNvbG9ycGlja2VyXG52YXIgY29sb3JwaWNrZXIgPSB7XG5cblx0cm93IDogbnVsbCxcblx0Y29sX251bSA6IG51bGwsXG5cblx0YWRkIDogZnVuY3Rpb24oKXtcblx0XHQkKCcuY29sb3JwaWNrZXJfYm94JykuQ29sb3JQaWNrZXIoe1xuXG5cdFx0XHRjb2xvcjogJyNmZjAwMDAnLFxuXHRcdFx0XG5cdFx0XHRvblNob3c6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0aWYoJChjb2xwa3IpLmNzcygnZGlzcGxheScpPT0nbm9uZScpe1xuXHRcdFx0XHRcdCQoY29scGtyKS5mYWRlSW4oMjAwKTtcblx0XHRcdFx0XHRjb2xvcnBpY2tlci5yb3cgPSAkKHRoaXMpLmF0dHIoJ3JvdycpO1xuXHRcdFx0XHRcdGNvbG9ycGlja2VyLmNvbF9udW0gPSAkKHRoaXMpLmF0dHIoJ2NvbF9udW0nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0XG5cdFx0XHRvbkhpZGU6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0JChjb2xwa3IpLmZhZGVPdXQoMjAwKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdFxuXHRcdFx0b25DaGFuZ2U6IGZ1bmN0aW9uIChoc2IsIGhleCwgcmdiKSB7XG5cdFx0XHRcdCQoJyNsZWdlbmRzIHRyIHRkW3Jvdz1cIicrY29sb3JwaWNrZXIucm93KydcIl0nKS5jc3MoJ2JhY2tncm91bmRDb2xvcicsICcjJyArIGhleCk7XG5cdFx0XHRcdFxuIFx0XHRcdFx0XHRwYWxldHMuY29sb3JfYXJyWyBwYWxldHMuY29sb3JfYXJyLmxlbmd0aC0xIF0gPSBwYWxldHMuY29sb3JfYXJyWyBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSBdLnNsaWNlKClcblx0XHRcdFx0XHRwYWxldHMuY29sb3JfYXJyWyBwYWxldHMuY29sb3JfYXJyLmxlbmd0aC0xIF1bY29sb3JwaWNrZXIuY29sX251bV0gPSAnIycgKyBoZXg7XG5cdFx0XHRcdFx0Ly9sYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSBwYWxldHMuY29sb3JfYXJyLmxlbmd0aCAtMTtcblx0XHRcdFx0XHRsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXVtjb2xvcnBpY2tlci5yb3ddID0gICcjJyArIGhleDtcblx0XHRcdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtjb2xvcnBpY2tlci5yb3ddWzNdID0gICcjJyArIGhleDtcblxuXHRcdFx0XHRcdHBhbGV0cy5zaG93KCk7XG4gICAgICBcdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRjb2xvcl9ib3JkZXIgOiBmdW5jdGlvbigpe1xuXHRcdCQoJy5jb2xvcl9ib3JkZXInKS5Db2xvclBpY2tlcih7XG5cblx0XHRvbkJlZm9yZVNob3c6IGZ1bmN0aW9uICgpIHtcblx0XHRcdCQodGhpcykuQ29sb3JQaWNrZXJTZXRDb2xvcihwb2ludGVycy5jb2xvcl9ib3JkZXIpO1xuXHRcdH0sXG5cdFx0XHRcdFxuXHRcdFx0b25TaG93OiBmdW5jdGlvbiAoY29scGtyKSB7XG5cdFx0XHRcdGlmKCQoY29scGtyKS5jc3MoJ2Rpc3BsYXknKT09J25vbmUnKXtcblx0XHRcdFx0XHQkKGNvbHBrcikuZmFkZUluKDIwMCk7XG5cdFx0XHRcdFx0Ly9jb2xvcnBpY2tlci5yb3cgPSAkKHRoaXMpLmF0dHIoJ3JvdycpO1xuXHRcdFx0XHRcdC8vY29sb3JwaWNrZXIuY29sX251bSA9ICQodGhpcykuYXR0cignY29sX251bScpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRcblx0XHRcdG9uSGlkZTogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHQkKGNvbHBrcikuZmFkZU91dCgyMDApO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0XG5cdFx0XHRvbkNoYW5nZTogZnVuY3Rpb24gKGhzYiwgaGV4LCByZ2IpIHtcblx0XHRcdFx0XG5cdFx0XHRcdHBvaW50ZXJzLmNvbG9yX2JvcmRlciA9ICAnIycgKyBoZXg7XG5cblx0XHRcdFx0JCgnLmNvbG9yX2JvcmRlcicpLmNzcygnYmFja2dyb3VuZENvbG9yJywgJyMnICsgaGV4KTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKHBvaW50ZXJzLnNob3dfYm9yZGVyKXtcblx0XHRcdFx0XHRwb2ludGVycy5kcmF3X2JvcmRlcihmYWxzZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG4iLCIvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgdHdvcnplbmllIHphcGlzeXdhbmllIGkgYWt0dWFsaXphY2plIGRhbnljaCBkb3R5Y3rEhcSHY3loIG1hcHlcbnZhciBjcnVkID0ge1xuXG5cdG1hcF9qc29uIDogQXJyYXkoKSwgLy9nxYLDs3duYSB6bWllbm5hIHByemVjaG93dWrEhWNhIHdzenlzdGtpZSBkYW5lXG5cdG1hcF9oYXNoIDpudWxsLFxuXHRsYXllcnMgOiB7fSxcblx0ZXhjZWwgOiBBcnJheSgpLFxuXHRwcm9qZWN0IDoge30sXG5cdHByb2plY3RfaGFzaCA6IG51bGwsIC8vZ8WCw7N3bnkgaGFzaCBkb3R5Y3rEhWN5IG5hc3plZ28gcHJvamVrdHVcblxuXHQvL3BvYmllcmFteSBkYW5lIHogcG9yb2pla3R1IGkgemFwaXN1amVteSBqZSBkbyBqc29uLWFcblx0cGFyc2VfZGF0YSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIGRvdHljesSFY2UgbWFweSAoY2FudmFzYSlcblxuXHRcdC8vemVydWplbXkgbmEgbm93byBjYcWCxIUgdGFibGljxJkgcG9pbnRlcsOzd1xuXHRcdHRoaXMubWFwX2pzb24gPSBBcnJheSgpO1xuXG5cdFx0Ly9kYXRhW3hdID0gem1pZW5uZSBwb2RzdGF3b3dlIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMubWFwX2pzb25bMF0gPSBBcnJheSgpO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMF0gPSBjYW52YXMuaGVpZ2h0X2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzFdID0gY2FudmFzLndpZHRoX2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzJdID0gcG9pbnRlcnMucGFkZGluZ194O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bM10gPSBwb2ludGVycy5wYWRkaW5nX3k7XG5cdFx0dGhpcy5tYXBfanNvblswXVs0XSA9IHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG87XG5cdFx0dGhpcy5tYXBfanNvblswXVs1XSA9IHBvaW50ZXJzLnNpemU7XG5cdFx0dGhpcy5tYXBfanNvblswXVs2XSA9IHBvaW50ZXJzLm1haW5fa2luZDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzddID0gY2FudmFzLnRpdGxlX3Byb2plY3Q7XG5cdFx0dGhpcy5tYXBfanNvblswXVs4XSA9IHBvaW50ZXJzLmNvbG9yX2JvcmRlcjtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzldID0gcG9pbnRlcnMuc2hvd19ib3JkZXI7XG5cblx0XHQvLyBkYXRhWzFdID0gdGFibGljYSBwdW5rdMOzdyAocG9pbnRlcnMucG9pbnRlcnMpIFt3aWVyc3pdW2tvbHVtbmFdID0gXCJub25lXCIgfHwgKG51bWVyIGthdGVnb3JpaSlcblx0XHR0aGlzLm1hcF9qc29uWzFdID0gcG9pbnRlcnMucG9pbnRlcnM7XG5cblx0XHQvLyBkYXRhWzJdID0gdGFibGljYSBrYXRlZ29yaWlcblx0XHR0aGlzLm1hcF9qc29uWzJdID0gY2F0ZWdvcmllcy5jYXRlZ29yeTtcblxuXHRcdC8vZGF0YVszXSA9IHRhYmxpY2Egd3pvcmNhICh6ZGrEmWNpYSB3IHRsZSBkbyBvZHJ5c293YW5pYSlcblx0XHR0aGlzLm1hcF9qc29uWzNdID0gQXJyYXkoKTtcblxuXHRcdGlmKGltYWdlLm9iail7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzBdID0gaW1hZ2Uub2JqLnNyYztcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMV0gPSBpbWFnZS54O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVsyXSA9IGltYWdlLnk7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzNdID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzRdID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs1XSA9IGltYWdlLmFscGhhO1xuXHRcdH1cblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0w7N3IChsYXllcnMpXG5cdFx0Ly90d29yenlteSBvYmlla3Qgd2Fyc3R3eSB6YXdpZXJhasSFY3kgd3N6eXN0a2llIGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0dVxuXG5cdFx0dGhpcy5sYXllcnMucGFsZXRzX2FjdGl2ZSA9IGxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdHRoaXMubGF5ZXJzLnZhbHVlID0gbGF5ZXJzLnZhbHVlO1xuXHRcdHRoaXMubGF5ZXJzLmNvbG9yc19wb3MgPSBsYXllcnMuY29sb3JzX3Bvcztcblx0XHR0aGlzLmxheWVycy5jb2xvcnNfYWN0aXZlID0gbGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0dGhpcy5sYXllcnMubWluX3ZhbHVlID0gbGF5ZXJzLm1pbl92YWx1ZTtcblx0XHR0aGlzLmxheWVycy5tYXhfdmFsdWUgPSBsYXllcnMubWF4X3ZhbHVlO1xuXHRcdHRoaXMubGF5ZXJzLmNsb3VkID0gbGF5ZXJzLmNsb3VkO1xuXHRcdHRoaXMubGF5ZXJzLmNsb3VkX3BhcnNlciA9IGxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0dGhpcy5sYXllcnMubGVnZW5kcyA9IGxheWVycy5sZWdlbmRzO1xuXHRcdHRoaXMubGF5ZXJzLmxhYmVscyA9IGxheWVycy5sYWJlbHM7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnkgPSBsYXllcnMuY2F0ZWdvcnk7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnlfY29sb3JzID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHR0aGlzLmxheWVycy5jYXRlZ29yeV9uYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0dGhpcy5sYXllcnMubGlzdCA9IGxheWVycy5saXN0O1xuXG5cdFx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRcdHRoaXMucHJvamVjdC5uYW1lID0gbGF5ZXJzLnByb2plY3RfbmFtZTtcblx0XHR0aGlzLnByb2plY3Quc291cmNlID0gbGF5ZXJzLnNvdXJjZTtcblxuXHRcdC8vdHdvcnp5bXkgb2JpZWt0IGV4Y2VsYVxuXHRcdHRoaXMuZXhjZWwgPSBleGNlbC5kYXRhO1xuXG5cblx0fSxcblxuXHRwdWJsaXNoIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKGNydWQucHJvamVjdF9oYXNoICE9IG51bGwpe1xuXHRcdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy/FgmF0YSBkbGEgbW96aWxsaVxuXHRcdFx0aWYoICgkKCcucHVibGlzaCAuZW1iZWQnKS5jc3MoJ2Rpc3BsYXknKSA9PSAnYmxvY2snKSAmJiAoJChldmVudC50YXJnZXQpLmhhc0NsYXNzKCdwdWJsaXNoJykpICl7XG5cdFx0XHRcdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmZhZGVPdXQoNTAwKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmh0bWwoJzxpZnJhbWUgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiJytjYW52YXMuaGVpZ2h0X2NhbnZhcysncHhcIiBib3JkZXI9XCIwXCIgZnJhbWVib3JkZXI9XCIwXCIgYm9yZGVyPVwiMFwiIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgc3JjPVwiaHR0cDovLycrbG9jYXRpb24uaHJlZi5zcGxpdCggJy8nIClbMl0rJy9lbWJlZC8nK2NydWQucHJvamVjdF9oYXNoKydcIj48L2lmcmFtZT4nKTtcblx0XHRcdFx0JCgnI2lmcmFtZScpLmh0bWwoJzxpZnJhbWUgIG9ubG9hZD1cImNydWQucHVibGlzaF9nZXRTaXplKHRoaXMpXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiJytjYW52YXMuaGVpZ2h0X2NhbnZhcysncHhcIiBib3JkZXI9XCIwXCIgZnJhbWVib3JkZXI9XCIwXCIgYm9yZGVyPVwiMFwiIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgc3JjPVwiaHR0cDovLycrbG9jYXRpb24uaHJlZi5zcGxpdCggJy8nIClbMl0rJy9lbWJlZC8nK2NydWQucHJvamVjdF9oYXNoKydcIj48L2lmcmFtZT4nKTtcblxuXHRcdFx0XHQkKCcucHVibGlzaCAuZW1iZWQnKS5mYWRlSW4oNTAwKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGFsZXJ0KCduYWpwaWVydyB6YXBpc3ogcHJvamVrdCBhIG5hc3TEmXBuaWUgZ28gcHVibGlrdWonKTtcblx0XHR9XG5cdH0sXG5cblx0cHVibGlzaF9nZXRTaXplIDogZnVuY3Rpb24ob2JqKXtcblx0XHRjb25zb2xlLmxvZyhvYmouY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5KTtcblx0XHRjb25zb2xlLmxvZygkKG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkpLmhlaWdodCgpICwkKG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkpLndpZHRoKCkpO1xuICAgIC8vb2JqLnN0eWxlLmhlaWdodCA9IG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0ICsgJ3B4Jztcblx0fSxcblxuXG5cdC8vd2N6eXRhbmllIHptaWVubnljaCBkbyBvYmlla3TDs3cgbWFweVxuXG5cdHNldF9tYXAgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vcG8gemFwaXNhbml1IGRhbnljaCBkbyBiYXp5IGFrdHVhbGl6dWplbXkgaWQgKHcgcHJ6eXBhZGt1IGplxZtsaSBpc3RuaWVqZSBuYWRwaXN1amVteSBqZSlcblx0XHR0aGlzLm1hcF9qc29uID0gZGF0YTtcblxuXHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gZGF0YVswXVswXTtcblx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gZGF0YVswXVsxXTtcblx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSBkYXRhWzBdWzJdO1xuXHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IGRhdGFbMF1bM107XG5cdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IGRhdGFbMF1bNF07XG5cdFx0cG9pbnRlcnMuc2l6ZSA9IGRhdGFbMF1bNV07XG5cdFx0cG9pbnRlcnMubWFpbl9raW5kID0gZGF0YVswXVs2XTtcblx0XHRjYW52YXMudGl0bGVfcHJvamVjdCA9IGRhdGFbMF1bN107XG5cdFx0XG5cdFx0aWYodHlwZW9mIGRhdGFbMF1bOF0gPT0gJ3VuZGVmaW5lZCcpe1xuXHRcdFx0cG9pbnRlcnMuY29sb3JfYm9yZGVyID0gXCIjMDAwXCI7XG5cdFx0fWVsc2V7XG5cdFx0XHRwb2ludGVycy5jb2xvcl9ib3JkZXIgPSBkYXRhWzBdWzhdO1xuXHRcdH1cblxuXHRcdGlmKHR5cGVvZiBkYXRhWzBdWzldID09ICd1bmRlZmluZWQnKXtcblx0XHRcdHBvaW50ZXJzLnNob3dfYm9yZGVyID0gZmFsc2U7XG5cdFx0fWVsc2V7XG5cdFx0XHRwb2ludGVycy5zaG93X2JvcmRlciA9IGRhdGFbMF1bOV07XG5cdFx0fVxuIFxuIFx0XHQkKCcjcG9pbnRlcl9ib3ggLmNvbG9yX2JvcmRlcicpLmNzcygnYmFja2dyb3VuZC1jb2xvcicscG9pbnRlcnMuY29sb3JfYm9yZGVyKTtcblxuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ194XCJdJykudmFsKCBkYXRhWzBdWzJdICk7XG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3lcIl0nKS52YWwoIGRhdGFbMF1bM10gKTtcblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInNpemVcIl0nKS52YWwoIGRhdGFbMF1bNV0gKTtcblx0XHQkKCdpbnB1dFtuYW1lPVwidGl0bGVfcHJvamVjdFwiXScpLnZhbCggZGF0YVswXVs3XSApO1xuXG5cdFx0aWYoIGRhdGFbMF1bNF0gKXtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHR9XG5cblx0XHRpZiggcG9pbnRlcnMuc2hvd19ib3JkZXIgKXtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInNob3dfYm9yZGVyXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInNob3dfYm9yZGVyXCJdJykuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdH1cblxuXHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmh0bWwoJycpO1xuXG5cdFx0cG9pbnRlcnMua2luZHMuZm9yRWFjaChmdW5jdGlvbihraW5kKXtcblxuXHRcdFx0aWYoa2luZCA9PSBkYXRhWzBdWzZdKXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIHNlbGVjdGVkPVwic2VsZWN0ZWRcIiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgbyBwb2ludGVyYWNoXG5cdFx0cG9pbnRlcnMucG9pbnRlcnMgPSBkYXRhWzFdO1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIGthdGVnb3JpYWNoXG5cdFx0Y2F0ZWdvcmllcy5jYXRlZ29yeSA9IGRhdGFbMl07XG5cblxuXHRcdC8vcG8gd2N6eXRhbml1IG1hcHkgYWt0eWFsaXp1amVteSBkYW5lIGRvdHljesSFY8SFIGthdGVnb3JpaSBpIGtvbG9yw7N3XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1swXSA9IFtdO1xuXHRcdGxheWVycy5jYXRlZ29yeV9uYW1lID0gW107XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGNhdGVnb3JpZXMuY2F0ZWdvcnkubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZS5wdXNoKGNhdGVnb3JpZXMuY2F0ZWdvcnlbaV1bMF0pO1xuXHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1swXS5wdXNoKGNhdGVnb3JpZXMuY2F0ZWdvcnlbaV1bMV0pO1xuXHRcdH1cblxuXHRcdC8vcG9iaWVyYW5pZSBkYW55Y2ggbyB6ZGrEmWNpdSBqZcW8ZWxpIGlzdG5pZWplXG5cdFx0aWYoIGRhdGFbM10ubGVuZ3RoID4gMil7XG5cdFx0XHRpbWFnZS5vYmogPSBuZXcgSW1hZ2UoKTtcblx0XHRcdGltYWdlLm9iai5zcmMgPSBkYXRhWzNdWzBdO1xuXHRcdFx0aW1hZ2UueCA9IHBhcnNlSW50KCBkYXRhWzNdWzFdICk7XG5cdFx0XHRpbWFnZS55ID0gcGFyc2VJbnQoIGRhdGFbM11bMl0gKTtcblx0XHRcdGltYWdlLndpZHRoID0gcGFyc2VJbnQoIGRhdGFbM11bM10gKTtcblx0XHRcdGltYWdlLmhlaWdodCA9IHBhcnNlSW50KCBkYXRhWzNdWzRdICk7XG5cdFx0XHRpbWFnZS5hbHBoYSA9IHBhcnNlSW50KCBkYXRhWzNdWzVdICk7XG5cblx0XHRcdC8vemF6bmFjemVuaWUgb2Rwb3dpZWRuaWVnbyBzZWxlY3RhIGFscGhhIHcgbWVudSB0b3Bcblx0XHRcdCQoJyNhbHBoYV9pbWFnZSBvcHRpb25bbmFtZT1cIicrXHRpbWFnZS5hbHBoYSArJ1wiXScpLmF0dHIoJ3NlbGVjdGVkJyx0cnVlKTtcblxuXHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyBjYW52YXMuZHJhdygpOyB9O1xuXHRcdH1cblxuXHRcdC8vemFrdHVhbGl6b3dhbmllIGRhbnljaCB3IGlucHV0YWNoXG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLCBjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsIGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6Y2FudmFzLndpZHRoX2NhbnZhcysncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzKydweCd9KTtcblxuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0Y2F0ZWdvcmllcy5zaG93X2xpc3QoKTtcblxuXHR9LFxuXG5cdHNldF9wcm9qZWN0IDogZnVuY3Rpb24oZGF0YSl7XG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIG1hcHlcblx0XHR0aGlzLnNldF9tYXAoIEpTT04ucGFyc2UoZGF0YS5tYXBfanNvbikgKTtcblx0XHRcblx0XHRleGNlbC5kYXRhID0gSlNPTi5wYXJzZShkYXRhLmV4Y2VsKTtcblxuXHRcdGRhdGEucHJvamVjdCA9IEpTT04ucGFyc2UoZGF0YS5wcm9qZWN0KTsgIFxuXHRcdGRhdGEubGF5ZXJzID0gSlNPTi5wYXJzZShkYXRhLmxheWVycyk7IFxuXG5cdFx0Ly93Y3p5dHVqZW15IGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0dVxuXHRcdGxheWVycy5wYWxldHNfYWN0aXZlID0gZGF0YS5sYXllcnMucGFsZXRzX2FjdGl2ZTtcblx0XHRsYXllcnMudmFsdWUgPSBkYXRhLmxheWVycy52YWx1ZTtcblx0XHRsYXllcnMuY29sb3JzX3BvcyA9IGRhdGEubGF5ZXJzLmNvbG9yc19wb3M7XG5cdFx0bGF5ZXJzLmNvbG9yc19hY3RpdmUgPSBkYXRhLmxheWVycy5jb2xvcnNfYWN0aXZlO1xuXHRcdGxheWVycy5taW5fdmFsdWUgPSBkYXRhLmxheWVycy5taW5fdmFsdWU7XG5cdFx0bGF5ZXJzLm1heF92YWx1ZSA9IGRhdGEubGF5ZXJzLm1heF92YWx1ZTtcblx0XHRsYXllcnMuY2xvdWQgPSBkYXRhLmxheWVycy5jbG91ZDtcblx0XHRsYXllcnMuY2xvdWRfcGFyc2VyID0gZGF0YS5sYXllcnMuY2xvdWRfcGFyc2VyO1xuXHRcdGxheWVycy5sZWdlbmRzID0gZGF0YS5sYXllcnMubGVnZW5kcztcblx0XHRsYXllcnMubGFiZWxzID0gZGF0YS5sYXllcnMubGFiZWxzO1xuXHQgXHRsYXllcnMuY2F0ZWdvcnkgPSBcdGRhdGEubGF5ZXJzLmNhdGVnb3J5O1xuXHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnMgPSBkYXRhLmxheWVycy5jYXRlZ29yeV9jb2xvcnM7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X25hbWUgPSBkYXRhLmxheWVycy5jYXRlZ29yeV9uYW1lO1xuXHRcdGxheWVycy5saXN0ID0gZGF0YS5sYXllcnMubGlzdDtcblxuXG5cblx0XHQvL3ptaWVubmUgZ2xvYmFsbmUgZG90eWN6xIVjZSBjYcWCZWdvIHByb2pla3R1XG5cdFx0bGF5ZXJzLnByb2plY3RfbmFtZSA9IGRhdGEucHJvamVjdC5uYW1lO1xuXHRcdGxheWVycy5zb3VyY2UgPSBkYXRhLnByb2plY3Quc291cmNlO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cInByb2plY3RfbmFtZVwiXScpLnZhbChsYXllcnMucHJvamVjdF9uYW1lKTtcblxuXHRcdHRpbnlNQ0UuZWRpdG9yc1swXS5zZXRDb250ZW50KCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0XHR0aW55TUNFLmVkaXRvcnNbMV0uc2V0Q29udGVudCggbGF5ZXJzLnNvdXJjZSApO1xuXG5cdFx0ZXhjZWwuc2hvdygpO1xuXHRcdHBhbGV0cy5zaG93KCk7XG5cdFx0bGVnZW5kcy5zaG93KCk7XG5cdFx0bGF5ZXJzLnNob3coKTtcblx0XHRsYWJlbHMuc2hvdygpO1xuXG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBtYXB5IHogYmF6eSBkYW55Y2ggaSBwcnpla2F6dWplbXkgZG8gd2N6eXRhbmlhIGRvIG9iaWVrdMOzdyBtYXB5XG5cdGdldF9tYXAgOiBmdW5jdGlvbigpe1xuXHRcdHZhciB0aCA9IHRoaXM7XG5cdFx0JC5hamF4KHtcblx0XHRcdCAgdXJsOiAnL2FwaS9tYXAvJyArIHRoLm1hcF9oYXNoLFxuXHRcdCAgXHR0eXBlOiBcIkdFVFwiLFxuXHRcdCAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHRcdH0pLmRvbmUoZnVuY3Rpb24oIGRhdGEgKSB7IHRoLnNldF9tYXAoIEpTT04ucGFyc2UoZGF0YS5kYXRhWzBdLm1hcF9qc29uKSApOyB9KTtcblx0fSxcblxuXHQvL3BvYmllcmFuaWUgcHJvamVrdHUgeiBiYXp5IGRhbnljaCBpIHdjenl0YW5pZVxuXHRnZXRfcHJvamVjdCA6IGZ1bmN0aW9uKCl7XG5cdFx0XG5cdFx0dmFyIHRoID0gdGhpcztcblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdCAgdXJsOiAnL2FwaS9wcm9qZWN0LycgKyB0aC5wcm9qZWN0X2hhc2gsXG5cdFx0XHQgIFx0dHlwZTogXCJHRVRcIixcblx0XHRcdCAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHRcdFx0fSkuZG9uZShmdW5jdGlvbiggZGF0YSApIHsgXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhLmRhdGEpO1xuXHRcdFx0XHRcdGlmKGRhdGEuc3RhdHVzID09ICdvaycpe1xuXHRcdFx0XHRcdFx0dGguc2V0X3Byb2plY3QoIGRhdGEuZGF0YSApOyBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KCduaWUgdWRhxYJvIHNpxJkgd2N6eXRhxIcgcHJvamVrdHUnKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblx0XHR9LFxuXG5cdC8vdHdvcnp5bXkgbm93eSBwcm9qZWt0XG5cdGNyZWF0ZV9wcm9qZWN0IDogZnVuY3Rpb24oKXtcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5wYXJzZV9kYXRhKCk7XG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2pzb24gOiBKU09OLnN0cmluZ2lmeSh0aC5tYXBfanNvbiksXG5cdFx0XHRtYXBfaGFzaCA6IHRoLm1hcF9oYXNoLFxuXHRcdFx0bGF5ZXJzIDogSlNPTi5zdHJpbmdpZnkodGgubGF5ZXJzKSxcblx0XHRcdGV4Y2VsIDogSlNPTi5zdHJpbmdpZnkodGguZXhjZWwpLFxuXHRcdFx0cHJvamVjdCA6IEpTT04uc3RyaW5naWZ5KHRoLnByb2plY3QpXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9wcm9qZWN0c1wiLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09ICdvaycpe1xuXHRcdFx0XHRcdGFsZXJ0KCd6YXBpc2FubyBub3d5IHByb2pla3QnKTtcblx0XHRcdFx0XHR0aC5wcm9qZWN0X2hhc2ggPSByZXNwb25zZS5wcm9qZWN0X2hhc2g7XG5cdFx0XHRcdFx0bWVudV90b3AuZ2V0X3Byb2plY3RzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRhbGVydCgnYsWCxIVkIHBvZGN6YXMgemFwaXN1Jyk7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vYWt0dWFsaXp1amVteSBqdcW8IGlzdG5pZWrEhWN5IHByb2pla3Rcblx0dXBkYXRlX3Byb2plY3QgOiBmdW5jdGlvbigpeyBcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5wYXJzZV9kYXRhKCk7XG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2pzb24gOiBKU09OLnN0cmluZ2lmeSh0aC5tYXBfanNvbiksXG5cdFx0XHRtYXBfaGFzaCA6IHRoLm1hcF9oYXNoLFxuXHRcdFx0cHJvamVjdF9oYXNoIDogdGgucHJvamVjdF9oYXNoLFxuXHRcdFx0bGF5ZXJzIDogSlNPTi5zdHJpbmdpZnkodGgubGF5ZXJzKSxcblx0XHRcdGV4Y2VsIDogSlNPTi5zdHJpbmdpZnkodGguZXhjZWwpLFxuXHRcdFx0cHJvamVjdCA6IEpTT04uc3RyaW5naWZ5KHRoLnByb2plY3QpXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9wcm9qZWN0c1wiLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdHR5cGU6ICdQVVQnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gJ29rJyl7XG5cdFx0XHRcdFx0bWVudV90b3AuZ2V0X3Byb2plY3RzKCk7XG5cdFx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIHByb2pla3QnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyBha3R1YWxpemFjamknKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vdXN1d2FteSBtYXDEmSB6IGJhenkgZGFueWNoXG5cdGRlbGV0ZV9wcm9qZWN0IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL3NwcmF3ZHphbXkgY3p5IG1hcGEgZG8gdXN1bmnEmWNpYSBwb3NpYWRhIHN3b2plIGlkXG5cdFx0aWYodGhpcy5wcm9qZWN0X2hhc2ggIT0gbnVsbCl7XHRcdFx0XG5cblx0XHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdFx0dXJsOiBcImFwaS9wcm9qZWN0L1wiK3RoLnByb2plY3RfaGFzaCxcblx0XHRcdFx0dHlwZTogJ0RFTEVURScsXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gJ29rJyl7XG5cdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyB1c3V3YW5pYScpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhbGVydCgnYnJhayBpZGVudHlmaWthdG9yYSBwcm9qZWt0dScpO1xuXHRcdH1cblx0fVxufVxuIiwidmFyIGV4Y2VsID0ge1xuXHRcblx0YWxwaGEgOiBbJ2EnLCdiJywnYycsJ2QnLCdlJywnZicsJ2cnLCdoJywnaScsJ2onLCdrJywnbCcsJ20nLCduJywnbycsJ3AnLCdxJywncicsJ3MnLCd0JywndScsJ3cnLCd4JywneScsJ3onXSxcblx0ZGF0YSA6IFtbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXV0sXG5cdG1pbl9yb3cgOiAxMixcblx0bWluX2NvbCA6IDYsXG5cblx0aW5pdCA6IGZ1bmN0aW9uKCl7XG5cdFx0Ly9kb2RhbmllIGV2ZW50w7N3IHByenkga2xpa25pxJljaXUgZXhjZWxhXG5cdFx0JCgnI2V4Y2VsX2JveCBidXR0b24nKS5jbGljayhmdW5jdGlvbigpeyAkKCcjZXhjZWxfYm94IGlucHV0JykuY2xpY2soKTsgfSk7XG5cdFx0JCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNoYW5nZShmdW5jdGlvbigpeyBleGNlbC5zZW5kX2ZpbGUoKTsgfSk7XG5cblx0XHQvL2Z1bmtjamEgdHltY3phc293YSBkbyBuYXJ5c293YW5pYSB0YWJlbGtpIGV4Y2VsYVxuXHRcdHRoaXMuc2hvdygpO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBvZHBvd2llZHppYWxhIHphIHBvcHJhd25lIHBvZHBpc2FuaWUgb3NpXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0YWRkX2h0bWwgPSAnJztcblxuXHRcdC8vamXFm2xpIGlsb8WbYyB3aWVyc3p5IGplc3Qgd2nEmWtzemEgYWt0dWFsaXp1amVteSB3aWVsa2/Fm8SHIHRhYmxpY3lcblx0XHRpZihleGNlbC5kYXRhLmxlbmd0aCA+IGV4Y2VsLm1pbl9yb3cpIGV4Y2VsLm1pbl9yb3cgPSBleGNlbC5kYXRhLmxlbmd0aDtcblx0XHRpZihleGNlbC5kYXRhWzBdLmxlbmd0aCA+IGV4Y2VsLm1pbl9jb2wpIGV4Y2VsLm1pbl9jb2wgPSBleGNlbC5kYXRhWzBdLmxlbmd0aDtcblxuXHRcdC8vcmVuZGVydWplbXkgY2HFgsSFIHRhYmxpY8SZIGV4Y2VsXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdGhpcy5taW5fcm93OyBpKyspe1xuXHRcdFx0YWRkX2h0bWwgKz0gJzx0ciBjbGFzcz1cInRyXCI+Jztcblx0XHRcdGZvcih2YXIgaiA9IDA7aiA8IHRoaXMubWluX2NvbDsgaisrKXtcblxuXHRcdFx0XHRpZigoaiA9PSAwKSAmJiAoaSA+IDApKXtcblx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIiA+JysgaSArJzwvdGQ+Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdGlmKHR5cGVvZihleGNlbC5kYXRhW2ldWyhqLTEpXSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8dGQgY2xhc3M9XCJ0ZFwiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj4nK2V4Y2VsLmRhdGFbaV1bKGotMSldKyc8L3RkPic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiAgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCI+PC90ZD4nO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2ldWyhqKzEpXSk7XG5cdFx0XHRcdFx0fWNhdGNoKGVycm9yKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yLGksaik7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj48L3RkPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcdGFkZF9odG1sICs9ICc8L3RyPic7XG5cdFx0fVxuXG5cdFx0JCgnI2V4Y2VsX2JveCAudGFibGUnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0Ly9kb2RhamVteSBtb8W8bGl3b8WbxIcgZWR5Y2ppIGV4Y2VsYVxuXHRcdCQoJyNleGNlbF9ib3ggLnRhYmxlIC50ZCcpLmtleXVwKGZ1bmN0aW9uKCl7IGV4Y2VsLmVkaXQodGhpcyk7IH0pO1xuXG5cdFx0JCgnI2V4Y2VsX2JveCAudGFibGUgLnRkJykuYmx1cihmdW5jdGlvbigpeyBwYWxldHMuc2hvd19zZWxlY3QoKTsgfSk7XG5cblx0fSxcblxuXHQvL2Z1bmtjamEgdW1vxbxsaXdpYWrEhWNhIGVkeWNqZSB6YXdhcnRvxZtjaSBrb23Ds3JraVxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKXtcdFxuXHRcdFxuXHRcdHZhciB2YWwgPSAkKG9iaikuaHRtbCgpXG5cdFx0aWYoJC5pc051bWVyaWModmFsKSkgeyB2YWwgPSBwYXJzZUZsb2F0KHZhbCk7IH1cblx0XHRcblx0XHRleGNlbC5kYXRhWyQob2JqKS5hdHRyKCdyb3cnKV1bKCQob2JqKS5hdHRyKCdjb2wnKS0xKV0gPSB2YWw7XG5cdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0fSxcblxuXHQvL3BvYmllcmFteSBwbGlrLCB6IGlucHV0YSBpIHd5xYJhbXkgZG8gYmFja2VuZHUgdyBjZWx1IHNwYXJzb3dhbmlhIGEgbmFzdMSZcG5pZSBwcnp5cGlzdWplbXkgZG8gdGFibGljeSBpIHd5xZt3aWV0bGFteXcgZm9ybWllIHRhYmVsc2tpXG5cdHNlbmRfZmlsZSA6IGZ1bmN0aW9uKCkge1xuXHRcblx0XHR2YXIgZXhjZWxfZm9ybSA9IG5ldyBGb3JtRGF0YSgpOyBcblx0XHRleGNlbF9mb3JtLmFwcGVuZChcImV4Y2VsX2ZpbGVcIiwgJChcIiNleGNlbF9ib3ggaW5wdXRcIilbMF0uZmlsZXNbMF0pO1xuXG4gXHRcdCQuYWpheCgge1xuICAgICAgXG4gICAgICB1cmw6ICcvYXBpL3Byb2plY3RzL2V4Y2VsX3BhcnNlJyxcbiAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgIGRhdGE6IGV4Y2VsX2Zvcm0sXG4gICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICBjb250ZW50VHlwZTogZmFsc2VcblxuICAgIH0pLmRvbmUoZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuICAgIFx0Ly8kKFwiI2V4Y2VsX2JveCBpbnB1dFwiKVswXS5maWxlc1swXS5yZXNldCgpO1xuXG5cdFx0XHQkKFwiI2V4Y2VsX2JveCBpbnB1dFwiKS5yZW1vdmUoKTtcblx0XHRcdCQoXCIjZXhjZWxfYm94XCIpLmFwcGVuZCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgLz4nKVxuXHRcdFx0JCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNoYW5nZShmdW5jdGlvbigpeyBleGNlbC5zZW5kX2ZpbGUoKTsgfSk7XG5cbiAgICBcdC8vcG8gd2N6eXRhbml1IHBsaWt1IGV4Y2VsIHByenlwaXN1amVteSBkYW5lIHJ5c3VqZW15IG5hIG5vd28gdGFiZWzEmSBvcmF6IHd5xZt3aWV0bGFteSB3c3p5c3RraWUgcGFsZXR5IGtvbG9yw7N3XG5cdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKVxuICAgIFx0ZXhjZWwuZGF0YSA9IHJlc3BvbnNlLmV4Y2VsWzBdLmRhdGE7XG4gICAgXHRleGNlbC50cmFuc2l0aW9uKCk7XG4gICAgXHRleGNlbC5zaG93KCk7XG4gICAgXHRwYWxldHMuc2hvd19zZWxlY3QoKTtcbiAgICB9KTtcblx0fSxcblxuXHQvL2Z1bmNramEgemFtaWVuaWFqxIVjYSBrcnRvcGtpIG5hIHByemVjaW5raSBwcnp5IGtvbcOzcmthY2ggbGljemJvd3ljaFxuXHR0cmFuc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRmb3IodmFyIGogPSAwLCBqX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBqIDwgal9tYXg7IGorKyl7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL3VzdXdhbXkgc3BhY2plIHd5c3TEmXB1asSFY2UgemEgbHViIHByemVkIHRla3N0ZW1cblx0XHRcdFx0ZXhjZWwuZGF0YVtpXVtqXSA9ICQudHJpbShleGNlbC5kYXRhW2ldW2pdKVxuXG5cdFx0XHRcdC8vamXFm2xpIG1hbXkgcHVzdMSFIHdhcnRvxZvEhyBudWxsIHphbWllbmlhbXkgasSFIG5hIHphbWtuacSZdHkgc3RyaW5nXG5cdFx0XHRcdGlmKGV4Y2VsLmRhdGFbaV1bal0gPT0gbnVsbCl7IGV4Y2VsLmRhdGFbaV1bal0gPSAnJzsgfVxuXHRcdFx0XHRcblx0XHRcdFx0aWYoJC5pc051bWVyaWMoIGV4Y2VsLmRhdGFbaV1bal0gKSl7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2ldW2pdKVxuXHRcdFx0XHRcdGV4Y2VsLmRhdGFbaV1bal0gPSBTdHJpbmcoZXhjZWwuZGF0YVtpXVtqXSkucmVwbGFjZSgnLicsJywnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4Y2VsLmluaXQoKTtcbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cbiAgc3F1YXJlX2JvcmRlcl9zbWFsbCA6IGZ1bmN0aW9uKGRhdGEpe1xuXG4gIGlmKGRhdGEubGluZV93aWR0aF95IDwgMil7XG4gICAgeV90cmFucyA9IC0yO1xuICB9XG4gIGVsc2V7XG4gICAgeV90cmFucyA9IC0zO1xuICB9XG5cbiAgaWYoZGF0YS5saW5lX3dpZHRoX3ggPCAzKXtcbiAgICB4X3RyYW5zID0gLTI7XG4gIH1cbiAgZWxzZXtcbiAgICB4X3RyYW5zID0gLTEqZGF0YS5saW5lX3dpZHRoX3g7XG4gIH1cblxuICBpZihkYXRhLmJvcmRlci50b3Ape1xuICAgIGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KFxuICAgICAgZGF0YS54K3hfdHJhbnMrMSxcbiAgICAgIGRhdGEueSt5X3RyYW5zKzEsXG4gICAgICBkYXRhLnNpemUrZGF0YS5saW5lX3dpZHRoX3grMSxcbiAgICAgIDFcbiAgICApO1xuICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3BfbGVmdCl7XG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K3hfdHJhbnMrMSxcbiAgICAgICAgZGF0YS55K3lfdHJhbnMrMSxcbiAgICAgICAgcGFyc2VJbnQoKGRhdGEuc2l6ZStkYXRhLmxpbmVfd2lkdGhfeCsxKS8yKSxcbiAgICAgICAgMVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3BfcmlnaHQpe1xuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueCt4X3RyYW5zKzErcGFyc2VJbnQoKGRhdGEuc2l6ZStkYXRhLmxpbmVfd2lkdGhfeCsxKS8yKSxcbiAgICAgICAgZGF0YS55K3lfdHJhbnMrMSxcbiAgICAgICAgTWF0aC5jZWlsKChkYXRhLnNpemUrZGF0YS5saW5lX3dpZHRoX3grMSkvMiksXG4gICAgICAgIDFcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS5ib3JkZXIucmlnaHQpe1xuICAgICAgaWYoZGF0YS5saW5lX3dpZHRoX3ggPCAyKXtcbiAgICAgICAgeF90cmFucyA9IC0xO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgeF90cmFucyA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEubGluZV93aWR0aF95IDwgMil7XG4gICAgICAgIHlfdHJhbnMgPSAyO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgeV90cmFucyA9IGRhdGEubGluZV93aWR0aF95O1xuICAgICAgfVxuXG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K2RhdGEuc2l6ZSt4X3RyYW5zKzEsXG4gICAgICAgIGRhdGEueS0xLFxuICAgICAgICAxLFxuICAgICAgICBkYXRhLnNpemUreV90cmFucyBcbiAgICAgICk7XG4gICAgfVxuICB9LFxuc3F1YXJlX2JvcmRlcl9iaWcgOiBmdW5jdGlvbihkYXRhKXtcblxuICBpZihkYXRhLmxpbmVfd2lkdGhfeSA8IDIpe1xuICAgIHlfdHJhbnMgPSAtMjtcbiAgfVxuICBlbHNle1xuICAgIHlfdHJhbnMgPSAtMztcbiAgfVxuXG4gIGlmKGRhdGEubGluZV93aWR0aF94IDwgMyl7XG4gICAgeF90cmFucyA9IC0yO1xuICB9XG4gIGVsc2V7XG4gICAgeF90cmFucyA9IC0xKmRhdGEubGluZV93aWR0aF94O1xuICB9XG5cbiAgaWYoZGF0YS5ib3JkZXIudG9wKXtcbiAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgIGRhdGEueCt4X3RyYW5zLFxuICAgICAgZGF0YS55K3lfdHJhbnMsXG4gICAgICBkYXRhLnNpemUrZGF0YS5saW5lX3dpZHRoX3grMyxcbiAgICAgIDNcbiAgICApO1xuICB9XG5cbiAgICBpZihkYXRhLmJvcmRlci50b3BfbGVmdCl7XG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K3hfdHJhbnMsXG4gICAgICAgIGRhdGEueSt5X3RyYW5zLFxuICAgICAgICBwYXJzZUludCgoZGF0YS5zaXplK2RhdGEubGluZV93aWR0aF94KzMpLzIpLFxuICAgICAgICAzXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmKGRhdGEuYm9yZGVyLnRvcF9yaWdodCl7XG4gICAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgZGF0YS54K3hfdHJhbnMrcGFyc2VJbnQoKGRhdGEuc2l6ZStkYXRhLmxpbmVfd2lkdGhfeCszKS8yKSxcbiAgICAgICAgZGF0YS55K3lfdHJhbnMsXG4gICAgICAgIE1hdGguY2VpbCgoZGF0YS5zaXplK2RhdGEubGluZV93aWR0aF94KzMpLzIpLFxuICAgICAgICAzXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmKGRhdGEuYm9yZGVyLnJpZ2h0KXtcbiAgICAgIGlmKGRhdGEubGluZV93aWR0aF94IDwgMil7XG4gICAgICAgIHhfdHJhbnMgPSAtMTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIHhfdHJhbnMgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmxpbmVfd2lkdGhfeSA8IDIpe1xuICAgICAgICB5X3RyYW5zID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIHlfdHJhbnMgPSBkYXRhLmxpbmVfd2lkdGhfeTtcbiAgICAgIH1cblxuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueCtkYXRhLnNpemUreF90cmFucyxcbiAgICAgICAgZGF0YS55LFxuICAgICAgICAzLFxuICAgICAgICBkYXRhLnNpemUreV90cmFucyBcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCIvL2Z1bmtjamUgZ2xvYmFsbmUga29udGVuZXIgbmEgd3N6eXN0a28gaSBuaWMgOylcbnZhciBnbG9iYWwgPSB7XG5cdHRvb2dsZV9wYW5lbCAgOiBmdW5jdGlvbihldmVudCl7XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRrYSBkbGEgbW96aWxsaVxuXHRcblx0XHQvL3NwcmF3ZHphbXkgeiBqYWtpbSBwYW5lbGVtIG1hbXkgZG8gY3p5bmllbmlhIChjenkgcG9rYXp1asSFY3ltIHNpxJkgeiBsZXdlaiBjenkgeiBwcmF3ZWogc3Ryb255KVxuXHRcdGlmKCAgcGFyc2VJbnQoJChldmVudC50YXJnZXQpLnBhcmVudCgpLmNzcygnbGVmdCcpKSA+IDAgKXtcblx0XHRcdC8vcGFuZWwgamVzdCB6IHByYXdlaiBzdHJvbnlcblx0XHRcdGlmKCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdyaWdodCcpID09ICcwcHgnICl7XG5cdFx0XHRcdCQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtyaWdodDogWy0kKGV2ZW50LnRhcmdldCkucGFyZW50KCkud2lkdGgoKS0yMCxcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdCAgICBlbHNle1xuXHQgICAgXHQgJChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe3JpZ2h0OiBbXCIwcHhcIixcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQvL3BhbmVsIGplc3QgeiBsZXdlaiBzdHJvbnlcblx0XHRcdGlmKCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdsZWZ0JykgPT0gJzBweCcgKXtcblx0XHRcdFx0JChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe2xlZnQ6IFstJChldmVudC50YXJnZXQpLnBhcmVudCgpLndpZHRoKCktMjAsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuXHQgICAgfVxuXHQgICAgZWxzZXtcblx0ICAgIFx0ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtsZWZ0OiBbXCIwcHhcIixcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdFx0fVxuXG5cdH1cbn1cbiIsIi8vZ8WCw7N3bmUgemRqxJljaWUgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbnZhciBpbWFnZSA9IHtcblx0b2JqIDogdW5kZWZpbmVkLFxuXHR4IDogbnVsbCxcblx0eSA6IG51bGwsXG5cdHdpZHRoIDogbnVsbCxcblx0aGVpZ2h0IDogbnVsbCxcblx0YWxwaGEgOiAxMCxcblxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IHRoaXMuYWxwaGEvMTA7XG5cdFx0Y2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMub2JqLHRoaXMueCx0aGlzLnksdGhpcy53aWR0aCx0aGlzLmhlaWdodCk7XG5cblx0XHQkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuY3NzKHsnaGVpZ2h0Jzp0aGlzLmhlaWdodCwndG9wJzp0aGlzLnkrJ3B4JywnbGVmdCc6KHRoaXMueCt0aGlzLndpZHRoKSsncHgnfSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBwb21vY25pY3phIGtvbndlcnR1asSFY2EgZGF0YVVSSSBuYSBwbGlrXG5cdGRhdGFVUkl0b0Jsb2IgOiBmdW5jdGlvbihkYXRhVVJJKSB7XG4gICAgdmFyIGJpbmFyeSA9IGF0b2IoZGF0YVVSSS5zcGxpdCgnLCcpWzFdKTtcbiAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFycmF5LnB1c2goYmluYXJ5LmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJsb2IoW25ldyBVaW50OEFycmF5KGFycmF5KV0sIHt0eXBlOiAnaW1hZ2UvcG5nJ30pO1xuXHR9XG5cbn1cbiIsInZhciBkYXRhX2lucHV0ID0ge1xuXG5cdC8vcG9iaWVyYW5pZSBpbmZvcm1hY2ppIHogaW5wdXTDs3cgaSB6YXBpc2FuaWUgZG8gb2JpZWt0dSBtYXBfc3ZnXG5cdGdldCA6IGZ1bmN0aW9uKCl7XG5cdFx0bWFwLm5hbWUgPSAkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoKTtcblx0XHRtYXAucGF0aCA9ICQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCgpLnJlcGxhY2UoL1wiL2csIFwiJ1wiKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9LFxuXG5cdC8vcG9icmFuaWUgaW5mb3JtYWNqaSB6IG9iaWVrdHUgbWFwX3N2ZyBpIHphcGlzYW5pZSBkbyBpbnB1dMOzd1xuXHRzZXQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCggbWFwLm5hbWUgKTtcblx0XHQkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoIG1hcC5wYXRoICk7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fVxuXG59XG4iLCJsYWJlbHMgPSB7XG5cblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2xheWVycyAubGFiZWxfbGF5ZXInKS52YWwoIGxheWVycy5sYWJlbHNbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0fSxcblxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKSB7XG5cdFx0bGF5ZXJzLmxhYmVsc1tsYXllcnMuYWN0aXZlXSA9ICQob2JqKS52YWwoKTtcblx0fVxufVxuXG4kKCcjbGF5ZXJzIC5sYWJlbF9sYXllcicpLmtleXVwKGZ1bmN0aW9uKCl7XG5cdGxhYmVscy5lZGl0KHRoaXMpO1xufSk7IFxuIiwidmFyIGxheWVycyA9IHtcblxuXHRsaXN0IDogWyd6YWvFgmFka2EgMSddLFxuXHRhY3RpdmUgOiAwLFxuXG5cdC8vdGFibGljYSB6IHBvZHN0YXdvd3l3bWkgZGFueW1pIHphZ3JlZ293YW55bWkgZGxhIGthxbxkZWogd2Fyc3R3eVxuXHRwYWxldHNfYWN0aXZlIDogWzBdLFxuXG5cdHZhbHVlIDogWy0xXSxcblx0Y29sb3JzX3BvcyA6IFtbMSwxLDEsMSwxLDEsMSwxLDFdXSxcblx0Y29sb3JzX2FjdGl2ZSA6IFtbXCIjZjdmY2ZkXCIsIFwiI2U1ZjVmOVwiLCBcIiNjY2VjZTZcIiwgXCIjOTlkOGM5XCIsIFwiIzY2YzJhNFwiLCBcIiM0MWFlNzZcIiwgXCIjMjM4YjQ1XCIsIFwiIzAwNmQyY1wiLCBcIiMwMDQ0MWJcIl1dLFxuXHRtaW5fdmFsdWUgOiBbMF0sXG5cdG1heF92YWx1ZSA6IFswXSxcblx0Y2xvdWQgOiBbXCJcIl0sXG5cdGNsb3VkX3BhcnNlciA6IFtcIlwiXSxcblx0bGVnZW5kcyA6IFtbXV0sXG5cdGxhYmVscyA6IFtcIlwiXSxcblx0Y2F0ZWdvcnkgOiBbLTFdLFxuXHRjYXRlZ29yeV9jb2xvcnMgOiBbXSxcblx0Y2F0ZWdvcnlfbmFtZSA6IFtdLFxuXG5cdC8vem1pZW5uZSBnbG9iYWxuZSBkb3R5Y3rEhWNlIGNhxYJlZ28gcHJvamVrdHVcblx0cHJvamVjdF9uYW1lIDogJ25vd3kgcHJvamVrdCcsXG5cdHNvdXJjZSA6ICcnLFxuXG5cdC8vdGFibGljYSBww7NsIHV6YWxlxbxuaW9ueWNoIG9kIGFrdHVhbG5laiB3YXJzdHd5XG5cdGRiX25hbWUgOiBbXCJsaXN0XCIsXCJwYWxldHNfYWN0aXZlXCIsXCJjYXRlZ29yeVwiLFwiY2F0ZWdvcnlfY29sb3JzXCIsXCJjYXRlZ29yeV9uYW1lXCIsXCJ2YWx1ZVwiLFwiY29sb3JzX3Bvc1wiLFwiY29sb3JzX2FjdGl2ZVwiLFwibWluX3ZhbHVlXCIsXCJtYXhfdmFsdWVcIixcImNsb3VkXCIsXCJjbG91ZF9wYXJzZXJcIixcImxlZ2VuZHNcIixcImxhYmVsc1wiXSxcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBodG1sID0gXCJcIjtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5saXN0Lmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0aWYoaSA9PSB0aGlzLmFjdGl2ZSl7XG5cdFx0XHRcdGh0bWwgKz0gJzxzcGFuIG51bT1cIicraSsnXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIGNsYXNzPVwiYWN0aXZlXCI+JyArIHRoaXMubGlzdFtpXSArICc8L3NwYW4+Jztcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGh0bWwgKz0gJzxzcGFuIG51bT1cIicraSsnXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiID4nICsgdGhpcy5saXN0W2ldICsgJzwvc3Bhbj4nO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJhZGRcIj4gKyA8L2J1dHRvbj48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCI+IC0gPC9idXR0b24+JztcblxuXHRcdCQoJyNsYXllcnMgPiBkaXYnKS5odG1sKGh0bWwpO1xuXG5cblx0XHQvL2RvZGFqZW15IHpkYXJ6ZW5pYSBkbyBlZHljamkgLyB6bWlhbnkga29sZWpub3NjaSBpIGFrdHVhbGl6b3dhbmlhIHdhcnN0d3lcblx0XHQkKCcjbGF5ZXJzIC5hZGQnKS5jbGljayhmdW5jdGlvbigpe2xheWVycy5hZGQoKTt9KTtcblx0XHRcblx0XHQkKCcjbGF5ZXJzIC5yZW1vdmUnKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdFx0aWYoY29uZmlybSgnQ3p5IGNoY2VzeiB1c3VuxIXEhyB3YXJzdHfEmSA/Jykpe1xuXHRcdFx0XHRsYXllcnMucmVtb3ZlKCk7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXHRcdFxuXHRcdCQoJyNsYXllcnMgc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7IGxheWVycy5zZWxlY3QodGhpcyk7IH0pO1xuXG5cdFx0JCggXCIjbGF5ZXJzID4gZGl2IHNwYW5cIiApLmtleXVwKGZ1bmN0aW9uKCl7XG5cdFx0XHRsYXllcnMubGlzdFtsYXllcnMuYWN0aXZlXSA9ICQodGhpcykuaHRtbCgpO1xuXHRcdH0pO1xuXG5cdFx0JCggXCIjbGF5ZXJzID4gZGl2IHNwYW5cIiApLmRibGNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdjb250ZW50ZWRpdGFibGUnKTtcblx0XHRcdCQodGhpcykuYmx1cihmdW5jdGlvbigpeyAkKHRoaXMpLnJlbW92ZUNsYXNzKCdjb250ZW50ZWRpdGFibGUnKSB9KTtcblx0XHR9KTtcblxuXHRcdCQoIFwiI2xheWVycyA+IGRpdlwiICkuc29ydGFibGUoeyBcblx0XHRcdGF4aXM6ICd4Jyxcblx0XHQgXHR1cGRhdGU6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRcdCQoIFwiI2xheWVycyA+IGRpdiBzcGFuXCIgKS5lYWNoKGZ1bmN0aW9uKGluZGV4LG9iail7XG5cdFx0XHRcdFx0aWYoaW5kZXggIT0gJChvYmopLmF0dHIoJ251bScpKXtcblx0XHRcdFx0XHRcdGxheWVycy5jaGFuZ2Vfb3JkZXIoJChvYmopLmF0dHIoJ251bScpLGluZGV4KVxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0IFx0fSxcblx0XHQgXHRjYW5jZWw6ICcuYWRkLC5yZW1vdmUsLmNvbnRlbnRlZGl0YWJsZSdcblx0XHR9KTtcblx0fSxcblxuXHRzZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXHRcdCQoJyNsYXllcnMgc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHQkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdGxheWVycy5hY3RpdmUgPSAkKG9iaikuaW5kZXgoKTtcblxuXHRcdHRpbnlNQ0UuZWRpdG9yc1swXS5zZXRDb250ZW50KCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0XHRwYWxldHMuc2hvdygpO1xuXHRcdGNsb3VkLnNldF90ZXh0YXJlYSgpO1xuXHRcdGxhYmVscy5zaG93KCk7XG5cdFx0bGVnZW5kcy5zaG93KCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHQvL3ptaWFuYSBrb2xlam5qb8WbY2kgd2Fyc3R3XG5cdGNoYW5nZV9vcmRlciA6IGZ1bmN0aW9uKGxhc3QsbmV4dCl7XG5cdFx0Zm9yICh2YXIgaT0gMCwgaV9tYXggPSB0aGlzLmRiX25hbWUubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKykge1xuXHRcdFx0dmFyIHRtcCA9IHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtuZXh0XTtcblx0XHRcdHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtuZXh0XSA9IHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtsYXN0XVxuXHRcdFx0dGhpc1t0aGlzLmRiX25hbWVbaV1dW2xhc3RdID0gdG1wO1xuXHRcdH1cblx0fSxcblxuXHQvL2RvZGFqZW15IG5vd8SFIHdhcnN0d8SZXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR0aGlzLmxpc3QucHVzaCggJ3pha8WCYWRrYSAnICsgcGFyc2VJbnQodGhpcy5saXN0Lmxlbmd0aCsxKSk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2goLTEpO1xuXHRcdHRoaXMuY2F0ZWdvcnlfY29sb3JzLnB1c2goIHRoaXMuY2F0ZWdvcnlfY29sb3JzW3RoaXMuY2F0ZWdvcnlfY29sb3JzLmxlbmd0aC0xXS5zbGljZSgpICk7XG5cdFx0dGhpcy52YWx1ZS5wdXNoKC0xKTtcblx0XHR0aGlzLnBhbGV0c19hY3RpdmUucHVzaCgwKTtcblx0XHR0aGlzLmNvbG9yc19hY3RpdmUucHVzaChbJyNmN2ZjZmQnLCcjZTVmNWY5JywnI2NjZWNlNicsJyM5OWQ4YzknLCcjNjZjMmE0JywnIzQxYWU3NicsJyMyMzhiNDUnLCcjMDA2ZDJjJywnIzAwNDQxYiddKTtcblx0XHR0aGlzLmNvbG9yc19wb3MucHVzaChbMSwxLDEsMSwxLDEsMSwxLDFdKTtcblx0XHR0aGlzLm1pbl92YWx1ZS5wdXNoKDApO1xuXHRcdHRoaXMubWF4X3ZhbHVlLnB1c2goMCk7XG5cdFx0dGhpcy5jbG91ZC5wdXNoKFwiXCIpO1xuXHRcdHRoaXMuY2xvdWRfcGFyc2VyLnB1c2goXCJcIik7XG5cdFx0dGhpcy5sZWdlbmRzLnB1c2goW10pO1xuXHRcdHRoaXMubGFiZWxzLnB1c2goXCJcIik7XG5cdFx0dGhpcy5zaG93KCk7XG5cblx0fSxcblxuXHQvL3VzdXdhbXkgYWt0dWFsbsSFIHdhcnN0d8SZXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0aWYodGhpcy5hY3RpdmUgPiAwKXtcblx0XHRcdGlmKHRoaXMuYWN0aXZlID09ICh0aGlzLmxpc3QubGVuZ3RoLTEpKXtcblx0XHRcdFx0dmFyIGlfdG1wID0gdGhpcy5saXN0Lmxlbmd0aC0xO1xuXHRcdFx0XHR0aGlzLnNlbGVjdCggJCgnI2xheWVycyBzcGFuJykuZXEoIGlfdG1wICkgKTtcblx0XHRcdH0gXG5cblx0XHRcdC8vcG9iaWVyYW15IG51bWVyIG9zdGF0bmllaiB6YWvFgmFka2lcblx0XHRcdGZvciAodmFyIGlfbGF5ZXJzPSB0aGlzLmFjdGl2ZSwgaV9sYXllcnNfbWF4ID0gbGF5ZXJzLmxpc3QubGVuZ3RoLTE7IGlfbGF5ZXJzIDwgaV9sYXllcnNfbWF4OyBpX2xheWVycysrKSB7XG5cdFx0XHRcdGZvciAodmFyIGk9IDAsIGlfbWF4ID0gdGhpcy5kYl9uYW1lLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspIHtcblx0XHRcdFx0XHR0aGlzW3RoaXMuZGJfbmFtZVtpXV1baV9sYXllcnNdID0gdGhpc1t0aGlzLmRiX25hbWVbaV1dW2lfbGF5ZXJzKzFdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vdXN1d2FteSBvc3RhdG5pxIUgemFrxYJhZGvEmSAvIHdhcnN0d8SZXG5cdFx0XHR2YXIgbGFzdF9pID0gbGF5ZXJzLmxpc3QubGVuZ3RoIC0gMTtcblx0XHRcdGZvciAodmFyIGk9IDAsIGlfbWF4ID0gdGhpcy5kYl9uYW1lLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspIHtcblx0XHRcdFx0dGhpc1t0aGlzLmRiX25hbWVbaV1dLnBvcCgpXG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtsYXN0X2ldKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zaG93KCk7XG5cdFx0XHR0aGlzLnNlbGVjdCgkKCcjbGF5ZXJzIHNwYW4uYWN0aXZlJykpOyBcblx0XHR9XG5cdH1cbn1cblxuLy96bWlhbmEgbmF6d3kgcHJvamVrdHUgcHJ6eSB3cGlzYW5pdSBub3dlaiBuYXp3eSBkbyBpbnB1dGFcbiQoJyNwb2ludGVycyAucHJvamVjdF9uYW1lJykua2V5dXAoZnVuY3Rpb24oKXsgbGF5ZXJzLnByb2plY3RfbmFtZSA9ICQodGhpcykudmFsKCk7IH0pO1xuXG4vL3ptaWVubmUgcG9tb2NuaWN6ZVxuJC5mbi5zZWxlY3RUZXh0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZG9jID0gZG9jdW1lbnQ7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzWzBdO1xuICAgIC8vY29uc29sZS5sb2codGhpcywgZWxlbWVudCk7XG4gICAgaWYgKGRvYy5ib2R5LmNyZWF0ZVRleHRSYW5nZSkge1xuICAgIFx0dmFyIHJhbmdlID0gZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgIHJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsZW1lbnQpO1xuICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgXHR2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpOyAgICAgICAgXG4gICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbiAgICB9XG59O1xuIiwiLy9vYmlla3QgZG90eWN6xIVzeSB3eXN3aWV0bGFuaWEgYWt1dGFsaXphY2ppIGkgZWR5Y2ppIHBhbmVsdSBsZWdlbmRcbmxlZ2VuZHMgPSB7XG5cblx0Ly93ecWbd2lldGxhbXkgd3N6eXN0a2llIGxlZ2VuZHkgdyBwYW5lbHUgbWFwXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGh0bWwgPSBcIjx0YWJsZT48dHI+PHRoPmtvbG9yOjwvdGg+PHRoPm9kOjwvdGg+PHRoPmRvOjwvdGg+PHRoPm9waXM6PC90aD48L3RyPlwiO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGh0bWwgKz0gXCI8dHIgcm93PSdcIitpK1wiJz48dGQgcm93PSdcIitpK1wiJyBjb2xfbnVtPScnIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzNdK1wiJyBjbGFzcz0nY29sb3IgY29sb3JwaWNrZXJfYm94Jz48L3RkPjx0ZCBjbGFzcz0nZnJvbScgbmFtZT0nZnJvbScgY29udGVudGVkaXRhYmxlPSd0cnVlJz5cIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVswXStcIjwvdGQ+PHRkIGNsYXNzPSd0bycgbmFtZT0ndG8nIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMV0rXCI8L3RkPjx0ZCBjbGFzcz0nZGVzY3JpcHRpb24nIG5hbWU9J2Rlc2NyaXB0aW9uJyBjb250ZW50ZWRpdGFibGU9J3RydWUnPlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzJdK1wiPC90ZD48L3RyPlwiO1xuXHRcdH1cblxuXHRcdGh0bWwgKz0gXCI8L3RhYmxlPlwiO1xuXHRcdCQoJyNsZWdlbmRzJykuaHRtbChodG1sKTtcblxuXHRcdHZhciByb3cgPSAxO1xuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRpZiggbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG5cdFx0XHRcdCQoJyNsZWdlbmRzIHRhYmxlIHRyJykuZXEocm93KS5jaGlsZHJlbigndGQnKS5lcSgwKS5hdHRyKCdjb2xfbnVtJywgaSk7XG5cdFx0XHRcdHJvdysrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKDE4ID09IGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdKSB7XG5cdFx0XHR2YXIgcm93ID0gMDtcblx0XHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdGlmKCBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcblx0XHRcdFx0XHRwYWxldHMuY29sb3JfYXJyWzE4XVtpXSA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW3Jvd107XG5cdFx0XHRcdFx0cm93Kys7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRwYWxldHMuY29sb3JfYXJyWzE4XVtpXSA9ICcjZmZmJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cGFsZXRzLnNob3coKVxuXHRcdH1cblxuXHRcdGNvbG9ycGlja2VyLmFkZCgpO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBha3V0YWxpenVqxIVjYSBrb2xvcnkgdyBwYWxlY2llIGtvbG9yw7N3XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNvbG9yX2NvdW50ID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoIC8vaWxvc2Mga29sb3LDs3dcblx0XHR2YXIgZGlmZnJlbnQgPSBNYXRoLmFicyggbGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSAtIGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gKTsgLy8gY29sb3JfY291bnQ7XG5cdFx0XG5cdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0gPSBbXTtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cblx0XHRcdGNvbnNvbGUubG9nKCBwYXJzZUludChsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdKSxsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdICk7XG5cblx0XHRcdHZhciBub3dfdG1wID0gTWF0aC5yb3VuZCggKHBhcnNlSW50KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pK2RpZmZyZW50L2NvbG9yX2NvdW50KmkpKjEwMCkgLyAxMDBcblx0XHRcdFxuXHRcdFx0Ly9jb25zb2xlLmxvZyhsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdK2RpZmZyZW50L2NvbG9yX2NvdW50KmkpO1xuXG5cblx0XHRcdGlmKGkrMSA9PSBpX21heCApe1xuXHRcdFx0XHR2YXIgbmV4dF90bXAgPSBsYXllcnMubWF4X3ZhbHVlW2xheWVycy5hY3RpdmVdXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHR2YXIgbmV4dF90bXAgPSBNYXRoLnJvdW5kKCAoKHBhcnNlSW50KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pK2RpZmZyZW50L2NvbG9yX2NvdW50KihpKzEpKSAtIDAuMDEpICAqMTAwKSAvIDEwMCBcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ucHVzaChbbm93X3RtcCxuZXh0X3RtcCwgIFN0cmluZyhub3dfdG1wKS5yZXBsYWNlKCcuJywnLCcpKycgLSAnK1N0cmluZyhuZXh0X3RtcCkucmVwbGFjZSgnLicsJywnKSwgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1baV0gXSk7XG5cdFx0XG5cdFx0fVxuXHRcdHRoaXMuc2hvdygpO1xuXHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdH0sXG5cblx0ZWRpdDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciByb3cgPSAkKG9iaikucGFyZW50KCkuYXR0cigncm93Jyk7XG5cdFx0dmFyIG5hbWUgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXHRcdHZhciB2YWwgPSAkKG9iaikuaHRtbCgpO1xuXG5cdFx0c3dpdGNoKG5hbWUpe1xuXHRcdFx0XG5cdFx0XHRjYXNlICdmcm9tJzpcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHZhbCkpIHsgJChvYmopLmh0bWwocGFyc2VGbG9hdCh2YWwpKSB9IC8vemFiZXpwaWVjemVuaWUsIGplxZtsaSB3cGlzYW5vIHRla3N0IHphbWllbmlhbXkgZ28gbmEgbGljemLEmVxuXHRcdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtyb3ddWzBdID0gcGFyc2VGbG9hdCh2YWwpO1xuXHRcdFx0XHRjYXRlZ29yaWVzLnVwZGF0ZV9jb2xvcigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGNhc2UgJ3RvJzpcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHZhbCkpIHsgJChvYmopLmh0bWwocGFyc2VGbG9hdCh2YWwpKSB9XG5cdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW3Jvd11bMV0gPSBwYXJzZUZsb2F0KHZhbCk7XG5cdFx0XHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y2FzZSAnZGVzY3JpcHRpb24nOlxuXHRcdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtyb3ddWzJdID0gdmFsO1xuXHRcdFx0YnJlYWs7XHRcdFxuXHRcdFxuXHRcdH1cblx0fVxufVxuXG5sZWdlbmRzLnNob3coKTsgXG5cblxuLy9kb2RhamVteSB6ZGFyemVuaWUgZWR5Y2ppIHdhcnRvxZtjaSB3IGxlZ2VuZHppZVxuJCgnI2xlZ2VuZHMnKS5vbigna2V5dXAnLCd0ZCcsIGZ1bmN0aW9uKCl7IGxlZ2VuZHMuZWRpdCh0aGlzKTsgfSk7XG4iLCIvKlxuICAgIF9fX18gICBfX19fIF9fX18gICAgX18gIF9fXyBfX18gICAgIF9fX18gICAgIF9fX19fICAgIF9fX18gXG4gICAvIF9fICkgLyAgXy8vIF9fIFxcICAvICB8LyAgLy8gICB8ICAgLyBfXyBcXCAgIHxfXyAgLyAgIC8gX18gXFxcbiAgLyBfXyAgfCAvIC8gLyAvIC8gLyAvIC98Xy8gLy8gL3wgfCAgLyAvXy8gLyAgICAvXyA8ICAgLyAvIC8gL1xuIC8gL18vIC9fLyAvIC8gL18vIC8gLyAvICAvIC8vIF9fXyB8IC8gX19fXy8gICBfX18vIC9fIC8gL18vIC8gXG4vX19fX18vL19fXy8gXFxfX19cXF9cXC9fLyAgL18vL18vICB8X3wvXy8gICAgICAgL19fX18vKF8pXFxfX19fLyAgXG5cbnZhcnNpb24gMy4wIGJ5IE1hcmNpbiBHxJliYWxhXG5cbmxpc3RhIG9iaWVrdMOzdzpcbmNhbnZhcyAtIG9iaWVrdCBjYW52YXNhXG5jYXRlZ29yaWVzXG5jbG91ZFxuY29sb3JfcGlja2VyXG5jcnVkIC0gb2JpZWt0IGNhbnZhc2FcbmV4Y2VsXG5maWd1cmVzXG5nbG9iYWxcbmltYWdlIC0gb2JpZWt0IHpkasSZY2lhIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG5pbnB1dFxubGFiZWxzXG5sYXllcnNcbmxlZ2VuZHNcbm1haW5cbm1lbnVfdG9wXG5tb2RlbHNcbm1vdXNlXG5vbl9jYXRlZ29yeVxucGFsZXRzXG5wb2ludGVyc1xuXG4qL1xuXG5cbi8vIENyZWF0ZSBJRSArIG90aGVycyBjb21wYXRpYmxlIGV2ZW50IGhhbmRsZXJcbnZhciBldmVudE1ldGhvZCA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID8gXCJhZGRFdmVudExpc3RlbmVyXCIgOiBcImF0dGFjaEV2ZW50XCI7XG52YXIgZXZlbnRlciA9IHdpbmRvd1tldmVudE1ldGhvZF07XG52YXIgbWVzc2FnZUV2ZW50ID0gZXZlbnRNZXRob2QgPT0gXCJhdHRhY2hFdmVudFwiID8gXCJvbm1lc3NhZ2VcIiA6IFwibWVzc2FnZVwiO1xuXG4vLyBMaXN0ZW4gdG8gbWVzc2FnZSBmcm9tIGNoaWxkIHdpbmRvd1xuZXZlbnRlcihtZXNzYWdlRXZlbnQsZnVuY3Rpb24oZSkge1xuICBjb25zb2xlLmxvZygncGFyZW50IHJlY2VpdmVkIG1lc3NhZ2UhOiAgJyxlLmRhdGEpO1xufSxmYWxzZSk7XG4gXG4vL2RvZGFqZW15IHRpbnltY2UgZG8gMiB0ZXh0YXJlYSAoZHltZWsgxbpyw7NkxYJvKVxudGlueW1jZS5pbml0KHtcblx0bWVudWJhcjpmYWxzZSxcbiAgc2VsZWN0b3I6ICcudGlueWVkaXQnLCAgLy8gY2hhbmdlIHRoaXMgdmFsdWUgYWNjb3JkaW5nIHRvIHlvdXIgSFRNTFxuICB0b29sYmFyOiAnYm9sZCBpdGFsaWMgfCBsaW5rIGltYWdlJyxcbiAgICBzZXR1cDogZnVuY3Rpb24gKGVkaXRvcikge1xuICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gJChlZGl0b3IudGFyZ2V0RWxtKS5hdHRyKCduYW1lJyk7XG4gICAgICAgIFxuICAgICAgICAvL2plxZtsaSBha3R1YWxpenVqZW15IGR5bWVrXG4gICAgICAgIGlmKHRhcmdldCA9PSAnY2xvdWQnKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygpXG4gICAgICAgIFx0bGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdID0gZWRpdG9yLmdldENvbnRlbnQoKTtcbiAgICAgICAgXHQvL2Nsb3VkLmdldF90ZXh0YXJlYSggZWRpdG9yLmdldENvbnRlbnQoKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9qZcWbbGkgYWt0dWFsaXp1amVteSDFvHLDs2TFgm8gcHJvamVrdHVcbiAgICAgICAgaWYodGFyZ2V0ID09ICdzb3VyY2UnKXtcbiAgIFx0XHRcdFx0bGF5ZXJzLnNvdXJjZSA9IGVkaXRvci5nZXRDb250ZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG4gICAgfVxufSk7XG5cbndpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uIChldnQpIHtcbiBcdGlmICh0eXBlb2YgZXZ0ID09ICd1bmRlZmluZWQnKSB7XG4gIFx0ZXZ0ID0gd2luZG93LmV2ZW50O1xuIFx0fVxuIFx0aWYgKGV2dCkge1xuICBcdGlmKCFjb25maXJtKCdDenkgY2hjZXN6IG9wdcWbY2nEhyB0xJkgc3Ryb27EmScpKSByZXR1cm4gZmFsc2Vcblx0fVxufVxuXG4vL3BvIGtsaWtuacSZY2l1IHptaWVuaWF5IGFrdHVhbG55IHBhbmVsXG4kKCcuYm94ID4gdWwgPiBsaScpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9ib3godGhpcykgfSk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0bWVudV90b3AuZ2V0X21hcHMoKTtcblx0bWVudV90b3AuZ2V0X3Byb2plY3RzKCk7XG4gIGxheWVycy5zaG93KCk7XG4gIHBhbGV0cy5zaG93KCk7XG5cbiAgY29sb3JwaWNrZXIuY29sb3JfYm9yZGVyKCk7XG5cblx0Ly96YWJsb2tvd2FuaWUgbW/FvGxpd2/Fm2NpIHphem5hY3phbmlhIGJ1dHRvbsOzdyBwb2RjemFzIGVkeWNqaSBwb2xhXG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNpblwiLFwiaW5wdXRcIixmdW5jdGlvbigpeyBtZW51X3RvcC5kaXNhYmxlX3NlbGVjdCA9IHRydWU7IH0pO1xuXHQkKGRvY3VtZW50KS5vbihcImZvY3Vzb3V0XCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gZmFsc2U7IH0pO1xuXG5cdC8vemF6bmFjemVuaWUgZHlta2EgZG8gcHVibGlrYWNqaSBwbyBrbGlrbmnEmWNpdVxuXHQkKCcucHVibGlzaCAuZW1iZWQnKS5jbGljayhmdW5jdGlvbigpe1x0JCh0aGlzKS5zZWxlY3QoKTtcdH0pO1xuXHQkKCcucHVibGlzaCcpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXsgY3J1ZC5wdWJsaXNoKGV2ZW50KTsgfSk7XG5cblx0Ly9qZcWbbGkgY2hjZW15IHphcGlzYcSHIC8gemFrdHVhbGl6b3dhxIcgLyBvcHVibGlrb3dhxIcgcHJvamVrdFxuXHQkKCcjdG9vbGJhcl90b3AgYnV0dG9uLnNhdmUnKS5jbGljayhmdW5jdGlvbigpeyBcblx0XHRpZih0eXBlb2YgY3J1ZC5wcm9qZWN0X2hhc2ggPT0gJ3N0cmluZycpe1x0Y3J1ZC51cGRhdGVfcHJvamVjdCgpOyB9XG5cdFx0ZWxzZXsgY3J1ZC5jcmVhdGVfcHJvamVjdCgpOyB9XG5cdH0pO1xuXG5cdC8vamXFm2xpIGNoY2VteSB1c3VuxIXEhyBwcm9qZWt0XG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uZGVsZXRlJykuY2xpY2soZnVuY3Rpb24oKXsgXG5cdFx0aWYoY29uZmlybSgnQ3p5IGNoY2VzeiB1c3VuxIXEhyBwcm9qZWt0ID8nKSl7XG5cdFx0XHRjcnVkLmRlbGV0ZV9wcm9qZWN0KCk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL29kem5hY3plbmllIHNlbGVjdGEgcHJ6eSB6bWlhbmllXG5cdCQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgJCgnI2NoYW5nZV9jYXRlZ29yeScpLmJsdXIoKTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSBwdXNjemVuaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IG1vdXNlLm1vdXNlX2Rvd24gPSBmYWxzZTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSB3Y2nFm25pxJljaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXHRcblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL8WCYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpO1xuXHRcblx0fSk7XG5cblx0Ly93eXdvxYJhbmllIGZ1bmtjamkgcG9kY3phcyBwb3J1c3phbmlhIG15c3prxIVcblx0JChkb2N1bWVudCkubW91c2Vtb3ZlKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdGlmKG1vdXNlLm1vdXNlX2Rvd24pIG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cdFx0aWYobWVudV90b3AuYXV0b19kcmF3KXsgbW91c2UuY2xpY2tfb2JqID0gXCJjYW52YXNcIjsgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTt9XG5cdFxuXHR9KTtcblxuXHQkKCcjbWFpbl9jYW52YXMnKS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpOy8vemFyZWplc3Ryb3dhbmllIG9iaWVrdHV3ICBrdMOzcnkga2xpa2FteVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cblx0fSk7XG5cblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpe1xuXG5cdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBudWxsO1x0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRjYW52YXMuY29udGV4dF94ID0gY2FudmFzLmNvbnRleHRfbmV3X3g7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IGNhbnZhcy5jb250ZXh0X25ld195O1xuXG5cdH0pO1xuXG5cdC8vZG9kYW5pZSBub3dlaiBrYXRlZ29yaWlcblx0JCgnI2FkZF9jYXRlZ29yeScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0Y2F0ZWdvcmllcy5hZGQoKTtcblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaSAocG8gd2NpxZtuacSZY2l1IGVudGVyKVxuXHQkKCdpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykua2V5cHJlc3MoZnVuY3Rpb24oZSkge1xuICAgIFx0aWYoZS53aGljaCA9PSAxMykge1xuICAgIFx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuICAgIFx0fVxuXHR9KTtcblxuXHQvLyQoZG9jdW1lbnQpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHsgbWVudV90b3Auc3dpdGNoX21vZGUoIGUud2hpY2ggKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImZvY3Vzb3V0XCIsIGZ1bmN0aW9uKCkgeyBjYXRlZ29yaWVzLnVwZGF0ZSgkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5JykgLCQodGhpcykudmFsKCkgKTsgfSk7XG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImtleXByZXNzXCIsIGZ1bmN0aW9uKGUpIHsgaWYoZS53aGljaCA9PSAxMykge2NhdGVnb3JpZXMudXBkYXRlKCQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKSAsJCh0aGlzKS52YWwoKSApOyB9IH0pO1xuXG5cdC8vdXN1bmnEmWNpZSBrYXRlZ29yaWlcbi8vXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJidXR0b24ucmVtb3ZlXCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy5yZW1vdmUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpL1xuLy9cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgIH0pO1xuLy9cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJmb2N1c291dFwiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSB0cnVlOyAgfSk7XG5cblx0Ly9wb2themFuaWUgLyB1a3J5Y2llIHBhbmVsdSBrYXRlZ29yaWlcblx0JCgnI2V4Y2VsX2JveCBoMiwgI3BvaW50ZXJfYm94IGgyLCAjcGFsZXRzX2JveCBoMicpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXsgZ2xvYmFsLnRvb2dsZV9wYW5lbChldmVudCk7IH0pO1xuXG5cdC8vb2JzxYJ1Z2EgYnV0dG9uw7N3IGRvIGlua3JlbWVudGFjamkgaSBkZWtyZW1lbnRhY2ppIGlucHV0w7N3XG5cdCQoJ2J1dHRvbi5pbmNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2luY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXHQkKCdidXR0b24uZGVjcmVtZW50JykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLmJ1dHRvbl9kZWNyZW1lbnQoICQodGhpcykgKSB9KTtcblxuXHQvL29ixYJ1Z2EgaW5wdXTDs3cgcG9icmFuaWUgZGFueWNoIGkgemFwaXNhbmllIGRvIGJhenlcblx0JCgnLnN3aXRjaCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9zd2l0Y2goICQodGhpcykgKTsgfSk7IC8vcHJ6eWNpc2tpIHN3aXRjaFxuXHQkKCcuaW5wdXRfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXQoICQodGhpcykgKTsgfSk7IC8vdHJhZHljeWpuZSBpbnB1dHlcblx0JCgnLmlucHV0X2Jhc2VfdGV4dCcpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXRfdGV4dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuc2VsZWN0X2Jhc2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3NlbGVjdCggJCh0aGlzKSApOyB9KTsgLy9saXN0eSByb3p3aWphbmUgc2VsZWN0XG5cblx0JCgnI21lbnVfdG9wICNpbmNyZW1lbnRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuaW5jcmVtZW50X3NjYWxlKCk7IH0pO1xuXHQkKCcjbWVudV90b3AgI2RlY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5kZWNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjYWRkX2ltYWdlJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuYWRkX2ltYWdlKCk7IH0pO1xuXG5cdCQoJyNtZW51X3RvcCAjcmVzZXRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgY2FudmFzLnNldF9kZWZhdWx0KCk7IH0pO1xuXG5cdC8vcHJ6eXBpc2FuaWUgcG9kc3Rhd293b3d5Y2ggZGFueWNoIGRvIG9iaWVrdHUgY2FudmFzXG5cdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcbiAgY2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnKSApO1xuICBjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnKSApO1xuICB2YXIgb2Zmc2V0ID0gJCgnI2NhbnZhc19ib3gnKS5vZmZzZXQoKTtcbiAgY2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuICAvL3R3b3J6eW15IHRhYmxpY2UgcG9pbnRlcsOzd1xuXHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblxuICAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuICAkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCwjY2FudmFzX2luZm8gI2hlaWdodCwjY2FudmFzX2luZm8gI3NpemUnKS5jaGFuZ2UoZnVuY3Rpb24oKXttZW51X3RvcC51cGRhdGVfY2FudmFzX2luZm8oKX0pO1xuXG5cdC8vJCgnI2FscGhhX2ltYWdlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9hbHBoYSgpIH0pO1xuXG5cdC8vJCgnaW5wdXQnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyB9KTtcblx0Ly8kKCdpbnB1dCcpLmZvY3Vzb3V0KGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgfSk7XG5cblx0Ly8kKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IGNhbnZhcy5kcmF3KCk7IH0pO1xuXHRjYW52YXMuZHJhdygpOyAvL3J5c293YW5pZSBjYW52YXNcblxufSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxubWVudV90b3AgPSB7XG5cblx0bW92ZV9pbWFnZSA6IGZhbHNlLFxuXHRtb3ZlX2NhbnZhcyA6IGZhbHNlLFxuXHRhdXRvX2RyYXcgOiBmYWxzZSxcblx0bW9kZV9rZXkgOiB0cnVlLFxuXHRjYXRlZ29yeSA6IDAsXG5cdGRpc2FibGVfc2VsZWN0IDogZmFsc2UsXG5cblx0Ly96bWlhbmEgYWt0dWFsbmVqIHpha8WCYWRraVxuXHRjaGFuZ2VfYm94IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKG9iaikucGFyZW50KCkuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHR2YXIgY2F0ZWdvcnkgPSAkKG9iaikuYXR0cignY2F0ZWdvcnknKTtcblx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJ2RpdicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuXHRcdFx0JChvYmopLnBhcmVudCgpLnBhcmVudCgpLmNoaWxkcmVuKCcjJytjYXRlZ29yeSkuZGVsYXkoMTAwKS5mYWRlSW4oNTAwKTtcblx0XHR9KTtcblx0XG5cdFxuXHR9LFxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X21hcHMgOiBmdW5jdGlvbigpe1xuXHRcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvbWFwcycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgbWFwIHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnPG9wdGlvbiBpZD1cInNlbGVjdF9tYXBcIj53eWJpZXJ6IG1hcMSZPC9vcHRpb24+Jztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXAnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0XHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBtYXAgXG5cdFx0XHRcdCQoJy5zZWxlY3RfbWFwJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Ly9zcHJhd2R6YW15IGN6eSB3eWJyYWxpxZtteSBwb2xlIHogaGFzaGVtIG1hcHlcblx0XHRcdFx0XHRpZiggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpICE9ICdzZWxlY3RfbWFwJyl7XG5cdFx0XHRcdFx0XHQvL2plxZtsaSB0YWsgdG8gc3ByYXdkemFteSBjenkgd2N6eXR1amVteSBtYXDEmSBwbyByYXogcGllcndzenkgY3p5IGRydWdpXG5cdFx0XHRcdFx0XHRpZihjcnVkLm1hcF9oYXNoICE9IG51bGwpe1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB3Y3p5dHVqZW15IHBvIHJheiBrb2xlam55IHRvIHB5dGFteSBjenkgbmFwZXdubyBjaGNlbXkgasSFIHdjenl0YcSHXG5cdFx0XHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd8SFIG1hcMSZID8nKSkge1xuXHRcdFx0XHRcdFx0XHRcdGNydWQubWFwX2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdFx0Y3J1ZC5nZXRfbWFwKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdCQoJy5zZWxlY3RfbWFwIG9wdGlvbicpLmVxKDApLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLm1hcF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9tYXAoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRhbGVydCgnbmllIG1vZ8SZIHBvYnJhxIcgbGlzdHkgbWFwJyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblxuXG5cdH0sXG5cblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9wcm9qZWN0cyA6IGZ1bmN0aW9uKCl7XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL3Byb2plY3RzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBwcm9qZWt0w7N3IHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICc8b3B0aW9uIGlkPVwibmV3X3Byb2plY3RcIj5ub3d5IHByb2pla3Q8L29wdGlvbj4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5wcm9qZWN0X2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5wcm9qZWN0KS5uYW1lICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLnByb2plY3QpLm5hbWUgKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfcHJvamVjdCcpLmh0bWwoIGFkZF9odG1sICk7XG5cdFx0XHRcblx0XHRcdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIHByb2plY3QgXG5cdFx0XHRcdCQoJy5zZWxlY3RfcHJvamVjdCcpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd3kgcHJvamVrdCA/JykpIHtcblx0XHRcdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19wcm9qZWN0JyApe1xuXHRcdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGNydWQucHJvamVjdF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9wcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0YWxlcnQoJ25pZSBtb2fEmSBwb2JyYcSHIGxpc3R5IHByb2pla3TDs3cnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0fSxcblxuXHR1cGRhdGVfY2FudmFzX2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5zY2FsZSA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoKSApO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCgpICk7XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoKSApO1xuXG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCBjYW52YXMuc2NhbGUgKyAnJScgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCBjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcgKTtcblxuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyxjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JyxjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0Y2hhbmdlX2FscGhhIDogZnVuY3Rpb24oKXtcblx0XHRpbWFnZS5hbHBoYSA9ICQoJyNhbHBoYV9pbWFnZScpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGFkZF9pbWFnZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2plc2xpIHBvZGFueSBwYXJhbWV0ciBuaWUgamVzdCBwdXN0eVxuXHRcdHZhciBzcmNfaW1hZ2UgPSBwcm9tcHQoXCJQb2RhaiDFm2NpZcW8a8SZIGRvIHpkasSZY2lhOiBcIik7XG5cblx0XHRpZihzcmNfaW1hZ2Upe1xuXHRcdFx0aWYoc3JjX2ltYWdlLmxlbmd0aCA+IDApe1xuXG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0XHRcdC8vd2N6eXRhbmllIHpkasSZY2lhOlxuXHRcdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHRpbWFnZS53aWR0aCA9IGltYWdlLm9iai53aWR0aDtcblx0ICAgIFx0XHRpbWFnZS5oZWlnaHQgPSBpbWFnZS5vYmouaGVpZ2h0O1xuXHQgICAgXHRcdGltYWdlLmRyYXcoKTtcblx0ICBcdFx0fTtcblxuXHRcdFx0ICBpbWFnZS54ID0gMDtcblx0XHRcdCAgaW1hZ2UueSA9IDA7XG5cdFx0XHQgIGltYWdlLm9iai5zcmMgPSBzcmNfaW1hZ2U7XG5cdFx0XHRcdC8vc2ltYWdlLm9iai5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzaG93X2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbChwYXJzZUludChjYW52YXMuc2NhbGUpICsgJyUnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHBhcnNlSW50KGNhbnZhcy53aWR0aF9jYW52YXMpICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwocGFyc2VJbnQoY2FudmFzLmhlaWdodF9jYW52YXMpICsgJ3B4Jyk7XG5cdH1cblxufVxuIiwiLy8gcG9iaWVyYW5pZSBkYW55Y2ggeiBzZWxla3RhIGlucHV0YSBzd2l0Y2h5IChha3R1YWxpemFjamEgb2JpZWt0w7N3KSBidXR0b24gaW5rcmVtZW50IGkgZGVrcmVtZW50XG52YXIgbW9kZWxzID0ge1xuXG5cdGJ1dHRvbl9pbmNyZW1lbnQgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIGlucHV0X3RvX3VwZGF0ZSA9ICQob2JqKS5hdHRyKCduYW1laW5wdXQnKTtcblx0XHR2YXIgdmFsdWUgPSBwYXJzZUludCgkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCgpKSArIDE7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCh2YWx1ZSk7XG5cdFx0dGhpcy51cGRhdGVfZnJvbV9pbnB1dCggJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKSApO1xuXHR9LFxuXG5cdGJ1dHRvbl9kZWNyZW1lbnQgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIGlucHV0X3RvX3VwZGF0ZSA9ICQob2JqKS5hdHRyKCduYW1laW5wdXQnKTtcblx0XHR2YXIgdmFsdWUgPSBwYXJzZUludCgkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCgpKSAtIDE7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCh2YWx1ZSk7XG5cdFx0dGhpcy51cGRhdGVfZnJvbV9pbnB1dCggJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKSApO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX2lucHV0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9IHBhcnNlSW50KCQob2JqKS52YWwoKSk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dF90ZXh0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9ICQob2JqKS52YWwoKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3NlbGVjdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21fc3dpdGNoIDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHRpZiggJChvYmopLmF0dHIoXCJ2YWx1ZVwiKSA9PSAnZmFsc2UnICl7XG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ3RydWUnKTtcblx0XHRcdCQob2JqKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRlbHNleyAvL3d5xYLEhWN6YW15IHByemXFgsSFY3puaWtcblx0XHRcdCQob2JqKS5hdHRyKFwidmFsdWVcIiwnZmFsc2UnKTtcblx0XHRcdCQob2JqKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHQkKG9iaikuYWRkQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBmYWxzZTtcblx0XHR9XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3QgbXlzemtpIChkbyBvZ2FybmllY2lhKVxudmFyIG1vdXNlID0ge1xuXHRtb3VzZV9kb3duIDogZmFsc2UsXG5cdGNsaWNrX29iaiA6IG51bGwsXG5cblx0dG1wX21vdXNlX3ggOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXHR0bXBfbW91c2VfeSA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cblx0bGVmdCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praVxuXHR0b3AgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2lcblx0cGFkZGluZ194IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdHBhZGRpbmdfeSA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRvZmZzZXRfeCA6IG51bGwsIC8vb2Zmc2V0IHggb2JpZWt0dSBrbGlrbmnEmXRlZ29cblx0b2Zmc2V0X3kgOiBudWxsLCAvL29mZnNldCB5IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cblx0Ly9mdW5ja2phIHd5a3J5d2FqxIVjYSB3IGNvIGtsaWtuacSZdG8gcG9iaWVyYWrEhWNhIHBhZGRpbmcga2xpa25pxJljaWEgb3JheiB6YXBpc3VqxIVjYSBrbGlrbmnEmWNpZVxuXHRzZXRfbW91c2VfZG93biA6IGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdHZhciBvYmogPSBldmVudC50YXJnZXQ7XG5cblx0XHQvL2plxZtsaSBlbGVtZW50IG5hIGt0w7NyeSBrbGlrbmnEmXRvIG1hIGF0cnlidXQgbmFtZWNsaWNrIHByenlwaXN1amVteSBnbyBkbyBvYmlla3R1IG15c3praVxuXHRcdGlmKHR5cGVvZigkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJykpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0dGhpcy5jbGlja19vYmogPSAkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJyk7XG5cblx0XHRcdHZhciBwb3NpdGlvbiA9ICQob2JqKS5vZmZzZXQoKTtcblx0XHRcdHRoaXMub2Zmc2V0X3ggPSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5vZmZzZXRfeSA9IHBvc2l0aW9uLnRvcDtcblx0XHRcdHRoaXMucGFkZGluZ194ID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMucGFkZGluZ195ID0gdGhpcy50b3AgLSBwb3NpdGlvbi50b3A7XG5cdFx0XHRtb3VzZS5tb3VzZV9kb3duID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy50bXBfbW91c2VfeCA9IGltYWdlLng7XG5cdFx0XHR0aGlzLnRtcF9tb3VzZV95ID0gaW1hZ2UueTtcblx0XHR9XG5cdH0sXG5cblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdHRoaXMubGVmdCA9IGV2ZW50LnBhZ2VYLFxuXHRcdHRoaXMudG9wID0gZXZlbnQucGFnZVlcblx0fSxcblxuXHQvL2Z1bmtjamEgd3lrb255d2FuYSBwb2RjemFzIHdjacWbbmllY2lhIHByenljaWtza3UgbXlzemtpICh3IHphbGXFvG5vxZtjaSBvZCBrbGlrbmnEmXRlZ28gZWxlbWVudHUgd3lrb251amVteSByw7PFvG5lIHJ6ZWN6eSlcblx0bW91c2Vtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHRzd2l0Y2godGhpcy5jbGlja19vYmope1xuXHRcdFx0Y2FzZSAncmlnaHRfcmVzaXplJzpcblx0XHRcdFx0Ly9yb3pzemVyemFuaWUgY2FudmFzYSB3IHByYXdvXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0dmFyIG5ld193aWR0aCA9IHRoaXMubGVmdCAtIHRoaXMucGFkZGluZ194IC0gcG9zaXRpb24ubGVmdFxuXHRcdFx0XHRpZihuZXdfd2lkdGggPCBzY3JlZW4ud2lkdGggLSAxMDApe1xuXHRcdFx0XHRcdGNhbnZhcy5yZXNpemVfd2lkdGgobmV3X3dpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2JvdHRvbV9yZXNpemUnOlxuXHRcdFx0XHQvL3ptaWVuaWFteSB3eXNva2/Fm8SHIGNhbnZhc2Fcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRjYW52YXMucmVzaXplX2hlaWdodCh0aGlzLnRvcCAtIHRoaXMucGFkZGluZ195IC0gcG9zaXRpb24udG9wKTtcblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdpbWFnZV9yZXNpemUnOlxuXG5cdFx0XHRcdGlmKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0XHR2YXIgeF9hY3R1YWwgPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1x0Ly9ha3R1YWxuYSBwb3p5Y2phIG15c3praVxuXHRcdFx0XHRcdHZhciBzdWJzdHJhY3QgPSBpbWFnZS54ICsgaW1hZ2Uud2lkdGggLSB4X2FjdHVhbCArIHRoaXMucGFkZGluZ194O1xuXHRcdFx0XHRcdHZhciBmYWNvciA9IGltYWdlLndpZHRoIC8gaW1hZ2UuaGVpZ2h0O1xuXG5cdFx0XHRcdFx0aWYgKGltYWdlLndpZHRoIC0gc3Vic3RyYWN0ID4gMTAwKXtcblx0XHRcdFx0XHRcdGltYWdlLndpZHRoIC09IHN1YnN0cmFjdDtcblx0XHRcdFx0XHRcdGltYWdlLmhlaWdodCAtPSBzdWJzdHJhY3QvZmFjb3I7XG5cdFx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG4iLCIvL29iaWVrdCBtw7N3acSFY3kgbmFtIG5hZCBqYWvEhSBrYXRlZ29yaWEgamVzdGXFm215XG52YXIgb25fY2F0ZWdvcnkgPSB7XG5cdFxuXHRjYW52YXNfb2Zmc2V0X3RvcCA6IDE4Nyxcblx0Y2FudmFzX29mZnNldF9sZWZ0IDogMTAsXG5cdG5hbWUgOiBudWxsLFxuXHRudW1iZXIgOiBudWxsLFxuXG5cdC8vZnVua2NqYSB6d3JhY2FqxIVjYSBha3R1YWxuxIUga2F0ZWdvcmnEmSBuYWQga3TDs3LEhSB6bmFqZHVqZSBzacSZIGt1cnNvclxuXHRzZXQgOiBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIHRoaXMuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSB0aGlzLmNhbnZhc19vZmZzZXRfdG9wO1xuXHRcdHZhciByb3cgPSBNYXRoLmNlaWwoIHRvcCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdC8vY29uc29sZS5sb2cobGVmdCx0b3AsdGhpcy5jYW52YXNfb2Zmc2V0X2xlZnQsdGhpcy5jYW52YXNfb2Zmc2V0X3RvcCk7XG5cdFx0aWYoKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICYmIChyb3cgJSAyICE9IDApKXtcblx0XHRcdHZhciBjb2x1bW4gPSBNYXRoLmNlaWwoIChsZWZ0ICsgKHBvaW50ZXJzLnNpemUvMikpLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeCkgKSAtIDE7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCBsZWZ0IC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cdFx0fVxuXG5cdFx0dHJ5e1xuXHRcdFx0dmFyIGNhdGVnb3J5X251bSA9IHBvaW50ZXJzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW4tMV07XG5cdFx0XHR2YXIgY2F0ZWdvcnlfbmFtZSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnlbY2F0ZWdvcnlfbnVtXVswXTtcblx0XHR9XG5cdFx0Y2F0Y2goZSl7XG5cdFx0XHR0aGlzLm5hbWUgPSBudWxsO1xuXHRcdFx0dGhpcy5udW1iZXIgPSBudWxsO1xuXHRcdH1cblx0XHRcblx0XHRpZigoY2F0ZWdvcnlfbmFtZSA9PSAncHVzdHknKSB8fCAoY2F0ZWdvcnlfbmFtZSA9PSAnZ3VtdWonKSl7XG5cdFx0XHR0aGlzLm5hbWUgPSBudWxsO1xuXHRcdFx0dGhpcy5udW1iZXIgPSBudWxsO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5uYW1lID0gY2F0ZWdvcnlfbmFtZTtcblx0XHRcdHRoaXMubnVtYmVyID0gY2F0ZWdvcnlfbnVtO1xuXHRcdH1cblxuXHR9XG5cbn1cblxuJCgnI2NhbnZhc193cmFwcGVyJykubW91c2VsZWF2ZShmdW5jdGlvbigpeyAkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDIwMCk7IH0pO1xuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgXG5cdG9uX2NhdGVnb3J5LnNldCgpO1xuXHRjbG91ZC51cGRhdGVfdGV4dCgpO1xuXHRjbG91ZC5zZXRfcG9zaXRpb24oKTtcbn0pO1xuXG4iLCJ2YXIgcGFsZXRzID0ge1xuICAvL3ZhbF9tYXggOiBudWxsLFxuICAvL3ZhbF9taW4gOiBudWxsLFxuICAvL3ZhbF9pbnRlcnZhbCA6IG51bGwsICAgXG4gIC8vcGFsZXRzX2FjdGl2ZSA6IDAsXG4gIC8vdmFsdWUgOiAtMSwgXG4gIC8vY2F0ZWdvcnkgOiAtMSxcblxuICAvL3BvZHN0YXdvd2UgcGFsZXR5IGtvbG9yw7N3ICggb3N0YXRuaWEgcGFsZXRhIGplc3QgbmFzesSFIHfFgmFzbsSFIGRvIHpkZWZpbmlvd2FuaWEgKVxuICBjb2xvcl9hcnIgOiBbXG4gICAgWycjZjdmY2ZkJywnI2U1ZjVmOScsJyNjY2VjZTYnLCcjOTlkOGM5JywnIzY2YzJhNCcsJyM0MWFlNzYnLCcjMjM4YjQ1JywnIzAwNmQyYycsJyMwMDQ0MWInXSxcbiAgICBbJyNmN2ZjZmQnLCcjZTBlY2Y0JywnI2JmZDNlNicsJyM5ZWJjZGEnLCcjOGM5NmM2JywnIzhjNmJiMScsJyM4ODQxOWQnLCcjODEwZjdjJywnIzRkMDA0YiddLFxuICAgIFsnI2Y3ZmNmMCcsJyNlMGYzZGInLCcjY2NlYmM1JywnI2E4ZGRiNScsJyM3YmNjYzQnLCcjNGViM2QzJywnIzJiOGNiZScsJyMwODY4YWMnLCcjMDg0MDgxJ10sXG4gICAgWycjZmZmN2VjJywnI2ZlZThjOCcsJyNmZGQ0OWUnLCcjZmRiYjg0JywnI2ZjOGQ1OScsJyNlZjY1NDgnLCcjZDczMDFmJywnI2IzMDAwMCcsJyM3ZjAwMDAnXSxcbiAgICBbJyNmZmY3ZmInLCcjZWNlN2YyJywnI2QwZDFlNicsJyNhNmJkZGInLCcjNzRhOWNmJywnIzM2OTBjMCcsJyMwNTcwYjAnLCcjMDQ1YThkJywnIzAyMzg1OCddLFxuICAgIFsnI2ZmZjdmYicsJyNlY2UyZjAnLCcjZDBkMWU2JywnI2E2YmRkYicsJyM2N2E5Y2YnLCcjMzY5MGMwJywnIzAyODE4YScsJyMwMTZjNTknLCcjMDE0NjM2J10sXG4gICAgWycjZjdmNGY5JywnI2U3ZTFlZicsJyNkNGI5ZGEnLCcjYzk5NGM3JywnI2RmNjViMCcsJyNlNzI5OGEnLCcjY2UxMjU2JywnIzk4MDA0MycsJyM2NzAwMWYnXSxcbiAgICBbJyNmZmY3ZjMnLCcjZmRlMGRkJywnI2ZjYzVjMCcsJyNmYTlmYjUnLCcjZjc2OGExJywnI2RkMzQ5NycsJyNhZTAxN2UnLCcjN2EwMTc3JywnIzQ5MDA2YSddLFxuICAgIFsnI2ZmZmZlNScsJyNmN2ZjYjknLCcjZDlmMGEzJywnI2FkZGQ4ZScsJyM3OGM2NzknLCcjNDFhYjVkJywnIzIzODQ0MycsJyMwMDY4MzcnLCcjMDA0NTI5J10sXG4gICAgWycjZmZmZmQ5JywnI2VkZjhiMScsJyNjN2U5YjQnLCcjN2ZjZGJiJywnIzQxYjZjNCcsJyMxZDkxYzAnLCcjMjI1ZWE4JywnIzI1MzQ5NCcsJyMwODFkNTgnXSxcbiAgICBbJyNmZmZmZTUnLCcjZmZmN2JjJywnI2ZlZTM5MScsJyNmZWM0NGYnLCcjZmU5OTI5JywnI2VjNzAxNCcsJyNjYzRjMDInLCcjOTkzNDA0JywnIzY2MjUwNiddLFxuICAgIFsnI2ZmZmZjYycsJyNmZmVkYTAnLCcjZmVkOTc2JywnI2ZlYjI0YycsJyNmZDhkM2MnLCcjZmM0ZTJhJywnI2UzMWExYycsJyNiZDAwMjYnLCcjODAwMDI2J10sXG4gICAgWycjZjdmYmZmJywnI2RlZWJmNycsJyNjNmRiZWYnLCcjOWVjYWUxJywnIzZiYWVkNicsJyM0MjkyYzYnLCcjMjE3MWI1JywnIzA4NTE5YycsJyMwODMwNmInXSxcbiAgICBbJyNmN2ZjZjUnLCcjZTVmNWUwJywnI2M3ZTljMCcsJyNhMWQ5OWInLCcjNzRjNDc2JywnIzQxYWI1ZCcsJyMyMzhiNDUnLCcjMDA2ZDJjJywnIzAwNDQxYiddLFxuICAgIFsnI2ZmZmZmZicsJyNmMGYwZjAnLCcjZDlkOWQ5JywnI2JkYmRiZCcsJyM5Njk2OTYnLCcjNzM3MzczJywnIzUyNTI1MicsJyMyNTI1MjUnLCcjMDAwMDAwJ10sXG4gICAgWycjZmZmNWViJywnI2ZlZTZjZScsJyNmZGQwYTInLCcjZmRhZTZiJywnI2ZkOGQzYycsJyNmMTY5MTMnLCcjZDk0ODAxJywnI2E2MzYwMycsJyM3ZjI3MDQnXSxcbiAgICBbJyNmY2ZiZmQnLCcjZWZlZGY1JywnI2RhZGFlYicsJyNiY2JkZGMnLCcjOWU5YWM4JywnIzgwN2RiYScsJyM2YTUxYTMnLCcjNTQyNzhmJywnIzNmMDA3ZCddLFxuICAgIFsnI2ZmZjVmMCcsJyNmZWUwZDInLCcjZmNiYmExJywnI2ZjOTI3MicsJyNmYjZhNGEnLCcjZWYzYjJjJywnI2NiMTgxZCcsJyNhNTBmMTUnLCcjNjcwMDBkJ10sXG4gICAgWycjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnXVxuICBdLFxuXG4gIHNob3cgOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuc2hvd19jb2xvcigpO1xuICAgIHRoaXMuc2hvd19wYWxldHMoKTtcbiAgICB0aGlzLnNob3dfc2VsZWN0KCk7XG4gICAgLy9sYXllcnMuZGF0YS5jb2xvcl9hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXTtcbiAgfSxcblxuICBzaG93X3NlbGVjdCA6IGZ1bmN0aW9uKCl7XG5cbiAgICAvL3d5xZt3aWV0bGFteSBwYW5lbCBkbyB3eWJvcnUga29sdW1ueSBrYXRlZ29yaWlcbiAgICBhZGRfaHRtbCA9ICc8b3B0aW9uIGNvbD1cIi0xXCI+d3liaWVyejwvb3B0aW9uPic7XG4gICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgIGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmKGV4Y2VsLmRhdGFbMF1baV0hPSAnJyl7XG4gICAgICAgIGlmKGkgPT0gbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKXtcbiAgICAgICAgICBhZGRfaHRtbCArPSAnPG9wdGlvbiBjb2w9XCInK2krJ1wiIHNlbGVjdGVkPicgK2V4Y2VsLmRhdGFbMF1baV0rICc8L29wdGlvbj4nOyAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICBhZGRfaHRtbCArPSAnPG9wdGlvbiBjb2w9XCInK2krJ1wiPicgK2V4Y2VsLmRhdGFbMF1baV0rICc8L29wdGlvbj4nOyAgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAkKCcjZXhjZWxfYm94IHNlbGVjdC5jYXRlZ29yeScpLmh0bWwoIGFkZF9odG1sICk7XG5cbiAgICAvL3d5xZt3aWV0bGFteSBwYW5lbCBkbyB3eWJvcnUga29sdW1ueSB3YXJ0b8WbY2lcbiAgICBhZGRfaHRtbCA9ICc8b3B0aW9uIGNvbD1cIi0xXCI+d3liaWVyejwvb3B0aW9uPic7XG4gICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgIGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmKGV4Y2VsLmRhdGFbMF1baV0hPSAnJyl7XG4gICAgICAgIGlmKGkgPT0gbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdKXtcbiAgICAgICAgICBhZGRfaHRtbCArPSAnPG9wdGlvbiBjb2w9XCInK2krJ1wiIHNlbGVjdGVkPicgK2V4Y2VsLmRhdGFbMF1baV0rICc8L29wdGlvbj4nOyAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICBhZGRfaHRtbCArPSAnPG9wdGlvbiBjb2w9XCInK2krJ1wiPicgK2V4Y2VsLmRhdGFbMF1baV0rICc8L29wdGlvbj4nOyAgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgJCgnI2V4Y2VsX2JveCBzZWxlY3QudmFsdWUnKS5odG1sKCBhZGRfaHRtbCApO1xuXG4gICAgLy9rb2xvcnVqZW15IG9kcG93aWVkbmlvIGV4Y2VsYVxuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZCcpLnJlbW92ZUNsYXNzKFwidmFsdWVcIik7XG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJjYXRlZ29yeVwiKTtcbiAgICBcbiAgICBpZiggbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdICE9IC0xKXtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwidmFsdWVcIik7XG4gICAgfVxuXG4gICAgaWYoIGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSl7XG4gICAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIH1cbiAgfSxcblxuICAvL3d5YmllcmFteSBrb2x1bW7EmSBrYXRlZ29yaWkgKG9ic3phcsOzdylcbiAgc2V0X2NhdGVnb3J5IDogZnVuY3Rpb24ob2JqKXtcbiAgICBsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gPSBwYXJzZUZsb2F0KCQoXCIjZXhjZWxfYm94IHNlbGVjdC5jYXRlZ29yeSBvcHRpb246c2VsZWN0ZWRcIikuYXR0cignY29sJykpO1xuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZCcpLnJlbW92ZUNsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkW2NvbD1cIicrKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJjYXRlZ29yeVwiKTtcbiAgICAvL2NhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG4gIH0sIFxuXG4gIC8vd3liaWVyYW15IGtvbHVtbmUgd2FydG/Fm2NpIGkgdXN0YXdpYW15IG5ham1uaWVqc3rEhSBpIG5handpxJlrc3rEhSB3YXJ0b8WbxIdcbiAgc2V0X3ZhbHVlIDogZnVuY3Rpb24ob2JqKXtcblxuICAgIHZhciB2YWx1ZV90bXAgPSBwYXJzZUZsb2F0KCQoXCIjZXhjZWxfYm94IHNlbGVjdC52YWx1ZSBvcHRpb246c2VsZWN0ZWRcIikuYXR0cignY29sJykpO1xuXG5cbiAgICAvL3phYmV6cGllY3plbmllIHByemVkIHd5YnJhbmllbSBrb2x1bW55IHphd2llcmFqxIVjZWogdGVrc3RcbiAgICB2YXIgY2hlY2sgPSB0cnVlO1xuICAgIGZvcih2YXIgaSA9IDEsIGlfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmICgoISQuaXNOdW1lcmljKFN0cmluZyhleGNlbC5kYXRhW2ldW3ZhbHVlX3RtcF0pLnJlcGxhY2UoJywnLCcuJykpKSAmJiAgKGV4Y2VsLmRhdGFbaV1bdmFsdWVfdG1wXSAhPSAnJykpeyBcblxuICAgICAgICBjaGVjayA9IGZhbHNlO1xuICAgICAgICBjb25zb2xlLmxvZygndG8gbmllIGplc3QgbGljemJhITogJytleGNlbC5kYXRhW2ldW3ZhbHVlX3RtcF0pO1xuICAgICAgIH1cbiAgICB9XG5cbiAgICAvL3NwcmF3ZHphbXkgY3p5IHcgemF6bmFjem9uZWoga29sdW1uaWUgem5hamR1amUgc2nEmSB3aWVyc3ogeiB0ZWtzdGVtXG4gICAgaWYoY2hlY2spe1xuICAgICAgLy9qZXNsaSBuaWUgd3liaWVyYW15IGRhbsSFIGtvbHVtbsSZXG4gICAgICBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gPSB2YWx1ZV90bXA7XG4gICAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcInZhbHVlXCIpO1xuICAgICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkW2NvbD1cIicrKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICAgIHRoaXMuc2V0X21pbl9tYXhfdmFsdWUoKTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgIC8vamXFm2xpIHRhayB6d3JhY2FteSBixYLEhWRcbiAgICAgIGFsZXJ0KCd3eWJyYW5hIGtvbHVtbmEgemF3aWVyYSB3YXJ0b8WbY2kgdGVrc3Rvd2UnKVxuICAgICAgdGhpcy5zaG93X3NlbGVjdCgpO1xuICAgIH1cblxuICB9LFxuXG4gIHNldF9taW5fbWF4X3ZhbHVlIDogZnVuY3Rpb24oKXtcbiAgICB2YXIgdG1wX3ZhbHVlID0gbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdO1xuICAgIGlmKHRtcF92YWx1ZSAhPSAtMSl7XG4gICAgICAvL3d5c3p1a3VqZW15IG5ham1uaWVqc3phIGkgbmFqd2nEmWtzesSFIHdhcnRvxZvEhyB3IGtvbHVtbmllIHdhcnRvxZtjaVxuICAgICAgaWYoIGxheWVycy52YWx1ZVt0bXBfdmFsdWVdICE9IC0xICl7XG4gICAgICAgIFxuICAgICAgICB2YXIgdG1wX21pbiA9IFN0cmluZyhleGNlbC5kYXRhWzFdW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJylcbiAgICAgICAgdmFyIHRtcF9tYXggPSBTdHJpbmcoZXhjZWwuZGF0YVsxXVt0bXBfdmFsdWVdKS5yZXBsYWNlKCcsJywnLicpO1xuICAgICAgICBmb3IodmFyIGkgPSAxLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICAgICAgaWYoKHRtcF9taW4gPiBTdHJpbmcoZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdKS5yZXBsYWNlKCcsJywnLicpKSAmJiAgKGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSAhPSBcIlwiKSkgdG1wX21pbiA9IFN0cmluZyhleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJyk7XG4gICAgICAgICAgaWYoKHRtcF9tYXggPCBTdHJpbmcoZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdKS5yZXBsYWNlKCcsJywnLicpKSAmJiAgKGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSAhPSBcIlwiKSkgdG1wX21heCA9IFN0cmluZyhleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIm1pbiBtYXggdmFsdWU6IFwiLHRtcF9taW4sIHRtcF9tYXgpO1xuICAgICAgfVxuXG4gICAgICBsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdID0gdG1wX21pblxuICAgICAgbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXSA9IHRtcF9tYXg7XG5cbiAgICAgIC8vYWt0dWFsaXp1amVteSB0YWJsaWPEmSBsZWdlbmRcbiAgICAgIGxlZ2VuZHMudXBkYXRlKCk7XG4gICAgfVxuICB9LFxuXG4gIHNob3dfY29sb3IgOiBmdW5jdGlvbigpe1xuICAgIC8vd3nFm3dpZXRsYW15IHBpZXJ3c3phbGlzdMSZIGtvbG9yw7N3XG4gICAgdmFyIGh0bWwgPSAnJztcblxuICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaTxpX21heDsgaSsrKXtcbiAgICAgIFxuICAgICAgaWYobGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwiYWN0aXZlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcl9hcnJbbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1dW2ldKydcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZDonK3RoaXMuY29sb3JfYXJyW2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXVtpXSsnXCI+PC9zcGFuPic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCgnI3BhbGV0cyAjc2VsZWN0JykuaHRtbCggaHRtbCApO1xuICAgIFxuICAgICQoJyNwYWxldHMgI3NlbGVjdCA+IHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBwYWxldHMuc2VsZWN0X2NvbG9yKHRoaXMpOyB9KTtcblxuICB9LFxuXG4gIHNob3dfcGFsZXRzIDogZnVuY3Rpb24oKXtcbiAgICBcbiAgICAvL3d5c3dpZXRsYW15IHdzenlzdGtpZSBwYWxldHlcbiAgICB2YXIgaHRtbCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyLmxlbmd0aDtpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBcbiAgICAgIGlmKGkgPT0gbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0pe1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cImFjdGl2ZVwiPic7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBodG1sICs9ICc8c3Bhbj4nO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMCwgal9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGogPCBqX21heDsgaisrKXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9yX2FycltpXVtqXSArICdcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICAgIGh0bWwgKz0gJzwvc3Bhbj4nO1xuXG4gICAgfVxuICAgICQoJyNwYWxldHMgI2FsbCcpLmh0bWwoIGh0bWwgKTtcbiAgICAkKCcjcGFsZXRzICNhbGwgPiBzcGFuJykuY2xpY2soZnVuY3Rpb24oKXsgcGFsZXRzLnNlbGVjdF9wYWxldHModGhpcyk7fSk7XG4gXG4gIH0sXG5cbiAgLy96YXpuYWN6YW15IGtvbmtyZXRuZSBrb2xvcnkgZG8gd3nFm3dpZXRsZW5pYVxuICBzZWxlY3RfY29sb3IgOiBmdW5jdGlvbihvYmope1xuICAgIGlmKChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcbiAgICAgIGlmKCAkKG9iaikuaGFzQ2xhc3MoJ2FjdGl2ZScpICl7XG4gICAgICAgIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdWyQob2JqKS5pbmRleCgpXSA9IDA7XG4gICAgICAgICQob2JqKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVskKG9iaikuaW5kZXgoKV0gPSAxO1xuICAgICAgICAkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJzZV9jb2xvcigpO1xuICAgICAgcGFsZXRzLnNldF9taW5fbWF4X3ZhbHVlKCk7XG4gICAgfVxuICB9LFxuXG4gIC8vZG9kYWplbXkgZG8gdGFibGljeSBha3R5d255Y2gga29sb3LDs3cgdGUga3TDs3JlIHPEhSB6YXpuYWN6b25lXG4gIHBhcnNlX2NvbG9yIDogZnVuY3Rpb24oKXtcbiAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IFtdO1xuICAgICBmb3IgKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGk8aV9tYXg7IGkrKyl7XG5cbiAgICAgIGlmKCAkKCcjcGFsZXRzICNzZWxlY3Qgc3BhbicpLmVxKGkpLmhhc0NsYXNzKCdhY3RpdmUnKSApe1xuICAgICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5wdXNoKCByZ2IyaGV4KCQoJyNwYWxldHMgI3NlbGVjdCBzcGFuJykuZXEoaSkuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJykpICk7XG4gICAgICB9XG4gICAgIH1cbiAgICAvL2NhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuICAgIC8vZnVua2NqYSBwb21vY25pY3phXG4gICAgZnVuY3Rpb24gcmdiMmhleChyZ2IpIHtcbiAgICAgIHJnYiA9IHJnYi5tYXRjaCgvXnJnYlxcKChcXGQrKSxcXHMqKFxcZCspLFxccyooXFxkKylcXCkkLyk7XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIGhleCh4KSB7XG4gICAgICAgIHJldHVybiAoXCIwXCIgKyBwYXJzZUludCh4KS50b1N0cmluZygxNikpLnNsaWNlKC0yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIiNcIiArIGhleChyZ2JbMV0pICsgaGV4KHJnYlsyXSkgKyBoZXgocmdiWzNdKTtcbiAgICB9XG4gICAgbGVnZW5kcy51cGRhdGUoKTtcbiAgfSxcblxuICAvL3phem5hY3phbXkgcGFsZXRlIGtvbG9yw7N3XG4gIHNlbGVjdF9wYWxldHMgOiBmdW5jdGlvbihvYmope1xuICAgIGlmKChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcbiAgICAgICQoJyNwYWxldHMgI2FsbCA+IHNwYW4nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSAkKG9iaikuaW5kZXgoKTtcbiAgICAgIFxuICAgICAgLy9ha3R1YWxpenVqZW15IHBhbGV0xJkgYWt0eXdueWNoIGtvbG9yw7N3XG4gICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IFtdO1xuICAgICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgICAgICAgaWYobGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG4gICAgICAgICAgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ucHVzaCggcGFsZXRzLmNvbG9yX2FycltsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXV1baV0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL2FrdHVhbGl6dWplbXkga29sb3J5IHcgbGVnZW5kemllXG4gICAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgICBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVszXSA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW2ldO1xuICAgICAgfVxuXG4gICAgICAvL3d5xZt3aWV0bGFteSBva25hIGtvbG9yw7N3IGRvIHphem5hY3plbmlhXG4gICAgICBwYWxldHMuc2hvd19jb2xvcigpO1xuICAgICAgLy93ecWbd2lldGxhbXkgb2tubyB6IGxlZ2VuZGFtaVxuICAgICAgbGVnZW5kcy5zaG93KCk7XG5cbiAgICAgIC8vYWt0dWFsaXp1amVteSBrb2xvcnkgbmEgbWFwaWVcbiAgICAgIGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG4gICAgfVxuICB9XG59XG5cbi8vemRhcnplbmlhIGRvdHljesSFY2UgcGFsZXRcbiQoJyNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5JykuY2hhbmdlKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZXRfY2F0ZWdvcnkodGhpcyk7IH0pO1xuJCgnI2V4Y2VsX2JveCBzZWxlY3QudmFsdWUnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgcGFsZXRzLnNldF92YWx1ZSh0aGlzKTsgfSk7IiwiLy9tZW51IHBvaW50ZXJcbnZhciBwb2ludGVycyA9IHtcblx0c2hvd19hbGxfcG9pbnQgOiB0cnVlLFxuXHRzaG93X2JvcmRlciA6IGZhbHNlLFxuXHRwYWRkaW5nX3ggOiAxLFxuXHRwYWRkaW5nX3kgOiAxLFxuXHR0cmFuc2xhdGVfbW9kdWxvIDogZmFsc2UsXG5cdHNpemU6IDEwLFxuXHRtYWluX2tpbmQgOiAnc3F1YXJlJyxcblx0a2luZHMgOiBBcnJheSgnc3F1YXJlJywnY2lyY2xlJywnaGV4YWdvbicsJ2hleGFnb24yJyksXG5cdGNvbG9yX2JvcmRlcjogJyMzMzMnLFxuXHRwb2ludGVycyA6IEFycmF5KCksIC8vcG9pbnRlcnMucG9pbnRlcnNbcnphZF1ba29sdW1uYV0gOiBrYXRlZ29yaWFbbnVtZXJdXG5cblx0bGFzdF9jb2x1bW4gOiBudWxsLFx0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRsYXN0X3JvdyA6IG51bGwsXHQvL3dpZXJzeiBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblxuXHRkcmF3X2JvcmRlcjogZnVuY3Rpb24obmV4dCl7XG5cblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ194LFxuXHRcdFx0XHRoZWlnaHRfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ195LFxuXHRcdFx0XHRub25lX2NvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCIsXG5cdFx0XHRcdGJvcmRlciA9IHt9LFxuXHRcdFx0XHRkYXRhID0ge307XG5cdFx0XG5cdFx0dmFyIG5leHQgPSBuZXh0IHx8IGZhbHNlO1xuXG5cdFx0aWYoKHRoaXMubWFpbl9raW5kID09ICdzcXVhcmUnKSB8fCAodGhpcy5tYWluX2tpbmQgPT0gJ2NpcmNsZScpIHx8ICh0aGlzLm1haW5fa2luZCA9PSAnaGV4YWdvbicpKXtcblx0XHRcdFx0XG5cdFx0XHQvL2NhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3JfYm9yZGVyO1xuXHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGE9MTtcblx0XHRcdC8vY2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMTI4LDAsMCwxKSc7XG5cblx0XHRcdGlmKCFuZXh0KXtcblx0XHRcdFx0Ly9jYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYT0xO1xuXHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwxKSc7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHQvL2NhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhPTAuNTtcblx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xvcl9ib3JkZXI7XG5cdFx0XHR9XG5cblxuXG5cdFx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKXtcblxuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IDApe1xuXG5cdFx0XHRcdFx0XHRib3JkZXIgPSB7XG5cdFx0XHRcdFx0XHRcdHRvcDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHRvcF9sZWZ0IDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHRvcF9yaWdodCA6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRyaWdodDogZmFsc2Vcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdC8vcnlzdWplbXkgcG/FgsOzd2thbWlcblx0XHRcdFx0XHRcdC8vc3ByYXdkemFteSBjenkgbWFteSB3xYLEhWN6b27EhSBvcGNqZSBtb2R1bG9cblx0XHRcdFx0XHRcdGlmKHJvdy0xID49IDApe1xuXHRcdFx0XHRcdFx0XHRpZighcG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyl7XG5cdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgbmllIHRvIHNwcmF3ZHphbXkgdHJhZHljeWpuaWUgd8WCxIVjem9uxIUgZ3JhbmljxJkgbmFkIFxuXHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyLnRvcCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdFx0Ly9qZcWbbGkgdGFrIHRvOiBzcHJhd2R6YW15IGN6eSB3aWVyc3ogamVzdCBwcnplc3VuacSZdHlcblx0XHRcdFx0XHRcdFx0XHRpZihyb3cgJSAyID09IDApe1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKGNvbHVtbi0xKSA+IDApe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbl0gIT0gdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pKXtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wX2xlZnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uKzFdICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uKzFdICE9IHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfcmlnaHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbi0xXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbi0xXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wX2xlZnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYoKGNvbHVtbisxKSA8PSBjYW52YXMuYWN0aXZlX2NvbHVtbil7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfcmlnaHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XHRcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYoKGNvbHVtbisxKSA8PSBjYW52YXMuYWN0aXZlX2NvbHVtbil7XG5cdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uKzFdICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbisxXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdGJvcmRlci5yaWdodCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZGF0YSA9IHtcblx0XHRcdFx0XHRcdFx0eCA6IGNvbHVtbip3aWR0aF9wb2ludGVyLFxuXHRcdFx0XHRcdFx0XHR5IDogcm93KmhlaWdodF9wb2ludGVyLFxuXHRcdFx0XHRcdFx0XHRzaXplIDogdGhpcy5zaXplLFxuXHRcdFx0XHRcdFx0XHRib3JkZXIgOiBib3JkZXIsXG5cdFx0XHRcdFx0XHRcdGxpbmVfd2lkdGhfeCA6IHBvaW50ZXJzLnBhZGRpbmdfeCxcblx0XHRcdFx0XHRcdFx0bGluZV93aWR0aF95IDogcG9pbnRlcnMucGFkZGluZ195LFxuXHRcdFx0XHRcdFx0XHR0X21vZHVsbyA6IGZhbHNlXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmKCAocm93ICUgMiA9PSAwKSAmJiAocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgKXtcblx0XHRcdFx0XHRcdFx0ZGF0YS54ID0gY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmKCFuZXh0KXtcblx0XHRcdFx0XHRcdFx0ZmlndXJlcy5zcXVhcmVfYm9yZGVyX2JpZyhkYXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGZpZ3VyZXMuc3F1YXJlX2JvcmRlcl9zbWFsbChkYXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cdFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKCFuZXh0KXtcblx0XHRcdHRoaXMuZHJhd19ib3JkZXIodHJ1ZSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vcnlzb3dhbmllIHdzenlzdGtpY2ggcHVua3TDs3dcblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHdpZHRoX3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHR2YXIgaGVpZ2h0X3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiXG5cblx0XHRpZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRcdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93Kyspe1xuXHRcdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1x0XHRcdFx0XG5cblx0XHRcdFx0XHRpZiggKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IG1lbnVfdG9wLmNhdGVnb3J5KSAmJiAobWVudV90b3AuY2F0ZWdvcnkgIT0gMCkgKXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC4yXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKHRoaXMuc2hvd19ib3JkZXIpe1xuXHRcdFx0dGhpcy5kcmF3X2JvcmRlcihmYWxzZSk7XG5cdFx0fVxuXG5cdH0sXG5cblx0Ly90d29yenlteSB0YWJsaWNlIHBvbnRlcsOzdyAoamXFm2xpIGpha2nFmyBwb250ZXIgaXN0bmllamUgem9zdGF3aWFteSBnbywgdyBwcnp5cGFka3UgZ2R5IHBvaW50ZXJhIG5pZSBtYSB0d29yenlteSBnbyBuYSBub3dvKVxuXHRjcmVhdGVfYXJyYXkgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5hY3RpdmVfcm93ID0gcGFyc2VJbnQoIGNhbnZhcy5oZWlnaHRfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3kpICk7XG5cdFx0Y2FudmFzLmFjdGl2ZV9jb2x1bW4gPSBwYXJzZUludCggY2FudmFzLndpZHRoX2NhbnZhcyAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXG5cdFx0aWYoICh0aGlzLnBvaW50ZXJzLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfcm93KSB8fCAodGhpcy5wb2ludGVyc1swXS5sZW5ndGggPCBjYW52YXMuYWN0aXZlX2NvbHVtbikgKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddID09IHVuZGVmaW5lZCkgdGhpcy5wb2ludGVyc1tyb3ddID0gbmV3IEFycmF5KCk7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gdW5kZWZpbmVkKVx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZV9wb2ludCA6IGZ1bmN0aW9uKHkseCx5X2xhc3QseF9sYXN0KXtcblxuXHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblxuXHRcdC8vd3l6bmFjemVuaWUgcsOzd25hbmlhIHByb3N0ZWpcblx0XHRpZiggKCh5X2xhc3QgIT0geSkgfHwgKHhfbGFzdCAhPSB4KSkgJiYgKHlfbGFzdCAhPSBudWxsKSAmJiAoeF9sYXN0ICE9IG51bGwpICl7XG5cdFx0XHR2YXIgYSA9ICh5X2xhc3QgLSB5KSAvICh4X2xhc3QgLSB4KTtcblx0XHRcdHZhciBiID0geSAtIGEqeDtcblxuXHRcdFx0aWYoeF9sYXN0ID4geCl7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHg7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIGNvbF90byA9IHg7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHhfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0aWYoeV9sYXN0ID4geSl7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHk7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHJvd190byA9IHk7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHlfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJvdyA9IG51bGw7XG5cdFx0XHRmb3IodmFyIGNvbCA9IGNvbF9mcm9tOyBjb2wgPD0gY29sX3RvOyBjb2wrKylcblx0XHRcdHtcblx0XHRcdFx0cm93ID0gcGFyc2VJbnQoIGEqY29sK2IgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHJvdykpIHJvdyA9IHk7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjb2wgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciByb3cgPSByb3dfZnJvbTsgcm93IDw9IHJvd190bzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbCA9IHBhcnNlSW50KCAocm93LWIpL2EgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKGNvbCkpIGNvbCA9IHg7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0fVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
