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
					pointers.draw_border();
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
			var category_num = pointers.pointers[row-1][column-1] 
			var category_name = categories.category[category_num][0]
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNvbG9yX3BpY2tlci5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJnbG9iYWwuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vZGVscy5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InByb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2N6eXN6Y3plbmllIGkgcnlzb3dhbmllIHBvIGNhbnZhc2llXG52YXIgY2FudmFzID0ge1xuXHRcblx0c2NhbGUgOiAxMDAsXG5cdHdpZHRoX2NhbnZhcyA6IDcwMCxcblx0aGVpZ2h0X2NhbnZhcyA6IDQwMCxcblx0Y2FudmFzIDogbnVsbCxcblx0Y29udGV4dCA6IG51bGwsXG5cdHRodW1ibmFpbCA6IG51bGwsXG5cdHRpdGxlX3Byb2plY3QgOiAnbm93eSBwcm9qZWt0JyxcblxuXHRjb250ZXh0X3ggOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF95IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB5XG5cdGNvbnRleHRfbmV3X3ggOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfbmV3X3kgOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB5XG5cblx0b2Zmc2V0X2xlZnQgOiBudWxsLFxuXHRvZmZzZXRfdG9wIDogbnVsbCxcblx0YWN0aXZlX3JvdyA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cdGFjdGl2ZV9jb2x1bW4gOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXG5cdHRodW1ibmFpbCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbl9jYW52YXNcIik7XG5cdFx0dmFyIGRhdGFVUkwgPSBjYW52YXMudG9EYXRhVVJMKCk7XG5cdFx0Y29uc29sZS5sb2coZGF0YVVSTCk7XG5cdH0sXG5cblx0Ly9yeXN1amVteSBjYW52YXMgemUgemRqxJljaWVtXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGlmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkgIGltYWdlLmRyYXcoKTtcblx0fSxcblxuXHRkcmF3X3RodW1uYWlsIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy50aHVtYm5haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdH0sXG5cblx0Ly9yZXNldHVqZW15IHTFgm8gemRqxJljaWFcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHR9LFxuXG5cdC8vIGN6ecWbY2lteSBjYcWCZSB6ZGrEmWNpZSBuYSBjYW52YXNpZVxuXHRjbGVhciA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0XHQvL3RoaXMuY29udGV4dC5maWxsUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0fSxcblxuXHRyZXNpemVfd2lkdGggOiBmdW5jdGlvbihuZXdfd2lkdGgpe1xuXHRcdHRoaXMud2lkdGhfY2FudmFzID0gbmV3X3dpZHRoO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyx0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IHRoaXMud2lkdGhfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwodGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlICsgJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0fSxcblxuXHRyZXNpemVfaGVpZ2h0IDogZnVuY3Rpb24obmV3X2hlaWdodCl7XG5cdFx0dGhpcy5oZWlnaHRfY2FudmFzID0gbmV3X2hlaWdodDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3MoeydoZWlnaHQnOiB0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwodGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSsnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpOyAvLyBha3R1YWxpenVqZW15IGRhbmUgb2Rub8WbbmllIHJvem1pYXLDs3cgY2FudmFzYSB3IG1lbnUgdSBnw7NyeVxuXHRcdC8vdGhpcy5kcmF3KCk7IC8vcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0fSxcblxuXHRzZXRfZGVmYXVsdCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cblx0XHRjYW52YXMuc2NhbGUgPSAxMDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3Qga2F0ZWdvcmlpIGRvZGFuaWUgLyBha3R1YWxpemFjamEgLyB1c3VuacSZY2llIC8gcG9rYXphbmllIGthdGVnb3JpaVxudmFyIGNhdGVnb3JpZXMgPSB7XG5cdFxuXHQvL2NhdGVnb3J5IDogbmV3IEFycmF5KFsncHVzdHknLCcjODA4MDgwJ10pLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWUgPSBBcnJheSgkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoKSwnI2ZmMDAwMCcpO1xuXHRcdCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgnJyk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2gobmFtZSk7XG5cdFx0bWVudV90b3AuY2F0ZWdvcnkgPSAodGhpcy5jYXRlZ29yeS5sZW5ndGgtMSk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbihpbmRleCxuYW1lKXtcblx0XHR0aGlzLmNhdGVnb3J5W2luZGV4XVswXSA9IG5hbWU7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXG5cdC8vYWt0dWFsaXp1amVteSB0YWJsaWPEmSBrb2xvcsOzd1xuXHR1cGRhdGVfY29sb3IgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9tb8W8bGl3YSBha3R1YWxpemFjamEgamVkeW5pZSB3IHByenlwYWRrdSB3eWJyYW5pYSBrb25rcmV0bmVqIGtvbHVtbnkgd2FydG/Fm2NpIGkga2F0ZWdvcmlpIHcgZXhjZWx1XG5cdFx0aWYoKGNydWQubWFwX2pzb24ubGVuZ3RoID4gMCkgJiYgKGV4Y2VsLmRhdGEubGVuZ3RoID4gMCkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuXG5cdFx0XHRmb3IgKHZhciBpX2NhdGVnb3J5ID0gMCwgaV9jYXRlZ29yeV9tYXggPVx0bGF5ZXJzLmNhdGVnb3J5X25hbWUubGVuZ3RoOyBpX2NhdGVnb3J5IDwgaV9jYXRlZ29yeV9tYXg7IGlfY2F0ZWdvcnkrKyl7XG5cdFx0XHRcdHZhciBuYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWVbaV9jYXRlZ29yeV07XG5cdFx0XHRcdHZhciBmaW5kID0gZmFsc2U7XG5cblx0XHRcdFx0Zm9yICh2YXIgaV9sYXllcnMgPSAwLCBpX2xheWVyc19tYXggPSBsYXllcnMubGlzdC5sZW5ndGg7IGlfbGF5ZXJzIDwgaV9sYXllcnNfbWF4OyBpX2xheWVycysrKXtcblx0XHRcdFx0XHRmb3IgKHZhciBpX2V4ZWwgPSAwLCBpX2V4ZWxfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfZXhlbCA8IGlfZXhlbF9tYXg7IGlfZXhlbCsrKXtcblx0XHRcdFx0XHRcdGlmKCggU3RyaW5nKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMuY2F0ZWdvcnlbaV9sYXllcnNdXSkudG9Mb3dlckNhc2UoKSA9PSBTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSkgJiYgKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMuY2F0ZWdvcnlbaV9sYXllcnNdXSAhPSAnJykpe1xuXG5cdFx0XHRcdFx0XHRcdGZpbmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB6bmFsZcW6bGnFm215IGthdGVnb3JpxJkgdyBleGNlbHVcblx0XHRcdFx0XHRcdFx0dmFyIHZhbHVlID0gU3RyaW5nKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMudmFsdWVbaV9sYXllcnNdXSkucmVwbGFjZSgnLCcsJy4nKTtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXhjZWwuZGF0YVtpX2V4ZWxdW2xheWVycy52YWx1ZVtpX2xheWVyc11dKycgfCAnK3ZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdGZvciAoIHZhciBpX2xlZ2VuZHMgPSAwLCBpX2xlZ2VuZHNfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdLmxlbmd0aDsgaV9sZWdlbmRzIDwgaV9sZWdlbmRzX21heDsgaV9sZWdlbmRzKysgKXtcblx0XHRcdFx0XHRcdFx0XHRpZiggKHZhbHVlID49IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNdWzBdKSAmJiAodmFsdWUgPD0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdW2lfbGVnZW5kc11bMV0pICl7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2plxZtsaSB6bmFsZcW6bGlzbXlcblx0XHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdW2lfbGVnZW5kc11bM107XG5cdFx0XHRcdFx0XHRcdFx0XHRpX2xlZ2VuZHMgPSBpX2xlZ2VuZHNfbWF4O1xuXHRcdFx0XHRcdFx0XHRcdFx0aV9leGVsID0gaV9leGVsX21heDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB3YXJ0b8WbxIcgd3ljaG9kemkgcG96YSBza2FsZSB1IHRhayBwcnp5cGlzdWplbXkgamVqIG9kcG93aWVkbmkga29sb3Jcblx0XHRcdFx0XHRcdFx0aWYodmFsdWUgPCBsYXllcnMubGVnZW5kc1tpX2xheWVyc11bMF1bMF0pe1xuXHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdWzBdWzNdO1xuXHRcdFx0XHRcdFx0XHR9XHRcblxuXHRcdFx0XHRcdFx0XHRpZih2YWx1ZSA+IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNfbWF4LTFdWzFdKXtcblx0XHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2lfbGF5ZXJzXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNfbWF4LTFdWzNdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSBkYW55IGtyYWogdyBleGNlbHUgbWEgd2FydG/Fm8SHIG51bGwgZG9tecWbbG5pZSBvdHJ6eW11amUga29sb3IgYmlhxYJ5XG5cdFx0XHRcdFx0XHRcdGlmKHZhbHVlID09IG51bGwpe1xuXHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gJyNmZmYnO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL3cgcHJ6eXBhZGt1IGdkeSBkYW55IGtyYWogbmllIHd5c3TEmXB1amUgdyBwbGlrdSBleGNlbCBvdHJ6eW11amUga29sb3IgYmlhxYJ5XG5cdFx0XHRcdFx0aWYoIWZpbmQpe1xuXHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tpX2xheWVyc11baV9jYXRlZ29yeV0gPSAnI2ZmZic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vcG8gemFrdHVhbGl6b3dhbml1IGtvbG9yw7N3IHcga2F0ZWdvcmlhY2ggcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0XHRjYW52YXMuZHJhdygpO1xuXG5cdH0sXG5cblx0cmVtb3ZlIDogZnVuY3Rpb24oaWQpe1xuXHRcdHZhciB0aCA9IHRoaXM7XG5cblx0XHQkLmVhY2godGhpcy5jYXRlZ29yeSxmdW5jdGlvbihpbmRleCx2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA+PSBpZCl7XG5cdFx0XHRcdHRoLmNhdGVnb3J5W2luZGV4XSA9IHRoLmNhdGVnb3J5W2luZGV4KzFdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBwb2ludGVycy5wb2ludGVycy5sZW5ndGg7IHJvdysrKXtcblx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgcG9pbnRlcnMucG9pbnRlcnNbcm93XS5sZW5ndGg7IGNvbHVtbisrKXtcblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gaWQpe1xuXHRcdFx0XHRcdHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPiBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gcGFyc2VJbnQocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSAtIDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuY2F0ZWdvcnkucG9wKCk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblxuXHRcdC8vcnlzdWplbXkgbmEgbm93xIUgY2FudmFzXG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRzaG93X2xpc3QgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGFkZF9jYXRlZ29yeSA9IFwiPHRhYmxlPlwiO1xuXHRcdC8vdmFyIGFkZF9zZWxlY3QgPSc8b3B0aW9uIG5hbWU9XCIwXCI+cHVzdHk8L29wdGlvbj4nO1xuXHRcdHZhciBhZGRfc2VsZWN0ID0gJyc7XG5cblx0XHRmb3IodmFyIGkgPSB0aGlzLmNhdGVnb3J5Lmxlbmd0aDsgaSA+IDE7IGktLSl7XG5cdFx0XHRhZGRfY2F0ZWdvcnkgKz0gJzx0cj48dGQ+PHNwYW4+JysoaS0xKSsnPC9zcGFuPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJjYXRlZ29yeV9uYW1lXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIiB2YWx1ZT1cIicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMF0rJ1wiIC8+PC90ZD48dGQ+PGRpdiBjbGFzcz1cImNvbG9ycGlja2VyX2JveFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjonK3RoaXMuY2F0ZWdvcnlbKGktMSldWzFdKydcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiPjwvZGl2PjwvdGQ+PHRkPjxidXR0b24gY2xhc3M9XCJyZW1vdmVcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiPnVzdW48L2J1dHRvbj48L3RkPjwvdHI+Jztcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gbmFtZT1cIicrKGktMSkrJ1wiPicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXG5cdFx0aWYobWVudV90b3AuY2F0ZWdvcnkgPT0gMCl7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIHNlbGVjdGVkIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiMFwiPicrdGhpcy5jYXRlZ29yeVswXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cblx0XHRhZGRfY2F0ZWdvcnkgKz0gXCI8L3RhYmxlPlwiO1xuXG5cdFx0JCgnI2NhdGVnb3J5X2JveCAjbGlzdCcpLmh0bWwoYWRkX2NhdGVnb3J5KTtcblx0XHQkKCdzZWxlY3QjY2hhbmdlX2NhdGVnb3J5JykuaHRtbChhZGRfc2VsZWN0KTtcblxuXHRcdGNvbG9ycGlja2VyLmFkZCgpO1xuXHR9XG59XG4iLCJjbG91ZCA9IHtcblxuXHRzZXRfdGV4dGFyZWEgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjbG91ZCAuY2xvdWRfdGV4dCcpLnZhbCggbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdICk7XG5cdH0sXG5cblx0LypnZXRfdGV4dGFyZWEgOiBmdW5jdGlvbih0ZXh0X3RtcCl7XG5cblx0XHQvL3ZhciB0ZXh0X3RtcCA9ICQob2JqKS52YWwoKTtcblxuXHRcdGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSA9IHRleHRfdG1wO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gPSBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0ucmVwbGFjZSgneycrZXhjZWwuZGF0YVswXVtpXSsnfScsJ1wiK2V4Y2VsLmRhdGFbdG1wX3Jvd11bJytpKyddXCIrJyk7XG5cdFx0fVxuXG5cdFx0bGF5ZXJzLmNsb3VkX3BhcnNlcltsYXllcnMuYWN0aXZlXSA9ICdcIicrdGV4dF90bXArJ1wiJztcblx0fSwqL1xuXG5cdC8vdXN0YXdpYW15IHBvcHJhd27EhSBwb3p5Y2rEmSBkeW1rYVxuXHRzZXRfcG9zaXRpb24gOiBmdW5jdGlvbigpe1xuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfbGVmdDtcblx0XHR2YXIgdG9wID0gbW91c2UudG9wIC0gb25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF90b3A7XG5cblx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5jc3Moe3RvcDpwYXJzZUludCh0b3AgLSAkKFwiI2NhbnZhc19jbG91ZFwiKS5oZWlnaHQoKS0zMCkrJ3B4JyxsZWZ0OmxlZnQrJ3B4J30pO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB3ecWbd2lldGxlbmllIGR5bWthIHogb2Rwb3dpZWRuacSFIHphd2FydG/Fm2NpxIVcblx0dXBkYXRlX3RleHQgOiBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdGlmKChvbl9jYXRlZ29yeS5uYW1lICE9IFwiXCIpICYmIChvbl9jYXRlZ29yeS5uYW1lICE9ICdudWxsJykpe1xuXG5cdFx0XHR2YXIgdG1wX3JvdyA9IG51bGw7XG5cdFx0XHR2YXIgZmluZCA9IDA7XG5cdFx0XHRmb3IodmFyIGlfcm93ID0gMCwgaV9yb3dfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfcm93IDwgaV9yb3dfbWF4OyBpX3JvdysrICl7XG5cdFx0XHRcdGlmKFN0cmluZyhvbl9jYXRlZ29yeS5uYW1lKS50b0xvd2VyQ2FzZSgpID09IFN0cmluZyhleGNlbC5kYXRhW2lfcm93XVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dKS50b0xvd2VyQ2FzZSgpKXtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR0aGlzLnNldF9wb3NpdGlvbigpO1xuXHRcdFx0XHRcdHZhciB0ZXh0X3RtcCA9IGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXTtcblxuXHRcdFx0XHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0XHRcdHRleHRfdG1wID0gdGV4dF90bXAucmVwbGFjZSgneycrZXhjZWwuZGF0YVswXVtpXSsnfScsZXhjZWwuZGF0YVtpX3Jvd11baV0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vZG9waWVybyBqZcWbbGkgZHltZWsgbWEgbWllxIcgamFrYcWbIGtvbmtyZXRuxIUgemF3YXJ0b8WbxIcgd3nFm3dpZXRsYW15IGdvXG5cdFx0XHRcdFx0aWYodGV4dF90bXAhPVwiXCIpe1xuXHRcdFx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZUluKDApO1xuXHRcdFx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuaHRtbCh0ZXh0X3RtcCk7XG5cdFx0XHRcdFx0XHRmaW5kID0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9qZcWbbGkgbmllIHpuYWxlemlvbm8gb2Rwb3dpZWRuaWVqIGthdGVnb3JpaVxuXHRcdFx0aWYgKCFmaW5kKSB7IFxuXHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDApO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDApO1xuXHRcdH1cblx0fVxuXG59XG5cbi8qXG4kKCcjY2xvdWQgLmNsb3VkX3RleHQnKS5rZXl1cChmdW5jdGlvbigpe1xuXG5cdGNsb3VkLmdldF90ZXh0YXJlYSh0aGlzKTtcblxufSkgOyovIiwiLy9zYW1hIG5hendhIHdpZWxlIHTFgnVtYWN6eSBwbyBwcm9zdHUgY29sb3JwaWNrZXJcbnZhciBjb2xvcnBpY2tlciA9IHtcblxuXHRyb3cgOiBudWxsLFxuXHRjb2xfbnVtIDogbnVsbCxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJy5jb2xvcnBpY2tlcl9ib3gnKS5Db2xvclBpY2tlcih7XG5cblx0XHRcdGNvbG9yOiAnI2ZmMDAwMCcsXG5cdFx0XHRcblx0XHRcdG9uU2hvdzogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHRpZigkKGNvbHBrcikuY3NzKCdkaXNwbGF5Jyk9PSdub25lJyl7XG5cdFx0XHRcdFx0JChjb2xwa3IpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdGNvbG9ycGlja2VyLnJvdyA9ICQodGhpcykuYXR0cigncm93Jyk7XG5cdFx0XHRcdFx0Y29sb3JwaWNrZXIuY29sX251bSA9ICQodGhpcykuYXR0cignY29sX251bScpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRcblx0XHRcdG9uSGlkZTogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHQkKGNvbHBrcikuZmFkZU91dCgyMDApO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0XG5cdFx0XHRvbkNoYW5nZTogZnVuY3Rpb24gKGhzYiwgaGV4LCByZ2IpIHtcblx0XHRcdFx0JCgnI2xlZ2VuZHMgdHIgdGRbcm93PVwiJytjb2xvcnBpY2tlci5yb3crJ1wiXScpLmNzcygnYmFja2dyb3VuZENvbG9yJywgJyMnICsgaGV4KTtcblx0XHRcdFx0XG4gXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbIHBhbGV0cy5jb2xvcl9hcnIubGVuZ3RoLTEgXSA9IHBhbGV0cy5jb2xvcl9hcnJbIGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdIF0uc2xpY2UoKVxuXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbIHBhbGV0cy5jb2xvcl9hcnIubGVuZ3RoLTEgXVtjb2xvcnBpY2tlci5jb2xfbnVtXSA9ICcjJyArIGhleDtcblx0XHRcdFx0XHQvL2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IHBhbGV0cy5jb2xvcl9hcnIubGVuZ3RoIC0xO1xuXHRcdFx0XHRcdGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW2NvbG9ycGlja2VyLnJvd10gPSAgJyMnICsgaGV4O1xuXHRcdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2NvbG9ycGlja2VyLnJvd11bM10gPSAgJyMnICsgaGV4O1xuXG5cdFx0XHRcdFx0cGFsZXRzLnNob3coKTtcbiAgICAgIFx0XHRjYXRlZ29yaWVzLnVwZGF0ZV9jb2xvcigpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdGNvbG9yX2JvcmRlciA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnLmNvbG9yX2JvcmRlcicpLkNvbG9yUGlja2VyKHtcblxuXHRcdG9uQmVmb3JlU2hvdzogZnVuY3Rpb24gKCkge1xuXHRcdFx0JCh0aGlzKS5Db2xvclBpY2tlclNldENvbG9yKHBvaW50ZXJzLmNvbG9yX2JvcmRlcik7XG5cdFx0fSxcblx0XHRcdFx0XG5cdFx0XHRvblNob3c6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0aWYoJChjb2xwa3IpLmNzcygnZGlzcGxheScpPT0nbm9uZScpe1xuXHRcdFx0XHRcdCQoY29scGtyKS5mYWRlSW4oMjAwKTtcblx0XHRcdFx0XHQvL2NvbG9ycGlja2VyLnJvdyA9ICQodGhpcykuYXR0cigncm93Jyk7XG5cdFx0XHRcdFx0Ly9jb2xvcnBpY2tlci5jb2xfbnVtID0gJCh0aGlzKS5hdHRyKCdjb2xfbnVtJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdFxuXHRcdFx0b25IaWRlOiBmdW5jdGlvbiAoY29scGtyKSB7XG5cdFx0XHRcdCQoY29scGtyKS5mYWRlT3V0KDIwMCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRcblx0XHRcdG9uQ2hhbmdlOiBmdW5jdGlvbiAoaHNiLCBoZXgsIHJnYikge1xuXHRcdFx0XHRcblx0XHRcdFx0cG9pbnRlcnMuY29sb3JfYm9yZGVyID0gICcjJyArIGhleDtcblxuXHRcdFx0XHQkKCcuY29sb3JfYm9yZGVyJykuY3NzKCdiYWNrZ3JvdW5kQ29sb3InLCAnIycgKyBoZXgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYocG9pbnRlcnMuc2hvd19ib3JkZXIpe1xuXHRcdFx0XHRcdHBvaW50ZXJzLmRyYXdfYm9yZGVyKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG4iLCIvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgdHdvcnplbmllIHphcGlzeXdhbmllIGkgYWt0dWFsaXphY2plIGRhbnljaCBkb3R5Y3rEhcSHY3loIG1hcHlcbnZhciBjcnVkID0ge1xuXG5cdG1hcF9qc29uIDogQXJyYXkoKSwgLy9nxYLDs3duYSB6bWllbm5hIHByemVjaG93dWrEhWNhIHdzenlzdGtpZSBkYW5lXG5cdG1hcF9oYXNoIDpudWxsLFxuXHRsYXllcnMgOiB7fSxcblx0ZXhjZWwgOiBBcnJheSgpLFxuXHRwcm9qZWN0IDoge30sXG5cdHByb2plY3RfaGFzaCA6IG51bGwsIC8vZ8WCw7N3bnkgaGFzaCBkb3R5Y3rEhWN5IG5hc3plZ28gcHJvamVrdHVcblxuXHQvL3BvYmllcmFteSBkYW5lIHogcG9yb2pla3R1IGkgemFwaXN1amVteSBqZSBkbyBqc29uLWFcblx0cGFyc2VfZGF0YSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIGRvdHljesSFY2UgbWFweSAoY2FudmFzYSlcblxuXHRcdC8vemVydWplbXkgbmEgbm93byBjYcWCxIUgdGFibGljxJkgcG9pbnRlcsOzd1xuXHRcdHRoaXMubWFwX2pzb24gPSBBcnJheSgpO1xuXG5cdFx0Ly9kYXRhW3hdID0gem1pZW5uZSBwb2RzdGF3b3dlIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMubWFwX2pzb25bMF0gPSBBcnJheSgpO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMF0gPSBjYW52YXMuaGVpZ2h0X2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzFdID0gY2FudmFzLndpZHRoX2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzJdID0gcG9pbnRlcnMucGFkZGluZ194O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bM10gPSBwb2ludGVycy5wYWRkaW5nX3k7XG5cdFx0dGhpcy5tYXBfanNvblswXVs0XSA9IHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG87XG5cdFx0dGhpcy5tYXBfanNvblswXVs1XSA9IHBvaW50ZXJzLnNpemU7XG5cdFx0dGhpcy5tYXBfanNvblswXVs2XSA9IHBvaW50ZXJzLm1haW5fa2luZDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzddID0gY2FudmFzLnRpdGxlX3Byb2plY3Q7XG5cdFx0dGhpcy5tYXBfanNvblswXVs4XSA9IHBvaW50ZXJzLmNvbG9yX2JvcmRlcjtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzldID0gcG9pbnRlcnMuc2hvd19ib3JkZXI7XG5cblx0XHQvLyBkYXRhWzFdID0gdGFibGljYSBwdW5rdMOzdyAocG9pbnRlcnMucG9pbnRlcnMpIFt3aWVyc3pdW2tvbHVtbmFdID0gXCJub25lXCIgfHwgKG51bWVyIGthdGVnb3JpaSlcblx0XHR0aGlzLm1hcF9qc29uWzFdID0gcG9pbnRlcnMucG9pbnRlcnM7XG5cblx0XHQvLyBkYXRhWzJdID0gdGFibGljYSBrYXRlZ29yaWlcblx0XHR0aGlzLm1hcF9qc29uWzJdID0gY2F0ZWdvcmllcy5jYXRlZ29yeTtcblxuXHRcdC8vZGF0YVszXSA9IHRhYmxpY2Egd3pvcmNhICh6ZGrEmWNpYSB3IHRsZSBkbyBvZHJ5c293YW5pYSlcblx0XHR0aGlzLm1hcF9qc29uWzNdID0gQXJyYXkoKTtcblxuXHRcdGlmKGltYWdlLm9iail7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzBdID0gaW1hZ2Uub2JqLnNyYztcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMV0gPSBpbWFnZS54O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVsyXSA9IGltYWdlLnk7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzNdID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzRdID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs1XSA9IGltYWdlLmFscGhhO1xuXHRcdH1cblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0w7N3IChsYXllcnMpXG5cdFx0Ly90d29yenlteSBvYmlla3Qgd2Fyc3R3eSB6YXdpZXJhasSFY3kgd3N6eXN0a2llIGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0dVxuXG5cdFx0dGhpcy5sYXllcnMucGFsZXRzX2FjdGl2ZSA9IGxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdHRoaXMubGF5ZXJzLnZhbHVlID0gbGF5ZXJzLnZhbHVlO1xuXHRcdHRoaXMubGF5ZXJzLmNvbG9yc19wb3MgPSBsYXllcnMuY29sb3JzX3Bvcztcblx0XHR0aGlzLmxheWVycy5jb2xvcnNfYWN0aXZlID0gbGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0dGhpcy5sYXllcnMubWluX3ZhbHVlID0gbGF5ZXJzLm1pbl92YWx1ZTtcblx0XHR0aGlzLmxheWVycy5tYXhfdmFsdWUgPSBsYXllcnMubWF4X3ZhbHVlO1xuXHRcdHRoaXMubGF5ZXJzLmNsb3VkID0gbGF5ZXJzLmNsb3VkO1xuXHRcdHRoaXMubGF5ZXJzLmNsb3VkX3BhcnNlciA9IGxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0dGhpcy5sYXllcnMubGVnZW5kcyA9IGxheWVycy5sZWdlbmRzO1xuXHRcdHRoaXMubGF5ZXJzLmxhYmVscyA9IGxheWVycy5sYWJlbHM7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnkgPSBsYXllcnMuY2F0ZWdvcnk7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnlfY29sb3JzID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHR0aGlzLmxheWVycy5jYXRlZ29yeV9uYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0dGhpcy5sYXllcnMubGlzdCA9IGxheWVycy5saXN0O1xuXG5cdFx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRcdHRoaXMucHJvamVjdC5uYW1lID0gbGF5ZXJzLnByb2plY3RfbmFtZTtcblx0XHR0aGlzLnByb2plY3Quc291cmNlID0gbGF5ZXJzLnNvdXJjZTtcblxuXHRcdC8vdHdvcnp5bXkgb2JpZWt0IGV4Y2VsYVxuXHRcdHRoaXMuZXhjZWwgPSBleGNlbC5kYXRhO1xuXG5cblx0fSxcblxuXHRwdWJsaXNoIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKGNydWQucHJvamVjdF9oYXNoICE9IG51bGwpe1xuXHRcdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy/FgmF0YSBkbGEgbW96aWxsaVxuXHRcdFx0aWYoICgkKCcucHVibGlzaCAuZW1iZWQnKS5jc3MoJ2Rpc3BsYXknKSA9PSAnYmxvY2snKSAmJiAoJChldmVudC50YXJnZXQpLmhhc0NsYXNzKCdwdWJsaXNoJykpICl7XG5cdFx0XHRcdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmZhZGVPdXQoNTAwKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmh0bWwoJzxpZnJhbWUgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiJytjYW52YXMuaGVpZ2h0X2NhbnZhcysncHhcIiBib3JkZXI9XCIwXCIgZnJhbWVib3JkZXI9XCIwXCIgYm9yZGVyPVwiMFwiIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgc3JjPVwiaHR0cDovLycrbG9jYXRpb24uaHJlZi5zcGxpdCggJy8nIClbMl0rJy9lbWJlZC8nK2NydWQucHJvamVjdF9oYXNoKydcIj48L2lmcmFtZT4nKTtcblx0XHRcdFx0JCgnI2lmcmFtZScpLmh0bWwoJzxpZnJhbWUgIG9ubG9hZD1cImNydWQucHVibGlzaF9nZXRTaXplKHRoaXMpXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiJytjYW52YXMuaGVpZ2h0X2NhbnZhcysncHhcIiBib3JkZXI9XCIwXCIgZnJhbWVib3JkZXI9XCIwXCIgYm9yZGVyPVwiMFwiIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgc3JjPVwiaHR0cDovLycrbG9jYXRpb24uaHJlZi5zcGxpdCggJy8nIClbMl0rJy9lbWJlZC8nK2NydWQucHJvamVjdF9oYXNoKydcIj48L2lmcmFtZT4nKTtcblxuXHRcdFx0XHQkKCcucHVibGlzaCAuZW1iZWQnKS5mYWRlSW4oNTAwKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGFsZXJ0KCduYWpwaWVydyB6YXBpc3ogcHJvamVrdCBhIG5hc3TEmXBuaWUgZ28gcHVibGlrdWonKTtcblx0XHR9XG5cdH0sXG5cblx0cHVibGlzaF9nZXRTaXplIDogZnVuY3Rpb24ob2JqKXtcblx0XHRjb25zb2xlLmxvZyhvYmouY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5KTtcblx0XHRjb25zb2xlLmxvZygkKG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkpLmhlaWdodCgpICwkKG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkpLndpZHRoKCkpO1xuICAgIC8vb2JqLnN0eWxlLmhlaWdodCA9IG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0ICsgJ3B4Jztcblx0fSxcblxuXG5cdC8vd2N6eXRhbmllIHptaWVubnljaCBkbyBvYmlla3TDs3cgbWFweVxuXG5cdHNldF9tYXAgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vcG8gemFwaXNhbml1IGRhbnljaCBkbyBiYXp5IGFrdHVhbGl6dWplbXkgaWQgKHcgcHJ6eXBhZGt1IGplxZtsaSBpc3RuaWVqZSBuYWRwaXN1amVteSBqZSlcblx0XHR0aGlzLm1hcF9qc29uID0gZGF0YTtcblxuXHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gZGF0YVswXVswXTtcblx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gZGF0YVswXVsxXTtcblx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSBkYXRhWzBdWzJdO1xuXHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IGRhdGFbMF1bM107XG5cdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IGRhdGFbMF1bNF07XG5cdFx0cG9pbnRlcnMuc2l6ZSA9IGRhdGFbMF1bNV07XG5cdFx0cG9pbnRlcnMubWFpbl9raW5kID0gZGF0YVswXVs2XTtcblx0XHRjYW52YXMudGl0bGVfcHJvamVjdCA9IGRhdGFbMF1bN107XG5cdFx0XG5cdFx0aWYodHlwZW9mIGRhdGFbMF1bOF0gPT0gJ3VuZGVmaW5lZCcpe1xuXHRcdFx0cG9pbnRlcnMuY29sb3JfYm9yZGVyID0gXCIjMDAwXCI7XG5cdFx0fWVsc2V7XG5cdFx0XHRwb2ludGVycy5jb2xvcl9ib3JkZXIgPSBkYXRhWzBdWzhdO1xuXHRcdH1cblxuXHRcdGlmKHR5cGVvZiBkYXRhWzBdWzldID09ICd1bmRlZmluZWQnKXtcblx0XHRcdHBvaW50ZXJzLnNob3dfYm9yZGVyID0gZmFsc2U7XG5cdFx0fWVsc2V7XG5cdFx0XHRwb2ludGVycy5zaG93X2JvcmRlciA9IGRhdGFbMF1bOV07XG5cdFx0fVxuIFxuIFx0XHQkKCcjcG9pbnRlcl9ib3ggLmNvbG9yX2JvcmRlcicpLmNzcygnYmFja2dyb3VuZC1jb2xvcicscG9pbnRlcnMuY29sb3JfYm9yZGVyKTtcblxuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ194XCJdJykudmFsKCBkYXRhWzBdWzJdICk7XG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3lcIl0nKS52YWwoIGRhdGFbMF1bM10gKTtcblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInNpemVcIl0nKS52YWwoIGRhdGFbMF1bNV0gKTtcblx0XHQkKCdpbnB1dFtuYW1lPVwidGl0bGVfcHJvamVjdFwiXScpLnZhbCggZGF0YVswXVs3XSApO1xuXG5cdFx0aWYoIGRhdGFbMF1bNF0gKXtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHR9XG5cblx0XHRpZiggcG9pbnRlcnMuc2hvd19ib3JkZXIgKXtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInNob3dfYm9yZGVyXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInNob3dfYm9yZGVyXCJdJykuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdH1cblxuXHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmh0bWwoJycpO1xuXG5cdFx0cG9pbnRlcnMua2luZHMuZm9yRWFjaChmdW5jdGlvbihraW5kKXtcblxuXHRcdFx0aWYoa2luZCA9PSBkYXRhWzBdWzZdKXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIHNlbGVjdGVkPVwic2VsZWN0ZWRcIiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgbyBwb2ludGVyYWNoXG5cdFx0cG9pbnRlcnMucG9pbnRlcnMgPSBkYXRhWzFdO1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIGthdGVnb3JpYWNoXG5cdFx0Y2F0ZWdvcmllcy5jYXRlZ29yeSA9IGRhdGFbMl07XG5cblxuXHRcdC8vcG8gd2N6eXRhbml1IG1hcHkgYWt0eWFsaXp1amVteSBkYW5lIGRvdHljesSFY8SFIGthdGVnb3JpaSBpIGtvbG9yw7N3XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1swXSA9IFtdO1xuXHRcdGxheWVycy5jYXRlZ29yeV9uYW1lID0gW107XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGNhdGVnb3JpZXMuY2F0ZWdvcnkubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZS5wdXNoKGNhdGVnb3JpZXMuY2F0ZWdvcnlbaV1bMF0pO1xuXHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1swXS5wdXNoKGNhdGVnb3JpZXMuY2F0ZWdvcnlbaV1bMV0pO1xuXHRcdH1cblxuXHRcdC8vcG9iaWVyYW5pZSBkYW55Y2ggbyB6ZGrEmWNpdSBqZcW8ZWxpIGlzdG5pZWplXG5cdFx0aWYoIGRhdGFbM10ubGVuZ3RoID4gMil7XG5cdFx0XHRpbWFnZS5vYmogPSBuZXcgSW1hZ2UoKTtcblx0XHRcdGltYWdlLm9iai5zcmMgPSBkYXRhWzNdWzBdO1xuXHRcdFx0aW1hZ2UueCA9IHBhcnNlSW50KCBkYXRhWzNdWzFdICk7XG5cdFx0XHRpbWFnZS55ID0gcGFyc2VJbnQoIGRhdGFbM11bMl0gKTtcblx0XHRcdGltYWdlLndpZHRoID0gcGFyc2VJbnQoIGRhdGFbM11bM10gKTtcblx0XHRcdGltYWdlLmhlaWdodCA9IHBhcnNlSW50KCBkYXRhWzNdWzRdICk7XG5cdFx0XHRpbWFnZS5hbHBoYSA9IHBhcnNlSW50KCBkYXRhWzNdWzVdICk7XG5cblx0XHRcdC8vemF6bmFjemVuaWUgb2Rwb3dpZWRuaWVnbyBzZWxlY3RhIGFscGhhIHcgbWVudSB0b3Bcblx0XHRcdCQoJyNhbHBoYV9pbWFnZSBvcHRpb25bbmFtZT1cIicrXHRpbWFnZS5hbHBoYSArJ1wiXScpLmF0dHIoJ3NlbGVjdGVkJyx0cnVlKTtcblxuXHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyBjYW52YXMuZHJhdygpOyB9O1xuXHRcdH1cblxuXHRcdC8vemFrdHVhbGl6b3dhbmllIGRhbnljaCB3IGlucHV0YWNoXG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLCBjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsIGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6Y2FudmFzLndpZHRoX2NhbnZhcysncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzKydweCd9KTtcblxuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0Y2F0ZWdvcmllcy5zaG93X2xpc3QoKTtcblxuXHR9LFxuXG5cdHNldF9wcm9qZWN0IDogZnVuY3Rpb24oZGF0YSl7XG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIG1hcHlcblx0XHR0aGlzLnNldF9tYXAoIEpTT04ucGFyc2UoZGF0YS5tYXBfanNvbikgKTtcblx0XHRcblx0XHRleGNlbC5kYXRhID0gSlNPTi5wYXJzZShkYXRhLmV4Y2VsKTtcblxuXHRcdGRhdGEucHJvamVjdCA9IEpTT04ucGFyc2UoZGF0YS5wcm9qZWN0KTsgIFxuXHRcdGRhdGEubGF5ZXJzID0gSlNPTi5wYXJzZShkYXRhLmxheWVycyk7IFxuXG5cdFx0Ly93Y3p5dHVqZW15IGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0dVxuXHRcdGxheWVycy5wYWxldHNfYWN0aXZlID0gZGF0YS5sYXllcnMucGFsZXRzX2FjdGl2ZTtcblx0XHRsYXllcnMudmFsdWUgPSBkYXRhLmxheWVycy52YWx1ZTtcblx0XHRsYXllcnMuY29sb3JzX3BvcyA9IGRhdGEubGF5ZXJzLmNvbG9yc19wb3M7XG5cdFx0bGF5ZXJzLmNvbG9yc19hY3RpdmUgPSBkYXRhLmxheWVycy5jb2xvcnNfYWN0aXZlO1xuXHRcdGxheWVycy5taW5fdmFsdWUgPSBkYXRhLmxheWVycy5taW5fdmFsdWU7XG5cdFx0bGF5ZXJzLm1heF92YWx1ZSA9IGRhdGEubGF5ZXJzLm1heF92YWx1ZTtcblx0XHRsYXllcnMuY2xvdWQgPSBkYXRhLmxheWVycy5jbG91ZDtcblx0XHRsYXllcnMuY2xvdWRfcGFyc2VyID0gZGF0YS5sYXllcnMuY2xvdWRfcGFyc2VyO1xuXHRcdGxheWVycy5sZWdlbmRzID0gZGF0YS5sYXllcnMubGVnZW5kcztcblx0XHRsYXllcnMubGFiZWxzID0gZGF0YS5sYXllcnMubGFiZWxzO1xuXHQgXHRsYXllcnMuY2F0ZWdvcnkgPSBcdGRhdGEubGF5ZXJzLmNhdGVnb3J5O1xuXHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnMgPSBkYXRhLmxheWVycy5jYXRlZ29yeV9jb2xvcnM7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X25hbWUgPSBkYXRhLmxheWVycy5jYXRlZ29yeV9uYW1lO1xuXHRcdGxheWVycy5saXN0ID0gZGF0YS5sYXllcnMubGlzdDtcblxuXG5cblx0XHQvL3ptaWVubmUgZ2xvYmFsbmUgZG90eWN6xIVjZSBjYcWCZWdvIHByb2pla3R1XG5cdFx0bGF5ZXJzLnByb2plY3RfbmFtZSA9IGRhdGEucHJvamVjdC5uYW1lO1xuXHRcdGxheWVycy5zb3VyY2UgPSBkYXRhLnByb2plY3Quc291cmNlO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cInByb2plY3RfbmFtZVwiXScpLnZhbChsYXllcnMucHJvamVjdF9uYW1lKTtcblxuXHRcdHRpbnlNQ0UuZWRpdG9yc1swXS5zZXRDb250ZW50KCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0XHR0aW55TUNFLmVkaXRvcnNbMV0uc2V0Q29udGVudCggbGF5ZXJzLnNvdXJjZSApO1xuXG5cdFx0ZXhjZWwuc2hvdygpO1xuXHRcdHBhbGV0cy5zaG93KCk7XG5cdFx0bGVnZW5kcy5zaG93KCk7XG5cdFx0bGF5ZXJzLnNob3coKTtcblx0XHRsYWJlbHMuc2hvdygpO1xuXG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBtYXB5IHogYmF6eSBkYW55Y2ggaSBwcnpla2F6dWplbXkgZG8gd2N6eXRhbmlhIGRvIG9iaWVrdMOzdyBtYXB5XG5cdGdldF9tYXAgOiBmdW5jdGlvbigpe1xuXHRcdHZhciB0aCA9IHRoaXM7XG5cdFx0JC5hamF4KHtcblx0XHRcdCAgdXJsOiAnL2FwaS9tYXAvJyArIHRoLm1hcF9oYXNoLFxuXHRcdCAgXHR0eXBlOiBcIkdFVFwiLFxuXHRcdCAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHRcdH0pLmRvbmUoZnVuY3Rpb24oIGRhdGEgKSB7IHRoLnNldF9tYXAoIEpTT04ucGFyc2UoZGF0YS5kYXRhWzBdLm1hcF9qc29uKSApOyB9KTtcblx0fSxcblxuXHQvL3BvYmllcmFuaWUgcHJvamVrdHUgeiBiYXp5IGRhbnljaCBpIHdjenl0YW5pZVxuXHRnZXRfcHJvamVjdCA6IGZ1bmN0aW9uKCl7XG5cdFx0XG5cdFx0dmFyIHRoID0gdGhpcztcblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdCAgdXJsOiAnL2FwaS9wcm9qZWN0LycgKyB0aC5wcm9qZWN0X2hhc2gsXG5cdFx0XHQgIFx0dHlwZTogXCJHRVRcIixcblx0XHRcdCAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHRcdFx0fSkuZG9uZShmdW5jdGlvbiggZGF0YSApIHsgXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhLmRhdGEpO1xuXHRcdFx0XHRcdGlmKGRhdGEuc3RhdHVzID09ICdvaycpe1xuXHRcdFx0XHRcdFx0dGguc2V0X3Byb2plY3QoIGRhdGEuZGF0YSApOyBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KCduaWUgdWRhxYJvIHNpxJkgd2N6eXRhxIcgcHJvamVrdHUnKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblx0XHR9LFxuXG5cdC8vdHdvcnp5bXkgbm93eSBwcm9qZWt0XG5cdGNyZWF0ZV9wcm9qZWN0IDogZnVuY3Rpb24oKXtcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5wYXJzZV9kYXRhKCk7XG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2pzb24gOiBKU09OLnN0cmluZ2lmeSh0aC5tYXBfanNvbiksXG5cdFx0XHRtYXBfaGFzaCA6IHRoLm1hcF9oYXNoLFxuXHRcdFx0bGF5ZXJzIDogSlNPTi5zdHJpbmdpZnkodGgubGF5ZXJzKSxcblx0XHRcdGV4Y2VsIDogSlNPTi5zdHJpbmdpZnkodGguZXhjZWwpLFxuXHRcdFx0cHJvamVjdCA6IEpTT04uc3RyaW5naWZ5KHRoLnByb2plY3QpXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9wcm9qZWN0c1wiLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09ICdvaycpe1xuXHRcdFx0XHRcdGFsZXJ0KCd6YXBpc2FubyBub3d5IHByb2pla3QnKTtcblx0XHRcdFx0XHR0aC5wcm9qZWN0X2hhc2ggPSByZXNwb25zZS5wcm9qZWN0X2hhc2g7XG5cdFx0XHRcdFx0bWVudV90b3AuZ2V0X3Byb2plY3RzKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRhbGVydCgnYsWCxIVkIHBvZGN6YXMgemFwaXN1Jyk7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vYWt0dWFsaXp1amVteSBqdcW8IGlzdG5pZWrEhWN5IHByb2pla3Rcblx0dXBkYXRlX3Byb2plY3QgOiBmdW5jdGlvbigpeyBcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5wYXJzZV9kYXRhKCk7XG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2pzb24gOiBKU09OLnN0cmluZ2lmeSh0aC5tYXBfanNvbiksXG5cdFx0XHRtYXBfaGFzaCA6IHRoLm1hcF9oYXNoLFxuXHRcdFx0cHJvamVjdF9oYXNoIDogdGgucHJvamVjdF9oYXNoLFxuXHRcdFx0bGF5ZXJzIDogSlNPTi5zdHJpbmdpZnkodGgubGF5ZXJzKSxcblx0XHRcdGV4Y2VsIDogSlNPTi5zdHJpbmdpZnkodGguZXhjZWwpLFxuXHRcdFx0cHJvamVjdCA6IEpTT04uc3RyaW5naWZ5KHRoLnByb2plY3QpXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9wcm9qZWN0c1wiLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdHR5cGU6ICdQVVQnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gJ29rJyl7XG5cdFx0XHRcdFx0bWVudV90b3AuZ2V0X3Byb2plY3RzKCk7XG5cdFx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIHByb2pla3QnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyBha3R1YWxpemFjamknKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vdXN1d2FteSBtYXDEmSB6IGJhenkgZGFueWNoXG5cdGRlbGV0ZV9wcm9qZWN0IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL3NwcmF3ZHphbXkgY3p5IG1hcGEgZG8gdXN1bmnEmWNpYSBwb3NpYWRhIHN3b2plIGlkXG5cdFx0aWYodGhpcy5wcm9qZWN0X2hhc2ggIT0gbnVsbCl7XHRcdFx0XG5cblx0XHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdFx0dXJsOiBcImFwaS9wcm9qZWN0L1wiK3RoLnByb2plY3RfaGFzaCxcblx0XHRcdFx0dHlwZTogJ0RFTEVURScsXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gJ29rJyl7XG5cdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyB1c3V3YW5pYScpO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhbGVydCgnYnJhayBpZGVudHlmaWthdG9yYSBwcm9qZWt0dScpO1xuXHRcdH1cblx0fVxufVxuIiwidmFyIGV4Y2VsID0ge1xuXHRcblx0YWxwaGEgOiBbJ2EnLCdiJywnYycsJ2QnLCdlJywnZicsJ2cnLCdoJywnaScsJ2onLCdrJywnbCcsJ20nLCduJywnbycsJ3AnLCdxJywncicsJ3MnLCd0JywndScsJ3cnLCd4JywneScsJ3onXSxcblx0ZGF0YSA6IFtbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXSxbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXV0sXG5cdG1pbl9yb3cgOiAxMixcblx0bWluX2NvbCA6IDYsXG5cblx0aW5pdCA6IGZ1bmN0aW9uKCl7XG5cdFx0Ly9kb2RhbmllIGV2ZW50w7N3IHByenkga2xpa25pxJljaXUgZXhjZWxhXG5cdFx0JCgnI2V4Y2VsX2JveCBidXR0b24nKS5jbGljayhmdW5jdGlvbigpeyAkKCcjZXhjZWxfYm94IGlucHV0JykuY2xpY2soKTsgfSk7XG5cdFx0JCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNoYW5nZShmdW5jdGlvbigpeyBleGNlbC5zZW5kX2ZpbGUoKTsgfSk7XG5cblx0XHQvL2Z1bmtjamEgdHltY3phc293YSBkbyBuYXJ5c293YW5pYSB0YWJlbGtpIGV4Y2VsYVxuXHRcdHRoaXMuc2hvdygpO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBvZHBvd2llZHppYWxhIHphIHBvcHJhd25lIHBvZHBpc2FuaWUgb3NpXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0YWRkX2h0bWwgPSAnJztcblxuXHRcdC8vamXFm2xpIGlsb8WbYyB3aWVyc3p5IGplc3Qgd2nEmWtzemEgYWt0dWFsaXp1amVteSB3aWVsa2/Fm8SHIHRhYmxpY3lcblx0XHRpZihleGNlbC5kYXRhLmxlbmd0aCA+IGV4Y2VsLm1pbl9yb3cpIGV4Y2VsLm1pbl9yb3cgPSBleGNlbC5kYXRhLmxlbmd0aDtcblx0XHRpZihleGNlbC5kYXRhWzBdLmxlbmd0aCA+IGV4Y2VsLm1pbl9jb2wpIGV4Y2VsLm1pbl9jb2wgPSBleGNlbC5kYXRhWzBdLmxlbmd0aDtcblxuXHRcdC8vcmVuZGVydWplbXkgY2HFgsSFIHRhYmxpY8SZIGV4Y2VsXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdGhpcy5taW5fcm93OyBpKyspe1xuXHRcdFx0YWRkX2h0bWwgKz0gJzx0ciBjbGFzcz1cInRyXCI+Jztcblx0XHRcdGZvcih2YXIgaiA9IDA7aiA8IHRoaXMubWluX2NvbDsgaisrKXtcblxuXHRcdFx0XHRpZigoaiA9PSAwKSAmJiAoaSA+IDApKXtcblx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIiA+JysgaSArJzwvdGQ+Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdGlmKHR5cGVvZihleGNlbC5kYXRhW2ldWyhqLTEpXSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8dGQgY2xhc3M9XCJ0ZFwiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj4nK2V4Y2VsLmRhdGFbaV1bKGotMSldKyc8L3RkPic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiAgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCI+PC90ZD4nO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2ldWyhqKzEpXSk7XG5cdFx0XHRcdFx0fWNhdGNoKGVycm9yKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycm9yLGksaik7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj48L3RkPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcdGFkZF9odG1sICs9ICc8L3RyPic7XG5cdFx0fVxuXG5cdFx0JCgnI2V4Y2VsX2JveCAudGFibGUnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0Ly9kb2RhamVteSBtb8W8bGl3b8WbxIcgZWR5Y2ppIGV4Y2VsYVxuXHRcdCQoJyNleGNlbF9ib3ggLnRhYmxlIC50ZCcpLmtleXVwKGZ1bmN0aW9uKCl7IGV4Y2VsLmVkaXQodGhpcyk7IH0pO1xuXG5cdFx0JCgnI2V4Y2VsX2JveCAudGFibGUgLnRkJykuYmx1cihmdW5jdGlvbigpeyBwYWxldHMuc2hvd19zZWxlY3QoKTsgfSk7XG5cblx0fSxcblxuXHQvL2Z1bmtjamEgdW1vxbxsaXdpYWrEhWNhIGVkeWNqZSB6YXdhcnRvxZtjaSBrb23Ds3JraVxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKXtcdFxuXHRcdFxuXHRcdHZhciB2YWwgPSAkKG9iaikuaHRtbCgpXG5cdFx0aWYoJC5pc051bWVyaWModmFsKSkgeyB2YWwgPSBwYXJzZUZsb2F0KHZhbCk7IH1cblx0XHRcblx0XHRleGNlbC5kYXRhWyQob2JqKS5hdHRyKCdyb3cnKV1bKCQob2JqKS5hdHRyKCdjb2wnKS0xKV0gPSB2YWw7XG5cdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0fSxcblxuXHQvL3BvYmllcmFteSBwbGlrLCB6IGlucHV0YSBpIHd5xYJhbXkgZG8gYmFja2VuZHUgdyBjZWx1IHNwYXJzb3dhbmlhIGEgbmFzdMSZcG5pZSBwcnp5cGlzdWplbXkgZG8gdGFibGljeSBpIHd5xZt3aWV0bGFteXcgZm9ybWllIHRhYmVsc2tpXG5cdHNlbmRfZmlsZSA6IGZ1bmN0aW9uKCkge1xuXHRcblx0XHR2YXIgZXhjZWxfZm9ybSA9IG5ldyBGb3JtRGF0YSgpOyBcblx0XHRleGNlbF9mb3JtLmFwcGVuZChcImV4Y2VsX2ZpbGVcIiwgJChcIiNleGNlbF9ib3ggaW5wdXRcIilbMF0uZmlsZXNbMF0pO1xuXG4gXHRcdCQuYWpheCgge1xuICAgICAgXG4gICAgICB1cmw6ICcvYXBpL3Byb2plY3RzL2V4Y2VsX3BhcnNlJyxcbiAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgIGRhdGE6IGV4Y2VsX2Zvcm0sXG4gICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICBjb250ZW50VHlwZTogZmFsc2VcblxuICAgIH0pLmRvbmUoZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuICAgIFx0Ly8kKFwiI2V4Y2VsX2JveCBpbnB1dFwiKVswXS5maWxlc1swXS5yZXNldCgpO1xuXG5cdFx0XHQkKFwiI2V4Y2VsX2JveCBpbnB1dFwiKS5yZW1vdmUoKTtcblx0XHRcdCQoXCIjZXhjZWxfYm94XCIpLmFwcGVuZCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgLz4nKVxuXHRcdFx0JCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNoYW5nZShmdW5jdGlvbigpeyBleGNlbC5zZW5kX2ZpbGUoKTsgfSk7XG5cbiAgICBcdC8vcG8gd2N6eXRhbml1IHBsaWt1IGV4Y2VsIHByenlwaXN1amVteSBkYW5lIHJ5c3VqZW15IG5hIG5vd28gdGFiZWzEmSBvcmF6IHd5xZt3aWV0bGFteSB3c3p5c3RraWUgcGFsZXR5IGtvbG9yw7N3XG5cdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKVxuICAgIFx0ZXhjZWwuZGF0YSA9IHJlc3BvbnNlLmV4Y2VsWzBdLmRhdGE7XG4gICAgXHRleGNlbC50cmFuc2l0aW9uKCk7XG4gICAgXHRleGNlbC5zaG93KCk7XG4gICAgXHRwYWxldHMuc2hvd19zZWxlY3QoKTtcbiAgICB9KTtcblx0fSxcblxuXHQvL2Z1bmNramEgemFtaWVuaWFqxIVjYSBrcnRvcGtpIG5hIHByemVjaW5raSBwcnp5IGtvbcOzcmthY2ggbGljemJvd3ljaFxuXHR0cmFuc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRmb3IodmFyIGogPSAwLCBqX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBqIDwgal9tYXg7IGorKyl7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL3VzdXdhbXkgc3BhY2plIHd5c3TEmXB1asSFY2UgemEgbHViIHByemVkIHRla3N0ZW1cblx0XHRcdFx0ZXhjZWwuZGF0YVtpXVtqXSA9ICQudHJpbShleGNlbC5kYXRhW2ldW2pdKVxuXG5cdFx0XHRcdC8vamXFm2xpIG1hbXkgcHVzdMSFIHdhcnRvxZvEhyBudWxsIHphbWllbmlhbXkgasSFIG5hIHphbWtuacSZdHkgc3RyaW5nXG5cdFx0XHRcdGlmKGV4Y2VsLmRhdGFbaV1bal0gPT0gbnVsbCl7IGV4Y2VsLmRhdGFbaV1bal0gPSAnJzsgfVxuXHRcdFx0XHRcblx0XHRcdFx0aWYoJC5pc051bWVyaWMoIGV4Y2VsLmRhdGFbaV1bal0gKSl7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2ldW2pdKVxuXHRcdFx0XHRcdGV4Y2VsLmRhdGFbaV1bal0gPSBTdHJpbmcoZXhjZWwuZGF0YVtpXVtqXSkucmVwbGFjZSgnLicsJywnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4Y2VsLmluaXQoKTtcbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cbiAgc3F1YXJlX2JvcmRlciA6IGZ1bmN0aW9uKGRhdGEpe1xuXG4gICAgaWYoZGF0YS5ib3JkZXIudG9wKXtcbiAgICAgIGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KFxuICAgICAgICBkYXRhLngtZGF0YS5saW5lX3dpZHRoX3gsXG4gICAgICAgIGRhdGEueS1kYXRhLmxpbmVfd2lkdGhfeSxcbiAgICAgICAgZGF0YS5zaXplKzIqZGF0YS5saW5lX3dpZHRoX3gsXG4gICAgICAgIGRhdGEubGluZV93aWR0aF95XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmKGRhdGEuYm9yZGVyLnRvcF9sZWZ0KXtcbiAgICAgIGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KFxuICAgICAgICBkYXRhLngsXG4gICAgICAgIGRhdGEueS1kYXRhLmxpbmVfd2lkdGhfeSxcbiAgICAgICAgTWF0aC5jZWlsKGRhdGEuc2l6ZS8yKSxcbiAgICAgICAgZGF0YS5saW5lX3dpZHRoX3lcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS5ib3JkZXIudG9wX3JpZ2h0KXtcbiAgICAgIGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KFxuICAgICAgICBkYXRhLngrTWF0aC5mbG9vcihkYXRhLnNpemUvMiksXG4gICAgICAgIGRhdGEueS1kYXRhLmxpbmVfd2lkdGhfeSxcbiAgICAgICAgTWF0aC5jZWlsKGRhdGEuc2l6ZS8yKStkYXRhLmxpbmVfd2lkdGhfeCxcbiAgICAgICAgZGF0YS5saW5lX3dpZHRoX3lcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS5ib3JkZXIucmlnaHQpe1xuICAgICAgY2FudmFzLmNvbnRleHQuZmlsbFJlY3QoXG4gICAgICAgIGRhdGEueCtkYXRhLnNpemUsXG4gICAgICAgIGRhdGEueS1kYXRhLmxpbmVfd2lkdGhfeSxcbiAgICAgICAgZGF0YS5saW5lX3dpZHRoX3gsXG4gICAgICAgIGRhdGEuc2l6ZSsyKmRhdGEubGluZV93aWR0aF95XG4gICAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCIvL2Z1bmtjamUgZ2xvYmFsbmUga29udGVuZXIgbmEgd3N6eXN0a28gaSBuaWMgOylcbnZhciBnbG9iYWwgPSB7XG5cdHRvb2dsZV9wYW5lbCAgOiBmdW5jdGlvbihldmVudCl7XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRrYSBkbGEgbW96aWxsaVxuXHRcblx0XHQvL3NwcmF3ZHphbXkgeiBqYWtpbSBwYW5lbGVtIG1hbXkgZG8gY3p5bmllbmlhIChjenkgcG9rYXp1asSFY3ltIHNpxJkgeiBsZXdlaiBjenkgeiBwcmF3ZWogc3Ryb255KVxuXHRcdGlmKCAgcGFyc2VJbnQoJChldmVudC50YXJnZXQpLnBhcmVudCgpLmNzcygnbGVmdCcpKSA+IDAgKXtcblx0XHRcdC8vcGFuZWwgamVzdCB6IHByYXdlaiBzdHJvbnlcblx0XHRcdGlmKCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdyaWdodCcpID09ICcwcHgnICl7XG5cdFx0XHRcdCQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtyaWdodDogWy0kKGV2ZW50LnRhcmdldCkucGFyZW50KCkud2lkdGgoKS0yMCxcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdCAgICBlbHNle1xuXHQgICAgXHQgJChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe3JpZ2h0OiBbXCIwcHhcIixcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQvL3BhbmVsIGplc3QgeiBsZXdlaiBzdHJvbnlcblx0XHRcdGlmKCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdsZWZ0JykgPT0gJzBweCcgKXtcblx0XHRcdFx0JChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe2xlZnQ6IFstJChldmVudC50YXJnZXQpLnBhcmVudCgpLndpZHRoKCktMjAsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuXHQgICAgfVxuXHQgICAgZWxzZXtcblx0ICAgIFx0ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtsZWZ0OiBbXCIwcHhcIixcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdFx0fVxuXG5cdH1cbn1cbiIsIi8vZ8WCw7N3bmUgemRqxJljaWUgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbnZhciBpbWFnZSA9IHtcblx0b2JqIDogdW5kZWZpbmVkLFxuXHR4IDogbnVsbCxcblx0eSA6IG51bGwsXG5cdHdpZHRoIDogbnVsbCxcblx0aGVpZ2h0IDogbnVsbCxcblx0YWxwaGEgOiAxMCxcblxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IHRoaXMuYWxwaGEvMTA7XG5cdFx0Y2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMub2JqLHRoaXMueCx0aGlzLnksdGhpcy53aWR0aCx0aGlzLmhlaWdodCk7XG5cblx0XHQkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuY3NzKHsnaGVpZ2h0Jzp0aGlzLmhlaWdodCwndG9wJzp0aGlzLnkrJ3B4JywnbGVmdCc6KHRoaXMueCt0aGlzLndpZHRoKSsncHgnfSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBwb21vY25pY3phIGtvbndlcnR1asSFY2EgZGF0YVVSSSBuYSBwbGlrXG5cdGRhdGFVUkl0b0Jsb2IgOiBmdW5jdGlvbihkYXRhVVJJKSB7XG4gICAgdmFyIGJpbmFyeSA9IGF0b2IoZGF0YVVSSS5zcGxpdCgnLCcpWzFdKTtcbiAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFycmF5LnB1c2goYmluYXJ5LmNoYXJDb2RlQXQoaSkpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJsb2IoW25ldyBVaW50OEFycmF5KGFycmF5KV0sIHt0eXBlOiAnaW1hZ2UvcG5nJ30pO1xuXHR9XG5cbn1cbiIsInZhciBkYXRhX2lucHV0ID0ge1xuXG5cdC8vcG9iaWVyYW5pZSBpbmZvcm1hY2ppIHogaW5wdXTDs3cgaSB6YXBpc2FuaWUgZG8gb2JpZWt0dSBtYXBfc3ZnXG5cdGdldCA6IGZ1bmN0aW9uKCl7XG5cdFx0bWFwLm5hbWUgPSAkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoKTtcblx0XHRtYXAucGF0aCA9ICQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCgpLnJlcGxhY2UoL1wiL2csIFwiJ1wiKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9LFxuXG5cdC8vcG9icmFuaWUgaW5mb3JtYWNqaSB6IG9iaWVrdHUgbWFwX3N2ZyBpIHphcGlzYW5pZSBkbyBpbnB1dMOzd1xuXHRzZXQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCggbWFwLm5hbWUgKTtcblx0XHQkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoIG1hcC5wYXRoICk7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fVxuXG59XG4iLCJsYWJlbHMgPSB7XG5cblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2xheWVycyAubGFiZWxfbGF5ZXInKS52YWwoIGxheWVycy5sYWJlbHNbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0fSxcblxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKSB7XG5cdFx0bGF5ZXJzLmxhYmVsc1tsYXllcnMuYWN0aXZlXSA9ICQob2JqKS52YWwoKTtcblx0fVxufVxuXG4kKCcjbGF5ZXJzIC5sYWJlbF9sYXllcicpLmtleXVwKGZ1bmN0aW9uKCl7XG5cdGxhYmVscy5lZGl0KHRoaXMpO1xufSk7IFxuIiwidmFyIGxheWVycyA9IHtcblxuXHRsaXN0IDogWyd6YWvFgmFka2EgMSddLFxuXHRhY3RpdmUgOiAwLFxuXG5cdC8vdGFibGljYSB6IHBvZHN0YXdvd3l3bWkgZGFueW1pIHphZ3JlZ293YW55bWkgZGxhIGthxbxkZWogd2Fyc3R3eVxuXHRwYWxldHNfYWN0aXZlIDogWzBdLFxuXG5cdHZhbHVlIDogWy0xXSxcblx0Y29sb3JzX3BvcyA6IFtbMSwxLDEsMSwxLDEsMSwxLDFdXSxcblx0Y29sb3JzX2FjdGl2ZSA6IFtbXCIjZjdmY2ZkXCIsIFwiI2U1ZjVmOVwiLCBcIiNjY2VjZTZcIiwgXCIjOTlkOGM5XCIsIFwiIzY2YzJhNFwiLCBcIiM0MWFlNzZcIiwgXCIjMjM4YjQ1XCIsIFwiIzAwNmQyY1wiLCBcIiMwMDQ0MWJcIl1dLFxuXHRtaW5fdmFsdWUgOiBbMF0sXG5cdG1heF92YWx1ZSA6IFswXSxcblx0Y2xvdWQgOiBbXCJcIl0sXG5cdGNsb3VkX3BhcnNlciA6IFtcIlwiXSxcblx0bGVnZW5kcyA6IFtbXV0sXG5cdGxhYmVscyA6IFtcIlwiXSxcblx0Y2F0ZWdvcnkgOiBbLTFdLFxuXHRjYXRlZ29yeV9jb2xvcnMgOiBbXSxcblx0Y2F0ZWdvcnlfbmFtZSA6IFtdLFxuXG5cdC8vem1pZW5uZSBnbG9iYWxuZSBkb3R5Y3rEhWNlIGNhxYJlZ28gcHJvamVrdHVcblx0cHJvamVjdF9uYW1lIDogJ25vd3kgcHJvamVrdCcsXG5cdHNvdXJjZSA6ICcnLFxuXG5cdC8vdGFibGljYSBww7NsIHV6YWxlxbxuaW9ueWNoIG9kIGFrdHVhbG5laiB3YXJzdHd5XG5cdGRiX25hbWUgOiBbXCJsaXN0XCIsXCJwYWxldHNfYWN0aXZlXCIsXCJjYXRlZ29yeVwiLFwiY2F0ZWdvcnlfY29sb3JzXCIsXCJjYXRlZ29yeV9uYW1lXCIsXCJ2YWx1ZVwiLFwiY29sb3JzX3Bvc1wiLFwiY29sb3JzX2FjdGl2ZVwiLFwibWluX3ZhbHVlXCIsXCJtYXhfdmFsdWVcIixcImNsb3VkXCIsXCJjbG91ZF9wYXJzZXJcIixcImxlZ2VuZHNcIixcImxhYmVsc1wiXSxcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBodG1sID0gXCJcIjtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5saXN0Lmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0aWYoaSA9PSB0aGlzLmFjdGl2ZSl7XG5cdFx0XHRcdGh0bWwgKz0gJzxzcGFuIG51bT1cIicraSsnXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIGNsYXNzPVwiYWN0aXZlXCI+JyArIHRoaXMubGlzdFtpXSArICc8L3NwYW4+Jztcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGh0bWwgKz0gJzxzcGFuIG51bT1cIicraSsnXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiID4nICsgdGhpcy5saXN0W2ldICsgJzwvc3Bhbj4nO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJhZGRcIj4gKyA8L2J1dHRvbj48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCI+IC0gPC9idXR0b24+JztcblxuXHRcdCQoJyNsYXllcnMgPiBkaXYnKS5odG1sKGh0bWwpO1xuXG5cblx0XHQvL2RvZGFqZW15IHpkYXJ6ZW5pYSBkbyBlZHljamkgLyB6bWlhbnkga29sZWpub3NjaSBpIGFrdHVhbGl6b3dhbmlhIHdhcnN0d3lcblx0XHQkKCcjbGF5ZXJzIC5hZGQnKS5jbGljayhmdW5jdGlvbigpe2xheWVycy5hZGQoKTt9KTtcblx0XHRcblx0XHQkKCcjbGF5ZXJzIC5yZW1vdmUnKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdFx0aWYoY29uZmlybSgnQ3p5IGNoY2VzeiB1c3VuxIXEhyB3YXJzdHfEmSA/Jykpe1xuXHRcdFx0XHRsYXllcnMucmVtb3ZlKCk7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXHRcdFxuXHRcdCQoJyNsYXllcnMgc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7IGxheWVycy5zZWxlY3QodGhpcyk7IH0pO1xuXG5cdFx0JCggXCIjbGF5ZXJzID4gZGl2IHNwYW5cIiApLmtleXVwKGZ1bmN0aW9uKCl7XG5cdFx0XHRsYXllcnMubGlzdFtsYXllcnMuYWN0aXZlXSA9ICQodGhpcykuaHRtbCgpO1xuXHRcdH0pO1xuXG5cdFx0JCggXCIjbGF5ZXJzID4gZGl2IHNwYW5cIiApLmRibGNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdjb250ZW50ZWRpdGFibGUnKTtcblx0XHRcdCQodGhpcykuYmx1cihmdW5jdGlvbigpeyAkKHRoaXMpLnJlbW92ZUNsYXNzKCdjb250ZW50ZWRpdGFibGUnKSB9KTtcblx0XHR9KTtcblxuXHRcdCQoIFwiI2xheWVycyA+IGRpdlwiICkuc29ydGFibGUoeyBcblx0XHRcdGF4aXM6ICd4Jyxcblx0XHQgXHR1cGRhdGU6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRcdCQoIFwiI2xheWVycyA+IGRpdiBzcGFuXCIgKS5lYWNoKGZ1bmN0aW9uKGluZGV4LG9iail7XG5cdFx0XHRcdFx0aWYoaW5kZXggIT0gJChvYmopLmF0dHIoJ251bScpKXtcblx0XHRcdFx0XHRcdGxheWVycy5jaGFuZ2Vfb3JkZXIoJChvYmopLmF0dHIoJ251bScpLGluZGV4KVxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0IFx0fSxcblx0XHQgXHRjYW5jZWw6ICcuYWRkLC5yZW1vdmUsLmNvbnRlbnRlZGl0YWJsZSdcblx0XHR9KTtcblx0fSxcblxuXHRzZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXHRcdCQoJyNsYXllcnMgc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0XHQkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdGxheWVycy5hY3RpdmUgPSAkKG9iaikuaW5kZXgoKTtcblxuXHRcdHRpbnlNQ0UuZWRpdG9yc1swXS5zZXRDb250ZW50KCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0XHRwYWxldHMuc2hvdygpO1xuXHRcdGNsb3VkLnNldF90ZXh0YXJlYSgpO1xuXHRcdGxhYmVscy5zaG93KCk7XG5cdFx0bGVnZW5kcy5zaG93KCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHQvL3ptaWFuYSBrb2xlam5qb8WbY2kgd2Fyc3R3XG5cdGNoYW5nZV9vcmRlciA6IGZ1bmN0aW9uKGxhc3QsbmV4dCl7XG5cdFx0Zm9yICh2YXIgaT0gMCwgaV9tYXggPSB0aGlzLmRiX25hbWUubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKykge1xuXHRcdFx0dmFyIHRtcCA9IHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtuZXh0XTtcblx0XHRcdHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtuZXh0XSA9IHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtsYXN0XVxuXHRcdFx0dGhpc1t0aGlzLmRiX25hbWVbaV1dW2xhc3RdID0gdG1wO1xuXHRcdH1cblx0fSxcblxuXHQvL2RvZGFqZW15IG5vd8SFIHdhcnN0d8SZXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR0aGlzLmxpc3QucHVzaCggJ3pha8WCYWRrYSAnICsgcGFyc2VJbnQodGhpcy5saXN0Lmxlbmd0aCsxKSk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2goLTEpO1xuXHRcdHRoaXMuY2F0ZWdvcnlfY29sb3JzLnB1c2goIHRoaXMuY2F0ZWdvcnlfY29sb3JzW3RoaXMuY2F0ZWdvcnlfY29sb3JzLmxlbmd0aC0xXS5zbGljZSgpICk7XG5cdFx0dGhpcy52YWx1ZS5wdXNoKC0xKTtcblx0XHR0aGlzLnBhbGV0c19hY3RpdmUucHVzaCgwKTtcblx0XHR0aGlzLmNvbG9yc19hY3RpdmUucHVzaChbJyNmN2ZjZmQnLCcjZTVmNWY5JywnI2NjZWNlNicsJyM5OWQ4YzknLCcjNjZjMmE0JywnIzQxYWU3NicsJyMyMzhiNDUnLCcjMDA2ZDJjJywnIzAwNDQxYiddKTtcblx0XHR0aGlzLmNvbG9yc19wb3MucHVzaChbMSwxLDEsMSwxLDEsMSwxLDFdKTtcblx0XHR0aGlzLm1pbl92YWx1ZS5wdXNoKDApO1xuXHRcdHRoaXMubWF4X3ZhbHVlLnB1c2goMCk7XG5cdFx0dGhpcy5jbG91ZC5wdXNoKFwiXCIpO1xuXHRcdHRoaXMuY2xvdWRfcGFyc2VyLnB1c2goXCJcIik7XG5cdFx0dGhpcy5sZWdlbmRzLnB1c2goW10pO1xuXHRcdHRoaXMubGFiZWxzLnB1c2goXCJcIik7XG5cdFx0dGhpcy5zaG93KCk7XG5cblx0fSxcblxuXHQvL3VzdXdhbXkgYWt0dWFsbsSFIHdhcnN0d8SZXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0aWYodGhpcy5hY3RpdmUgPiAwKXtcblx0XHRcdGlmKHRoaXMuYWN0aXZlID09ICh0aGlzLmxpc3QubGVuZ3RoLTEpKXtcblx0XHRcdFx0dmFyIGlfdG1wID0gdGhpcy5saXN0Lmxlbmd0aC0xO1xuXHRcdFx0XHR0aGlzLnNlbGVjdCggJCgnI2xheWVycyBzcGFuJykuZXEoIGlfdG1wICkgKTtcblx0XHRcdH0gXG5cblx0XHRcdC8vcG9iaWVyYW15IG51bWVyIG9zdGF0bmllaiB6YWvFgmFka2lcblx0XHRcdGZvciAodmFyIGlfbGF5ZXJzPSB0aGlzLmFjdGl2ZSwgaV9sYXllcnNfbWF4ID0gbGF5ZXJzLmxpc3QubGVuZ3RoLTE7IGlfbGF5ZXJzIDwgaV9sYXllcnNfbWF4OyBpX2xheWVycysrKSB7XG5cdFx0XHRcdGZvciAodmFyIGk9IDAsIGlfbWF4ID0gdGhpcy5kYl9uYW1lLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspIHtcblx0XHRcdFx0XHR0aGlzW3RoaXMuZGJfbmFtZVtpXV1baV9sYXllcnNdID0gdGhpc1t0aGlzLmRiX25hbWVbaV1dW2lfbGF5ZXJzKzFdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vdXN1d2FteSBvc3RhdG5pxIUgemFrxYJhZGvEmSAvIHdhcnN0d8SZXG5cdFx0XHR2YXIgbGFzdF9pID0gbGF5ZXJzLmxpc3QubGVuZ3RoIC0gMTtcblx0XHRcdGZvciAodmFyIGk9IDAsIGlfbWF4ID0gdGhpcy5kYl9uYW1lLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspIHtcblx0XHRcdFx0dGhpc1t0aGlzLmRiX25hbWVbaV1dLnBvcCgpXG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtsYXN0X2ldKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zaG93KCk7XG5cdFx0XHR0aGlzLnNlbGVjdCgkKCcjbGF5ZXJzIHNwYW4uYWN0aXZlJykpOyBcblx0XHR9XG5cdH1cbn1cblxuLy96bWlhbmEgbmF6d3kgcHJvamVrdHUgcHJ6eSB3cGlzYW5pdSBub3dlaiBuYXp3eSBkbyBpbnB1dGFcbiQoJyNwb2ludGVycyAucHJvamVjdF9uYW1lJykua2V5dXAoZnVuY3Rpb24oKXsgbGF5ZXJzLnByb2plY3RfbmFtZSA9ICQodGhpcykudmFsKCk7IH0pO1xuXG4vL3ptaWVubmUgcG9tb2NuaWN6ZVxuJC5mbi5zZWxlY3RUZXh0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZG9jID0gZG9jdW1lbnQ7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzWzBdO1xuICAgIC8vY29uc29sZS5sb2codGhpcywgZWxlbWVudCk7XG4gICAgaWYgKGRvYy5ib2R5LmNyZWF0ZVRleHRSYW5nZSkge1xuICAgIFx0dmFyIHJhbmdlID0gZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgIHJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsZW1lbnQpO1xuICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgXHR2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpOyAgICAgICAgXG4gICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbiAgICB9XG59O1xuIiwiLy9vYmlla3QgZG90eWN6xIVzeSB3eXN3aWV0bGFuaWEgYWt1dGFsaXphY2ppIGkgZWR5Y2ppIHBhbmVsdSBsZWdlbmRcbmxlZ2VuZHMgPSB7XG5cblx0Ly93ecWbd2lldGxhbXkgd3N6eXN0a2llIGxlZ2VuZHkgdyBwYW5lbHUgbWFwXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGh0bWwgPSBcIjx0YWJsZT48dHI+PHRoPmtvbG9yOjwvdGg+PHRoPm9kOjwvdGg+PHRoPmRvOjwvdGg+PHRoPm9waXM6PC90aD48L3RyPlwiO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGh0bWwgKz0gXCI8dHIgcm93PSdcIitpK1wiJz48dGQgcm93PSdcIitpK1wiJyBjb2xfbnVtPScnIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzNdK1wiJyBjbGFzcz0nY29sb3IgY29sb3JwaWNrZXJfYm94Jz48L3RkPjx0ZCBjbGFzcz0nZnJvbScgbmFtZT0nZnJvbScgY29udGVudGVkaXRhYmxlPSd0cnVlJz5cIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVswXStcIjwvdGQ+PHRkIGNsYXNzPSd0bycgbmFtZT0ndG8nIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMV0rXCI8L3RkPjx0ZCBjbGFzcz0nZGVzY3JpcHRpb24nIG5hbWU9J2Rlc2NyaXB0aW9uJyBjb250ZW50ZWRpdGFibGU9J3RydWUnPlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzJdK1wiPC90ZD48L3RyPlwiO1xuXHRcdH1cblxuXHRcdGh0bWwgKz0gXCI8L3RhYmxlPlwiO1xuXHRcdCQoJyNsZWdlbmRzJykuaHRtbChodG1sKTtcblxuXHRcdHZhciByb3cgPSAxO1xuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRpZiggbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG5cdFx0XHRcdCQoJyNsZWdlbmRzIHRhYmxlIHRyJykuZXEocm93KS5jaGlsZHJlbigndGQnKS5lcSgwKS5hdHRyKCdjb2xfbnVtJywgaSk7XG5cdFx0XHRcdHJvdysrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKDE4ID09IGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdKSB7XG5cdFx0XHR2YXIgcm93ID0gMDtcblx0XHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdGlmKCBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcblx0XHRcdFx0XHRwYWxldHMuY29sb3JfYXJyWzE4XVtpXSA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW3Jvd107XG5cdFx0XHRcdFx0cm93Kys7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRwYWxldHMuY29sb3JfYXJyWzE4XVtpXSA9ICcjZmZmJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cGFsZXRzLnNob3coKVxuXHRcdH1cblxuXHRcdGNvbG9ycGlja2VyLmFkZCgpO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBha3V0YWxpenVqxIVjYSBrb2xvcnkgdyBwYWxlY2llIGtvbG9yw7N3XG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNvbG9yX2NvdW50ID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoIC8vaWxvc2Mga29sb3LDs3dcblx0XHR2YXIgZGlmZnJlbnQgPSBNYXRoLmFicyggbGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSAtIGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gKTsgLy8gY29sb3JfY291bnQ7XG5cdFx0XG5cdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0gPSBbXTtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cblx0XHRcdGNvbnNvbGUubG9nKCBwYXJzZUludChsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdKSxsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdICk7XG5cblx0XHRcdHZhciBub3dfdG1wID0gTWF0aC5yb3VuZCggKHBhcnNlSW50KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pK2RpZmZyZW50L2NvbG9yX2NvdW50KmkpKjEwMCkgLyAxMDBcblx0XHRcdFxuXHRcdFx0Ly9jb25zb2xlLmxvZyhsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdK2RpZmZyZW50L2NvbG9yX2NvdW50KmkpO1xuXG5cblx0XHRcdGlmKGkrMSA9PSBpX21heCApe1xuXHRcdFx0XHR2YXIgbmV4dF90bXAgPSBsYXllcnMubWF4X3ZhbHVlW2xheWVycy5hY3RpdmVdXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHR2YXIgbmV4dF90bXAgPSBNYXRoLnJvdW5kKCAoKHBhcnNlSW50KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pK2RpZmZyZW50L2NvbG9yX2NvdW50KihpKzEpKSAtIDAuMDEpICAqMTAwKSAvIDEwMCBcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ucHVzaChbbm93X3RtcCxuZXh0X3RtcCwgIFN0cmluZyhub3dfdG1wKS5yZXBsYWNlKCcuJywnLCcpKycgLSAnK1N0cmluZyhuZXh0X3RtcCkucmVwbGFjZSgnLicsJywnKSwgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1baV0gXSk7XG5cdFx0XG5cdFx0fVxuXHRcdHRoaXMuc2hvdygpO1xuXHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdH0sXG5cblx0ZWRpdDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciByb3cgPSAkKG9iaikucGFyZW50KCkuYXR0cigncm93Jyk7XG5cdFx0dmFyIG5hbWUgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXHRcdHZhciB2YWwgPSAkKG9iaikuaHRtbCgpO1xuXG5cdFx0c3dpdGNoKG5hbWUpe1xuXHRcdFx0XG5cdFx0XHRjYXNlICdmcm9tJzpcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHZhbCkpIHsgJChvYmopLmh0bWwocGFyc2VGbG9hdCh2YWwpKSB9IC8vemFiZXpwaWVjemVuaWUsIGplxZtsaSB3cGlzYW5vIHRla3N0IHphbWllbmlhbXkgZ28gbmEgbGljemLEmVxuXHRcdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtyb3ddWzBdID0gcGFyc2VGbG9hdCh2YWwpO1xuXHRcdFx0XHRjYXRlZ29yaWVzLnVwZGF0ZV9jb2xvcigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGNhc2UgJ3RvJzpcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHZhbCkpIHsgJChvYmopLmh0bWwocGFyc2VGbG9hdCh2YWwpKSB9XG5cdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW3Jvd11bMV0gPSBwYXJzZUZsb2F0KHZhbCk7XG5cdFx0XHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y2FzZSAnZGVzY3JpcHRpb24nOlxuXHRcdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtyb3ddWzJdID0gdmFsO1xuXHRcdFx0YnJlYWs7XHRcdFxuXHRcdFxuXHRcdH1cblx0fVxufVxuXG5sZWdlbmRzLnNob3coKTsgXG5cblxuLy9kb2RhamVteSB6ZGFyemVuaWUgZWR5Y2ppIHdhcnRvxZtjaSB3IGxlZ2VuZHppZVxuJCgnI2xlZ2VuZHMnKS5vbigna2V5dXAnLCd0ZCcsIGZ1bmN0aW9uKCl7IGxlZ2VuZHMuZWRpdCh0aGlzKTsgfSk7XG4iLCIvKlxuICAgIF9fX18gICBfX19fIF9fX18gICAgX18gIF9fXyBfX18gICAgIF9fX18gICAgIF9fX19fICAgIF9fX18gXG4gICAvIF9fICkgLyAgXy8vIF9fIFxcICAvICB8LyAgLy8gICB8ICAgLyBfXyBcXCAgIHxfXyAgLyAgIC8gX18gXFxcbiAgLyBfXyAgfCAvIC8gLyAvIC8gLyAvIC98Xy8gLy8gL3wgfCAgLyAvXy8gLyAgICAvXyA8ICAgLyAvIC8gL1xuIC8gL18vIC9fLyAvIC8gL18vIC8gLyAvICAvIC8vIF9fXyB8IC8gX19fXy8gICBfX18vIC9fIC8gL18vIC8gXG4vX19fX18vL19fXy8gXFxfX19cXF9cXC9fLyAgL18vL18vICB8X3wvXy8gICAgICAgL19fX18vKF8pXFxfX19fLyAgXG5cbnZhcnNpb24gMy4wIGJ5IE1hcmNpbiBHxJliYWxhXG5cbmxpc3RhIG9iaWVrdMOzdzpcbmNhbnZhcyAtIG9iaWVrdCBjYW52YXNhXG5jYXRlZ29yaWVzXG5jbG91ZFxuY29sb3JfcGlja2VyXG5jcnVkIC0gb2JpZWt0IGNhbnZhc2FcbmV4Y2VsXG5maWd1cmVzXG5nbG9iYWxcbmltYWdlIC0gb2JpZWt0IHpkasSZY2lhIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG5pbnB1dFxubGFiZWxzXG5sYXllcnNcbmxlZ2VuZHNcbm1haW5cbm1lbnVfdG9wXG5tb2RlbHNcbm1vdXNlXG5vbl9jYXRlZ29yeVxucGFsZXRzXG5wb2ludGVyc1xuXG4qL1xuXG5cbi8vIENyZWF0ZSBJRSArIG90aGVycyBjb21wYXRpYmxlIGV2ZW50IGhhbmRsZXJcbnZhciBldmVudE1ldGhvZCA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID8gXCJhZGRFdmVudExpc3RlbmVyXCIgOiBcImF0dGFjaEV2ZW50XCI7XG52YXIgZXZlbnRlciA9IHdpbmRvd1tldmVudE1ldGhvZF07XG52YXIgbWVzc2FnZUV2ZW50ID0gZXZlbnRNZXRob2QgPT0gXCJhdHRhY2hFdmVudFwiID8gXCJvbm1lc3NhZ2VcIiA6IFwibWVzc2FnZVwiO1xuXG4vLyBMaXN0ZW4gdG8gbWVzc2FnZSBmcm9tIGNoaWxkIHdpbmRvd1xuZXZlbnRlcihtZXNzYWdlRXZlbnQsZnVuY3Rpb24oZSkge1xuICBjb25zb2xlLmxvZygncGFyZW50IHJlY2VpdmVkIG1lc3NhZ2UhOiAgJyxlLmRhdGEpO1xufSxmYWxzZSk7XG4gXG4vL2RvZGFqZW15IHRpbnltY2UgZG8gMiB0ZXh0YXJlYSAoZHltZWsgxbpyw7NkxYJvKVxudGlueW1jZS5pbml0KHtcblx0bWVudWJhcjpmYWxzZSxcbiAgc2VsZWN0b3I6ICcudGlueWVkaXQnLCAgLy8gY2hhbmdlIHRoaXMgdmFsdWUgYWNjb3JkaW5nIHRvIHlvdXIgSFRNTFxuICB0b29sYmFyOiAnYm9sZCBpdGFsaWMgfCBsaW5rIGltYWdlJyxcbiAgICBzZXR1cDogZnVuY3Rpb24gKGVkaXRvcikge1xuICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gJChlZGl0b3IudGFyZ2V0RWxtKS5hdHRyKCduYW1lJyk7XG4gICAgICAgIFxuICAgICAgICAvL2plxZtsaSBha3R1YWxpenVqZW15IGR5bWVrXG4gICAgICAgIGlmKHRhcmdldCA9PSAnY2xvdWQnKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygpXG4gICAgICAgIFx0bGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdID0gZWRpdG9yLmdldENvbnRlbnQoKTtcbiAgICAgICAgXHQvL2Nsb3VkLmdldF90ZXh0YXJlYSggZWRpdG9yLmdldENvbnRlbnQoKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9qZcWbbGkgYWt0dWFsaXp1amVteSDFvHLDs2TFgm8gcHJvamVrdHVcbiAgICAgICAgaWYodGFyZ2V0ID09ICdzb3VyY2UnKXtcbiAgIFx0XHRcdFx0bGF5ZXJzLnNvdXJjZSA9IGVkaXRvci5nZXRDb250ZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG4gICAgfVxufSk7XG5cbndpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uIChldnQpIHtcbiBcdGlmICh0eXBlb2YgZXZ0ID09ICd1bmRlZmluZWQnKSB7XG4gIFx0ZXZ0ID0gd2luZG93LmV2ZW50O1xuIFx0fVxuIFx0aWYgKGV2dCkge1xuICBcdGlmKCFjb25maXJtKCdDenkgY2hjZXN6IG9wdcWbY2nEhyB0xJkgc3Ryb27EmScpKSByZXR1cm4gZmFsc2Vcblx0fVxufVxuXG4vL3BvIGtsaWtuacSZY2l1IHptaWVuaWF5IGFrdHVhbG55IHBhbmVsXG4kKCcuYm94ID4gdWwgPiBsaScpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9ib3godGhpcykgfSk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0bWVudV90b3AuZ2V0X21hcHMoKTtcblx0bWVudV90b3AuZ2V0X3Byb2plY3RzKCk7XG4gIGxheWVycy5zaG93KCk7XG4gIHBhbGV0cy5zaG93KCk7XG5cbiAgY29sb3JwaWNrZXIuY29sb3JfYm9yZGVyKCk7XG5cblx0Ly96YWJsb2tvd2FuaWUgbW/FvGxpd2/Fm2NpIHphem5hY3phbmlhIGJ1dHRvbsOzdyBwb2RjemFzIGVkeWNqaSBwb2xhXG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNpblwiLFwiaW5wdXRcIixmdW5jdGlvbigpeyBtZW51X3RvcC5kaXNhYmxlX3NlbGVjdCA9IHRydWU7IH0pO1xuXHQkKGRvY3VtZW50KS5vbihcImZvY3Vzb3V0XCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gZmFsc2U7IH0pO1xuXG5cdC8vemF6bmFjemVuaWUgZHlta2EgZG8gcHVibGlrYWNqaSBwbyBrbGlrbmnEmWNpdVxuXHQkKCcucHVibGlzaCAuZW1iZWQnKS5jbGljayhmdW5jdGlvbigpe1x0JCh0aGlzKS5zZWxlY3QoKTtcdH0pO1xuXHQkKCcucHVibGlzaCcpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXsgY3J1ZC5wdWJsaXNoKGV2ZW50KTsgfSk7XG5cblx0Ly9qZcWbbGkgY2hjZW15IHphcGlzYcSHIC8gemFrdHVhbGl6b3dhxIcgLyBvcHVibGlrb3dhxIcgcHJvamVrdFxuXHQkKCcjdG9vbGJhcl90b3AgYnV0dG9uLnNhdmUnKS5jbGljayhmdW5jdGlvbigpeyBcblx0XHRpZih0eXBlb2YgY3J1ZC5wcm9qZWN0X2hhc2ggPT0gJ3N0cmluZycpe1x0Y3J1ZC51cGRhdGVfcHJvamVjdCgpOyB9XG5cdFx0ZWxzZXsgY3J1ZC5jcmVhdGVfcHJvamVjdCgpOyB9XG5cdH0pO1xuXG5cdC8vamXFm2xpIGNoY2VteSB1c3VuxIXEhyBwcm9qZWt0XG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uZGVsZXRlJykuY2xpY2soZnVuY3Rpb24oKXsgXG5cdFx0aWYoY29uZmlybSgnQ3p5IGNoY2VzeiB1c3VuxIXEhyBwcm9qZWt0ID8nKSl7XG5cdFx0XHRjcnVkLmRlbGV0ZV9wcm9qZWN0KCk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL29kem5hY3plbmllIHNlbGVjdGEgcHJ6eSB6bWlhbmllXG5cdCQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgJCgnI2NoYW5nZV9jYXRlZ29yeScpLmJsdXIoKTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSBwdXNjemVuaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IG1vdXNlLm1vdXNlX2Rvd24gPSBmYWxzZTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSB3Y2nFm25pxJljaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXHRcblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL8WCYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpO1xuXHRcblx0fSk7XG5cblx0Ly93eXdvxYJhbmllIGZ1bmtjamkgcG9kY3phcyBwb3J1c3phbmlhIG15c3prxIVcblx0JChkb2N1bWVudCkubW91c2Vtb3ZlKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdGlmKG1vdXNlLm1vdXNlX2Rvd24pIG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cdFx0aWYobWVudV90b3AuYXV0b19kcmF3KXsgbW91c2UuY2xpY2tfb2JqID0gXCJjYW52YXNcIjsgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTt9XG5cdFxuXHR9KTtcblxuXHQkKCcjbWFpbl9jYW52YXMnKS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpOy8vemFyZWplc3Ryb3dhbmllIG9iaWVrdHV3ICBrdMOzcnkga2xpa2FteVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cblx0fSk7XG5cblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpe1xuXG5cdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBudWxsO1x0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRjYW52YXMuY29udGV4dF94ID0gY2FudmFzLmNvbnRleHRfbmV3X3g7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IGNhbnZhcy5jb250ZXh0X25ld195O1xuXG5cdH0pO1xuXG5cdC8vZG9kYW5pZSBub3dlaiBrYXRlZ29yaWlcblx0JCgnI2FkZF9jYXRlZ29yeScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0Y2F0ZWdvcmllcy5hZGQoKTtcblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaSAocG8gd2NpxZtuacSZY2l1IGVudGVyKVxuXHQkKCdpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykua2V5cHJlc3MoZnVuY3Rpb24oZSkge1xuICAgIFx0aWYoZS53aGljaCA9PSAxMykge1xuICAgIFx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuICAgIFx0fVxuXHR9KTtcblxuXHQvLyQoZG9jdW1lbnQpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHsgbWVudV90b3Auc3dpdGNoX21vZGUoIGUud2hpY2ggKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImZvY3Vzb3V0XCIsIGZ1bmN0aW9uKCkgeyBjYXRlZ29yaWVzLnVwZGF0ZSgkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5JykgLCQodGhpcykudmFsKCkgKTsgfSk7XG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImtleXByZXNzXCIsIGZ1bmN0aW9uKGUpIHsgaWYoZS53aGljaCA9PSAxMykge2NhdGVnb3JpZXMudXBkYXRlKCQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKSAsJCh0aGlzKS52YWwoKSApOyB9IH0pO1xuXG5cdC8vdXN1bmnEmWNpZSBrYXRlZ29yaWlcbi8vXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJidXR0b24ucmVtb3ZlXCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy5yZW1vdmUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpL1xuLy9cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgIH0pO1xuLy9cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJmb2N1c291dFwiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSB0cnVlOyAgfSk7XG5cblx0Ly9wb2themFuaWUgLyB1a3J5Y2llIHBhbmVsdSBrYXRlZ29yaWlcblx0JCgnI2V4Y2VsX2JveCBoMiwgI3BvaW50ZXJfYm94IGgyLCAjcGFsZXRzX2JveCBoMicpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXsgZ2xvYmFsLnRvb2dsZV9wYW5lbChldmVudCk7IH0pO1xuXG5cdC8vb2JzxYJ1Z2EgYnV0dG9uw7N3IGRvIGlua3JlbWVudGFjamkgaSBkZWtyZW1lbnRhY2ppIGlucHV0w7N3XG5cdCQoJ2J1dHRvbi5pbmNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2luY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXHQkKCdidXR0b24uZGVjcmVtZW50JykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLmJ1dHRvbl9kZWNyZW1lbnQoICQodGhpcykgKSB9KTtcblxuXHQvL29ixYJ1Z2EgaW5wdXTDs3cgcG9icmFuaWUgZGFueWNoIGkgemFwaXNhbmllIGRvIGJhenlcblx0JCgnLnN3aXRjaCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9zd2l0Y2goICQodGhpcykgKTsgfSk7IC8vcHJ6eWNpc2tpIHN3aXRjaFxuXHQkKCcuaW5wdXRfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXQoICQodGhpcykgKTsgfSk7IC8vdHJhZHljeWpuZSBpbnB1dHlcblx0JCgnLmlucHV0X2Jhc2VfdGV4dCcpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXRfdGV4dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuc2VsZWN0X2Jhc2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3NlbGVjdCggJCh0aGlzKSApOyB9KTsgLy9saXN0eSByb3p3aWphbmUgc2VsZWN0XG5cblx0JCgnI21lbnVfdG9wICNpbmNyZW1lbnRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuaW5jcmVtZW50X3NjYWxlKCk7IH0pO1xuXHQkKCcjbWVudV90b3AgI2RlY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5kZWNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjYWRkX2ltYWdlJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuYWRkX2ltYWdlKCk7IH0pO1xuXG5cdCQoJyNtZW51X3RvcCAjcmVzZXRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgY2FudmFzLnNldF9kZWZhdWx0KCk7IH0pO1xuXG5cdC8vcHJ6eXBpc2FuaWUgcG9kc3Rhd293b3d5Y2ggZGFueWNoIGRvIG9iaWVrdHUgY2FudmFzXG5cdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcbiAgY2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnKSApO1xuICBjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnKSApO1xuICB2YXIgb2Zmc2V0ID0gJCgnI2NhbnZhc19ib3gnKS5vZmZzZXQoKTtcbiAgY2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuICAvL3R3b3J6eW15IHRhYmxpY2UgcG9pbnRlcsOzd1xuXHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblxuICAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuICAkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCwjY2FudmFzX2luZm8gI2hlaWdodCwjY2FudmFzX2luZm8gI3NpemUnKS5jaGFuZ2UoZnVuY3Rpb24oKXttZW51X3RvcC51cGRhdGVfY2FudmFzX2luZm8oKX0pO1xuXG5cdC8vJCgnI2FscGhhX2ltYWdlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9hbHBoYSgpIH0pO1xuXG5cdC8vJCgnaW5wdXQnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyB9KTtcblx0Ly8kKCdpbnB1dCcpLmZvY3Vzb3V0KGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgfSk7XG5cblx0Ly8kKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IGNhbnZhcy5kcmF3KCk7IH0pO1xuXHRjYW52YXMuZHJhdygpOyAvL3J5c293YW5pZSBjYW52YXNcblxufSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxubWVudV90b3AgPSB7XG5cblx0bW92ZV9pbWFnZSA6IGZhbHNlLFxuXHRtb3ZlX2NhbnZhcyA6IGZhbHNlLFxuXHRhdXRvX2RyYXcgOiBmYWxzZSxcblx0bW9kZV9rZXkgOiB0cnVlLFxuXHRjYXRlZ29yeSA6IDAsXG5cdGRpc2FibGVfc2VsZWN0IDogZmFsc2UsXG5cblx0Ly96bWlhbmEgYWt0dWFsbmVqIHpha8WCYWRraVxuXHRjaGFuZ2VfYm94IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKG9iaikucGFyZW50KCkuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHR2YXIgY2F0ZWdvcnkgPSAkKG9iaikuYXR0cignY2F0ZWdvcnknKTtcblx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJ2RpdicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuXHRcdFx0JChvYmopLnBhcmVudCgpLnBhcmVudCgpLmNoaWxkcmVuKCcjJytjYXRlZ29yeSkuZGVsYXkoMTAwKS5mYWRlSW4oNTAwKTtcblx0XHR9KTtcblx0XG5cdFxuXHR9LFxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X21hcHMgOiBmdW5jdGlvbigpe1xuXHRcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvbWFwcycsXG4gICAgXHR0eXBlOiBcIkdFVFwiLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZSggZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XG5cdFx0XHQvL3d5xZt3aWV0bGFteSBsaXN0xJkgbWFwIHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnPG9wdGlvbiBpZD1cInNlbGVjdF9tYXBcIj53eWJpZXJ6IG1hcMSZPC9vcHRpb24+Jztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXAnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0XHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBtYXAgXG5cdFx0XHRcdCQoJy5zZWxlY3RfbWFwJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Ly9zcHJhd2R6YW15IGN6eSB3eWJyYWxpxZtteSBwb2xlIHogaGFzaGVtIG1hcHlcblx0XHRcdFx0XHRpZiggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpICE9ICdzZWxlY3RfbWFwJyl7XG5cdFx0XHRcdFx0XHQvL2plxZtsaSB0YWsgdG8gc3ByYXdkemFteSBjenkgd2N6eXR1amVteSBtYXDEmSBwbyByYXogcGllcndzenkgY3p5IGRydWdpXG5cdFx0XHRcdFx0XHRpZihjcnVkLm1hcF9oYXNoICE9IG51bGwpe1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB3Y3p5dHVqZW15IHBvIHJheiBrb2xlam55IHRvIHB5dGFteSBjenkgbmFwZXdubyBjaGNlbXkgasSFIHdjenl0YcSHXG5cdFx0XHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd8SFIG1hcMSZID8nKSkge1xuXHRcdFx0XHRcdFx0XHRcdGNydWQubWFwX2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdFx0Y3J1ZC5nZXRfbWFwKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdCQoJy5zZWxlY3RfbWFwIG9wdGlvbicpLmVxKDApLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLm1hcF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9tYXAoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRhbGVydCgnbmllIG1vZ8SZIHBvYnJhxIcgbGlzdHkgbWFwJyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblxuXG5cdH0sXG5cblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9wcm9qZWN0cyA6IGZ1bmN0aW9uKCl7XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL3Byb2plY3RzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBwcm9qZWt0w7N3IHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICc8b3B0aW9uIGlkPVwibmV3X3Byb2plY3RcIj5ub3d5IHByb2pla3Q8L29wdGlvbj4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5wcm9qZWN0X2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5wcm9qZWN0KS5uYW1lICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLnByb2plY3QpLm5hbWUgKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfcHJvamVjdCcpLmh0bWwoIGFkZF9odG1sICk7XG5cdFx0XHRcblx0XHRcdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIHByb2plY3QgXG5cdFx0XHRcdCQoJy5zZWxlY3RfcHJvamVjdCcpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd3kgcHJvamVrdCA/JykpIHtcblx0XHRcdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19wcm9qZWN0JyApe1xuXHRcdFx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGNydWQucHJvamVjdF9oYXNoID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpO1xuXHRcdFx0XHRcdFx0XHRjcnVkLmdldF9wcm9qZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0YWxlcnQoJ25pZSBtb2fEmSBwb2JyYcSHIGxpc3R5IHByb2pla3TDs3cnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0fSxcblxuXHR1cGRhdGVfY2FudmFzX2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5zY2FsZSA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoKSApO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCgpICk7XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoKSApO1xuXG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCBjYW52YXMuc2NhbGUgKyAnJScgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCBjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcgKTtcblxuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyxjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JyxjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0Y2hhbmdlX2FscGhhIDogZnVuY3Rpb24oKXtcblx0XHRpbWFnZS5hbHBoYSA9ICQoJyNhbHBoYV9pbWFnZScpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGFkZF9pbWFnZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2plc2xpIHBvZGFueSBwYXJhbWV0ciBuaWUgamVzdCBwdXN0eVxuXHRcdHZhciBzcmNfaW1hZ2UgPSBwcm9tcHQoXCJQb2RhaiDFm2NpZcW8a8SZIGRvIHpkasSZY2lhOiBcIik7XG5cblx0XHRpZihzcmNfaW1hZ2Upe1xuXHRcdFx0aWYoc3JjX2ltYWdlLmxlbmd0aCA+IDApe1xuXG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0XHRcdC8vd2N6eXRhbmllIHpkasSZY2lhOlxuXHRcdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHRpbWFnZS53aWR0aCA9IGltYWdlLm9iai53aWR0aDtcblx0ICAgIFx0XHRpbWFnZS5oZWlnaHQgPSBpbWFnZS5vYmouaGVpZ2h0O1xuXHQgICAgXHRcdGltYWdlLmRyYXcoKTtcblx0ICBcdFx0fTtcblxuXHRcdFx0ICBpbWFnZS54ID0gMDtcblx0XHRcdCAgaW1hZ2UueSA9IDA7XG5cdFx0XHQgIGltYWdlLm9iai5zcmMgPSBzcmNfaW1hZ2U7XG5cdFx0XHRcdC8vc2ltYWdlLm9iai5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzaG93X2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbChwYXJzZUludChjYW52YXMuc2NhbGUpICsgJyUnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHBhcnNlSW50KGNhbnZhcy53aWR0aF9jYW52YXMpICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwocGFyc2VJbnQoY2FudmFzLmhlaWdodF9jYW52YXMpICsgJ3B4Jyk7XG5cdH1cblxufVxuIiwiLy8gcG9iaWVyYW5pZSBkYW55Y2ggeiBzZWxla3RhIGlucHV0YSBzd2l0Y2h5IChha3R1YWxpemFjamEgb2JpZWt0w7N3KSBidXR0b24gaW5rcmVtZW50IGkgZGVrcmVtZW50XG52YXIgbW9kZWxzID0ge1xuXG5cdGJ1dHRvbl9pbmNyZW1lbnQgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIGlucHV0X3RvX3VwZGF0ZSA9ICQob2JqKS5hdHRyKCduYW1laW5wdXQnKTtcblx0XHR2YXIgdmFsdWUgPSBwYXJzZUludCgkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCgpKSArIDE7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCh2YWx1ZSk7XG5cdFx0dGhpcy51cGRhdGVfZnJvbV9pbnB1dCggJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKSApO1xuXHR9LFxuXG5cdGJ1dHRvbl9kZWNyZW1lbnQgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIGlucHV0X3RvX3VwZGF0ZSA9ICQob2JqKS5hdHRyKCduYW1laW5wdXQnKTtcblx0XHR2YXIgdmFsdWUgPSBwYXJzZUludCgkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCgpKSAtIDE7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCh2YWx1ZSk7XG5cdFx0dGhpcy51cGRhdGVfZnJvbV9pbnB1dCggJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKSApO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX2lucHV0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9IHBhcnNlSW50KCQob2JqKS52YWwoKSk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dF90ZXh0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9ICQob2JqKS52YWwoKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3NlbGVjdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21fc3dpdGNoIDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHRpZiggJChvYmopLmF0dHIoXCJ2YWx1ZVwiKSA9PSAnZmFsc2UnICl7XG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ3RydWUnKTtcblx0XHRcdCQob2JqKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRlbHNleyAvL3d5xYLEhWN6YW15IHByemXFgsSFY3puaWtcblx0XHRcdCQob2JqKS5hdHRyKFwidmFsdWVcIiwnZmFsc2UnKTtcblx0XHRcdCQob2JqKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHQkKG9iaikuYWRkQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBmYWxzZTtcblx0XHR9XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3QgbXlzemtpIChkbyBvZ2FybmllY2lhKVxudmFyIG1vdXNlID0ge1xuXHRtb3VzZV9kb3duIDogZmFsc2UsXG5cdGNsaWNrX29iaiA6IG51bGwsXG5cblx0dG1wX21vdXNlX3ggOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXHR0bXBfbW91c2VfeSA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cblx0bGVmdCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praVxuXHR0b3AgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2lcblx0cGFkZGluZ194IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdHBhZGRpbmdfeSA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRvZmZzZXRfeCA6IG51bGwsIC8vb2Zmc2V0IHggb2JpZWt0dSBrbGlrbmnEmXRlZ29cblx0b2Zmc2V0X3kgOiBudWxsLCAvL29mZnNldCB5IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cblx0Ly9mdW5ja2phIHd5a3J5d2FqxIVjYSB3IGNvIGtsaWtuacSZdG8gcG9iaWVyYWrEhWNhIHBhZGRpbmcga2xpa25pxJljaWEgb3JheiB6YXBpc3VqxIVjYSBrbGlrbmnEmWNpZVxuXHRzZXRfbW91c2VfZG93biA6IGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdHZhciBvYmogPSBldmVudC50YXJnZXQ7XG5cblx0XHQvL2plxZtsaSBlbGVtZW50IG5hIGt0w7NyeSBrbGlrbmnEmXRvIG1hIGF0cnlidXQgbmFtZWNsaWNrIHByenlwaXN1amVteSBnbyBkbyBvYmlla3R1IG15c3praVxuXHRcdGlmKHR5cGVvZigkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJykpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0dGhpcy5jbGlja19vYmogPSAkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJyk7XG5cblx0XHRcdHZhciBwb3NpdGlvbiA9ICQob2JqKS5vZmZzZXQoKTtcblx0XHRcdHRoaXMub2Zmc2V0X3ggPSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5vZmZzZXRfeSA9IHBvc2l0aW9uLnRvcDtcblx0XHRcdHRoaXMucGFkZGluZ194ID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMucGFkZGluZ195ID0gdGhpcy50b3AgLSBwb3NpdGlvbi50b3A7XG5cdFx0XHRtb3VzZS5tb3VzZV9kb3duID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy50bXBfbW91c2VfeCA9IGltYWdlLng7XG5cdFx0XHR0aGlzLnRtcF9tb3VzZV95ID0gaW1hZ2UueTtcblx0XHR9XG5cdH0sXG5cblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdHRoaXMubGVmdCA9IGV2ZW50LnBhZ2VYLFxuXHRcdHRoaXMudG9wID0gZXZlbnQucGFnZVlcblx0fSxcblxuXHQvL2Z1bmtjamEgd3lrb255d2FuYSBwb2RjemFzIHdjacWbbmllY2lhIHByenljaWtza3UgbXlzemtpICh3IHphbGXFvG5vxZtjaSBvZCBrbGlrbmnEmXRlZ28gZWxlbWVudHUgd3lrb251amVteSByw7PFvG5lIHJ6ZWN6eSlcblx0bW91c2Vtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHRzd2l0Y2godGhpcy5jbGlja19vYmope1xuXHRcdFx0Y2FzZSAncmlnaHRfcmVzaXplJzpcblx0XHRcdFx0Ly9yb3pzemVyemFuaWUgY2FudmFzYSB3IHByYXdvXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0dmFyIG5ld193aWR0aCA9IHRoaXMubGVmdCAtIHRoaXMucGFkZGluZ194IC0gcG9zaXRpb24ubGVmdFxuXHRcdFx0XHRpZihuZXdfd2lkdGggPCBzY3JlZW4ud2lkdGggLSAxMDApe1xuXHRcdFx0XHRcdGNhbnZhcy5yZXNpemVfd2lkdGgobmV3X3dpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2JvdHRvbV9yZXNpemUnOlxuXHRcdFx0XHQvL3ptaWVuaWFteSB3eXNva2/Fm8SHIGNhbnZhc2Fcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRjYW52YXMucmVzaXplX2hlaWdodCh0aGlzLnRvcCAtIHRoaXMucGFkZGluZ195IC0gcG9zaXRpb24udG9wKTtcblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdpbWFnZV9yZXNpemUnOlxuXG5cdFx0XHRcdGlmKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0XHR2YXIgeF9hY3R1YWwgPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1x0Ly9ha3R1YWxuYSBwb3p5Y2phIG15c3praVxuXHRcdFx0XHRcdHZhciBzdWJzdHJhY3QgPSBpbWFnZS54ICsgaW1hZ2Uud2lkdGggLSB4X2FjdHVhbCArIHRoaXMucGFkZGluZ194O1xuXHRcdFx0XHRcdHZhciBmYWNvciA9IGltYWdlLndpZHRoIC8gaW1hZ2UuaGVpZ2h0O1xuXG5cdFx0XHRcdFx0aWYgKGltYWdlLndpZHRoIC0gc3Vic3RyYWN0ID4gMTAwKXtcblx0XHRcdFx0XHRcdGltYWdlLndpZHRoIC09IHN1YnN0cmFjdDtcblx0XHRcdFx0XHRcdGltYWdlLmhlaWdodCAtPSBzdWJzdHJhY3QvZmFjb3I7XG5cdFx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG4iLCIvL29iaWVrdCBtw7N3acSFY3kgbmFtIG5hZCBqYWvEhSBrYXRlZ29yaWEgamVzdGXFm215XG52YXIgb25fY2F0ZWdvcnkgPSB7XG5cdFxuXHRjYW52YXNfb2Zmc2V0X3RvcCA6IDE4Nyxcblx0Y2FudmFzX29mZnNldF9sZWZ0IDogMTAsXG5cdG5hbWUgOiBudWxsLFxuXHRudW1iZXIgOiBudWxsLFxuXG5cdC8vZnVua2NqYSB6d3JhY2FqxIVjYSBha3R1YWxuxIUga2F0ZWdvcmnEmSBuYWQga3TDs3LEhSB6bmFqZHVqZSBzacSZIGt1cnNvclxuXHRzZXQgOiBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIHRoaXMuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSB0aGlzLmNhbnZhc19vZmZzZXRfdG9wO1xuXHRcdHZhciByb3cgPSBNYXRoLmNlaWwoIHRvcCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdC8vY29uc29sZS5sb2cobGVmdCx0b3AsdGhpcy5jYW52YXNfb2Zmc2V0X2xlZnQsdGhpcy5jYW52YXNfb2Zmc2V0X3RvcCk7XG5cdFx0aWYoKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICYmIChyb3cgJSAyICE9IDApKXtcblx0XHRcdHZhciBjb2x1bW4gPSBNYXRoLmNlaWwoIChsZWZ0ICsgKHBvaW50ZXJzLnNpemUvMikpLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeCkgKSAtIDE7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCBsZWZ0IC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cdFx0fVxuXG5cdFx0dHJ5e1xuXHRcdFx0dmFyIGNhdGVnb3J5X251bSA9IHBvaW50ZXJzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW4tMV0gXG5cdFx0XHR2YXIgY2F0ZWdvcnlfbmFtZSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnlbY2F0ZWdvcnlfbnVtXVswXVxuXHRcdH1cblx0XHRjYXRjaChlKXtcblx0XHRcdHRoaXMubmFtZSA9IG51bGw7XG5cdFx0XHR0aGlzLm51bWJlciA9IG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKChjYXRlZ29yeV9uYW1lID09ICdwdXN0eScpIHx8IChjYXRlZ29yeV9uYW1lID09ICdndW11aicpKXtcblx0XHRcdHRoaXMubmFtZSA9IG51bGw7XG5cdFx0XHR0aGlzLm51bWJlciA9IG51bGw7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLm5hbWUgPSBjYXRlZ29yeV9uYW1lO1xuXHRcdFx0dGhpcy5udW1iZXIgPSBjYXRlZ29yeV9udW07XG5cdFx0fVxuXG5cdH1cblxufVxuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCl7ICQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTsgfSk7XG5cbiQoJyNjYW52YXNfd3JhcHBlcicpLm1vdXNlbW92ZShmdW5jdGlvbigpeyBcblx0b25fY2F0ZWdvcnkuc2V0KCk7XG5cdGNsb3VkLnVwZGF0ZV90ZXh0KCk7XG5cdGNsb3VkLnNldF9wb3NpdGlvbigpO1xufSk7XG5cbiIsInZhciBwYWxldHMgPSB7XG4gIC8vdmFsX21heCA6IG51bGwsXG4gIC8vdmFsX21pbiA6IG51bGwsXG4gIC8vdmFsX2ludGVydmFsIDogbnVsbCwgICBcbiAgLy9wYWxldHNfYWN0aXZlIDogMCxcbiAgLy92YWx1ZSA6IC0xLCBcbiAgLy9jYXRlZ29yeSA6IC0xLFxuXG4gIC8vcG9kc3Rhd293ZSBwYWxldHkga29sb3LDs3cgKCBvc3RhdG5pYSBwYWxldGEgamVzdCBuYXN6xIUgd8WCYXNuxIUgZG8gemRlZmluaW93YW5pYSApXG4gIGNvbG9yX2FyciA6IFtcbiAgICBbJyNmN2ZjZmQnLCcjZTVmNWY5JywnI2NjZWNlNicsJyM5OWQ4YzknLCcjNjZjMmE0JywnIzQxYWU3NicsJyMyMzhiNDUnLCcjMDA2ZDJjJywnIzAwNDQxYiddLFxuICAgIFsnI2Y3ZmNmZCcsJyNlMGVjZjQnLCcjYmZkM2U2JywnIzllYmNkYScsJyM4Yzk2YzYnLCcjOGM2YmIxJywnIzg4NDE5ZCcsJyM4MTBmN2MnLCcjNGQwMDRiJ10sXG4gICAgWycjZjdmY2YwJywnI2UwZjNkYicsJyNjY2ViYzUnLCcjYThkZGI1JywnIzdiY2NjNCcsJyM0ZWIzZDMnLCcjMmI4Y2JlJywnIzA4NjhhYycsJyMwODQwODEnXSxcbiAgICBbJyNmZmY3ZWMnLCcjZmVlOGM4JywnI2ZkZDQ5ZScsJyNmZGJiODQnLCcjZmM4ZDU5JywnI2VmNjU0OCcsJyNkNzMwMWYnLCcjYjMwMDAwJywnIzdmMDAwMCddLFxuICAgIFsnI2ZmZjdmYicsJyNlY2U3ZjInLCcjZDBkMWU2JywnI2E2YmRkYicsJyM3NGE5Y2YnLCcjMzY5MGMwJywnIzA1NzBiMCcsJyMwNDVhOGQnLCcjMDIzODU4J10sXG4gICAgWycjZmZmN2ZiJywnI2VjZTJmMCcsJyNkMGQxZTYnLCcjYTZiZGRiJywnIzY3YTljZicsJyMzNjkwYzAnLCcjMDI4MThhJywnIzAxNmM1OScsJyMwMTQ2MzYnXSxcbiAgICBbJyNmN2Y0ZjknLCcjZTdlMWVmJywnI2Q0YjlkYScsJyNjOTk0YzcnLCcjZGY2NWIwJywnI2U3Mjk4YScsJyNjZTEyNTYnLCcjOTgwMDQzJywnIzY3MDAxZiddLFxuICAgIFsnI2ZmZjdmMycsJyNmZGUwZGQnLCcjZmNjNWMwJywnI2ZhOWZiNScsJyNmNzY4YTEnLCcjZGQzNDk3JywnI2FlMDE3ZScsJyM3YTAxNzcnLCcjNDkwMDZhJ10sXG4gICAgWycjZmZmZmU1JywnI2Y3ZmNiOScsJyNkOWYwYTMnLCcjYWRkZDhlJywnIzc4YzY3OScsJyM0MWFiNWQnLCcjMjM4NDQzJywnIzAwNjgzNycsJyMwMDQ1MjknXSxcbiAgICBbJyNmZmZmZDknLCcjZWRmOGIxJywnI2M3ZTliNCcsJyM3ZmNkYmInLCcjNDFiNmM0JywnIzFkOTFjMCcsJyMyMjVlYTgnLCcjMjUzNDk0JywnIzA4MWQ1OCddLFxuICAgIFsnI2ZmZmZlNScsJyNmZmY3YmMnLCcjZmVlMzkxJywnI2ZlYzQ0ZicsJyNmZTk5MjknLCcjZWM3MDE0JywnI2NjNGMwMicsJyM5OTM0MDQnLCcjNjYyNTA2J10sXG4gICAgWycjZmZmZmNjJywnI2ZmZWRhMCcsJyNmZWQ5NzYnLCcjZmViMjRjJywnI2ZkOGQzYycsJyNmYzRlMmEnLCcjZTMxYTFjJywnI2JkMDAyNicsJyM4MDAwMjYnXSxcbiAgICBbJyNmN2ZiZmYnLCcjZGVlYmY3JywnI2M2ZGJlZicsJyM5ZWNhZTEnLCcjNmJhZWQ2JywnIzQyOTJjNicsJyMyMTcxYjUnLCcjMDg1MTljJywnIzA4MzA2YiddLFxuICAgIFsnI2Y3ZmNmNScsJyNlNWY1ZTAnLCcjYzdlOWMwJywnI2ExZDk5YicsJyM3NGM0NzYnLCcjNDFhYjVkJywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10sXG4gICAgWycjZmZmZmZmJywnI2YwZjBmMCcsJyNkOWQ5ZDknLCcjYmRiZGJkJywnIzk2OTY5NicsJyM3MzczNzMnLCcjNTI1MjUyJywnIzI1MjUyNScsJyMwMDAwMDAnXSxcbiAgICBbJyNmZmY1ZWInLCcjZmVlNmNlJywnI2ZkZDBhMicsJyNmZGFlNmInLCcjZmQ4ZDNjJywnI2YxNjkxMycsJyNkOTQ4MDEnLCcjYTYzNjAzJywnIzdmMjcwNCddLFxuICAgIFsnI2ZjZmJmZCcsJyNlZmVkZjUnLCcjZGFkYWViJywnI2JjYmRkYycsJyM5ZTlhYzgnLCcjODA3ZGJhJywnIzZhNTFhMycsJyM1NDI3OGYnLCcjM2YwMDdkJ10sXG4gICAgWycjZmZmNWYwJywnI2ZlZTBkMicsJyNmY2JiYTEnLCcjZmM5MjcyJywnI2ZiNmE0YScsJyNlZjNiMmMnLCcjY2IxODFkJywnI2E1MGYxNScsJyM2NzAwMGQnXSxcbiAgICBbJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZiddXG4gIF0sXG5cbiAgc2hvdyA6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zaG93X2NvbG9yKCk7XG4gICAgdGhpcy5zaG93X3BhbGV0cygpO1xuICAgIHRoaXMuc2hvd19zZWxlY3QoKTtcbiAgICAvL2xheWVycy5kYXRhLmNvbG9yX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdO1xuICB9LFxuXG4gIHNob3dfc2VsZWN0IDogZnVuY3Rpb24oKXtcblxuICAgIC8vd3nFm3dpZXRsYW15IHBhbmVsIGRvIHd5Ym9ydSBrb2x1bW55IGthdGVnb3JpaVxuICAgIGFkZF9odG1sID0gJzxvcHRpb24gY29sPVwiLTFcIj53eWJpZXJ6PC9vcHRpb24+JztcbiAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyAgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgaWYoZXhjZWwuZGF0YVswXVtpXSE9ICcnKXtcbiAgICAgICAgaWYoaSA9PSBsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0pe1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCIgc2VsZWN0ZWQ+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCI+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgICQoJyNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5JykuaHRtbCggYWRkX2h0bWwgKTtcblxuICAgIC8vd3nFm3dpZXRsYW15IHBhbmVsIGRvIHd5Ym9ydSBrb2x1bW55IHdhcnRvxZtjaVxuICAgIGFkZF9odG1sID0gJzxvcHRpb24gY29sPVwiLTFcIj53eWJpZXJ6PC9vcHRpb24+JztcbiAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyAgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgaWYoZXhjZWwuZGF0YVswXVtpXSE9ICcnKXtcbiAgICAgICAgaWYoaSA9PSBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0pe1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCIgc2VsZWN0ZWQ+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCI+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAkKCcjZXhjZWxfYm94IHNlbGVjdC52YWx1ZScpLmh0bWwoIGFkZF9odG1sICk7XG5cbiAgICAvL2tvbG9ydWplbXkgb2Rwb3dpZWRuaW8gZXhjZWxhXG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIFxuICAgIGlmKCBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpe1xuICAgICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkW2NvbD1cIicrKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICB9XG5cbiAgICBpZiggbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdICE9IC0xKXtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgfVxuICB9LFxuXG4gIC8vd3liaWVyYW15IGtvbHVtbsSZIGthdGVnb3JpaSAob2JzemFyw7N3KVxuICBzZXRfY2F0ZWdvcnkgOiBmdW5jdGlvbihvYmope1xuICAgIGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSA9IHBhcnNlRmxvYXQoJChcIiNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5IG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdjb2wnKSk7XG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJjYXRlZ29yeVwiKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIC8vY2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcbiAgfSwgXG5cbiAgLy93eWJpZXJhbXkga29sdW1uZSB3YXJ0b8WbY2kgaSB1c3Rhd2lhbXkgbmFqbW5pZWpzesSFIGkgbmFqd2nEmWtzesSFIHdhcnRvxZvEh1xuICBzZXRfdmFsdWUgOiBmdW5jdGlvbihvYmope1xuXG4gICAgdmFyIHZhbHVlX3RtcCA9IHBhcnNlRmxvYXQoJChcIiNleGNlbF9ib3ggc2VsZWN0LnZhbHVlIG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdjb2wnKSk7XG5cblxuICAgIC8vemFiZXpwaWVjemVuaWUgcHJ6ZWQgd3licmFuaWVtIGtvbHVtbnkgemF3aWVyYWrEhWNlaiB0ZWtzdFxuICAgIHZhciBjaGVjayA9IHRydWU7XG4gICAgZm9yKHZhciBpID0gMSwgaV9tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgaWYgKCghJC5pc051bWVyaWMoU3RyaW5nKGV4Y2VsLmRhdGFbaV1bdmFsdWVfdG1wXSkucmVwbGFjZSgnLCcsJy4nKSkpICYmICAoZXhjZWwuZGF0YVtpXVt2YWx1ZV90bXBdICE9ICcnKSl7IFxuXG4gICAgICAgIGNoZWNrID0gZmFsc2U7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0byBuaWUgamVzdCBsaWN6YmEhOiAnK2V4Y2VsLmRhdGFbaV1bdmFsdWVfdG1wXSk7XG4gICAgICAgfVxuICAgIH1cblxuICAgIC8vc3ByYXdkemFteSBjenkgdyB6YXpuYWN6b25laiBrb2x1bW5pZSB6bmFqZHVqZSBzacSZIHdpZXJzeiB6IHRla3N0ZW1cbiAgICBpZihjaGVjayl7XG4gICAgICAvL2plc2xpIG5pZSB3eWJpZXJhbXkgZGFuxIUga29sdW1uxJlcbiAgICAgIGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSA9IHZhbHVlX3RtcDtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZCcpLnJlbW92ZUNsYXNzKFwidmFsdWVcIik7XG4gICAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcInZhbHVlXCIpO1xuICAgICAgdGhpcy5zZXRfbWluX21heF92YWx1ZSgpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgLy9qZcWbbGkgdGFrIHp3cmFjYW15IGLFgsSFZFxuICAgICAgYWxlcnQoJ3d5YnJhbmEga29sdW1uYSB6YXdpZXJhIHdhcnRvxZtjaSB0ZWtzdG93ZScpXG4gICAgICB0aGlzLnNob3dfc2VsZWN0KCk7XG4gICAgfVxuXG4gIH0sXG5cbiAgc2V0X21pbl9tYXhfdmFsdWUgOiBmdW5jdGlvbigpe1xuICAgIHZhciB0bXBfdmFsdWUgPSBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV07XG4gICAgaWYodG1wX3ZhbHVlICE9IC0xKXtcbiAgICAgIC8vd3lzenVrdWplbXkgbmFqbW5pZWpzemEgaSBuYWp3acSZa3N6xIUgd2FydG/Fm8SHIHcga29sdW1uaWUgd2FydG/Fm2NpXG4gICAgICBpZiggbGF5ZXJzLnZhbHVlW3RtcF92YWx1ZV0gIT0gLTEgKXtcbiAgICAgICAgXG4gICAgICAgIHZhciB0bXBfbWluID0gU3RyaW5nKGV4Y2VsLmRhdGFbMV1bdG1wX3ZhbHVlXSkucmVwbGFjZSgnLCcsJy4nKVxuICAgICAgICB2YXIgdG1wX21heCA9IFN0cmluZyhleGNlbC5kYXRhWzFdW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJyk7XG4gICAgICAgIGZvcih2YXIgaSA9IDEsIGlfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgICAgICAgICBpZigodG1wX21pbiA+IFN0cmluZyhleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJykpICYmICAoZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdICE9IFwiXCIpKSB0bXBfbWluID0gU3RyaW5nKGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSkucmVwbGFjZSgnLCcsJy4nKTtcbiAgICAgICAgICBpZigodG1wX21heCA8IFN0cmluZyhleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJykpICYmICAoZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdICE9IFwiXCIpKSB0bXBfbWF4ID0gU3RyaW5nKGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSkucmVwbGFjZSgnLCcsJy4nKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKFwibWluIG1heCB2YWx1ZTogXCIsdG1wX21pbiwgdG1wX21heCk7XG4gICAgICB9XG5cbiAgICAgIGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gPSB0bXBfbWluXG4gICAgICBsYXllcnMubWF4X3ZhbHVlW2xheWVycy5hY3RpdmVdID0gdG1wX21heDtcblxuICAgICAgLy9ha3R1YWxpenVqZW15IHRhYmxpY8SZIGxlZ2VuZFxuICAgICAgbGVnZW5kcy51cGRhdGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2hvd19jb2xvciA6IGZ1bmN0aW9uKCl7XG4gICAgLy93ecWbd2lldGxhbXkgcGllcndzemFsaXN0xJkga29sb3LDs3dcbiAgICB2YXIgaHRtbCA9ICcnO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5jb2xvcl9hcnJbMF0ubGVuZ3RoOyBpPGlfbWF4OyBpKyspe1xuICAgICAgXG4gICAgICBpZihsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJhY3RpdmVcIiBzdHlsZT1cImJhY2tncm91bmQ6Jyt0aGlzLmNvbG9yX2FycltsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXV1baV0rJ1wiPjwvc3Bhbj4nO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcl9hcnJbbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1dW2ldKydcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkKCcjcGFsZXRzICNzZWxlY3QnKS5odG1sKCBodG1sICk7XG4gICAgXG4gICAgJCgnI3BhbGV0cyAjc2VsZWN0ID4gc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZWxlY3RfY29sb3IodGhpcyk7IH0pO1xuXG4gIH0sXG5cbiAgc2hvd19wYWxldHMgOiBmdW5jdGlvbigpe1xuICAgIFxuICAgIC8vd3lzd2lldGxhbXkgd3N6eXN0a2llIHBhbGV0eVxuICAgIHZhciBodG1sID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5jb2xvcl9hcnIubGVuZ3RoO2kgPCBpX21heDsgaSsrKXtcbiAgICAgIFxuICAgICAgaWYoaSA9PSBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSl7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwiYWN0aXZlXCI+JztcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuPic7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwLCBqX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaiA8IGpfbWF4OyBqKyspe1xuICAgICAgICBodG1sICs9ICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JfYXJyW2ldW2pdICsgJ1wiPjwvc3Bhbj4nO1xuICAgICAgfVxuICAgICAgaHRtbCArPSAnPC9zcGFuPic7XG5cbiAgICB9XG4gICAgJCgnI3BhbGV0cyAjYWxsJykuaHRtbCggaHRtbCApO1xuICAgICQoJyNwYWxldHMgI2FsbCA+IHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBwYWxldHMuc2VsZWN0X3BhbGV0cyh0aGlzKTt9KTtcbiBcbiAgfSxcblxuICAvL3phem5hY3phbXkga29ua3JldG5lIGtvbG9yeSBkbyB3ecWbd2lldGxlbmlhXG4gIHNlbGVjdF9jb2xvciA6IGZ1bmN0aW9uKG9iail7XG4gICAgaWYoKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuICAgICAgaWYoICQob2JqKS5oYXNDbGFzcygnYWN0aXZlJykgKXtcbiAgICAgICAgbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1bJChvYmopLmluZGV4KCldID0gMDtcbiAgICAgICAgJChvYmopLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdWyQob2JqKS5pbmRleCgpXSA9IDE7XG4gICAgICAgICQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcnNlX2NvbG9yKCk7XG4gICAgICBwYWxldHMuc2V0X21pbl9tYXhfdmFsdWUoKTtcbiAgICB9XG4gIH0sXG5cbiAgLy9kb2RhamVteSBkbyB0YWJsaWN5IGFrdHl3bnljaCBrb2xvcsOzdyB0ZSBrdMOzcmUgc8SFIHphem5hY3pvbmVcbiAgcGFyc2VfY29sb3IgOiBmdW5jdGlvbigpe1xuICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gW107XG4gICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaTxpX21heDsgaSsrKXtcblxuICAgICAgaWYoICQoJyNwYWxldHMgI3NlbGVjdCBzcGFuJykuZXEoaSkuaGFzQ2xhc3MoJ2FjdGl2ZScpICl7XG4gICAgICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdLnB1c2goIHJnYjJoZXgoJCgnI3BhbGV0cyAjc2VsZWN0IHNwYW4nKS5lcShpKS5jc3MoJ2JhY2tncm91bmQtY29sb3InKSkgKTtcbiAgICAgIH1cbiAgICAgfVxuICAgIC8vY2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG4gICAgLy9mdW5rY2phIHBvbW9jbmljemFcbiAgICBmdW5jdGlvbiByZ2IyaGV4KHJnYikge1xuICAgICAgcmdiID0gcmdiLm1hdGNoKC9ecmdiXFwoKFxcZCspLFxccyooXFxkKyksXFxzKihcXGQrKVxcKSQvKTtcbiAgICAgIFxuICAgICAgZnVuY3Rpb24gaGV4KHgpIHtcbiAgICAgICAgcmV0dXJuIChcIjBcIiArIHBhcnNlSW50KHgpLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiI1wiICsgaGV4KHJnYlsxXSkgKyBoZXgocmdiWzJdKSArIGhleChyZ2JbM10pO1xuICAgIH1cbiAgICBsZWdlbmRzLnVwZGF0ZSgpO1xuICB9LFxuXG4gIC8vemF6bmFjemFteSBwYWxldGUga29sb3LDs3dcbiAgc2VsZWN0X3BhbGV0cyA6IGZ1bmN0aW9uKG9iail7XG4gICAgaWYoKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuICAgICAgJCgnI3BhbGV0cyAjYWxsID4gc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9ICQob2JqKS5pbmRleCgpO1xuICAgICAgXG4gICAgICAvL2FrdHVhbGl6dWplbXkgcGFsZXTEmSBha3R5d255Y2gga29sb3LDs3dcbiAgICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gW107XG4gICAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgICBpZihsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcbiAgICAgICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5wdXNoKCBwYWxldHMuY29sb3JfYXJyW2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXVtpXSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vYWt0dWFsaXp1amVteSBrb2xvcnkgdyBsZWdlbmR6aWVcbiAgICAgIGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICAgIGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzNdID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1baV07XG4gICAgICB9XG5cbiAgICAgIC8vd3nFm3dpZXRsYW15IG9rbmEga29sb3LDs3cgZG8gemF6bmFjemVuaWFcbiAgICAgIHBhbGV0cy5zaG93X2NvbG9yKCk7XG4gICAgICAvL3d5xZt3aWV0bGFteSBva25vIHogbGVnZW5kYW1pXG4gICAgICBsZWdlbmRzLnNob3coKTtcblxuICAgICAgLy9ha3R1YWxpenVqZW15IGtvbG9yeSBuYSBtYXBpZVxuICAgICAgY2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcbiAgICB9XG4gIH1cbn1cblxuLy96ZGFyemVuaWEgZG90eWN6xIVjZSBwYWxldFxuJCgnI2V4Y2VsX2JveCBzZWxlY3QuY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgcGFsZXRzLnNldF9jYXRlZ29yeSh0aGlzKTsgfSk7XG4kKCcjZXhjZWxfYm94IHNlbGVjdC52YWx1ZScpLmNoYW5nZShmdW5jdGlvbigpeyBwYWxldHMuc2V0X3ZhbHVlKHRoaXMpOyB9KTsiLCIvL21lbnUgcG9pbnRlclxudmFyIHBvaW50ZXJzID0ge1xuXHRzaG93X2FsbF9wb2ludCA6IHRydWUsXG5cdHNob3dfYm9yZGVyIDogZmFsc2UsXG5cdHBhZGRpbmdfeCA6IDEsXG5cdHBhZGRpbmdfeSA6IDEsXG5cdHRyYW5zbGF0ZV9tb2R1bG8gOiBmYWxzZSxcblx0c2l6ZTogMTAsXG5cdG1haW5fa2luZCA6ICdzcXVhcmUnLFxuXHRraW5kcyA6IEFycmF5KCdzcXVhcmUnLCdjaXJjbGUnLCdoZXhhZ29uJywnaGV4YWdvbjInKSxcblx0Y29sb3JfYm9yZGVyOiAnIzMzMycsXG5cdHBvaW50ZXJzIDogQXJyYXkoKSwgLy9wb2ludGVycy5wb2ludGVyc1tyemFkXVtrb2x1bW5hXSA6IGthdGVnb3JpYVtudW1lcl1cblxuXHRsYXN0X2NvbHVtbiA6IG51bGwsXHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdGxhc3Rfcm93IDogbnVsbCxcdC8vd2llcnN6IHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXG5cdGRyYXdfYm9yZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciB3aWR0aF9wb2ludGVyID0gdGhpcy5zaXplICsgdGhpcy5wYWRkaW5nX3gsXG5cdFx0XHRcdGhlaWdodF9wb2ludGVyID0gdGhpcy5zaXplICsgdGhpcy5wYWRkaW5nX3ksXG5cdFx0XHRcdG5vbmVfY29sb3IgPSBcInJnYmEoMCwwLDAsMClcIixcblx0XHRcdFx0Ym9yZGVyID0ge30sXG5cdFx0XHRcdGRhdGEgPSB7fTtcblxuXHRcdGlmKCh0aGlzLm1haW5fa2luZCA9PSAnc3F1YXJlJykgfHwgKHRoaXMubWFpbl9raW5kID09ICdjaXJjbGUnKSB8fCAodGhpcy5tYWluX2tpbmQgPT0gJ2hleGFnb24nKSl7XG5cdFx0XHRcdFxuXHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xvcl9ib3JkZXI7XG5cblx0XHRcdGZvcih2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKXtcblx0XHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspe1xuXG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gIT0gMCl7XG5cblx0XHRcdFx0XHRcdGJvcmRlciA9IHtcblx0XHRcdFx0XHRcdFx0dG9wOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0dG9wX2xlZnQgOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0dG9wX3JpZ2h0IDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHJpZ2h0OiBmYWxzZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0Ly9yeXN1amVteSBwb8WCw7N3a2FtaVxuXHRcdFx0XHRcdFx0Ly9zcHJhd2R6YW15IGN6eSBtYW15IHfFgsSFY3pvbsSFIG9wY2plIG1vZHVsb1xuXHRcdFx0XHRcdFx0aWYocm93LTEgPj0gMCl7XG5cdFx0XHRcdFx0XHRcdGlmKCFwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKXtcblx0XHRcdFx0XHRcdFx0XHQvL2plxZtsaSBuaWUgdG8gc3ByYXdkemFteSB0cmFkeWN5am5pZSB3xYLEhWN6b27EhSBncmFuaWPEmSBuYWQgXG5cdFx0XHRcdFx0XHRcdFx0aWYoKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbl0gIT0gMCkmJih0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0XHQvL2plxZtsaSB0YWsgdG86IHNwcmF3ZHphbXkgY3p5IHdpZXJzeiBqZXN0IHByemVzdW5pxJl0eVxuXHRcdFx0XHRcdFx0XHRcdGlmKHJvdyAlIDIgPT0gMCl7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZigoY29sdW1uLTEpID4gMCl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfbGVmdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGlmKCh0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW4rMV0gIT0gMCkmJih0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW4rMV0gIT0gdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pKXtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyLnRvcF9yaWdodCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdICE9IHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlci50b3BfbGVmdCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZigoY29sdW1uKzEpIDw9IGNhbnZhcy5hY3RpdmVfY29sdW1uKXtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYoKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbl0gIT0gMCkmJih0aGlzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW5dICE9IHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyLnRvcF9yaWdodCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cdFxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZigoY29sdW1uKzEpIDw9IGNhbnZhcy5hY3RpdmVfY29sdW1uKXtcblx0XHRcdFx0XHRcdFx0aWYoKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW4rMV0gIT0gMCkmJih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uKzFdICE9IHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSl7XG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyLnJpZ2h0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdFx0XHR4IDogY29sdW1uKndpZHRoX3BvaW50ZXIsXG5cdFx0XHRcdFx0XHRcdHkgOiByb3cqaGVpZ2h0X3BvaW50ZXIsXG5cdFx0XHRcdFx0XHRcdHNpemUgOiB0aGlzLnNpemUsXG5cdFx0XHRcdFx0XHRcdGJvcmRlciA6IGJvcmRlcixcblx0XHRcdFx0XHRcdFx0bGluZV93aWR0aF94IDogcG9pbnRlcnMucGFkZGluZ194LFxuXHRcdFx0XHRcdFx0XHRsaW5lX3dpZHRoX3kgOiBwb2ludGVycy5wYWRkaW5nX3ksXG5cdFx0XHRcdFx0XHRcdHRfbW9kdWxvIDogZmFsc2Vcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdFx0XHRkYXRhLnggPSBjb2x1bW4qd2lkdGhfcG9pbnRlciArIHdpZHRoX3BvaW50ZXIvMjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0ZmlndXJlcy5zcXVhcmVfYm9yZGVyKGRhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVx0XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vcnlzb3dhbmllIHdzenlzdGtpY2ggcHVua3TDs3dcblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHdpZHRoX3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHR2YXIgaGVpZ2h0X3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiXG5cblx0XHRpZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRcdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93Kyspe1xuXHRcdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1x0XHRcdFx0XG5cblx0XHRcdFx0XHRpZiggKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IG1lbnVfdG9wLmNhdGVnb3J5KSAmJiAobWVudV90b3AuY2F0ZWdvcnkgIT0gMCkgKXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC4yXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKHRoaXMuc2hvd19ib3JkZXIpe1xuXHRcdFx0dGhpcy5kcmF3X2JvcmRlcigpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8vdHdvcnp5bXkgdGFibGljZSBwb250ZXLDs3cgKGplxZtsaSBqYWtpxZsgcG9udGVyIGlzdG5pZWplIHpvc3Rhd2lhbXkgZ28sIHcgcHJ6eXBhZGt1IGdkeSBwb2ludGVyYSBuaWUgbWEgdHdvcnp5bXkgZ28gbmEgbm93bylcblx0Y3JlYXRlX2FycmF5IDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuYWN0aXZlX3JvdyA9IHBhcnNlSW50KCBjYW52YXMuaGVpZ2h0X2NhbnZhcyAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdGNhbnZhcy5hY3RpdmVfY29sdW1uID0gcGFyc2VJbnQoIGNhbnZhcy53aWR0aF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeCkgKTtcblxuXHRcdGlmKCAodGhpcy5wb2ludGVycy5sZW5ndGggPCBjYW52YXMuYWN0aXZlX3JvdykgfHwgKHRoaXMucG9pbnRlcnNbMF0ubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW4pIClcblx0XHR7XG5cdFx0XHRmb3IgKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XSA9PSB1bmRlZmluZWQpIHRoaXMucG9pbnRlcnNbcm93XSA9IG5ldyBBcnJheSgpO1xuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IHVuZGVmaW5lZClcdHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVfcG9pbnQgOiBmdW5jdGlvbih5LHgseV9sYXN0LHhfbGFzdCl7XG5cblx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cblx0XHQvL3d5em5hY3plbmllIHLDs3duYW5pYSBwcm9zdGVqXG5cdFx0aWYoICgoeV9sYXN0ICE9IHkpIHx8ICh4X2xhc3QgIT0geCkpICYmICh5X2xhc3QgIT0gbnVsbCkgJiYgKHhfbGFzdCAhPSBudWxsKSApe1xuXHRcdFx0dmFyIGEgPSAoeV9sYXN0IC0geSkgLyAoeF9sYXN0IC0geCk7XG5cdFx0XHR2YXIgYiA9IHkgLSBhKng7XG5cblx0XHRcdGlmKHhfbGFzdCA+IHgpe1xuXHRcdFx0XHR2YXIgY29sX2Zyb20gPSB4O1xuXHRcdFx0XHR2YXIgY29sX3RvID0geF9sYXN0O1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4O1xuXHRcdFx0XHR2YXIgY29sX2Zyb20gPSB4X2xhc3Q7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHlfbGFzdCA+IHkpe1xuXHRcdFx0XHR2YXIgcm93X2Zyb20gPSB5O1xuXHRcdFx0XHR2YXIgcm93X3RvID0geV9sYXN0O1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5O1xuXHRcdFx0XHR2YXIgcm93X2Zyb20gPSB5X2xhc3Q7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByb3cgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciBjb2wgPSBjb2xfZnJvbTsgY29sIDw9IGNvbF90bzsgY29sKyspXG5cdFx0XHR7XG5cdFx0XHRcdHJvdyA9IHBhcnNlSW50KCBhKmNvbCtiICk7XG5cdFx0XHRcdGlmKCEkLmlzTnVtZXJpYyhyb3cpKSByb3cgPSB5O1xuXHRcdFx0XHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sXSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgY29sID0gbnVsbDtcblx0XHRcdGZvcih2YXIgcm93ID0gcm93X2Zyb207IHJvdyA8PSByb3dfdG87IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRjb2wgPSBwYXJzZUludCggKHJvdy1iKS9hICk7XG5cdFx0XHRcdGlmKCEkLmlzTnVtZXJpYyhjb2wpKSBjb2wgPSB4O1xuXHRcdFx0XHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sXSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdH1cblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
