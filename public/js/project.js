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
	update_text : function(name){
		
		if((name != "") && (name != 'null')){

			var tmp_row = null;
			var find = 0;
			for(var i_row = 0, i_row_max = excel.data.length; i_row < i_row_max; i_row++ ){
				if(String(name).toLowerCase() == String(excel.data[i_row][layers.category[layers.active]]).toLowerCase()){
					
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
		this.remove();
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

	remove : function(){
		$('.colorpicker').remove();
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

		// data[x] = zmienne podstawowe dotyczące mapy
		this.map_json[0] = Array();
		this.map_json[0][0] = canvas.height_canvas;
		this.map_json[0][1] = canvas.width_canvas;
		this.map_json[0][2] = pointers.padding_x;
		this.map_json[0][3] = pointers.padding_y;
		this.map_json[0][4] = pointers.translate_modulo;
		this.map_json[0][5] = pointers.size;
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

		$('#pointer_box input[name="padding_x"]').val( data[0][2] );
		$('#pointer_box input[name="padding_y"]').val( data[0][3] );
		$('#pointer_box input[name="size"]').val( data[0][5] );
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

  square_border : function(x,y,size){
    canvas.context.fillRect(x,y,size,size);
  },

  circle_border : function(x,y,size){
    var size = size / 2;
    var center_x = x + size;
    var center_y = y + size;
    canvas.context.beginPath();
    canvas.context.arc(center_x, center_y, size, 0, 2 * Math.PI);
    canvas.context.fill();
  },

  hexagon_border  : function(x,y,size){
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

	//funkcja zwracająca aktualną kategorię nad którą znajduje się kursor
	get_name : function(){
		
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

$('#canvas_wrapper').mouseleave(function(){ $("#canvas_cloud").fadeOut(200); });
$('#canvas_wrapper').mousemove(function(){ cloud.update_text( on_category.get_name() ); });
$("#canvas_cloud").mousemove(function(){ cloud.set_position(); });
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
	border_show : true,
	padding_x : 1,
	padding_y : 1,
	translate_modulo : false,
	size: 10,
	main_kind : 'square',
	kinds : Array('square','circle','hexagon','hexagon2'),

	pointers : Array(), //pointers.pointers[rzad][kolumna] : kategoria[numer]

	last_column : null,	//kolumna pointera który został ostatnio zmieniony
	last_row : null,	//wiersz pointera który został ostatnio zmieniony

	draw_border: function(){
		if(this.main_kind != 'hexagon2'){
			for(var row = 0; row < canvas.active_row; row++){
				for(var column = 0; column < canvas.active_column; column++){

					if(this.pointers[row][column] != 0){

						var border = {
							top : false,
							bottom: false,
							left: false,
							right: false
						};

						if(row-1 >= 0){
							if((this.pointers[row-1][column] != 0)&&(this.pointers[row-1][column] != this.pointers[row][column])){
								border.top = true;
							}
						}		

						if(row+1 <= canvas.active_row){
							if((this.pointers[row+1][column] != 0)&&(this.pointers[row+1][column] != this.pointers[row][column])){
								border.bottom = true;
							}
						}

						if(column-1 >= 0){
							if((this.pointers[row][column] != 0)&&(this.pointers[row][column-1] != this.pointers[row][column])){
								border.left = true;
							}
						}		

						if(column+1 <= canvas.active_column){
							if((this.pointers[row][column+1] != 0)&&(this.pointers[row][column+1] != this.pointers[row][column])){
								border.right = true;
							}
						}

						try{
							canvas.context.fillStyle = layers.category_colors[layers.active][ this.pointers[row][column] ];
						}
						catch(e){
							console.log('ERROR 39 LINE ! ',this.pointers[row][column],row,column);
						}

						if( (row % 2 == 0) && (pointers.translate_modulo) ){
							window['figures'][this.main_kind+'_border']( column*width_pointer + width_pointer/2 , row*height_pointer , this.size);
						}
						else{
							window['figures'][this.main_kind+'_border']( column*width_pointer , row*height_pointer , this.size);
						}
						
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNvbG9yX3BpY2tlci5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJnbG9iYWwuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vZGVscy5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InByb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2N6eXN6Y3plbmllIGkgcnlzb3dhbmllIHBvIGNhbnZhc2llXG52YXIgY2FudmFzID0ge1xuXHRcblx0c2NhbGUgOiAxMDAsXG5cdHdpZHRoX2NhbnZhcyA6IDcwMCxcblx0aGVpZ2h0X2NhbnZhcyA6IDQwMCxcblx0Y2FudmFzIDogbnVsbCxcblx0Y29udGV4dCA6IG51bGwsXG5cdHRodW1ibmFpbCA6IG51bGwsXG5cdHRpdGxlX3Byb2plY3QgOiAnbm93eSBwcm9qZWt0JyxcblxuXHRjb250ZXh0X3ggOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF95IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB5XG5cdGNvbnRleHRfbmV3X3ggOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfbmV3X3kgOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB5XG5cblx0b2Zmc2V0X2xlZnQgOiBudWxsLFxuXHRvZmZzZXRfdG9wIDogbnVsbCxcblx0YWN0aXZlX3JvdyA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cdGFjdGl2ZV9jb2x1bW4gOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXG5cdHRodW1ibmFpbCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbl9jYW52YXNcIik7XG5cdFx0dmFyIGRhdGFVUkwgPSBjYW52YXMudG9EYXRhVVJMKCk7XG5cdFx0Y29uc29sZS5sb2coZGF0YVVSTCk7XG5cdH0sXG5cblx0Ly9yeXN1amVteSBjYW52YXMgemUgemRqxJljaWVtXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGlmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkgIGltYWdlLmRyYXcoKTtcblx0fSxcblxuXHRkcmF3X3RodW1uYWlsIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy50aHVtYm5haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdH0sXG5cblx0Ly9yZXNldHVqZW15IHTFgm8gemRqxJljaWFcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHR9LFxuXG5cdC8vIGN6ecWbY2lteSBjYcWCZSB6ZGrEmWNpZSBuYSBjYW52YXNpZVxuXHRjbGVhciA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0XHQvL3RoaXMuY29udGV4dC5maWxsUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0fSxcblxuXHRyZXNpemVfd2lkdGggOiBmdW5jdGlvbihuZXdfd2lkdGgpe1xuXHRcdHRoaXMud2lkdGhfY2FudmFzID0gbmV3X3dpZHRoO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyx0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IHRoaXMud2lkdGhfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwodGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlICsgJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0fSxcblxuXHRyZXNpemVfaGVpZ2h0IDogZnVuY3Rpb24obmV3X2hlaWdodCl7XG5cdFx0dGhpcy5oZWlnaHRfY2FudmFzID0gbmV3X2hlaWdodDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3MoeydoZWlnaHQnOiB0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwodGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSsnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpOyAvLyBha3R1YWxpenVqZW15IGRhbmUgb2Rub8WbbmllIHJvem1pYXLDs3cgY2FudmFzYSB3IG1lbnUgdSBnw7NyeVxuXHRcdC8vdGhpcy5kcmF3KCk7IC8vcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0fSxcblxuXHRzZXRfZGVmYXVsdCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cblx0XHRjYW52YXMuc2NhbGUgPSAxMDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3Qga2F0ZWdvcmlpIGRvZGFuaWUgLyBha3R1YWxpemFjamEgLyB1c3VuacSZY2llIC8gcG9rYXphbmllIGthdGVnb3JpaVxudmFyIGNhdGVnb3JpZXMgPSB7XG5cdFxuXHQvL2NhdGVnb3J5IDogbmV3IEFycmF5KFsncHVzdHknLCcjODA4MDgwJ10pLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWUgPSBBcnJheSgkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoKSwnI2ZmMDAwMCcpO1xuXHRcdCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgnJyk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2gobmFtZSk7XG5cdFx0bWVudV90b3AuY2F0ZWdvcnkgPSAodGhpcy5jYXRlZ29yeS5sZW5ndGgtMSk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbihpbmRleCxuYW1lKXtcblx0XHR0aGlzLmNhdGVnb3J5W2luZGV4XVswXSA9IG5hbWU7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXG5cdC8vYWt0dWFsaXp1amVteSB0YWJsaWPEmSBrb2xvcsOzd1xuXHR1cGRhdGVfY29sb3IgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9tb8W8bGl3YSBha3R1YWxpemFjamEgamVkeW5pZSB3IHByenlwYWRrdSB3eWJyYW5pYSBrb25rcmV0bmVqIGtvbHVtbnkgd2FydG/Fm2NpIGkga2F0ZWdvcmlpIHcgZXhjZWx1XG5cdFx0aWYoKGNydWQubWFwX2pzb24ubGVuZ3RoID4gMCkgJiYgKGV4Y2VsLmRhdGEubGVuZ3RoID4gMCkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuXG5cdFx0XHRmb3IgKHZhciBpX2NhdGVnb3J5ID0gMCwgaV9jYXRlZ29yeV9tYXggPVx0bGF5ZXJzLmNhdGVnb3J5X25hbWUubGVuZ3RoOyBpX2NhdGVnb3J5IDwgaV9jYXRlZ29yeV9tYXg7IGlfY2F0ZWdvcnkrKyl7XG5cdFx0XHRcdHZhciBuYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWVbaV9jYXRlZ29yeV07XG5cdFx0XHRcdHZhciBmaW5kID0gZmFsc2U7XG5cblx0XHRcdFx0Zm9yICh2YXIgaV9sYXllcnMgPSAwLCBpX2xheWVyc19tYXggPSBsYXllcnMubGlzdC5sZW5ndGg7IGlfbGF5ZXJzIDwgaV9sYXllcnNfbWF4OyBpX2xheWVycysrKXtcblx0XHRcdFx0XHRmb3IgKHZhciBpX2V4ZWwgPSAwLCBpX2V4ZWxfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfZXhlbCA8IGlfZXhlbF9tYXg7IGlfZXhlbCsrKXtcblx0XHRcdFx0XHRcdGlmKCggU3RyaW5nKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMuY2F0ZWdvcnlbaV9sYXllcnNdXSkudG9Mb3dlckNhc2UoKSA9PSBTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSkgJiYgKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMuY2F0ZWdvcnlbaV9sYXllcnNdXSAhPSAnJykpe1xuXG5cdFx0XHRcdFx0XHRcdGZpbmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB6bmFsZcW6bGnFm215IGthdGVnb3JpxJkgdyBleGNlbHVcblx0XHRcdFx0XHRcdFx0dmFyIHZhbHVlID0gU3RyaW5nKGV4Y2VsLmRhdGFbaV9leGVsXVtsYXllcnMudmFsdWVbaV9sYXllcnNdXSkucmVwbGFjZSgnLCcsJy4nKTtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXhjZWwuZGF0YVtpX2V4ZWxdW2xheWVycy52YWx1ZVtpX2xheWVyc11dKycgfCAnK3ZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdGZvciAoIHZhciBpX2xlZ2VuZHMgPSAwLCBpX2xlZ2VuZHNfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdLmxlbmd0aDsgaV9sZWdlbmRzIDwgaV9sZWdlbmRzX21heDsgaV9sZWdlbmRzKysgKXtcblx0XHRcdFx0XHRcdFx0XHRpZiggKHZhbHVlID49IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNdWzBdKSAmJiAodmFsdWUgPD0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdW2lfbGVnZW5kc11bMV0pICl7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2plxZtsaSB6bmFsZcW6bGlzbXlcblx0XHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdW2lfbGVnZW5kc11bM107XG5cdFx0XHRcdFx0XHRcdFx0XHRpX2xlZ2VuZHMgPSBpX2xlZ2VuZHNfbWF4O1xuXHRcdFx0XHRcdFx0XHRcdFx0aV9leGVsID0gaV9leGVsX21heDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSB3YXJ0b8WbxIcgd3ljaG9kemkgcG96YSBza2FsZSB1IHRhayBwcnp5cGlzdWplbXkgamVqIG9kcG93aWVkbmkga29sb3Jcblx0XHRcdFx0XHRcdFx0aWYodmFsdWUgPCBsYXllcnMubGVnZW5kc1tpX2xheWVyc11bMF1bMF0pe1xuXHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gbGF5ZXJzLmxlZ2VuZHNbaV9sYXllcnNdWzBdWzNdO1xuXHRcdFx0XHRcdFx0XHR9XHRcblxuXHRcdFx0XHRcdFx0XHRpZih2YWx1ZSA+IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNfbWF4LTFdWzFdKXtcblx0XHRcdFx0XHRcdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2lfbGF5ZXJzXVtpX2NhdGVnb3J5XSA9IGxheWVycy5sZWdlbmRzW2lfbGF5ZXJzXVtpX2xlZ2VuZHNfbWF4LTFdWzNdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHQvL2plxZtsaSBkYW55IGtyYWogdyBleGNlbHUgbWEgd2FydG/Fm8SHIG51bGwgZG9tecWbbG5pZSBvdHJ6eW11amUga29sb3IgYmlhxYJ5XG5cdFx0XHRcdFx0XHRcdGlmKHZhbHVlID09IG51bGwpe1xuXHRcdFx0XHRcdFx0XHRcdGxheWVycy5jYXRlZ29yeV9jb2xvcnNbaV9sYXllcnNdW2lfY2F0ZWdvcnldID0gJyNmZmYnO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL3cgcHJ6eXBhZGt1IGdkeSBkYW55IGtyYWogbmllIHd5c3TEmXB1amUgdyBwbGlrdSBleGNlbCBvdHJ6eW11amUga29sb3IgYmlhxYJ5XG5cdFx0XHRcdFx0aWYoIWZpbmQpe1xuXHRcdFx0XHRcdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tpX2xheWVyc11baV9jYXRlZ29yeV0gPSAnI2ZmZic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vcG8gemFrdHVhbGl6b3dhbml1IGtvbG9yw7N3IHcga2F0ZWdvcmlhY2ggcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0XHRjYW52YXMuZHJhdygpO1xuXG5cdH0sXG5cblx0cmVtb3ZlIDogZnVuY3Rpb24oaWQpe1xuXHRcdHZhciB0aCA9IHRoaXM7XG5cblx0XHQkLmVhY2godGhpcy5jYXRlZ29yeSxmdW5jdGlvbihpbmRleCx2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA+PSBpZCl7XG5cdFx0XHRcdHRoLmNhdGVnb3J5W2luZGV4XSA9IHRoLmNhdGVnb3J5W2luZGV4KzFdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBwb2ludGVycy5wb2ludGVycy5sZW5ndGg7IHJvdysrKXtcblx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgcG9pbnRlcnMucG9pbnRlcnNbcm93XS5sZW5ndGg7IGNvbHVtbisrKXtcblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gaWQpe1xuXHRcdFx0XHRcdHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPiBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gcGFyc2VJbnQocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSAtIDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuY2F0ZWdvcnkucG9wKCk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblxuXHRcdC8vcnlzdWplbXkgbmEgbm93xIUgY2FudmFzXG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRzaG93X2xpc3QgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGFkZF9jYXRlZ29yeSA9IFwiPHRhYmxlPlwiO1xuXHRcdC8vdmFyIGFkZF9zZWxlY3QgPSc8b3B0aW9uIG5hbWU9XCIwXCI+cHVzdHk8L29wdGlvbj4nO1xuXHRcdHZhciBhZGRfc2VsZWN0ID0gJyc7XG5cblx0XHRmb3IodmFyIGkgPSB0aGlzLmNhdGVnb3J5Lmxlbmd0aDsgaSA+IDE7IGktLSl7XG5cdFx0XHRhZGRfY2F0ZWdvcnkgKz0gJzx0cj48dGQ+PHNwYW4+JysoaS0xKSsnPC9zcGFuPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJjYXRlZ29yeV9uYW1lXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIiB2YWx1ZT1cIicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMF0rJ1wiIC8+PC90ZD48dGQ+PGRpdiBjbGFzcz1cImNvbG9ycGlja2VyX2JveFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjonK3RoaXMuY2F0ZWdvcnlbKGktMSldWzFdKydcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiPjwvZGl2PjwvdGQ+PHRkPjxidXR0b24gY2xhc3M9XCJyZW1vdmVcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiPnVzdW48L2J1dHRvbj48L3RkPjwvdHI+Jztcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gbmFtZT1cIicrKGktMSkrJ1wiPicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXG5cdFx0aWYobWVudV90b3AuY2F0ZWdvcnkgPT0gMCl7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIHNlbGVjdGVkIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiMFwiPicrdGhpcy5jYXRlZ29yeVswXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cblx0XHRhZGRfY2F0ZWdvcnkgKz0gXCI8L3RhYmxlPlwiO1xuXG5cdFx0JCgnI2NhdGVnb3J5X2JveCAjbGlzdCcpLmh0bWwoYWRkX2NhdGVnb3J5KTtcblx0XHQkKCdzZWxlY3QjY2hhbmdlX2NhdGVnb3J5JykuaHRtbChhZGRfc2VsZWN0KTtcblxuXHRcdGNvbG9ycGlja2VyLmFkZCgpO1xuXHR9XG59XG4iLCJjbG91ZCA9IHtcblxuXHRzZXRfdGV4dGFyZWEgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjbG91ZCAuY2xvdWRfdGV4dCcpLnZhbCggbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdICk7XG5cdH0sXG5cblx0LypnZXRfdGV4dGFyZWEgOiBmdW5jdGlvbih0ZXh0X3RtcCl7XG5cblx0XHQvL3ZhciB0ZXh0X3RtcCA9ICQob2JqKS52YWwoKTtcblxuXHRcdGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSA9IHRleHRfdG1wO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gPSBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0ucmVwbGFjZSgneycrZXhjZWwuZGF0YVswXVtpXSsnfScsJ1wiK2V4Y2VsLmRhdGFbdG1wX3Jvd11bJytpKyddXCIrJyk7XG5cdFx0fVxuXG5cdFx0bGF5ZXJzLmNsb3VkX3BhcnNlcltsYXllcnMuYWN0aXZlXSA9ICdcIicrdGV4dF90bXArJ1wiJztcblx0fSwqL1xuXG5cdC8vdXN0YXdpYW15IHBvcHJhd27EhSBwb3p5Y2rEmSBkeW1rYVxuXHRzZXRfcG9zaXRpb24gOiBmdW5jdGlvbigpe1xuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfbGVmdDtcblx0XHR2YXIgdG9wID0gbW91c2UudG9wIC0gb25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF90b3A7XG5cblx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5jc3Moe3RvcDpwYXJzZUludCh0b3AgLSAkKFwiI2NhbnZhc19jbG91ZFwiKS5oZWlnaHQoKS0zMCkrJ3B4JyxsZWZ0OmxlZnQrJ3B4J30pO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB3ecWbd2lldGxlbmllIGR5bWthIHogb2Rwb3dpZWRuacSFIHphd2FydG/Fm2NpxIVcblx0dXBkYXRlX3RleHQgOiBmdW5jdGlvbihuYW1lKXtcblx0XHRcblx0XHRpZigobmFtZSAhPSBcIlwiKSAmJiAobmFtZSAhPSAnbnVsbCcpKXtcblxuXHRcdFx0dmFyIHRtcF9yb3cgPSBudWxsO1xuXHRcdFx0dmFyIGZpbmQgPSAwO1xuXHRcdFx0Zm9yKHZhciBpX3JvdyA9IDAsIGlfcm93X21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpX3JvdyA8IGlfcm93X21heDsgaV9yb3crKyApe1xuXHRcdFx0XHRpZihTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSA9PSBTdHJpbmcoZXhjZWwuZGF0YVtpX3Jvd11bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSkudG9Mb3dlckNhc2UoKSl7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dGhpcy5zZXRfcG9zaXRpb24oKTtcblx0XHRcdFx0XHR2YXIgdGV4dF90bXAgPSBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV07XG5cblx0XHRcdFx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdFx0XHR0ZXh0X3RtcCA9IHRleHRfdG1wLnJlcGxhY2UoJ3snK2V4Y2VsLmRhdGFbMF1baV0rJ30nLGV4Y2VsLmRhdGFbaV9yb3ddW2ldKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL2RvcGllcm8gamXFm2xpIGR5bWVrIG1hIG1pZcSHIGpha2HFmyBrb25rcmV0bsSFIHphd2FydG/Fm8SHIHd5xZt3aWV0bGFteSBnb1xuXHRcdFx0XHRcdGlmKHRleHRfdG1wIT1cIlwiKXtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVJbigwKTtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmh0bWwodGV4dF90bXApO1xuXHRcdFx0XHRcdFx0ZmluZCA9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vamXFm2xpIG5pZSB6bmFsZXppb25vIG9kcG93aWVkbmllaiBrYXRlZ29yaWlcblx0XHRcdGlmICghZmluZCkgeyBcblx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgwKTtcblx0XHRcdH1cblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgwKTtcblx0XHR9XG5cdH1cblxufVxuXG4vKlxuJCgnI2Nsb3VkIC5jbG91ZF90ZXh0Jykua2V5dXAoZnVuY3Rpb24oKXtcblxuXHRjbG91ZC5nZXRfdGV4dGFyZWEodGhpcyk7XG5cbn0pIDsqLyIsIi8vc2FtYSBuYXp3YSB3aWVsZSB0xYJ1bWFjenkgcG8gcHJvc3R1IGNvbG9ycGlja2VyXG52YXIgY29sb3JwaWNrZXIgPSB7XG5cblx0cm93IDogbnVsbCxcblx0Y29sX251bSA6IG51bGwsXG5cblx0YWRkIDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLnJlbW92ZSgpO1xuXHRcdCQoJy5jb2xvcnBpY2tlcl9ib3gnKS5Db2xvclBpY2tlcih7XG5cblx0XHRcdGNvbG9yOiAnI2ZmMDAwMCcsXG5cdFx0XHRcblx0XHRcdG9uU2hvdzogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHRpZigkKGNvbHBrcikuY3NzKCdkaXNwbGF5Jyk9PSdub25lJyl7XG5cdFx0XHRcdFx0JChjb2xwa3IpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdGNvbG9ycGlja2VyLnJvdyA9ICQodGhpcykuYXR0cigncm93Jyk7XG5cdFx0XHRcdFx0Y29sb3JwaWNrZXIuY29sX251bSA9ICQodGhpcykuYXR0cignY29sX251bScpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRcblx0XHRcdG9uSGlkZTogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHQkKGNvbHBrcikuZmFkZU91dCgyMDApO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0XG5cdFx0XHRvbkNoYW5nZTogZnVuY3Rpb24gKGhzYiwgaGV4LCByZ2IpIHtcblx0XHRcdFx0JCgnI2xlZ2VuZHMgdHIgdGRbcm93PVwiJytjb2xvcnBpY2tlci5yb3crJ1wiXScpLmNzcygnYmFja2dyb3VuZENvbG9yJywgJyMnICsgaGV4KTtcblx0XHRcdFx0XG4gXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbIHBhbGV0cy5jb2xvcl9hcnIubGVuZ3RoLTEgXSA9IHBhbGV0cy5jb2xvcl9hcnJbIGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdIF0uc2xpY2UoKVxuXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbIHBhbGV0cy5jb2xvcl9hcnIubGVuZ3RoLTEgXVtjb2xvcnBpY2tlci5jb2xfbnVtXSA9ICcjJyArIGhleDtcblx0XHRcdFx0XHQvL2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IHBhbGV0cy5jb2xvcl9hcnIubGVuZ3RoIC0xO1xuXHRcdFx0XHRcdGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW2NvbG9ycGlja2VyLnJvd10gPSAgJyMnICsgaGV4O1xuXHRcdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2NvbG9ycGlja2VyLnJvd11bM10gPSAgJyMnICsgaGV4O1xuXG5cdFx0XHRcdFx0cGFsZXRzLnNob3coKTtcbiAgICAgIFx0XHRjYXRlZ29yaWVzLnVwZGF0ZV9jb2xvcigpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnLmNvbG9ycGlja2VyJykucmVtb3ZlKCk7XG5cdH1cbn1cbiIsIi8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB0d29yemVuaWUgemFwaXN5d2FuaWUgaSBha3R1YWxpemFjamUgZGFueWNoIGRvdHljesSFxIdjeWggbWFweVxudmFyIGNydWQgPSB7XG5cblx0bWFwX2pzb24gOiBBcnJheSgpLCAvL2fFgsOzd25hIHptaWVubmEgcHJ6ZWNob3d1asSFY2Egd3N6eXN0a2llIGRhbmVcblx0bWFwX2hhc2ggOm51bGwsXG5cdGxheWVycyA6IHt9LFxuXHRleGNlbCA6IEFycmF5KCksXG5cdHByb2plY3QgOiB7fSxcblx0cHJvamVjdF9oYXNoIDogbnVsbCwgLy9nxYLDs3dueSBoYXNoIGRvdHljesSFY3kgbmFzemVnbyBwcm9qZWt0dVxuXG5cdC8vcG9iaWVyYW15IGRhbmUgeiBwb3JvamVrdHUgaSB6YXBpc3VqZW15IGplIGRvIGpzb24tYVxuXHRwYXJzZV9kYXRhIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgZG90eWN6xIVjZSBtYXB5IChjYW52YXNhKVxuXG5cdFx0Ly96ZXJ1amVteSBuYSBub3dvIGNhxYLEhSB0YWJsaWPEmSBwb2ludGVyw7N3XG5cdFx0dGhpcy5tYXBfanNvbiA9IEFycmF5KCk7XG5cblx0XHQvLyBkYXRhW3hdID0gem1pZW5uZSBwb2RzdGF3b3dlIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMubWFwX2pzb25bMF0gPSBBcnJheSgpO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMF0gPSBjYW52YXMuaGVpZ2h0X2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzFdID0gY2FudmFzLndpZHRoX2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzJdID0gcG9pbnRlcnMucGFkZGluZ194O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bM10gPSBwb2ludGVycy5wYWRkaW5nX3k7XG5cdFx0dGhpcy5tYXBfanNvblswXVs0XSA9IHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG87XG5cdFx0dGhpcy5tYXBfanNvblswXVs1XSA9IHBvaW50ZXJzLnNpemU7XG5cdFx0dGhpcy5tYXBfanNvblswXVs2XSA9IHBvaW50ZXJzLm1haW5fa2luZDtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzddID0gY2FudmFzLnRpdGxlX3Byb2plY3Q7XG5cblx0XHQvLyBkYXRhWzFdID0gdGFibGljYSBwdW5rdMOzdyAocG9pbnRlcnMucG9pbnRlcnMpIFt3aWVyc3pdW2tvbHVtbmFdID0gXCJub25lXCIgfHwgKG51bWVyIGthdGVnb3JpaSlcblx0XHR0aGlzLm1hcF9qc29uWzFdID0gcG9pbnRlcnMucG9pbnRlcnM7XG5cblx0XHQvLyBkYXRhWzJdID0gdGFibGljYSBrYXRlZ29yaWlcblx0XHR0aGlzLm1hcF9qc29uWzJdID0gY2F0ZWdvcmllcy5jYXRlZ29yeTtcblxuXHRcdC8vZGF0YVszXSA9IHRhYmxpY2Egd3pvcmNhICh6ZGrEmWNpYSB3IHRsZSBkbyBvZHJ5c293YW5pYSlcblx0XHR0aGlzLm1hcF9qc29uWzNdID0gQXJyYXkoKTtcblxuXHRcdGlmKGltYWdlLm9iail7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzBdID0gaW1hZ2Uub2JqLnNyYztcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMV0gPSBpbWFnZS54O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVsyXSA9IGltYWdlLnk7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzNdID0gaW1hZ2Uud2lkdGg7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzRdID0gaW1hZ2UuaGVpZ2h0O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs1XSA9IGltYWdlLmFscGhhO1xuXHRcdH1cblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0w7N3IChsYXllcnMpXG5cdFx0Ly90d29yenlteSBvYmlla3Qgd2Fyc3R3eSB6YXdpZXJhasSFY3kgd3N6eXN0a2llIGRhbmUgZG90eWN6xIVjZSBwcm9qZWt0dVxuXG5cdFx0dGhpcy5sYXllcnMucGFsZXRzX2FjdGl2ZSA9IGxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdHRoaXMubGF5ZXJzLnZhbHVlID0gbGF5ZXJzLnZhbHVlO1xuXHRcdHRoaXMubGF5ZXJzLmNvbG9yc19wb3MgPSBsYXllcnMuY29sb3JzX3Bvcztcblx0XHR0aGlzLmxheWVycy5jb2xvcnNfYWN0aXZlID0gbGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0dGhpcy5sYXllcnMubWluX3ZhbHVlID0gbGF5ZXJzLm1pbl92YWx1ZTtcblx0XHR0aGlzLmxheWVycy5tYXhfdmFsdWUgPSBsYXllcnMubWF4X3ZhbHVlO1xuXHRcdHRoaXMubGF5ZXJzLmNsb3VkID0gbGF5ZXJzLmNsb3VkO1xuXHRcdHRoaXMubGF5ZXJzLmNsb3VkX3BhcnNlciA9IGxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0dGhpcy5sYXllcnMubGVnZW5kcyA9IGxheWVycy5sZWdlbmRzO1xuXHRcdHRoaXMubGF5ZXJzLmxhYmVscyA9IGxheWVycy5sYWJlbHM7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnkgPSBsYXllcnMuY2F0ZWdvcnk7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnlfY29sb3JzID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHR0aGlzLmxheWVycy5jYXRlZ29yeV9uYW1lID0gbGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0dGhpcy5sYXllcnMubGlzdCA9IGxheWVycy5saXN0O1xuXG5cdFx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRcdHRoaXMucHJvamVjdC5uYW1lID0gbGF5ZXJzLnByb2plY3RfbmFtZTtcblx0XHR0aGlzLnByb2plY3Quc291cmNlID0gbGF5ZXJzLnNvdXJjZTtcblxuXHRcdC8vdHdvcnp5bXkgb2JpZWt0IGV4Y2VsYVxuXHRcdHRoaXMuZXhjZWwgPSBleGNlbC5kYXRhO1xuXG5cblx0fSxcblxuXHRwdWJsaXNoIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKGNydWQucHJvamVjdF9oYXNoICE9IG51bGwpe1xuXHRcdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy/FgmF0YSBkbGEgbW96aWxsaVxuXHRcdFx0aWYoICgkKCcucHVibGlzaCAuZW1iZWQnKS5jc3MoJ2Rpc3BsYXknKSA9PSAnYmxvY2snKSAmJiAoJChldmVudC50YXJnZXQpLmhhc0NsYXNzKCdwdWJsaXNoJykpICl7XG5cdFx0XHRcdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmZhZGVPdXQoNTAwKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmh0bWwoJzxpZnJhbWUgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiJytjYW52YXMuaGVpZ2h0X2NhbnZhcysncHhcIiBib3JkZXI9XCIwXCIgZnJhbWVib3JkZXI9XCIwXCIgYm9yZGVyPVwiMFwiIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgc3JjPVwiaHR0cDovLycrbG9jYXRpb24uaHJlZi5zcGxpdCggJy8nIClbMl0rJy9lbWJlZC8nK2NydWQucHJvamVjdF9oYXNoKydcIj48L2lmcmFtZT4nKTtcblx0XHRcdFx0JCgnI2lmcmFtZScpLmh0bWwoJzxpZnJhbWUgIG9ubG9hZD1cImNydWQucHVibGlzaF9nZXRTaXplKHRoaXMpXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiJytjYW52YXMuaGVpZ2h0X2NhbnZhcysncHhcIiBib3JkZXI9XCIwXCIgZnJhbWVib3JkZXI9XCIwXCIgYm9yZGVyPVwiMFwiIGFsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiIHZzcGFjZT1cIjBcIiBoc3BhY2U9XCIwXCIgc3JjPVwiaHR0cDovLycrbG9jYXRpb24uaHJlZi5zcGxpdCggJy8nIClbMl0rJy9lbWJlZC8nK2NydWQucHJvamVjdF9oYXNoKydcIj48L2lmcmFtZT4nKTtcblxuXHRcdFx0XHQkKCcucHVibGlzaCAuZW1iZWQnKS5mYWRlSW4oNTAwKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGFsZXJ0KCduYWpwaWVydyB6YXBpc3ogcHJvamVrdCBhIG5hc3TEmXBuaWUgZ28gcHVibGlrdWonKTtcblx0XHR9XG5cdH0sXG5cblx0cHVibGlzaF9nZXRTaXplIDogZnVuY3Rpb24ob2JqKXtcblx0XHRjb25zb2xlLmxvZyhvYmouY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5KTtcblx0XHRjb25zb2xlLmxvZygkKG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkpLmhlaWdodCgpICwkKG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkpLndpZHRoKCkpO1xuICAgIC8vb2JqLnN0eWxlLmhlaWdodCA9IG9iai5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0ICsgJ3B4Jztcblx0fSxcblxuXG5cdC8vd2N6eXRhbmllIHptaWVubnljaCBkbyBvYmlla3TDs3cgbWFweVxuXG5cdHNldF9tYXAgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vcG8gemFwaXNhbml1IGRhbnljaCBkbyBiYXp5IGFrdHVhbGl6dWplbXkgaWQgKHcgcHJ6eXBhZGt1IGplxZtsaSBpc3RuaWVqZSBuYWRwaXN1amVteSBqZSlcblx0XHR0aGlzLm1hcF9qc29uID0gZGF0YTtcblxuXHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gZGF0YVswXVswXTtcblx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gZGF0YVswXVsxXTtcblx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSBkYXRhWzBdWzJdO1xuXHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IGRhdGFbMF1bM107XG5cdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IGRhdGFbMF1bNF07XG5cdFx0cG9pbnRlcnMuc2l6ZSA9IGRhdGFbMF1bNV07XG5cdFx0cG9pbnRlcnMubWFpbl9raW5kID0gZGF0YVswXVs2XTtcblx0XHRjYW52YXMudGl0bGVfcHJvamVjdCA9IGRhdGFbMF1bN107XG5cblx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeFwiXScpLnZhbCggZGF0YVswXVsyXSApO1xuXHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ195XCJdJykudmFsKCBkYXRhWzBdWzNdICk7XG5cdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJzaXplXCJdJykudmFsKCBkYXRhWzBdWzVdICk7XG5cdFx0JCgnaW5wdXRbbmFtZT1cInRpdGxlX3Byb2plY3RcIl0nKS52YWwoIGRhdGFbMF1bN10gKTtcblxuXHRcdGlmKCBkYXRhWzBdWzRdICl7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0fVxuXG5cdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuaHRtbCgnJyk7XG5cblx0XHRwb2ludGVycy5raW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGtpbmQpe1xuXG5cdFx0XHRpZihraW5kID09IGRhdGFbMF1bNl0pe1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5hcHBlbmQoJzxvcHRpb24gc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggc2VsZWN0W25hbWU9XCJtYWluX2tpbmRcIl0nKS5hcHBlbmQoJzxvcHRpb24gbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIHBvaW50ZXJhY2hcblx0XHRwb2ludGVycy5wb2ludGVycyA9IGRhdGFbMV07XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIG8ga2F0ZWdvcmlhY2hcblx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5ID0gZGF0YVsyXTtcblxuXG5cdFx0Ly9wbyB3Y3p5dGFuaXUgbWFweSBha3R5YWxpenVqZW15IGRhbmUgZG90eWN6xIVjxIUga2F0ZWdvcmlpIGkga29sb3LDs3dcblx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzWzBdID0gW107XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X25hbWUgPSBbXTtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gY2F0ZWdvcmllcy5jYXRlZ29yeS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGxheWVycy5jYXRlZ29yeV9uYW1lLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVswXSk7XG5cdFx0XHRsYXllcnMuY2F0ZWdvcnlfY29sb3JzWzBdLnB1c2goY2F0ZWdvcmllcy5jYXRlZ29yeVtpXVsxXSk7XG5cdFx0fVxuXG5cdFx0Ly9wb2JpZXJhbmllIGRhbnljaCBvIHpkasSZY2l1IGplxbxlbGkgaXN0bmllamVcblx0XHRpZiggZGF0YVszXS5sZW5ndGggPiAyKXtcblx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0aW1hZ2Uub2JqLnNyYyA9IGRhdGFbM11bMF07XG5cdFx0XHRpbWFnZS54ID0gcGFyc2VJbnQoIGRhdGFbM11bMV0gKTtcblx0XHRcdGltYWdlLnkgPSBwYXJzZUludCggZGF0YVszXVsyXSApO1xuXHRcdFx0aW1hZ2Uud2lkdGggPSBwYXJzZUludCggZGF0YVszXVszXSApO1xuXHRcdFx0aW1hZ2UuaGVpZ2h0ID0gcGFyc2VJbnQoIGRhdGFbM11bNF0gKTtcblx0XHRcdGltYWdlLmFscGhhID0gcGFyc2VJbnQoIGRhdGFbM11bNV0gKTtcblxuXHRcdFx0Ly96YXpuYWN6ZW5pZSBvZHBvd2llZG5pZWdvIHNlbGVjdGEgYWxwaGEgdyBtZW51IHRvcFxuXHRcdFx0JCgnI2FscGhhX2ltYWdlIG9wdGlvbltuYW1lPVwiJytcdGltYWdlLmFscGhhICsnXCJdJykuYXR0cignc2VsZWN0ZWQnLHRydWUpO1xuXG5cdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7IGNhbnZhcy5kcmF3KCk7IH07XG5cdFx0fVxuXG5cdFx0Ly96YWt0dWFsaXpvd2FuaWUgZGFueWNoIHcgaW5wdXRhY2hcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsIGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JywgY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzpjYW52YXMud2lkdGhfY2FudmFzKydweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMrJ3B4J30pO1xuXG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRjYXRlZ29yaWVzLnNob3dfbGlzdCgpO1xuXG5cdH0sXG5cblx0c2V0X3Byb2plY3QgOiBmdW5jdGlvbihkYXRhKXtcblxuXHRcdC8vd2N6eXR1amVteSBkYW5lIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMuc2V0X21hcCggSlNPTi5wYXJzZShkYXRhLm1hcF9qc29uKSApO1xuXHRcdFxuXHRcdGV4Y2VsLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEuZXhjZWwpO1xuXG5cdFx0ZGF0YS5wcm9qZWN0ID0gSlNPTi5wYXJzZShkYXRhLnByb2plY3QpOyAgXG5cdFx0ZGF0YS5sYXllcnMgPSBKU09OLnBhcnNlKGRhdGEubGF5ZXJzKTsgXG5cblx0XHQvL3djenl0dWplbXkgZGFuZSBkb3R5Y3rEhWNlIHByb2pla3R1XG5cdFx0bGF5ZXJzLnBhbGV0c19hY3RpdmUgPSBkYXRhLmxheWVycy5wYWxldHNfYWN0aXZlO1xuXHRcdGxheWVycy52YWx1ZSA9IGRhdGEubGF5ZXJzLnZhbHVlO1xuXHRcdGxheWVycy5jb2xvcnNfcG9zID0gZGF0YS5sYXllcnMuY29sb3JzX3Bvcztcblx0XHRsYXllcnMuY29sb3JzX2FjdGl2ZSA9IGRhdGEubGF5ZXJzLmNvbG9yc19hY3RpdmU7XG5cdFx0bGF5ZXJzLm1pbl92YWx1ZSA9IGRhdGEubGF5ZXJzLm1pbl92YWx1ZTtcblx0XHRsYXllcnMubWF4X3ZhbHVlID0gZGF0YS5sYXllcnMubWF4X3ZhbHVlO1xuXHRcdGxheWVycy5jbG91ZCA9IGRhdGEubGF5ZXJzLmNsb3VkO1xuXHRcdGxheWVycy5jbG91ZF9wYXJzZXIgPSBkYXRhLmxheWVycy5jbG91ZF9wYXJzZXI7XG5cdFx0bGF5ZXJzLmxlZ2VuZHMgPSBkYXRhLmxheWVycy5sZWdlbmRzO1xuXHRcdGxheWVycy5sYWJlbHMgPSBkYXRhLmxheWVycy5sYWJlbHM7XG5cdCBcdGxheWVycy5jYXRlZ29yeSA9IFx0ZGF0YS5sYXllcnMuY2F0ZWdvcnk7XG5cdFx0bGF5ZXJzLmNhdGVnb3J5X2NvbG9ycyA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X2NvbG9ycztcblx0XHRsYXllcnMuY2F0ZWdvcnlfbmFtZSA9IGRhdGEubGF5ZXJzLmNhdGVnb3J5X25hbWU7XG5cdFx0bGF5ZXJzLmxpc3QgPSBkYXRhLmxheWVycy5saXN0O1xuXG5cdFx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRcdGxheWVycy5wcm9qZWN0X25hbWUgPSBkYXRhLnByb2plY3QubmFtZTtcblx0XHRsYXllcnMuc291cmNlID0gZGF0YS5wcm9qZWN0LnNvdXJjZTtcblxuXHRcdCQoJ2lucHV0W25hbWU9XCJwcm9qZWN0X25hbWVcIl0nKS52YWwobGF5ZXJzLnByb2plY3RfbmFtZSk7XG5cblx0XHR0aW55TUNFLmVkaXRvcnNbMF0uc2V0Q29udGVudCggbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdICk7XG5cdFx0dGlueU1DRS5lZGl0b3JzWzFdLnNldENvbnRlbnQoIGxheWVycy5zb3VyY2UgKTtcblxuXHRcdGV4Y2VsLnNob3coKTtcblx0XHRwYWxldHMuc2hvdygpO1xuXHRcdGxlZ2VuZHMuc2hvdygpO1xuXHRcdGxheWVycy5zaG93KCk7XG5cdFx0bGFiZWxzLnNob3coKTtcblxuXHR9LFxuXG5cdC8vcG9icmFuaWUgbWFweSB6IGJhenkgZGFueWNoIGkgcHJ6ZWthenVqZW15IGRvIHdjenl0YW5pYSBkbyBvYmlla3TDs3cgbWFweVxuXHRnZXRfbWFwIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgdGggPSB0aGlzO1xuXHRcdCQuYWpheCh7XG5cdFx0XHQgIHVybDogJy9hcGkvbWFwLycgKyB0aC5tYXBfaGFzaCxcblx0XHQgIFx0dHlwZTogXCJHRVRcIixcblx0XHQgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0XHR9KS5kb25lKGZ1bmN0aW9uKCBkYXRhICkgeyB0aC5zZXRfbWFwKCBKU09OLnBhcnNlKGRhdGEuZGF0YVswXS5tYXBfanNvbikgKTsgfSk7XG5cdH0sXG5cblx0Ly9wb2JpZXJhbmllIHByb2pla3R1IHogYmF6eSBkYW55Y2ggaSB3Y3p5dGFuaWVcblx0Z2V0X3Byb2plY3QgOiBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdHZhciB0aCA9IHRoaXM7XG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHQgIHVybDogJy9hcGkvcHJvamVjdC8nICsgdGgucHJvamVjdF9oYXNoLFxuXHRcdFx0ICBcdHR5cGU6IFwiR0VUXCIsXG5cdFx0XHQgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0XHRcdH0pLmRvbmUoZnVuY3Rpb24oIGRhdGEgKSB7IFxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YS5kYXRhKTtcblx0XHRcdFx0XHRpZihkYXRhLnN0YXR1cyA9PSAnb2snKXtcblx0XHRcdFx0XHRcdHRoLnNldF9wcm9qZWN0KCBkYXRhLmRhdGEgKTsgXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhbGVydCgnbmllIHVkYcWCbyBzacSZIHdjenl0YcSHIHByb2pla3R1Jyk7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cdFx0fSxcblxuXHQvL3R3b3J6eW15IG5vd3kgcHJvamVrdFxuXHRjcmVhdGVfcHJvamVjdCA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2FrdHVhbGl6dWplbXkganNvbmEgZG8gd3lzxYJhbmlhIGFqYXhlbVxuXHRcdHRoaXMucGFyc2VfZGF0YSgpO1xuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdG1hcF9qc29uIDogSlNPTi5zdHJpbmdpZnkodGgubWFwX2pzb24pLFxuXHRcdFx0bWFwX2hhc2ggOiB0aC5tYXBfaGFzaCxcblx0XHRcdGxheWVycyA6IEpTT04uc3RyaW5naWZ5KHRoLmxheWVycyksXG5cdFx0XHRleGNlbCA6IEpTT04uc3RyaW5naWZ5KHRoLmV4Y2VsKSxcblx0XHRcdHByb2plY3QgOiBKU09OLnN0cmluZ2lmeSh0aC5wcm9qZWN0KVxuXHRcdH1cblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogXCJhcGkvcHJvamVjdHNcIixcblx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAnb2snKXtcblx0XHRcdFx0XHRhbGVydCgnemFwaXNhbm8gbm93eSBwcm9qZWt0Jyk7XG5cdFx0XHRcdFx0dGgucHJvamVjdF9oYXNoID0gcmVzcG9uc2UucHJvamVjdF9oYXNoO1xuXHRcdFx0XHRcdG1lbnVfdG9wLmdldF9wcm9qZWN0cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoJ2LFgsSFZCBwb2RjemFzIHphcGlzdScpO1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXHQvL2FrdHVhbGl6dWplbXkganXFvCBpc3RuaWVqxIVjeSBwcm9qZWt0XG5cdHVwZGF0ZV9wcm9qZWN0IDogZnVuY3Rpb24oKXsgXG5cblx0XHQvL2FrdHVhbGl6dWplbXkganNvbmEgZG8gd3lzxYJhbmlhIGFqYXhlbVxuXHRcdHRoaXMucGFyc2VfZGF0YSgpO1xuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdG1hcF9qc29uIDogSlNPTi5zdHJpbmdpZnkodGgubWFwX2pzb24pLFxuXHRcdFx0bWFwX2hhc2ggOiB0aC5tYXBfaGFzaCxcblx0XHRcdHByb2plY3RfaGFzaCA6IHRoLnByb2plY3RfaGFzaCxcblx0XHRcdGxheWVycyA6IEpTT04uc3RyaW5naWZ5KHRoLmxheWVycyksXG5cdFx0XHRleGNlbCA6IEpTT04uc3RyaW5naWZ5KHRoLmV4Y2VsKSxcblx0XHRcdHByb2plY3QgOiBKU09OLnN0cmluZ2lmeSh0aC5wcm9qZWN0KVxuXHRcdH1cblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogXCJhcGkvcHJvamVjdHNcIixcblx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHR0eXBlOiAnUFVUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09ICdvaycpe1xuXHRcdFx0XHRcdG1lbnVfdG9wLmdldF9wcm9qZWN0cygpO1xuXHRcdFx0XHRcdGFsZXJ0KCd6YWt0dWFsaXpvd2FubyBwcm9qZWt0Jyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRhbGVydCgnYsWCxIVkIHBvZGN6YXMgYWt0dWFsaXphY2ppJyk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXHQvL3VzdXdhbXkgbWFwxJkgeiBiYXp5IGRhbnljaFxuXHRkZWxldGVfcHJvamVjdCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0Ly9zcHJhd2R6YW15IGN6eSBtYXBhIGRvIHVzdW5pxJljaWEgcG9zaWFkYSBzd29qZSBpZFxuXHRcdGlmKHRoaXMucHJvamVjdF9oYXNoICE9IG51bGwpe1x0XHRcdFxuXG5cdFx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHRcdHVybDogXCJhcGkvcHJvamVjdC9cIit0aC5wcm9qZWN0X2hhc2gsXG5cdFx0XHRcdHR5cGU6ICdERUxFVEUnLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09ICdvaycpe1xuXHRcdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhbGVydCgnYsWCxIVkIHBvZGN6YXMgdXN1d2FuaWEnKTtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWxlcnQoJ2JyYWsgaWRlbnR5ZmlrYXRvcmEgcHJvamVrdHUnKTtcblx0XHR9XG5cdH1cbn1cbiIsInZhciBleGNlbCA9IHtcblx0XG5cdGFscGhhIDogWydhJywnYicsJ2MnLCdkJywnZScsJ2YnLCdnJywnaCcsJ2knLCdqJywnaycsJ2wnLCdtJywnbicsJ28nLCdwJywncScsJ3InLCdzJywndCcsJ3UnLCd3JywneCcsJ3knLCd6J10sXG5cdGRhdGEgOiBbW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl0sW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl1dLFxuXHRtaW5fcm93IDogMTIsXG5cdG1pbl9jb2wgOiA2LFxuXG5cdGluaXQgOiBmdW5jdGlvbigpe1xuXHRcdC8vZG9kYW5pZSBldmVudMOzdyBwcnp5IGtsaWtuacSZY2l1IGV4Y2VsYVxuXHRcdCQoJyNleGNlbF9ib3ggYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKXsgJCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNsaWNrKCk7IH0pO1xuXHRcdCQoJyNleGNlbF9ib3ggaW5wdXQnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgZXhjZWwuc2VuZF9maWxlKCk7IH0pO1xuXG5cdFx0Ly9mdW5rY2phIHR5bWN6YXNvd2EgZG8gbmFyeXNvd2FuaWEgdGFiZWxraSBleGNlbGFcblx0XHR0aGlzLnNob3coKTtcblx0fSxcblxuXHQvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsYSB6YSBwb3ByYXduZSBwb2RwaXNhbmllIG9zaVxuXHRzaG93IDogZnVuY3Rpb24oKXtcblxuXHRcdGFkZF9odG1sID0gJyc7XG5cblx0XHQvL2plxZtsaSBpbG/Fm2Mgd2llcnN6eSBqZXN0IHdpxJlrc3phIGFrdHVhbGl6dWplbXkgd2llbGtvxZvEhyB0YWJsaWN5XG5cdFx0aWYoZXhjZWwuZGF0YS5sZW5ndGggPiBleGNlbC5taW5fcm93KSBleGNlbC5taW5fcm93ID0gZXhjZWwuZGF0YS5sZW5ndGg7XG5cdFx0aWYoZXhjZWwuZGF0YVswXS5sZW5ndGggPiBleGNlbC5taW5fY29sKSBleGNlbC5taW5fY29sID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7XG5cblx0XHQvL3JlbmRlcnVqZW15IGNhxYLEhSB0YWJsaWPEmSBleGNlbFxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRoaXMubWluX3JvdzsgaSsrKXtcblx0XHRcdGFkZF9odG1sICs9ICc8dHIgY2xhc3M9XCJ0clwiPic7XG5cdFx0XHRmb3IodmFyIGogPSAwO2ogPCB0aGlzLm1pbl9jb2w7IGorKyl7XG5cblx0XHRcdFx0aWYoKGogPT0gMCkgJiYgKGkgPiAwKSl7XG5cdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzx0ZCBjbGFzcz1cInRkXCIgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCIgPicrIGkgKyc8L3RkPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHR0cnl7XG5cdFx0XHRcdFx0XHRpZih0eXBlb2YoZXhjZWwuZGF0YVtpXVsoai0xKV0pICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPHRkIGNsYXNzPVwidGRcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCI+JytleGNlbC5kYXRhW2ldWyhqLTEpXSsnPC90ZD4nO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzx0ZCBjbGFzcz1cInRkXCIgIHJvdz1cIicgKyBpICsgJ1wiIGNvbD1cIicgKyBqICsgJ1wiPjwvdGQ+Jztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZXhjZWwuZGF0YVtpXVsoaisxKV0pO1xuXHRcdFx0XHRcdH1jYXRjaChlcnJvcil7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlcnJvcixpLGopO1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzx0ZCBjbGFzcz1cInRkXCIgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCI+PC90ZD4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0XHRhZGRfaHRtbCArPSAnPC90cj4nO1xuXHRcdH1cblxuXHRcdCQoJyNleGNlbF9ib3ggLnRhYmxlJykuaHRtbCggYWRkX2h0bWwgKTtcblxuXHRcdC8vZG9kYWplbXkgbW/FvGxpd2/Fm8SHIGVkeWNqaSBleGNlbGFcblx0XHQkKCcjZXhjZWxfYm94IC50YWJsZSAudGQnKS5rZXl1cChmdW5jdGlvbigpeyBleGNlbC5lZGl0KHRoaXMpOyB9KTtcblxuXHRcdCQoJyNleGNlbF9ib3ggLnRhYmxlIC50ZCcpLmJsdXIoZnVuY3Rpb24oKXsgcGFsZXRzLnNob3dfc2VsZWN0KCk7IH0pO1xuXG5cdH0sXG5cblx0Ly9mdW5rY2phIHVtb8W8bGl3aWFqxIVjYSBlZHljamUgemF3YXJ0b8WbY2kga29tw7Nya2lcblx0ZWRpdCA6IGZ1bmN0aW9uKG9iail7XHRcblx0XHRcblx0XHR2YXIgdmFsID0gJChvYmopLmh0bWwoKVxuXHRcdGlmKCQuaXNOdW1lcmljKHZhbCkpIHsgdmFsID0gcGFyc2VGbG9hdCh2YWwpOyB9XG5cdFx0XG5cdFx0ZXhjZWwuZGF0YVskKG9iaikuYXR0cigncm93JyldWygkKG9iaikuYXR0cignY29sJyktMSldID0gdmFsO1xuXHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdH0sXG5cblx0Ly9wb2JpZXJhbXkgcGxpaywgeiBpbnB1dGEgaSB3ecWCYW15IGRvIGJhY2tlbmR1IHcgY2VsdSBzcGFyc293YW5pYSBhIG5hc3TEmXBuaWUgcHJ6eXBpc3VqZW15IGRvIHRhYmxpY3kgaSB3ecWbd2lldGxhbXl3IGZvcm1pZSB0YWJlbHNraVxuXHRzZW5kX2ZpbGUgOiBmdW5jdGlvbigpIHtcblx0XG5cdFx0dmFyIGV4Y2VsX2Zvcm0gPSBuZXcgRm9ybURhdGEoKTsgXG5cdFx0ZXhjZWxfZm9ybS5hcHBlbmQoXCJleGNlbF9maWxlXCIsICQoXCIjZXhjZWxfYm94IGlucHV0XCIpWzBdLmZpbGVzWzBdKTtcblxuIFx0XHQkLmFqYXgoIHtcbiAgICAgIFxuICAgICAgdXJsOiAnL2FwaS9wcm9qZWN0cy9leGNlbF9wYXJzZScsXG4gICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICBkYXRhOiBleGNlbF9mb3JtLFxuICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgY29udGVudFR5cGU6IGZhbHNlXG5cbiAgICB9KS5kb25lKGZ1bmN0aW9uKCByZXNwb25zZSApIHtcbiAgICBcdC8vcG8gd2N6eXRhbml1IHBsaWt1IGV4Y2VsIHByenlwaXN1amVteSBkYW5lIHJ5c3VqZW15IG5hIG5vd28gdGFiZWzEmSBvcmF6IHd5xZt3aWV0bGFteSB3c3p5c3RraWUgcGFsZXR5IGtvbG9yw7N3XG5cdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKVxuICAgIFx0ZXhjZWwuZGF0YSA9IHJlc3BvbnNlLmV4Y2VsWzBdLmRhdGE7XG4gICAgXHRleGNlbC50cmFuc2l0aW9uKCk7XG4gICAgXHRleGNlbC5zaG93KCk7XG4gICAgXHRwYWxldHMuc2hvd19zZWxlY3QoKTtcbiAgICB9KTtcblx0fSxcblxuXHQvL2Z1bmNramEgemFtaWVuaWFqxIVjYSBrcnRvcGtpIG5hIHByemVjaW5raSBwcnp5IGtvbcOzcmthY2ggbGljemJvd3ljaFxuXHR0cmFuc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRmb3IodmFyIGogPSAwLCBqX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBqIDwgal9tYXg7IGorKyl7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL3VzdXdhbXkgc3BhY2plIHd5c3TEmXB1asSFY2UgemEgbHViIHByemVkIHRla3N0ZW1cblx0XHRcdFx0ZXhjZWwuZGF0YVtpXVtqXSA9ICQudHJpbShleGNlbC5kYXRhW2ldW2pdKVxuXG5cdFx0XHRcdC8vamXFm2xpIG1hbXkgcHVzdMSFIHdhcnRvxZvEhyBudWxsIHphbWllbmlhbXkgasSFIG5hIHphbWtuacSZdHkgc3RyaW5nXG5cdFx0XHRcdGlmKGV4Y2VsLmRhdGFbaV1bal0gPT0gbnVsbCl7IGV4Y2VsLmRhdGFbaV1bal0gPSAnJzsgfVxuXHRcdFx0XHRcblx0XHRcdFx0aWYoJC5pc051bWVyaWMoIGV4Y2VsLmRhdGFbaV1bal0gKSl7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2ldW2pdKVxuXHRcdFx0XHRcdGV4Y2VsLmRhdGFbaV1bal0gPSBTdHJpbmcoZXhjZWwuZGF0YVtpXVtqXSkucmVwbGFjZSgnLicsJywnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4Y2VsLmluaXQoKTtcbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cbiAgc3F1YXJlX2JvcmRlciA6IGZ1bmN0aW9uKHgseSxzaXplKXtcbiAgICBjYW52YXMuY29udGV4dC5maWxsUmVjdCh4LHksc2l6ZSxzaXplKTtcbiAgfSxcblxuICBjaXJjbGVfYm9yZGVyIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuICAgIHZhciBzaXplID0gc2l6ZSAvIDI7XG4gICAgdmFyIGNlbnRlcl94ID0geCArIHNpemU7XG4gICAgdmFyIGNlbnRlcl95ID0geSArIHNpemU7XG4gICAgY2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuICAgIGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcbiAgfSxcblxuICBoZXhhZ29uX2JvcmRlciAgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG4gICAgdmFyIGEgPSBzaXplLzQ7XG4gICAgdmFyIGEyID0gc2l6ZS8yO1xuICAgIHZhciBoID0gc2l6ZS8yKk1hdGguc3FydCgzKS8yO1xuXG4gICAgY2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY2FudmFzLmNvbnRleHQubW92ZVRvKHgseSthMik7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyLWgpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2ErYTIseSthMi1oKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCtzaXplLHkrYTIpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUtYSx5K2EyK2gpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EseSthMitoKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5maWxsKCk7XG4gIH1cbn1cbiIsIi8vZnVua2NqZSBnbG9iYWxuZSBrb250ZW5lciBuYSB3c3p5c3RrbyBpIG5pYyA7KVxudmFyIGdsb2JhbCA9IHtcblx0dG9vZ2xlX3BhbmVsICA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGthIGRsYSBtb3ppbGxpXG5cdFxuXHRcdC8vc3ByYXdkemFteSB6IGpha2ltIHBhbmVsZW0gbWFteSBkbyBjenluaWVuaWEgKGN6eSBwb2thenVqxIVjeW0gc2nEmSB6IGxld2VqIGN6eSB6IHByYXdlaiBzdHJvbnkpXG5cdFx0aWYoICBwYXJzZUludCgkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdsZWZ0JykpID4gMCApe1xuXHRcdFx0Ly9wYW5lbCBqZXN0IHogcHJhd2VqIHN0cm9ueVxuXHRcdFx0aWYoICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5jc3MoJ3JpZ2h0JykgPT0gJzBweCcgKXtcblx0XHRcdFx0JChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe3JpZ2h0OiBbLSQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS53aWR0aCgpLTIwLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcblx0ICAgIH1cblx0ICAgIGVsc2V7XG5cdCAgICBcdCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7cmlnaHQ6IFtcIjBweFwiLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcblx0ICAgIH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdC8vcGFuZWwgamVzdCB6IGxld2VqIHN0cm9ueVxuXHRcdFx0aWYoICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5jc3MoJ2xlZnQnKSA9PSAnMHB4JyApe1xuXHRcdFx0XHQkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7bGVmdDogWy0kKGV2ZW50LnRhcmdldCkucGFyZW50KCkud2lkdGgoKS0yMCxcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdCAgICBlbHNle1xuXHQgICAgXHQgJChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe2xlZnQ6IFtcIjBweFwiLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcblx0ICAgIH1cblx0XHR9XG5cblx0fVxufVxuIiwiLy9nxYLDs3duZSB6ZGrEmWNpZSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxudmFyIGltYWdlID0ge1xuXHRvYmogOiB1bmRlZmluZWQsXG5cdHggOiBudWxsLFxuXHR5IDogbnVsbCxcblx0d2lkdGggOiBudWxsLFxuXHRoZWlnaHQgOiBudWxsLFxuXHRhbHBoYSA6IDEwLFxuXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYS8xMDtcblx0XHRjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5vYmosdGhpcy54LHRoaXMueSx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KTtcblxuXHRcdCQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5jc3MoeydoZWlnaHQnOnRoaXMuaGVpZ2h0LCd0b3AnOnRoaXMueSsncHgnLCdsZWZ0JzoodGhpcy54K3RoaXMud2lkdGgpKydweCd9KTtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG5cdH0sXG5cblx0Ly9mdW5rY2phIHBvbW9jbmljemEga29ud2VydHVqxIVjYSBkYXRhVVJJIG5hIHBsaWtcblx0ZGF0YVVSSXRvQmxvYiA6IGZ1bmN0aW9uKGRhdGFVUkkpIHtcbiAgICB2YXIgYmluYXJ5ID0gYXRvYihkYXRhVVJJLnNwbGl0KCcsJylbMV0pO1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXkucHVzaChiaW5hcnkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXSwge3R5cGU6ICdpbWFnZS9wbmcnfSk7XG5cdH1cblxufVxuIiwidmFyIGRhdGFfaW5wdXQgPSB7XG5cblx0Ly9wb2JpZXJhbmllIGluZm9ybWFjamkgeiBpbnB1dMOzdyBpIHphcGlzYW5pZSBkbyBvYmlla3R1IG1hcF9zdmdcblx0Z2V0IDogZnVuY3Rpb24oKXtcblx0XHRtYXAubmFtZSA9ICQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCgpO1xuXHRcdG1hcC5wYXRoID0gJCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCkucmVwbGFjZSgvXCIvZywgXCInXCIpO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBpbmZvcm1hY2ppIHogb2JpZWt0dSBtYXBfc3ZnIGkgemFwaXNhbmllIGRvIGlucHV0w7N3XG5cdHNldCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCBtYXAubmFtZSApO1xuXHRcdCQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCggbWFwLnBhdGggKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9XG5cbn1cbiIsImxhYmVscyA9IHtcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbGF5ZXJzIC5sYWJlbF9sYXllcicpLnZhbCggbGF5ZXJzLmxhYmVsc1tsYXllcnMuYWN0aXZlXSApO1xuXHR9LFxuXG5cdGVkaXQgOiBmdW5jdGlvbihvYmopIHtcblx0XHRsYXllcnMubGFiZWxzW2xheWVycy5hY3RpdmVdID0gJChvYmopLnZhbCgpO1xuXHR9XG59XG5cbiQoJyNsYXllcnMgLmxhYmVsX2xheWVyJykua2V5dXAoZnVuY3Rpb24oKXtcblx0bGFiZWxzLmVkaXQodGhpcyk7XG59KTsgXG4iLCJ2YXIgbGF5ZXJzID0ge1xuXG5cdGxpc3QgOiBbJ3pha8WCYWRrYSAxJ10sXG5cdGFjdGl2ZSA6IDAsXG5cblx0Ly90YWJsaWNhIHogcG9kc3Rhd293eXdtaSBkYW55bWkgemFncmVnb3dhbnltaSBkbGEga2HFvGRlaiB3YXJzdHd5XG5cdHBhbGV0c19hY3RpdmUgOiBbMF0sXG5cblx0dmFsdWUgOiBbLTFdLFxuXHRjb2xvcnNfcG9zIDogW1sxLDEsMSwxLDEsMSwxLDEsMV1dLFxuXHRjb2xvcnNfYWN0aXZlIDogW1tcIiNmN2ZjZmRcIiwgXCIjZTVmNWY5XCIsIFwiI2NjZWNlNlwiLCBcIiM5OWQ4YzlcIiwgXCIjNjZjMmE0XCIsIFwiIzQxYWU3NlwiLCBcIiMyMzhiNDVcIiwgXCIjMDA2ZDJjXCIsIFwiIzAwNDQxYlwiXV0sXG5cdG1pbl92YWx1ZSA6IFswXSxcblx0bWF4X3ZhbHVlIDogWzBdLFxuXHRjbG91ZCA6IFtcIlwiXSxcblx0Y2xvdWRfcGFyc2VyIDogW1wiXCJdLFxuXHRsZWdlbmRzIDogW1tdXSxcblx0bGFiZWxzIDogW1wiXCJdLFxuXHRjYXRlZ29yeSA6IFstMV0sXG5cdGNhdGVnb3J5X2NvbG9ycyA6IFtdLFxuXHRjYXRlZ29yeV9uYW1lIDogW10sXG5cblx0Ly96bWllbm5lIGdsb2JhbG5lIGRvdHljesSFY2UgY2HFgmVnbyBwcm9qZWt0dVxuXHRwcm9qZWN0X25hbWUgOiAnbm93eSBwcm9qZWt0Jyxcblx0c291cmNlIDogJycsXG5cblx0Ly90YWJsaWNhIHDDs2wgdXphbGXFvG5pb255Y2ggb2QgYWt0dWFsbmVqIHdhcnN0d3lcblx0ZGJfbmFtZSA6IFtcImxpc3RcIixcInBhbGV0c19hY3RpdmVcIixcImNhdGVnb3J5XCIsXCJjYXRlZ29yeV9jb2xvcnNcIixcImNhdGVnb3J5X25hbWVcIixcInZhbHVlXCIsXCJjb2xvcnNfcG9zXCIsXCJjb2xvcnNfYWN0aXZlXCIsXCJtaW5fdmFsdWVcIixcIm1heF92YWx1ZVwiLFwiY2xvdWRcIixcImNsb3VkX3BhcnNlclwiLFwibGVnZW5kc1wiLFwibGFiZWxzXCJdLFxuXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmxpc3QubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRpZihpID09IHRoaXMuYWN0aXZlKXtcblx0XHRcdFx0aHRtbCArPSAnPHNwYW4gbnVtPVwiJytpKydcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgY2xhc3M9XCJhY3RpdmVcIj4nICsgdGhpcy5saXN0W2ldICsgJzwvc3Bhbj4nO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0aHRtbCArPSAnPHNwYW4gbnVtPVwiJytpKydcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgPicgKyB0aGlzLmxpc3RbaV0gKyAnPC9zcGFuPic7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImFkZFwiPiArIDwvYnV0dG9uPjxidXR0b24gY2xhc3M9XCJyZW1vdmVcIj4gLSA8L2J1dHRvbj4nO1xuXG5cdFx0JCgnI2xheWVycyA+IGRpdicpLmh0bWwoaHRtbCk7XG5cblxuXHRcdC8vZG9kYWplbXkgemRhcnplbmlhIGRvIGVkeWNqaSAvIHptaWFueSBrb2xlam5vc2NpIGkgYWt0dWFsaXpvd2FuaWEgd2Fyc3R3eVxuXHRcdCQoJyNsYXllcnMgLmFkZCcpLmNsaWNrKGZ1bmN0aW9uKCl7bGF5ZXJzLmFkZCgpO30pO1xuXHRcdFxuXHRcdCQoJyNsYXllcnMgLnJlbW92ZScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjb25maXJtKCdDenkgY2hjZXN6IHVzdW7EhcSHIHdhcnN0d8SZID8nKSl7XG5cdFx0XHRcdGxheWVycy5yZW1vdmUoKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cdFx0XG5cdFx0JCgnI2xheWVycyBzcGFuJykuY2xpY2soZnVuY3Rpb24oKXsgbGF5ZXJzLnNlbGVjdCh0aGlzKTsgfSk7XG5cblx0XHQkKCBcIiNsYXllcnMgPiBkaXYgc3BhblwiICkua2V5dXAoZnVuY3Rpb24oKXtcblx0XHRcdGxheWVycy5saXN0W2xheWVycy5hY3RpdmVdID0gJCh0aGlzKS5odG1sKCk7XG5cdFx0fSk7XG5cblx0XHQkKCBcIiNsYXllcnMgPiBkaXYgc3BhblwiICkuZGJsY2xpY2soZnVuY3Rpb24oKXtcblx0XHRcdCQodGhpcykuYWRkQ2xhc3MoJ2NvbnRlbnRlZGl0YWJsZScpO1xuXHRcdFx0JCh0aGlzKS5ibHVyKGZ1bmN0aW9uKCl7ICQodGhpcykucmVtb3ZlQ2xhc3MoJ2NvbnRlbnRlZGl0YWJsZScpIH0pO1xuXHRcdH0pO1xuXG5cdFx0JCggXCIjbGF5ZXJzID4gZGl2XCIgKS5zb3J0YWJsZSh7IFxuXHRcdFx0YXhpczogJ3gnLFxuXHRcdCBcdHVwZGF0ZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0JCggXCIjbGF5ZXJzID4gZGl2IHNwYW5cIiApLmVhY2goZnVuY3Rpb24oaW5kZXgsb2JqKXtcblx0XHRcdFx0XHRpZihpbmRleCAhPSAkKG9iaikuYXR0cignbnVtJykpe1xuXHRcdFx0XHRcdFx0bGF5ZXJzLmNoYW5nZV9vcmRlcigkKG9iaikuYXR0cignbnVtJyksaW5kZXgpXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHQgXHR9LFxuXHRcdCBcdGNhbmNlbDogJy5hZGQsLnJlbW92ZSwuY29udGVudGVkaXRhYmxlJ1xuXHRcdH0pO1xuXHR9LFxuXG5cdHNlbGVjdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0JCgnI2xheWVycyBzcGFuJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFx0bGF5ZXJzLmFjdGl2ZSA9ICQob2JqKS5pbmRleCgpO1xuXG5cdFx0dGlueU1DRS5lZGl0b3JzWzBdLnNldENvbnRlbnQoIGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSApO1xuXHRcdHBhbGV0cy5zaG93KCk7XG5cdFx0Y2xvdWQuc2V0X3RleHRhcmVhKCk7XG5cdFx0bGFiZWxzLnNob3coKTtcblx0XHRsZWdlbmRzLnNob3coKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdC8vem1pYW5hIGtvbGVqbmpvxZtjaSB3YXJzdHdcblx0Y2hhbmdlX29yZGVyIDogZnVuY3Rpb24obGFzdCxuZXh0KXtcblx0XHRmb3IgKHZhciBpPSAwLCBpX21heCA9IHRoaXMuZGJfbmFtZS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKSB7XG5cdFx0XHR2YXIgdG1wID0gdGhpc1t0aGlzLmRiX25hbWVbaV1dW25leHRdO1xuXHRcdFx0dGhpc1t0aGlzLmRiX25hbWVbaV1dW25leHRdID0gdGhpc1t0aGlzLmRiX25hbWVbaV1dW2xhc3RdXG5cdFx0XHR0aGlzW3RoaXMuZGJfbmFtZVtpXV1bbGFzdF0gPSB0bXA7XG5cdFx0fVxuXHR9LFxuXG5cdC8vZG9kYWplbXkgbm93xIUgd2Fyc3R3xJlcblx0YWRkIDogZnVuY3Rpb24oKXtcblxuXHRcdHRoaXMubGlzdC5wdXNoKCAnemFrxYJhZGthICcgKyBwYXJzZUludCh0aGlzLmxpc3QubGVuZ3RoKzEpKTtcblxuXHRcdHRoaXMuY2F0ZWdvcnkucHVzaCgtMSk7XG5cdFx0dGhpcy5jYXRlZ29yeV9jb2xvcnMucHVzaCggdGhpcy5jYXRlZ29yeV9jb2xvcnNbdGhpcy5jYXRlZ29yeV9jb2xvcnMubGVuZ3RoLTFdLnNsaWNlKCkgKTtcblx0XHR0aGlzLnZhbHVlLnB1c2goLTEpO1xuXHRcdHRoaXMucGFsZXRzX2FjdGl2ZS5wdXNoKDApO1xuXHRcdHRoaXMuY29sb3JzX2FjdGl2ZS5wdXNoKFsnI2Y3ZmNmZCcsJyNlNWY1ZjknLCcjY2NlY2U2JywnIzk5ZDhjOScsJyM2NmMyYTQnLCcjNDFhZTc2JywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10pO1xuXHRcdHRoaXMuY29sb3JzX3Bvcy5wdXNoKFsxLDEsMSwxLDEsMSwxLDEsMV0pO1xuXHRcdHRoaXMubWluX3ZhbHVlLnB1c2goMCk7XG5cdFx0dGhpcy5tYXhfdmFsdWUucHVzaCgwKTtcblx0XHR0aGlzLmNsb3VkLnB1c2goXCJcIik7XG5cdFx0dGhpcy5jbG91ZF9wYXJzZXIucHVzaChcIlwiKTtcblx0XHR0aGlzLmxlZ2VuZHMucHVzaChbXSk7XG5cdFx0dGhpcy5sYWJlbHMucHVzaChcIlwiKTtcblx0XHR0aGlzLnNob3coKTtcblxuXHR9LFxuXG5cdC8vdXN1d2FteSBha3R1YWxuxIUgd2Fyc3R3xJlcblx0cmVtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHRpZih0aGlzLmFjdGl2ZSA+IDApe1xuXHRcdFx0aWYodGhpcy5hY3RpdmUgPT0gKHRoaXMubGlzdC5sZW5ndGgtMSkpe1xuXHRcdFx0XHR2YXIgaV90bXAgPSB0aGlzLmxpc3QubGVuZ3RoLTE7XG5cdFx0XHRcdHRoaXMuc2VsZWN0KCAkKCcjbGF5ZXJzIHNwYW4nKS5lcSggaV90bXAgKSApO1xuXHRcdFx0fSBcblxuXHRcdFx0Ly9wb2JpZXJhbXkgbnVtZXIgb3N0YXRuaWVqIHpha8WCYWRraVxuXHRcdFx0Zm9yICh2YXIgaV9sYXllcnM9IHRoaXMuYWN0aXZlLCBpX2xheWVyc19tYXggPSBsYXllcnMubGlzdC5sZW5ndGgtMTsgaV9sYXllcnMgPCBpX2xheWVyc19tYXg7IGlfbGF5ZXJzKyspIHtcblx0XHRcdFx0Zm9yICh2YXIgaT0gMCwgaV9tYXggPSB0aGlzLmRiX25hbWUubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKykge1xuXHRcdFx0XHRcdHRoaXNbdGhpcy5kYl9uYW1lW2ldXVtpX2xheWVyc10gPSB0aGlzW3RoaXMuZGJfbmFtZVtpXV1baV9sYXllcnMrMV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly91c3V3YW15IG9zdGF0bmnEhSB6YWvFgmFka8SZIC8gd2Fyc3R3xJlcblx0XHRcdHZhciBsYXN0X2kgPSBsYXllcnMubGlzdC5sZW5ndGggLSAxO1xuXHRcdFx0Zm9yICh2YXIgaT0gMCwgaV9tYXggPSB0aGlzLmRiX25hbWUubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKykge1xuXHRcdFx0XHR0aGlzW3RoaXMuZGJfbmFtZVtpXV0ucG9wKClcblx0XHRcdFx0Y29uc29sZS5sb2codGhpc1t0aGlzLmRiX25hbWVbaV1dW2xhc3RfaV0pO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNob3coKTtcblx0XHRcdHRoaXMuc2VsZWN0KCQoJyNsYXllcnMgc3Bhbi5hY3RpdmUnKSk7IFxuXHRcdH1cblx0fVxufVxuXG4vL3ptaWFuYSBuYXp3eSBwcm9qZWt0dSBwcnp5IHdwaXNhbml1IG5vd2VqIG5hend5IGRvIGlucHV0YVxuJCgnI3BvaW50ZXJzIC5wcm9qZWN0X25hbWUnKS5rZXl1cChmdW5jdGlvbigpeyBsYXllcnMucHJvamVjdF9uYW1lID0gJCh0aGlzKS52YWwoKTsgfSk7XG5cbi8vem1pZW5uZSBwb21vY25pY3plXG4kLmZuLnNlbGVjdFRleHQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBkb2MgPSBkb2N1bWVudDtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXNbMF07XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLCBlbGVtZW50KTtcbiAgICBpZiAoZG9jLmJvZHkuY3JlYXRlVGV4dFJhbmdlKSB7XG4gICAgXHR2YXIgcmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgcmFuZ2UubW92ZVRvRWxlbWVudFRleHQoZWxlbWVudCk7XG4gICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICBcdHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7ICAgICAgICBcbiAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XG4gICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cbn07XG4iLCIvL29iaWVrdCBkb3R5Y3rEhXN5IHd5c3dpZXRsYW5pYSBha3V0YWxpemFjamkgaSBlZHljamkgcGFuZWx1IGxlZ2VuZFxubGVnZW5kcyA9IHtcblxuXHQvL3d5xZt3aWV0bGFteSB3c3p5c3RraWUgbGVnZW5keSB3IHBhbmVsdSBtYXBcblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgaHRtbCA9IFwiPHRhYmxlPjx0cj48dGg+a29sb3I6PC90aD48dGg+b2Q6PC90aD48dGg+ZG86PC90aD48dGg+b3Bpczo8L3RoPjwvdHI+XCI7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0aHRtbCArPSBcIjx0ciByb3c9J1wiK2krXCInPjx0ZCByb3c9J1wiK2krXCInIGNvbF9udW09Jycgc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bM10rXCInIGNsYXNzPSdjb2xvciBjb2xvcnBpY2tlcl9ib3gnPjwvdGQ+PHRkIGNsYXNzPSdmcm9tJyBuYW1lPSdmcm9tJyBjb250ZW50ZWRpdGFibGU9J3RydWUnPlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzBdK1wiPC90ZD48dGQgY2xhc3M9J3RvJyBuYW1lPSd0bycgY29udGVudGVkaXRhYmxlPSd0cnVlJz5cIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVsxXStcIjwvdGQ+PHRkIGNsYXNzPSdkZXNjcmlwdGlvbicgbmFtZT0nZGVzY3JpcHRpb24nIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMl0rXCI8L3RkPjwvdHI+XCI7XG5cdFx0fVxuXG5cdFx0aHRtbCArPSBcIjwvdGFibGU+XCI7XG5cdFx0JCgnI2xlZ2VuZHMnKS5odG1sKGh0bWwpO1xuXG5cdFx0dmFyIHJvdyA9IDE7XG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGlmKCBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcblx0XHRcdFx0JCgnI2xlZ2VuZHMgdGFibGUgdHInKS5lcShyb3cpLmNoaWxkcmVuKCd0ZCcpLmVxKDApLmF0dHIoJ2NvbF9udW0nLCBpKTtcblx0XHRcdFx0cm93Kys7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoMTggPT0gbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0pIHtcblx0XHRcdHZhciByb3cgPSAwO1xuXHRcdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0aWYoIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdW2ldID09IDEpe1xuXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbMThdW2ldID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1bcm93XTtcblx0XHRcdFx0XHRyb3crKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHBhbGV0cy5jb2xvcl9hcnJbMThdW2ldID0gJyNmZmYnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRwYWxldHMuc2hvdygpXG5cdFx0fVxuXG5cdFx0Y29sb3JwaWNrZXIuYWRkKCk7XG5cdH0sXG5cblx0Ly9mdW5rY2phIGFrdXRhbGl6dWrEhWNhIGtvbG9yeSB3IHBhbGVjaWUga29sb3LDs3dcblx0dXBkYXRlIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgY29sb3JfY291bnQgPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5sZW5ndGggLy9pbG9zYyBrb2xvcsOzd1xuXHRcdHZhciBkaWZmcmVudCA9IE1hdGguYWJzKCBsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdIC0gbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXSApOyAvLyBjb2xvcl9jb3VudDtcblx0XHRcblx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXSA9IFtdO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblxuXHRcdFx0Y29uc29sZS5sb2coIHBhcnNlSW50KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pLGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gKTtcblxuXHRcdFx0dmFyIG5vd190bXAgPSBNYXRoLnJvdW5kKCAocGFyc2VJbnQobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSkrZGlmZnJlbnQvY29sb3JfY291bnQqaSkqMTAwKSAvIDEwMFxuXHRcdFx0XG5cdFx0XHQvL2NvbnNvbGUubG9nKGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0rZGlmZnJlbnQvY29sb3JfY291bnQqaSk7XG5cblxuXHRcdFx0aWYoaSsxID09IGlfbWF4ICl7XG5cdFx0XHRcdHZhciBuZXh0X3RtcCA9IGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV1cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHZhciBuZXh0X3RtcCA9IE1hdGgucm91bmQoICgocGFyc2VJbnQobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSkrZGlmZnJlbnQvY29sb3JfY291bnQqKGkrMSkpIC0gMC4wMSkgICoxMDApIC8gMTAwIFxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5wdXNoKFtub3dfdG1wLG5leHRfdG1wLCAgU3RyaW5nKG5vd190bXApLnJlcGxhY2UoJy4nLCcsJykrJyAtICcrU3RyaW5nKG5leHRfdG1wKS5yZXBsYWNlKCcuJywnLCcpLCBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXVtpXSBdKTtcblx0XHRcblx0XHR9XG5cdFx0dGhpcy5zaG93KCk7XG5cdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0fSxcblxuXHRlZGl0OiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIHJvdyA9ICQob2JqKS5wYXJlbnQoKS5hdHRyKCdyb3cnKTtcblx0XHR2YXIgbmFtZSA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cdFx0dmFyIHZhbCA9ICQob2JqKS5odG1sKCk7XG5cblx0XHRzd2l0Y2gobmFtZSl7XG5cdFx0XHRcblx0XHRcdGNhc2UgJ2Zyb20nOlxuXHRcdFx0XHRpZighJC5pc051bWVyaWModmFsKSkgeyAkKG9iaikuaHRtbChwYXJzZUZsb2F0KHZhbCkpIH0gLy96YWJlenBpZWN6ZW5pZSwgamXFm2xpIHdwaXNhbm8gdGVrc3QgemFtaWVuaWFteSBnbyBuYSBsaWN6YsSZXG5cdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW3Jvd11bMF0gPSBwYXJzZUZsb2F0KHZhbCk7XG5cdFx0XHRcdGNhdGVnb3JpZXMudXBkYXRlX2NvbG9yKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y2FzZSAndG8nOlxuXHRcdFx0XHRpZighJC5pc051bWVyaWModmFsKSkgeyAkKG9iaikuaHRtbChwYXJzZUZsb2F0KHZhbCkpIH1cblx0XHRcdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1bcm93XVsxXSA9IHBhcnNlRmxvYXQodmFsKTtcblx0XHRcdFx0Y2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0XG5cdFx0XHRjYXNlICdkZXNjcmlwdGlvbic6XG5cdFx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW3Jvd11bMl0gPSB2YWw7XG5cdFx0XHRicmVhaztcdFx0XG5cdFx0XG5cdFx0fVxuXHR9XG59XG5cbmxlZ2VuZHMuc2hvdygpOyBcblxuXG4vL2RvZGFqZW15IHpkYXJ6ZW5pZSBlZHljamkgd2FydG/Fm2NpIHcgbGVnZW5kemllXG4kKCcjbGVnZW5kcycpLm9uKCdrZXl1cCcsJ3RkJywgZnVuY3Rpb24oKXsgbGVnZW5kcy5lZGl0KHRoaXMpOyB9KTtcbiIsIi8qXG4gICAgX19fXyAgIF9fX18gX19fXyAgICBfXyAgX19fIF9fXyAgICAgX19fXyAgICAgX19fX18gICAgX19fXyBcbiAgIC8gX18gKSAvICBfLy8gX18gXFwgIC8gIHwvICAvLyAgIHwgICAvIF9fIFxcICAgfF9fICAvICAgLyBfXyBcXFxuICAvIF9fICB8IC8gLyAvIC8gLyAvIC8gL3xfLyAvLyAvfCB8ICAvIC9fLyAvICAgIC9fIDwgICAvIC8gLyAvXG4gLyAvXy8gL18vIC8gLyAvXy8gLyAvIC8gIC8gLy8gX19fIHwgLyBfX19fLyAgIF9fXy8gL18gLyAvXy8gLyBcbi9fX19fXy8vX19fLyBcXF9fX1xcX1xcL18vICAvXy8vXy8gIHxffC9fLyAgICAgICAvX19fXy8oXylcXF9fX18vICBcblxudmFyc2lvbiAzLjAgYnkgTWFyY2luIEfEmWJhbGFcblxubGlzdGEgb2JpZWt0w7N3OlxuY2FudmFzIC0gb2JpZWt0IGNhbnZhc2FcbmNhdGVnb3JpZXNcbmNsb3VkXG5jb2xvcl9waWNrZXJcbmNydWQgLSBvYmlla3QgY2FudmFzYVxuZXhjZWxcbmZpZ3VyZXNcbmdsb2JhbFxuaW1hZ2UgLSBvYmlla3QgemRqxJljaWEgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbmlucHV0XG5sYWJlbHNcbmxheWVyc1xubGVnZW5kc1xubWFpblxubWVudV90b3Bcbm1vZGVsc1xubW91c2Vcbm9uX2NhdGVnb3J5XG5wYWxldHNcbnBvaW50ZXJzXG5cbiovXG5cblxuLy8gQ3JlYXRlIElFICsgb3RoZXJzIGNvbXBhdGlibGUgZXZlbnQgaGFuZGxlclxudmFyIGV2ZW50TWV0aG9kID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgPyBcImFkZEV2ZW50TGlzdGVuZXJcIiA6IFwiYXR0YWNoRXZlbnRcIjtcbnZhciBldmVudGVyID0gd2luZG93W2V2ZW50TWV0aG9kXTtcbnZhciBtZXNzYWdlRXZlbnQgPSBldmVudE1ldGhvZCA9PSBcImF0dGFjaEV2ZW50XCIgPyBcIm9ubWVzc2FnZVwiIDogXCJtZXNzYWdlXCI7XG5cbi8vIExpc3RlbiB0byBtZXNzYWdlIGZyb20gY2hpbGQgd2luZG93XG5ldmVudGVyKG1lc3NhZ2VFdmVudCxmdW5jdGlvbihlKSB7XG4gIGNvbnNvbGUubG9nKCdwYXJlbnQgcmVjZWl2ZWQgbWVzc2FnZSE6ICAnLGUuZGF0YSk7XG59LGZhbHNlKTtcbiBcbi8vZG9kYWplbXkgdGlueW1jZSBkbyAyIHRleHRhcmVhIChkeW1layDFunLDs2TFgm8pXG50aW55bWNlLmluaXQoe1xuXHRtZW51YmFyOmZhbHNlLFxuICBzZWxlY3RvcjogJy50aW55ZWRpdCcsICAvLyBjaGFuZ2UgdGhpcyB2YWx1ZSBhY2NvcmRpbmcgdG8geW91ciBIVE1MXG4gIHRvb2xiYXI6ICdib2xkIGl0YWxpYyB8IGxpbmsgaW1hZ2UnLFxuICAgIHNldHVwOiBmdW5jdGlvbiAoZWRpdG9yKSB7XG4gICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSAkKGVkaXRvci50YXJnZXRFbG0pLmF0dHIoJ25hbWUnKTtcbiAgICAgICAgXG4gICAgICAgIC8vamXFm2xpIGFrdHVhbGl6dWplbXkgZHltZWtcbiAgICAgICAgaWYodGFyZ2V0ID09ICdjbG91ZCcpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKClcbiAgICAgICAgXHRsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gPSBlZGl0b3IuZ2V0Q29udGVudCgpO1xuICAgICAgICBcdC8vY2xvdWQuZ2V0X3RleHRhcmVhKCBlZGl0b3IuZ2V0Q29udGVudCgpICk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2plxZtsaSBha3R1YWxpenVqZW15IMW8csOzZMWCbyBwcm9qZWt0dVxuICAgICAgICBpZih0YXJnZXQgPT0gJ3NvdXJjZScpe1xuICAgXHRcdFx0XHRsYXllcnMuc291cmNlID0gZWRpdG9yLmdldENvbnRlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcbiAgICB9XG59KTtcblxud2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24gKGV2dCkge1xuIFx0aWYgKHR5cGVvZiBldnQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgXHRldnQgPSB3aW5kb3cuZXZlbnQ7XG4gXHR9XG4gXHRpZiAoZXZ0KSB7XG4gIFx0aWYoIWNvbmZpcm0oJ0N6eSBjaGNlc3ogb3B1xZtjacSHIHTEmSBzdHJvbsSZJykpIHJldHVybiBmYWxzZVxuXHR9XG59XG5cbi8vcG8ga2xpa25pxJljaXUgem1pZW5pYXkgYWt0dWFsbnkgcGFuZWxcbiQoJy5ib3ggPiB1bCA+IGxpJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2JveCh0aGlzKSB9KTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRtZW51X3RvcC5nZXRfbWFwcygpO1xuXHRtZW51X3RvcC5nZXRfcHJvamVjdHMoKTtcbiAgbGF5ZXJzLnNob3coKTtcbiAgcGFsZXRzLnNob3coKTtcblxuXHQvL3phYmxva293YW5pZSBtb8W8bGl3b8WbY2kgemF6bmFjemFuaWEgYnV0dG9uw7N3IHBvZGN6YXMgZWR5Y2ppIHBvbGFcblx0JChkb2N1bWVudCkub24oXCJmb2N1c2luXCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gdHJ1ZTsgfSk7XG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNvdXRcIixcImlucHV0XCIsZnVuY3Rpb24oKXsgbWVudV90b3AuZGlzYWJsZV9zZWxlY3QgPSBmYWxzZTsgfSk7XG5cblx0Ly96YXpuYWN6ZW5pZSBkeW1rYSBkbyBwdWJsaWthY2ppIHBvIGtsaWtuacSZY2l1XG5cdCQoJy5wdWJsaXNoIC5lbWJlZCcpLmNsaWNrKGZ1bmN0aW9uKCl7XHQkKHRoaXMpLnNlbGVjdCgpO1x0fSk7XG5cdCQoJy5wdWJsaXNoJykuY2xpY2soZnVuY3Rpb24oZXZlbnQpeyBjcnVkLnB1Ymxpc2goZXZlbnQpOyB9KTtcblxuXHQvL2plxZtsaSBjaGNlbXkgemFwaXNhxIcgLyB6YWt0dWFsaXpvd2HEhyAvIG9wdWJsaWtvd2HEhyBwcm9qZWt0XG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCl7IFxuXHRcdGlmKHR5cGVvZiBjcnVkLnByb2plY3RfaGFzaCA9PSAnc3RyaW5nJyl7XHRjcnVkLnVwZGF0ZV9wcm9qZWN0KCk7IH1cblx0XHRlbHNleyBjcnVkLmNyZWF0ZV9wcm9qZWN0KCk7IH1cblx0fSk7XG5cblx0Ly9qZcWbbGkgY2hjZW15IHVzdW7EhcSHIHByb2pla3Rcblx0JCgnI3Rvb2xiYXJfdG9wIGJ1dHRvbi5kZWxldGUnKS5jbGljayhmdW5jdGlvbigpeyBcblx0XHRpZihjb25maXJtKCdDenkgY2hjZXN6IHVzdW7EhcSHIHByb2pla3QgPycpKXtcblx0XHRcdGNydWQuZGVsZXRlX3Byb2plY3QoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vb2R6bmFjemVuaWUgc2VsZWN0YSBwcnp5IHptaWFuaWVcblx0JCgnI2NoYW5nZV9jYXRlZ29yeScpLmNoYW5nZShmdW5jdGlvbigpeyAkKCcjY2hhbmdlX2NhdGVnb3J5JykuYmx1cigpOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHB1c2N6ZW5pYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgbW91c2UubW91c2VfZG93biA9IGZhbHNlOyB9KTtcblxuXHQvL3JlamVzdHJhY2phIHpkYXJ6ZW5pYSB3IG1vbWVuY2llIHdjacWbbmnEmWNpYSBwcnp5Y2lza3UgbXlzemtpXG5cdCQoZG9jdW1lbnQpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cdFxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vxYJhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7XG5cdFxuXHR9KTtcblxuXHQvL3d5d2/FgmFuaWUgZnVua2NqaSBwb2RjemFzIHBvcnVzemFuaWEgbXlzemvEhVxuXHQkKGRvY3VtZW50KS5tb3VzZW1vdmUoZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0aWYobW91c2UubW91c2VfZG93bikgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblx0XHRpZihtZW51X3RvcC5hdXRvX2RyYXcpeyBtb3VzZS5jbGlja19vYmogPSBcImNhbnZhc1wiOyBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO31cblx0XG5cdH0pO1xuXG5cdCQoJyNtYWluX2NhbnZhcycpLm1vdXNlZG93bihmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfbW91c2VfZG93bihldmVudCk7Ly96YXJlamVzdHJvd2FuaWUgb2JpZWt0dXcgIGt0w7NyeSBrbGlrYW15XG5cdFx0bW91c2Uuc2V0X3Bvc2l0aW9uKGV2ZW50KTsgLy96YXJlamVzdHJvd2FuaWUgcG96eWNqaSBteXN6a2lcblx0XHQvL2plc2xpIHByenljaXNrIGplc3Qgd2NpxZtuacSZdHkgd3lrb251amVteSBkb2RhdGtvd2UgemRhcnplbmlhIChwcnp5IHJ1c3phbml1IG15c3prxIUpXG5cdFx0bW91c2UubW91c2Vtb3ZlKGV2ZW50KTtcblxuXHR9KTtcblxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7XG5cblx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IG51bGw7XHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdFx0cG9pbnRlcnMubGFzdF9yb3cgPSBudWxsO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSBjYW52YXMuY29udGV4dF9uZXdfeDtcblx0XHRjYW52YXMuY29udGV4dF95ID0gY2FudmFzLmNvbnRleHRfbmV3X3k7XG5cblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaVxuXHQkKCcjYWRkX2NhdGVnb3J5JykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuXHR9KTtcblxuXHQvL2RvZGFuaWUgbm93ZWoga2F0ZWdvcmlpIChwbyB3Y2nFm25pxJljaXUgZW50ZXIpXG5cdCQoJ2lucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS5rZXlwcmVzcyhmdW5jdGlvbihlKSB7XG4gICAgXHRpZihlLndoaWNoID09IDEzKSB7XG4gICAgXHRcdGNhdGVnb3JpZXMuYWRkKCk7XG4gICAgXHR9XG5cdH0pO1xuXG5cdC8vJChkb2N1bWVudCkua2V5cHJlc3MoZnVuY3Rpb24oZSkgeyBtZW51X3RvcC5zd2l0Y2hfbW9kZSggZS53aGljaCApOyB9KTtcblxuXHQvL3pha3R1YWxpem93YW5pZSBrYXRlZ29yaWlcbi8vXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKSB7IGNhdGVnb3JpZXMudXBkYXRlKCQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKSAsJCh0aGlzKS52YWwoKSApOyB9KTtcbi8vXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZSkgeyBpZihlLndoaWNoID09IDEzKSB7Y2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0gfSk7XG5cblx0Ly91c3VuacSZY2llIGthdGVnb3JpaVxuLy9cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImJ1dHRvbi5yZW1vdmVcIixcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBjYXRlZ29yaWVzLnJlbW92ZSgkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5JykpOyB9KTtcblxuXHQvL3pha3R1YWxpem93YW5pZSBrYXRlZ29yaWkvXG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyAgfSk7XG4vL1x0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImZvY3Vzb3V0XCIsIGZ1bmN0aW9uKCkgeyBtZW51X3RvcC5tb2RlX2tleSA9IHRydWU7ICB9KTtcblxuXHQvL3Bva2F6YW5pZSAvIHVrcnljaWUgcGFuZWx1IGthdGVnb3JpaVxuXHQkKCcjZXhjZWxfYm94IGgyLCAjcG9pbnRlcl9ib3ggaDIsICNwYWxldHNfYm94IGgyJykuY2xpY2soZnVuY3Rpb24oZXZlbnQpeyBnbG9iYWwudG9vZ2xlX3BhbmVsKGV2ZW50KTsgfSk7XG5cblx0Ly9vYnPFgnVnYSBidXR0b27Ds3cgZG8gaW5rcmVtZW50YWNqaSBpIGRla3JlbWVudGFjamkgaW5wdXTDs3dcblx0JCgnYnV0dG9uLmluY3JlbWVudCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy5idXR0b25faW5jcmVtZW50KCAkKHRoaXMpICkgfSk7XG5cdCQoJ2J1dHRvbi5kZWNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2RlY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXG5cdC8vb2LFgnVnYSBpbnB1dMOzdyBwb2JyYW5pZSBkYW55Y2ggaSB6YXBpc2FuaWUgZG8gYmF6eVxuXHQkKCcuc3dpdGNoJykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3N3aXRjaCggJCh0aGlzKSApOyB9KTsgLy9wcnp5Y2lza2kgc3dpdGNoXG5cdCQoJy5pbnB1dF9iYXNlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9pbnB1dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuaW5wdXRfYmFzZV90ZXh0JykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9pbnB1dF90ZXh0KCAkKHRoaXMpICk7IH0pOyAvL3RyYWR5Y3lqbmUgaW5wdXR5XG5cdCQoJy5zZWxlY3RfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21fc2VsZWN0KCAkKHRoaXMpICk7IH0pOyAvL2xpc3R5IHJvendpamFuZSBzZWxlY3RcblxuXHQkKCcjbWVudV90b3AgI2luY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5pbmNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjZGVjcmVtZW50X2NhbnZhcycpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRlY3JlbWVudF9zY2FsZSgpOyB9KTtcblx0JCgnI21lbnVfdG9wICNhZGRfaW1hZ2UnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5hZGRfaW1hZ2UoKTsgfSk7XG5cblx0JCgnI21lbnVfdG9wICNyZXNldF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBjYW52YXMuc2V0X2RlZmF1bHQoKTsgfSk7XG5cblx0Ly9wcnp5cGlzYW5pZSBwb2RzdGF3b3dvd3ljaCBkYW55Y2ggZG8gb2JpZWt0dSBjYW52YXNcblx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuICBjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcpICk7XG4gIGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcGFyc2VJbnQoICQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcpICk7XG4gIHZhciBvZmZzZXQgPSAkKCcjY2FudmFzX2JveCcpLm9mZnNldCgpO1xuICBjYW52YXMub2Zmc2V0X2xlZnQgPSBvZmZzZXQubGVmdDtcbiAgY2FudmFzLm9mZnNldF90b3AgPSBvZmZzZXQudG9wO1xuXG4gIC8vdHdvcnp5bXkgdGFibGljZSBwb2ludGVyw7N3XG5cdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXG4gICQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoY2FudmFzLndpZHRoX2NhbnZhcysncHgnKTtcblx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG4gICQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHQkKCcjY2FudmFzX2luZm8gI3dpZHRoLCNjYW52YXNfaW5mbyAjaGVpZ2h0LCNjYW52YXNfaW5mbyAjc2l6ZScpLmNoYW5nZShmdW5jdGlvbigpe21lbnVfdG9wLnVwZGF0ZV9jYW52YXNfaW5mbygpfSk7XG5cblx0Ly8kKCcjYWxwaGFfaW1hZ2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2FscGhhKCkgfSk7XG5cblx0Ly8kKCdpbnB1dCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gZmFsc2U7IH0pO1xuXHQvLyQoJ2lucHV0JykuZm9jdXNvdXQoZnVuY3Rpb24oKXsgbWVudV90b3AubW9kZV9rZXkgPSB0cnVlOyB9KTtcblxuXHQvLyQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgY2FudmFzLmRyYXcoKTsgfSk7XG5cdGNhbnZhcy5kcmF3KCk7IC8vcnlzb3dhbmllIGNhbnZhc1xuXG59KTtcbiIsIi8vb2JpZWt0IG1lbnVfdG9wXG5tZW51X3RvcCA9IHtcblxuXHRtb3ZlX2ltYWdlIDogZmFsc2UsXG5cdG1vdmVfY2FudmFzIDogZmFsc2UsXG5cdGF1dG9fZHJhdyA6IGZhbHNlLFxuXHRtb2RlX2tleSA6IHRydWUsXG5cdGNhdGVnb3J5IDogMCxcblx0ZGlzYWJsZV9zZWxlY3QgOiBmYWxzZSxcblxuXHQvL3ptaWFuYSBha3R1YWxuZWogemFrxYJhZGtpXG5cdGNoYW5nZV9ib3ggOiBmdW5jdGlvbihvYmope1xuXHRcdCQob2JqKS5wYXJlbnQoKS5jaGlsZHJlbignbGknKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0JChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuXHRcdHZhciBjYXRlZ29yeSA9ICQob2JqKS5hdHRyKCdjYXRlZ29yeScpO1xuXHRcdCQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5jaGlsZHJlbignZGl2JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJyMnK2NhdGVnb3J5KS5kZWxheSgxMDApLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcblx0XG5cdH0sXG5cblx0Ly9mdW5rY2phIHPFgnXFvMSFY2EgZG8gcG9iaWVyYW5pYSBkYW55Y2ggZG90eWN6xIVjeWNoIG1hcFxuXHRnZXRfbWFwcyA6IGZ1bmN0aW9uKCl7XG5cdFxuXHRcdCQuYWpheCh7XG4gICBcdFx0dXJsOiAnL2FwaS9tYXBzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBtYXAgdyBwYW5lbHUgdSBnw7NyeVxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IFwib2tcIil7XG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICc8b3B0aW9uIGlkPVwic2VsZWN0X21hcFwiPnd5YmllcnogbWFwxJk8L29wdGlvbj4nO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXHRcdFx0XHRcdGlmKHJlc3BvbnNlLmRhdGFbaV0uX2lkID09IGNydWQubWFwX2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdCQoJyN0b29sYmFyX3RvcCBzZWxlY3Quc2VsZWN0X21hcCcpLmh0bWwoIGFkZF9odG1sICk7XG5cblx0XHRcdFx0Ly9kb2RhamVtdSB6ZGFyemVuaWUgY2hhbmdlIG1hcCBcblx0XHRcdFx0JCgnLnNlbGVjdF9tYXAnKS5jaGFuZ2UoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHQvL3NwcmF3ZHphbXkgY3p5IHd5YnJhbGnFm215IHBvbGUgeiBoYXNoZW0gbWFweVxuXHRcdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgIT0gJ3NlbGVjdF9tYXAnKXtcblx0XHRcdFx0XHRcdC8vamXFm2xpIHRhayB0byBzcHJhd2R6YW15IGN6eSB3Y3p5dHVqZW15IG1hcMSZIHBvIHJheiBwaWVyd3N6eSBjenkgZHJ1Z2lcblx0XHRcdFx0XHRcdGlmKGNydWQubWFwX2hhc2ggIT0gbnVsbCl7XG5cdFx0XHRcdFx0XHRcdC8vamXFm2xpIHdjenl0dWplbXkgcG8gcmF6IGtvbGVqbnkgdG8gcHl0YW15IGN6eSBuYXBld25vIGNoY2VteSBqxIUgd2N6eXRhxIdcblx0XHRcdFx0XHRcdFx0aWYgKGNvbmZpcm0oJ0N6eSBjaGNlc3ogd2N6eXRhxIcgbm93xIUgbWFwxJkgPycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y3J1ZC5tYXBfaGFzaCA9ICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKTtcblx0XHRcdFx0XHRcdFx0XHRjcnVkLmdldF9tYXAoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0JCgnLnNlbGVjdF9tYXAgb3B0aW9uJykuZXEoMCkucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdGNydWQubWFwX2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdGNydWQuZ2V0X21hcCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGFsZXJ0KCduaWUgbW9nxJkgcG9icmHEhyBsaXN0eSBtYXAnKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXG5cblx0fSxcblxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X3Byb2plY3RzIDogZnVuY3Rpb24oKXtcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9hcGkvcHJvamVjdHMnLFxuICAgIFx0dHlwZTogXCJHRVRcIixcbiAgICBcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoIGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblxuXHRcdFx0Ly93ecWbd2lldGxhbXkgbGlzdMSZIHByb2pla3TDs3cgdyBwYW5lbHUgdSBnw7NyeVxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IFwib2tcIil7XG5cblx0XHRcdFx0dmFyIGFkZF9odG1sID0gJzxvcHRpb24gaWQ9XCJuZXdfcHJvamVjdFwiPm5vd3kgcHJvamVrdDwvb3B0aW9uPic7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBpX21heCA9IHJlc3BvbnNlLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXggO2krKyl7XG5cblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLnByb2plY3RfaGFzaCl7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBzZWxlY3RlZCBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLnByb2plY3QpLm5hbWUgKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ucHJvamVjdCkubmFtZSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9wcm9qZWN0JykuaHRtbCggYWRkX2h0bWwgKTtcblx0XHRcdFxuXHRcdFx0XHQvL2RvZGFqZW11IHpkYXJ6ZW5pZSBjaGFuZ2UgcHJvamVjdCBcblx0XHRcdFx0JCgnLnNlbGVjdF9wcm9qZWN0JykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0aWYgKGNvbmZpcm0oJ0N6eSBjaGNlc3ogd2N6eXRhxIcgbm93eSBwcm9qZWt0ID8nKSkge1xuXHRcdFx0XHRcdFx0aWYoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSA9PSAnbmV3X3Byb2plY3QnICl7XG5cdFx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0Y3J1ZC5wcm9qZWN0X2hhc2ggPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdFx0XHRcdGNydWQuZ2V0X3Byb2plY3QoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRhbGVydCgnbmllIG1vZ8SZIHBvYnJhxIcgbGlzdHkgcHJvamVrdMOzdycpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKTtcblx0XHRcdH1cblxuXHRcdH0pO1xuXHR9LFxuXG5cdHVwZGF0ZV9jYW52YXNfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLnNjYWxlID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCgpICk7XG5cdFx0Y2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCkgKTtcblx0XHRjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCgpICk7XG5cblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoIGNhbnZhcy5zY2FsZSArICclJyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoIGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnICk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoIGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4JyApO1xuXG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCAjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRjaGFuZ2VfYWxwaGEgOiBmdW5jdGlvbigpe1xuXHRcdGltYWdlLmFscGhhID0gJCgnI2FscGhhX2ltYWdlJykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0YWRkX2ltYWdlIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vamVzbGkgcG9kYW55IHBhcmFtZXRyIG5pZSBqZXN0IHB1c3R5XG5cdFx0dmFyIHNyY19pbWFnZSA9IHByb21wdChcIlBvZGFqIMWbY2llxbxrxJkgZG8gemRqxJljaWE6IFwiKTtcblxuXHRcdGlmKHNyY19pbWFnZSl7XG5cdFx0XHRpZihzcmNfaW1hZ2UubGVuZ3RoID4gMCl7XG5cblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cblx0XHRcdFx0Ly93Y3p5dGFuaWUgemRqxJljaWE6XG5cdFx0XHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdGltYWdlLndpZHRoID0gaW1hZ2Uub2JqLndpZHRoO1xuXHQgICAgXHRcdGltYWdlLmhlaWdodCA9IGltYWdlLm9iai5oZWlnaHQ7XG5cdCAgICBcdFx0aW1hZ2UuZHJhdygpO1xuXHQgIFx0XHR9O1xuXG5cdFx0XHQgIGltYWdlLnggPSAwO1xuXHRcdFx0ICBpbWFnZS55ID0gMDtcblx0XHRcdCAgaW1hZ2Uub2JqLnNyYyA9IHNyY19pbWFnZTtcblx0XHRcdFx0Ly9zaW1hZ2Uub2JqLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNob3dfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHBhcnNlSW50KGNhbnZhcy5zY2FsZSkgKyAnJScpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwocGFyc2VJbnQoY2FudmFzLndpZHRoX2NhbnZhcykgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbChwYXJzZUludChjYW52YXMuaGVpZ2h0X2NhbnZhcykgKyAncHgnKTtcblx0fVxuXG59XG4iLCIvLyBwb2JpZXJhbmllIGRhbnljaCB6IHNlbGVrdGEgaW5wdXRhIHN3aXRjaHkgKGFrdHVhbGl6YWNqYSBvYmlla3TDs3cpIGJ1dHRvbiBpbmtyZW1lbnQgaSBkZWtyZW1lbnRcbnZhciBtb2RlbHMgPSB7XG5cblx0YnV0dG9uX2luY3JlbWVudCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgaW5wdXRfdG9fdXBkYXRlID0gJChvYmopLmF0dHIoJ25hbWVpbnB1dCcpO1xuXHRcdHZhciB2YWx1ZSA9IHBhcnNlSW50KCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKCkpICsgMTtcblxuXHRcdCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKHZhbHVlKTtcblx0XHR0aGlzLnVwZGF0ZV9mcm9tX2lucHV0KCAkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpICk7XG5cdH0sXG5cblx0YnV0dG9uX2RlY3JlbWVudCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgaW5wdXRfdG9fdXBkYXRlID0gJChvYmopLmF0dHIoJ25hbWVpbnB1dCcpO1xuXHRcdHZhciB2YWx1ZSA9IHBhcnNlSW50KCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKCkpIC0gMTtcblxuXHRcdCQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykudmFsKHZhbHVlKTtcblx0XHR0aGlzLnVwZGF0ZV9mcm9tX2lucHV0KCAkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpICk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21faW5wdXQgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gcGFyc2VJbnQoJChvYmopLnZhbCgpKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX2lucHV0X3RleHQgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gJChvYmopLnZhbCgpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21fc2VsZWN0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9ICQob2JqKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCduYW1lJyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9zd2l0Y2ggOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdGlmKCAkKG9iaikuYXR0cihcInZhbHVlXCIpID09ICdmYWxzZScgKXtcblx0XHRcdCQob2JqKS5hdHRyKFwidmFsdWVcIiwndHJ1ZScpO1xuXHRcdFx0JChvYmopLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHQkKG9iaikuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2V7IC8vd3nFgsSFY3phbXkgcHJ6ZcWCxIVjem5pa1xuXHRcdFx0JChvYmopLmF0dHIoXCJ2YWx1ZVwiLCdmYWxzZScpO1xuXHRcdFx0JChvYmopLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdCQob2JqKS5hZGRDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9IGZhbHNlO1xuXHRcdH1cblx0XHRjYW52YXMuZHJhdygpO1xuXHR9XG59XG4iLCIvL29iaWVrdCBteXN6a2kgKGRvIG9nYXJuaWVjaWEpXG52YXIgbW91c2UgPSB7XG5cdG1vdXNlX2Rvd24gOiBmYWxzZSxcblx0Y2xpY2tfb2JqIDogbnVsbCxcblxuXHR0bXBfbW91c2VfeCA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cdHRtcF9tb3VzZV95IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblxuXHRsZWZ0IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpXG5cdHRvcCA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praVxuXHRwYWRkaW5nX3ggOiBudWxsLCAvL3BvenljamEgeCBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0cGFkZGluZ195IDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdG9mZnNldF94IDogbnVsbCwgLy9vZmZzZXQgeCBvYmlla3R1IGtsaWtuacSZdGVnb1xuXHRvZmZzZXRfeSA6IG51bGwsIC8vb2Zmc2V0IHkgb2JpZWt0dSBrbGlrbmnEmXRlZ29cblxuXHQvL2Z1bmNramEgd3lrcnl3YWrEhWNhIHcgY28ga2xpa25pxJl0byBwb2JpZXJhasSFY2EgcGFkZGluZyBrbGlrbmnEmWNpYSBvcmF6IHphcGlzdWrEhWNhIGtsaWtuacSZY2llXG5cdHNldF9tb3VzZV9kb3duIDogZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0dmFyIG9iaiA9IGV2ZW50LnRhcmdldDtcblxuXHRcdC8vamXFm2xpIGVsZW1lbnQgbmEga3TDs3J5IGtsaWtuacSZdG8gbWEgYXRyeWJ1dCBuYW1lY2xpY2sgcHJ6eXBpc3VqZW15IGdvIGRvIG9iaWVrdHUgbXlzemtpXG5cdFx0aWYodHlwZW9mKCQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHR0aGlzLmNsaWNrX29iaiA9ICQoZXZlbnQudGFyZ2V0KS5hdHRyKCduYW1lY2xpY2snKTtcblxuXHRcdFx0dmFyIHBvc2l0aW9uID0gJChvYmopLm9mZnNldCgpO1xuXHRcdFx0dGhpcy5vZmZzZXRfeCA9IHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLm9mZnNldF95ID0gcG9zaXRpb24udG9wO1xuXHRcdFx0dGhpcy5wYWRkaW5nX3ggPSB0aGlzLmxlZnQgLSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5wYWRkaW5nX3kgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDtcblx0XHRcdG1vdXNlLm1vdXNlX2Rvd24gPSB0cnVlO1xuXG5cdFx0XHR0aGlzLnRtcF9tb3VzZV94ID0gaW1hZ2UueDtcblx0XHRcdHRoaXMudG1wX21vdXNlX3kgPSBpbWFnZS55O1xuXHRcdH1cblx0fSxcblxuXHRzZXRfcG9zaXRpb24gOiBmdW5jdGlvbihldmVudCl7XG5cdFx0dGhpcy5sZWZ0ID0gZXZlbnQucGFnZVgsXG5cdFx0dGhpcy50b3AgPSBldmVudC5wYWdlWVxuXHR9LFxuXG5cdC8vZnVua2NqYSB3eWtvbnl3YW5hIHBvZGN6YXMgd2NpxZtuaWVjaWEgcHJ6eWNpa3NrdSBteXN6a2kgKHcgemFsZcW8bm/Fm2NpIG9kIGtsaWtuacSZdGVnbyBlbGVtZW50dSB3eWtvbnVqZW15IHLDs8W8bmUgcnplY3p5KVxuXHRtb3VzZW1vdmUgOiBmdW5jdGlvbigpe1xuXHRcdHN3aXRjaCh0aGlzLmNsaWNrX29iail7XG5cdFx0XHRjYXNlICdyaWdodF9yZXNpemUnOlxuXHRcdFx0XHQvL3JvenN6ZXJ6YW5pZSBjYW52YXNhIHcgcHJhd29cblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHR2YXIgbmV3X3dpZHRoID0gdGhpcy5sZWZ0IC0gdGhpcy5wYWRkaW5nX3ggLSBwb3NpdGlvbi5sZWZ0XG5cdFx0XHRcdGlmKG5ld193aWR0aCA8IHNjcmVlbi53aWR0aCAtIDEwMCl7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2l6ZV93aWR0aChuZXdfd2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYm90dG9tX3Jlc2l6ZSc6XG5cdFx0XHRcdC8vem1pZW5pYW15IHd5c29rb8WbxIcgY2FudmFzYVxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdGNhbnZhcy5yZXNpemVfaGVpZ2h0KHRoaXMudG9wIC0gdGhpcy5wYWRkaW5nX3kgLSBwb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2ltYWdlX3Jlc2l6ZSc6XG5cblx0XHRcdFx0aWYoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XHQvL2FrdHVhbG5hIHBvenljamEgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHN1YnN0cmFjdCA9IGltYWdlLnggKyBpbWFnZS53aWR0aCAtIHhfYWN0dWFsICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0XHRcdFx0dmFyIGZhY29yID0gaW1hZ2Uud2lkdGggLyBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdFx0XHRpZiAoaW1hZ2Uud2lkdGggLSBzdWJzdHJhY3QgPiAxMDApe1xuXHRcdFx0XHRcdFx0aW1hZ2Uud2lkdGggLT0gc3Vic3RyYWN0O1xuXHRcdFx0XHRcdFx0aW1hZ2UuaGVpZ2h0IC09IHN1YnN0cmFjdC9mYWNvcjtcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cbiIsIi8vb2JpZWt0IG3Ds3dpxIVjeSBuYW0gbmFkIGpha8SFIGthdGVnb3JpYSBqZXN0ZcWbbXlcbnZhciBvbl9jYXRlZ29yeSA9IHtcblx0XG5cdGNhbnZhc19vZmZzZXRfdG9wIDogMTg3LFxuXHRjYW52YXNfb2Zmc2V0X2xlZnQgOiAxMCxcblxuXHQvL2Z1bmtjamEgendyYWNhasSFY2EgYWt0dWFsbsSFIGthdGVnb3JpxJkgbmFkIGt0w7NyxIUgem5hamR1amUgc2nEmSBrdXJzb3Jcblx0Z2V0X25hbWUgOiBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIHRoaXMuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSB0aGlzLmNhbnZhc19vZmZzZXRfdG9wO1xuXHRcdHZhciByb3cgPSBNYXRoLmNlaWwoIHRvcCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdC8vY29uc29sZS5sb2cobGVmdCx0b3AsdGhpcy5jYW52YXNfb2Zmc2V0X2xlZnQsdGhpcy5jYW52YXNfb2Zmc2V0X3RvcCk7XG5cdFx0aWYoKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICYmIChyb3cgJSAyICE9IDApKXtcblx0XHRcdHZhciBjb2x1bW4gPSBNYXRoLmNlaWwoIChsZWZ0ICsgKHBvaW50ZXJzLnNpemUvMikpLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeCkgKSAtIDE7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCBsZWZ0IC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cdFx0fVxuXG5cdFx0dHJ5e1xuXHRcdFx0dmFyIGNhdGVnb3J5X251bSA9IHBvaW50ZXJzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW4tMV0gXG5cdFx0XHR2YXIgY2F0ZWdvcnlfbmFtZSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnlbY2F0ZWdvcnlfbnVtXVswXVxuXHRcdH1cblx0XHRjYXRjaChlKXtcblx0XHRcdHJldHVybiAnbnVsbCc7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKChjYXRlZ29yeV9uYW1lID09ICdwdXN0eScpIHx8IChjYXRlZ29yeV9uYW1lID09ICdndW11aicpKXtcblx0XHRcdHJldHVybiAnbnVsbCc7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRyZXR1cm4gY2F0ZWdvcnlfbmFtZTtcdFx0XG5cdFx0fVxuXG5cdH1cblxufVxuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCl7ICQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTsgfSk7XG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgY2xvdWQudXBkYXRlX3RleHQoIG9uX2NhdGVnb3J5LmdldF9uYW1lKCkgKTsgfSk7XG4kKFwiI2NhbnZhc19jbG91ZFwiKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgY2xvdWQuc2V0X3Bvc2l0aW9uKCk7IH0pOyIsInZhciBwYWxldHMgPSB7XG4gIC8vdmFsX21heCA6IG51bGwsXG4gIC8vdmFsX21pbiA6IG51bGwsXG4gIC8vdmFsX2ludGVydmFsIDogbnVsbCwgICBcbiAgLy9wYWxldHNfYWN0aXZlIDogMCxcbiAgLy92YWx1ZSA6IC0xLCBcbiAgLy9jYXRlZ29yeSA6IC0xLFxuXG4gIC8vcG9kc3Rhd293ZSBwYWxldHkga29sb3LDs3cgKCBvc3RhdG5pYSBwYWxldGEgamVzdCBuYXN6xIUgd8WCYXNuxIUgZG8gemRlZmluaW93YW5pYSApXG4gIGNvbG9yX2FyciA6IFtcbiAgICBbJyNmN2ZjZmQnLCcjZTVmNWY5JywnI2NjZWNlNicsJyM5OWQ4YzknLCcjNjZjMmE0JywnIzQxYWU3NicsJyMyMzhiNDUnLCcjMDA2ZDJjJywnIzAwNDQxYiddLFxuICAgIFsnI2Y3ZmNmZCcsJyNlMGVjZjQnLCcjYmZkM2U2JywnIzllYmNkYScsJyM4Yzk2YzYnLCcjOGM2YmIxJywnIzg4NDE5ZCcsJyM4MTBmN2MnLCcjNGQwMDRiJ10sXG4gICAgWycjZjdmY2YwJywnI2UwZjNkYicsJyNjY2ViYzUnLCcjYThkZGI1JywnIzdiY2NjNCcsJyM0ZWIzZDMnLCcjMmI4Y2JlJywnIzA4NjhhYycsJyMwODQwODEnXSxcbiAgICBbJyNmZmY3ZWMnLCcjZmVlOGM4JywnI2ZkZDQ5ZScsJyNmZGJiODQnLCcjZmM4ZDU5JywnI2VmNjU0OCcsJyNkNzMwMWYnLCcjYjMwMDAwJywnIzdmMDAwMCddLFxuICAgIFsnI2ZmZjdmYicsJyNlY2U3ZjInLCcjZDBkMWU2JywnI2E2YmRkYicsJyM3NGE5Y2YnLCcjMzY5MGMwJywnIzA1NzBiMCcsJyMwNDVhOGQnLCcjMDIzODU4J10sXG4gICAgWycjZmZmN2ZiJywnI2VjZTJmMCcsJyNkMGQxZTYnLCcjYTZiZGRiJywnIzY3YTljZicsJyMzNjkwYzAnLCcjMDI4MThhJywnIzAxNmM1OScsJyMwMTQ2MzYnXSxcbiAgICBbJyNmN2Y0ZjknLCcjZTdlMWVmJywnI2Q0YjlkYScsJyNjOTk0YzcnLCcjZGY2NWIwJywnI2U3Mjk4YScsJyNjZTEyNTYnLCcjOTgwMDQzJywnIzY3MDAxZiddLFxuICAgIFsnI2ZmZjdmMycsJyNmZGUwZGQnLCcjZmNjNWMwJywnI2ZhOWZiNScsJyNmNzY4YTEnLCcjZGQzNDk3JywnI2FlMDE3ZScsJyM3YTAxNzcnLCcjNDkwMDZhJ10sXG4gICAgWycjZmZmZmU1JywnI2Y3ZmNiOScsJyNkOWYwYTMnLCcjYWRkZDhlJywnIzc4YzY3OScsJyM0MWFiNWQnLCcjMjM4NDQzJywnIzAwNjgzNycsJyMwMDQ1MjknXSxcbiAgICBbJyNmZmZmZDknLCcjZWRmOGIxJywnI2M3ZTliNCcsJyM3ZmNkYmInLCcjNDFiNmM0JywnIzFkOTFjMCcsJyMyMjVlYTgnLCcjMjUzNDk0JywnIzA4MWQ1OCddLFxuICAgIFsnI2ZmZmZlNScsJyNmZmY3YmMnLCcjZmVlMzkxJywnI2ZlYzQ0ZicsJyNmZTk5MjknLCcjZWM3MDE0JywnI2NjNGMwMicsJyM5OTM0MDQnLCcjNjYyNTA2J10sXG4gICAgWycjZmZmZmNjJywnI2ZmZWRhMCcsJyNmZWQ5NzYnLCcjZmViMjRjJywnI2ZkOGQzYycsJyNmYzRlMmEnLCcjZTMxYTFjJywnI2JkMDAyNicsJyM4MDAwMjYnXSxcbiAgICBbJyNmN2ZiZmYnLCcjZGVlYmY3JywnI2M2ZGJlZicsJyM5ZWNhZTEnLCcjNmJhZWQ2JywnIzQyOTJjNicsJyMyMTcxYjUnLCcjMDg1MTljJywnIzA4MzA2YiddLFxuICAgIFsnI2Y3ZmNmNScsJyNlNWY1ZTAnLCcjYzdlOWMwJywnI2ExZDk5YicsJyM3NGM0NzYnLCcjNDFhYjVkJywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10sXG4gICAgWycjZmZmZmZmJywnI2YwZjBmMCcsJyNkOWQ5ZDknLCcjYmRiZGJkJywnIzk2OTY5NicsJyM3MzczNzMnLCcjNTI1MjUyJywnIzI1MjUyNScsJyMwMDAwMDAnXSxcbiAgICBbJyNmZmY1ZWInLCcjZmVlNmNlJywnI2ZkZDBhMicsJyNmZGFlNmInLCcjZmQ4ZDNjJywnI2YxNjkxMycsJyNkOTQ4MDEnLCcjYTYzNjAzJywnIzdmMjcwNCddLFxuICAgIFsnI2ZjZmJmZCcsJyNlZmVkZjUnLCcjZGFkYWViJywnI2JjYmRkYycsJyM5ZTlhYzgnLCcjODA3ZGJhJywnIzZhNTFhMycsJyM1NDI3OGYnLCcjM2YwMDdkJ10sXG4gICAgWycjZmZmNWYwJywnI2ZlZTBkMicsJyNmY2JiYTEnLCcjZmM5MjcyJywnI2ZiNmE0YScsJyNlZjNiMmMnLCcjY2IxODFkJywnI2E1MGYxNScsJyM2NzAwMGQnXSxcbiAgICBbJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZiddXG4gIF0sXG5cbiAgc2hvdyA6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zaG93X2NvbG9yKCk7XG4gICAgdGhpcy5zaG93X3BhbGV0cygpO1xuICAgIHRoaXMuc2hvd19zZWxlY3QoKTtcbiAgICAvL2xheWVycy5kYXRhLmNvbG9yX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdO1xuICB9LFxuXG4gIHNob3dfc2VsZWN0IDogZnVuY3Rpb24oKXtcblxuICAgIC8vd3nFm3dpZXRsYW15IHBhbmVsIGRvIHd5Ym9ydSBrb2x1bW55IGthdGVnb3JpaVxuICAgIGFkZF9odG1sID0gJzxvcHRpb24gY29sPVwiLTFcIj53eWJpZXJ6PC9vcHRpb24+JztcbiAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyAgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgaWYoZXhjZWwuZGF0YVswXVtpXSE9ICcnKXtcbiAgICAgICAgaWYoaSA9PSBsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0pe1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCIgc2VsZWN0ZWQ+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCI+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgICQoJyNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5JykuaHRtbCggYWRkX2h0bWwgKTtcblxuICAgIC8vd3nFm3dpZXRsYW15IHBhbmVsIGRvIHd5Ym9ydSBrb2x1bW55IHdhcnRvxZtjaVxuICAgIGFkZF9odG1sID0gJzxvcHRpb24gY29sPVwiLTFcIj53eWJpZXJ6PC9vcHRpb24+JztcbiAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyAgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgaWYoZXhjZWwuZGF0YVswXVtpXSE9ICcnKXtcbiAgICAgICAgaWYoaSA9PSBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0pe1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCIgc2VsZWN0ZWQ+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCI+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAkKCcjZXhjZWxfYm94IHNlbGVjdC52YWx1ZScpLmh0bWwoIGFkZF9odG1sICk7XG5cbiAgICAvL2tvbG9ydWplbXkgb2Rwb3dpZWRuaW8gZXhjZWxhXG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIFxuICAgIGlmKCBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpe1xuICAgICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkW2NvbD1cIicrKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICB9XG5cbiAgICBpZiggbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdICE9IC0xKXtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgfVxuICB9LFxuXG4gIC8vd3liaWVyYW15IGtvbHVtbsSZIGthdGVnb3JpaSAob2JzemFyw7N3KVxuICBzZXRfY2F0ZWdvcnkgOiBmdW5jdGlvbihvYmope1xuICAgIGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSA9IHBhcnNlRmxvYXQoJChcIiNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5IG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdjb2wnKSk7XG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJjYXRlZ29yeVwiKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIC8vY2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcbiAgfSwgXG5cbiAgLy93eWJpZXJhbXkga29sdW1uZSB3YXJ0b8WbY2kgaSB1c3Rhd2lhbXkgbmFqbW5pZWpzesSFIGkgbmFqd2nEmWtzesSFIHdhcnRvxZvEh1xuICBzZXRfdmFsdWUgOiBmdW5jdGlvbihvYmope1xuXG4gICAgdmFyIHZhbHVlX3RtcCA9IHBhcnNlRmxvYXQoJChcIiNleGNlbF9ib3ggc2VsZWN0LnZhbHVlIG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdjb2wnKSk7XG5cblxuICAgIC8vemFiZXpwaWVjemVuaWUgcHJ6ZWQgd3licmFuaWVtIGtvbHVtbnkgemF3aWVyYWrEhWNlaiB0ZWtzdFxuICAgIHZhciBjaGVjayA9IHRydWU7XG4gICAgZm9yKHZhciBpID0gMSwgaV9tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgaWYgKCghJC5pc051bWVyaWMoU3RyaW5nKGV4Y2VsLmRhdGFbaV1bdmFsdWVfdG1wXSkucmVwbGFjZSgnLCcsJy4nKSkpICYmICAoZXhjZWwuZGF0YVtpXVt2YWx1ZV90bXBdICE9ICcnKSl7IFxuXG4gICAgICAgIGNoZWNrID0gZmFsc2U7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0byBuaWUgamVzdCBsaWN6YmEhOiAnK2V4Y2VsLmRhdGFbaV1bdmFsdWVfdG1wXSk7XG4gICAgICAgfVxuICAgIH1cblxuICAgIC8vc3ByYXdkemFteSBjenkgdyB6YXpuYWN6b25laiBrb2x1bW5pZSB6bmFqZHVqZSBzacSZIHdpZXJzeiB6IHRla3N0ZW1cbiAgICBpZihjaGVjayl7XG4gICAgICAvL2plc2xpIG5pZSB3eWJpZXJhbXkgZGFuxIUga29sdW1uxJlcbiAgICAgIGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSA9IHZhbHVlX3RtcDtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZCcpLnJlbW92ZUNsYXNzKFwidmFsdWVcIik7XG4gICAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcInZhbHVlXCIpO1xuICAgICAgdGhpcy5zZXRfbWluX21heF92YWx1ZSgpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgLy9qZcWbbGkgdGFrIHp3cmFjYW15IGLFgsSFZFxuICAgICAgYWxlcnQoJ3d5YnJhbmEga29sdW1uYSB6YXdpZXJhIHdhcnRvxZtjaSB0ZWtzdG93ZScpXG4gICAgICB0aGlzLnNob3dfc2VsZWN0KCk7XG4gICAgfVxuXG4gIH0sXG5cbiAgc2V0X21pbl9tYXhfdmFsdWUgOiBmdW5jdGlvbigpe1xuICAgIHZhciB0bXBfdmFsdWUgPSBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV07XG4gICAgaWYodG1wX3ZhbHVlICE9IC0xKXtcbiAgICAgIC8vd3lzenVrdWplbXkgbmFqbW5pZWpzemEgaSBuYWp3acSZa3N6xIUgd2FydG/Fm8SHIHcga29sdW1uaWUgd2FydG/Fm2NpXG4gICAgICBpZiggbGF5ZXJzLnZhbHVlW3RtcF92YWx1ZV0gIT0gLTEgKXtcbiAgICAgICAgXG4gICAgICAgIHZhciB0bXBfbWluID0gU3RyaW5nKGV4Y2VsLmRhdGFbMV1bdG1wX3ZhbHVlXSkucmVwbGFjZSgnLCcsJy4nKVxuICAgICAgICB2YXIgdG1wX21heCA9IFN0cmluZyhleGNlbC5kYXRhWzFdW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJyk7XG4gICAgICAgIGZvcih2YXIgaSA9IDEsIGlfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgICAgICAgICBpZigodG1wX21pbiA+IFN0cmluZyhleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJykpICYmICAoZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdICE9IFwiXCIpKSB0bXBfbWluID0gU3RyaW5nKGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSkucmVwbGFjZSgnLCcsJy4nKTtcbiAgICAgICAgICBpZigodG1wX21heCA8IFN0cmluZyhleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pLnJlcGxhY2UoJywnLCcuJykpICYmICAoZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdICE9IFwiXCIpKSB0bXBfbWF4ID0gU3RyaW5nKGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSkucmVwbGFjZSgnLCcsJy4nKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKFwibWluIG1heCB2YWx1ZTogXCIsdG1wX21pbiwgdG1wX21heCk7XG4gICAgICB9XG5cbiAgICAgIGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gPSB0bXBfbWluXG4gICAgICBsYXllcnMubWF4X3ZhbHVlW2xheWVycy5hY3RpdmVdID0gdG1wX21heDtcblxuICAgICAgLy9ha3R1YWxpenVqZW15IHRhYmxpY8SZIGxlZ2VuZFxuICAgICAgbGVnZW5kcy51cGRhdGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2hvd19jb2xvciA6IGZ1bmN0aW9uKCl7XG4gICAgLy93ecWbd2lldGxhbXkgcGllcndzemFsaXN0xJkga29sb3LDs3dcbiAgICB2YXIgaHRtbCA9ICcnO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5jb2xvcl9hcnJbMF0ubGVuZ3RoOyBpPGlfbWF4OyBpKyspe1xuICAgICAgXG4gICAgICBpZihsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJhY3RpdmVcIiBzdHlsZT1cImJhY2tncm91bmQ6Jyt0aGlzLmNvbG9yX2FycltsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXV1baV0rJ1wiPjwvc3Bhbj4nO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcl9hcnJbbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1dW2ldKydcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkKCcjcGFsZXRzICNzZWxlY3QnKS5odG1sKCBodG1sICk7XG4gICAgXG4gICAgJCgnI3BhbGV0cyAjc2VsZWN0ID4gc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZWxlY3RfY29sb3IodGhpcyk7IH0pO1xuXG4gIH0sXG5cbiAgc2hvd19wYWxldHMgOiBmdW5jdGlvbigpe1xuICAgIFxuICAgIC8vd3lzd2lldGxhbXkgd3N6eXN0a2llIHBhbGV0eVxuICAgIHZhciBodG1sID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5jb2xvcl9hcnIubGVuZ3RoO2kgPCBpX21heDsgaSsrKXtcbiAgICAgIFxuICAgICAgaWYoaSA9PSBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSl7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwiYWN0aXZlXCI+JztcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuPic7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwLCBqX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaiA8IGpfbWF4OyBqKyspe1xuICAgICAgICBodG1sICs9ICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JfYXJyW2ldW2pdICsgJ1wiPjwvc3Bhbj4nO1xuICAgICAgfVxuICAgICAgaHRtbCArPSAnPC9zcGFuPic7XG5cbiAgICB9XG4gICAgJCgnI3BhbGV0cyAjYWxsJykuaHRtbCggaHRtbCApO1xuICAgICQoJyNwYWxldHMgI2FsbCA+IHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBwYWxldHMuc2VsZWN0X3BhbGV0cyh0aGlzKTt9KTtcbiBcbiAgfSxcblxuICAvL3phem5hY3phbXkga29ua3JldG5lIGtvbG9yeSBkbyB3ecWbd2lldGxlbmlhXG4gIHNlbGVjdF9jb2xvciA6IGZ1bmN0aW9uKG9iail7XG4gICAgaWYoKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuICAgICAgaWYoICQob2JqKS5oYXNDbGFzcygnYWN0aXZlJykgKXtcbiAgICAgICAgbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1bJChvYmopLmluZGV4KCldID0gMDtcbiAgICAgICAgJChvYmopLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdWyQob2JqKS5pbmRleCgpXSA9IDE7XG4gICAgICAgICQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcnNlX2NvbG9yKCk7XG4gICAgICBwYWxldHMuc2V0X21pbl9tYXhfdmFsdWUoKTtcbiAgICB9XG4gIH0sXG5cbiAgLy9kb2RhamVteSBkbyB0YWJsaWN5IGFrdHl3bnljaCBrb2xvcsOzdyB0ZSBrdMOzcmUgc8SFIHphem5hY3pvbmVcbiAgcGFyc2VfY29sb3IgOiBmdW5jdGlvbigpe1xuICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gW107XG4gICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaTxpX21heDsgaSsrKXtcblxuICAgICAgaWYoICQoJyNwYWxldHMgI3NlbGVjdCBzcGFuJykuZXEoaSkuaGFzQ2xhc3MoJ2FjdGl2ZScpICl7XG4gICAgICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdLnB1c2goIHJnYjJoZXgoJCgnI3BhbGV0cyAjc2VsZWN0IHNwYW4nKS5lcShpKS5jc3MoJ2JhY2tncm91bmQtY29sb3InKSkgKTtcbiAgICAgIH1cbiAgICAgfVxuICAgIC8vY2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG4gICAgLy9mdW5rY2phIHBvbW9jbmljemFcbiAgICBmdW5jdGlvbiByZ2IyaGV4KHJnYikge1xuICAgICAgcmdiID0gcmdiLm1hdGNoKC9ecmdiXFwoKFxcZCspLFxccyooXFxkKyksXFxzKihcXGQrKVxcKSQvKTtcbiAgICAgIFxuICAgICAgZnVuY3Rpb24gaGV4KHgpIHtcbiAgICAgICAgcmV0dXJuIChcIjBcIiArIHBhcnNlSW50KHgpLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiI1wiICsgaGV4KHJnYlsxXSkgKyBoZXgocmdiWzJdKSArIGhleChyZ2JbM10pO1xuICAgIH1cbiAgICBsZWdlbmRzLnVwZGF0ZSgpO1xuICB9LFxuXG4gIC8vemF6bmFjemFteSBwYWxldGUga29sb3LDs3dcbiAgc2VsZWN0X3BhbGV0cyA6IGZ1bmN0aW9uKG9iail7XG4gICAgaWYoKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuICAgICAgJCgnI3BhbGV0cyAjYWxsID4gc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9ICQob2JqKS5pbmRleCgpO1xuICAgICAgXG4gICAgICAvL2FrdHVhbGl6dWplbXkgcGFsZXTEmSBha3R5d255Y2gga29sb3LDs3dcbiAgICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gW107XG4gICAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgICBpZihsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcbiAgICAgICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5wdXNoKCBwYWxldHMuY29sb3JfYXJyW2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXVtpXSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vYWt0dWFsaXp1amVteSBrb2xvcnkgdyBsZWdlbmR6aWVcbiAgICAgIGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICAgIGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzNdID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1baV07XG4gICAgICB9XG5cbiAgICAgIC8vd3nFm3dpZXRsYW15IG9rbmEga29sb3LDs3cgZG8gemF6bmFjemVuaWFcbiAgICAgIHBhbGV0cy5zaG93X2NvbG9yKCk7XG4gICAgICAvL3d5xZt3aWV0bGFteSBva25vIHogbGVnZW5kYW1pXG4gICAgICBsZWdlbmRzLnNob3coKTtcblxuICAgICAgLy9ha3R1YWxpenVqZW15IGtvbG9yeSBuYSBtYXBpZVxuICAgICAgY2F0ZWdvcmllcy51cGRhdGVfY29sb3IoKTtcbiAgICB9XG4gIH1cbn1cblxuLy96ZGFyemVuaWEgZG90eWN6xIVjZSBwYWxldFxuJCgnI2V4Y2VsX2JveCBzZWxlY3QuY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgcGFsZXRzLnNldF9jYXRlZ29yeSh0aGlzKTsgfSk7XG4kKCcjZXhjZWxfYm94IHNlbGVjdC52YWx1ZScpLmNoYW5nZShmdW5jdGlvbigpeyBwYWxldHMuc2V0X3ZhbHVlKHRoaXMpOyB9KTsiLCIvL21lbnUgcG9pbnRlclxudmFyIHBvaW50ZXJzID0ge1xuXHRzaG93X2FsbF9wb2ludCA6IHRydWUsXG5cdGJvcmRlcl9zaG93IDogdHJ1ZSxcblx0cGFkZGluZ194IDogMSxcblx0cGFkZGluZ195IDogMSxcblx0dHJhbnNsYXRlX21vZHVsbyA6IGZhbHNlLFxuXHRzaXplOiAxMCxcblx0bWFpbl9raW5kIDogJ3NxdWFyZScsXG5cdGtpbmRzIDogQXJyYXkoJ3NxdWFyZScsJ2NpcmNsZScsJ2hleGFnb24nLCdoZXhhZ29uMicpLFxuXG5cdHBvaW50ZXJzIDogQXJyYXkoKSwgLy9wb2ludGVycy5wb2ludGVyc1tyemFkXVtrb2x1bW5hXSA6IGthdGVnb3JpYVtudW1lcl1cblxuXHRsYXN0X2NvbHVtbiA6IG51bGwsXHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdGxhc3Rfcm93IDogbnVsbCxcdC8vd2llcnN6IHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXG5cdGRyYXdfYm9yZGVyOiBmdW5jdGlvbigpe1xuXHRcdGlmKHRoaXMubWFpbl9raW5kICE9ICdoZXhhZ29uMicpe1xuXHRcdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93Kyspe1xuXHRcdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSAhPSAwKXtcblxuXHRcdFx0XHRcdFx0dmFyIGJvcmRlciA9IHtcblx0XHRcdFx0XHRcdFx0dG9wIDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGJvdHRvbTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGxlZnQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRyaWdodDogZmFsc2Vcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGlmKHJvdy0xID49IDApe1xuXHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ctMV1bY29sdW1uXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93LTFdW2NvbHVtbl0gIT0gdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pKXtcblx0XHRcdFx0XHRcdFx0XHRib3JkZXIudG9wID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVx0XHRcblxuXHRcdFx0XHRcdFx0aWYocm93KzEgPD0gY2FudmFzLmFjdGl2ZV9yb3cpe1xuXHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3crMV1bY29sdW1uXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93KzFdW2NvbHVtbl0gIT0gdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pKXtcblx0XHRcdFx0XHRcdFx0XHRib3JkZXIuYm90dG9tID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZihjb2x1bW4tMSA+PSAwKXtcblx0XHRcdFx0XHRcdFx0aWYoKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IDApJiYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbi0xXSAhPSB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkpe1xuXHRcdFx0XHRcdFx0XHRcdGJvcmRlci5sZWZ0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVx0XHRcblxuXHRcdFx0XHRcdFx0aWYoY29sdW1uKzEgPD0gY2FudmFzLmFjdGl2ZV9jb2x1bW4pe1xuXHRcdFx0XHRcdFx0XHRpZigodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbisxXSAhPSAwKSYmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW4rMV0gIT0gdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pKXtcblx0XHRcdFx0XHRcdFx0XHRib3JkZXIucmlnaHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbGF5ZXJzLmNhdGVnb3J5X2NvbG9yc1tsYXllcnMuYWN0aXZlXVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhdGNoKGUpe1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmKCAocm93ICUgMiA9PSAwKSAmJiAocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgKXtcblx0XHRcdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmQrJ19ib3JkZXInXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmQrJ19ib3JkZXInXSggY29sdW1uKndpZHRoX3BvaW50ZXIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0fVx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0Ly9yeXNvd2FuaWUgd3N6eXN0a2ljaCBwdW5rdMOzd1xuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ194O1xuXHRcdHZhciBoZWlnaHRfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ195O1xuXHRcdHZhciBub25lX2NvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCJcblxuXHRcdGlmKHRoaXMuc2hvd19hbGxfcG9pbnQpIG5vbmVfY29sb3IgPSBcInJnYmEoMTI4LDEyOCwxMjgsMSlcIjtcblxuXHRcblxuXHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSAwKXtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSBub25lX2NvbG9yO1xuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC41O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XHRcdFx0XHRcblxuXHRcdFx0XHRcdGlmKCAodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gIT0gbWVudV90b3AuY2F0ZWdvcnkpICYmIChtZW51X3RvcC5jYXRlZ29yeSAhPSAwKSApe1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnl7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSBsYXllcnMuY2F0ZWdvcnlfY29sb3JzW2xheWVycy5hY3RpdmVdWyB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSBdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaChlKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdFUlJPUiAzOSBMSU5FICEgJyx0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSxyb3csY29sdW1uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiggKHJvdyAlIDIgPT0gMCkgJiYgKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICl7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciArIHdpZHRoX3BvaW50ZXIvMiAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHR3aW5kb3dbJ2ZpZ3VyZXMnXVt0aGlzLm1haW5fa2luZF0oIGNvbHVtbip3aWR0aF9wb2ludGVyICwgcm93KmhlaWdodF9wb2ludGVyICwgdGhpcy5zaXplKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vdHdvcnp5bXkgdGFibGljZSBwb250ZXLDs3cgKGplxZtsaSBqYWtpxZsgcG9udGVyIGlzdG5pZWplIHpvc3Rhd2lhbXkgZ28sIHcgcHJ6eXBhZGt1IGdkeSBwb2ludGVyYSBuaWUgbWEgdHdvcnp5bXkgZ28gbmEgbm93bylcblx0Y3JlYXRlX2FycmF5IDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuYWN0aXZlX3JvdyA9IHBhcnNlSW50KCBjYW52YXMuaGVpZ2h0X2NhbnZhcyAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdGNhbnZhcy5hY3RpdmVfY29sdW1uID0gcGFyc2VJbnQoIGNhbnZhcy53aWR0aF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeCkgKTtcblxuXHRcdGlmKCAodGhpcy5wb2ludGVycy5sZW5ndGggPCBjYW52YXMuYWN0aXZlX3JvdykgfHwgKHRoaXMucG9pbnRlcnNbMF0ubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW4pIClcblx0XHR7XG5cdFx0XHRmb3IgKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XSA9PSB1bmRlZmluZWQpIHRoaXMucG9pbnRlcnNbcm93XSA9IG5ldyBBcnJheSgpO1xuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IHVuZGVmaW5lZClcdHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVfcG9pbnQgOiBmdW5jdGlvbih5LHgseV9sYXN0LHhfbGFzdCl7XG5cblx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cblx0XHQvL3d5em5hY3plbmllIHLDs3duYW5pYSBwcm9zdGVqXG5cdFx0aWYoICgoeV9sYXN0ICE9IHkpIHx8ICh4X2xhc3QgIT0geCkpICYmICh5X2xhc3QgIT0gbnVsbCkgJiYgKHhfbGFzdCAhPSBudWxsKSApe1xuXHRcdFx0dmFyIGEgPSAoeV9sYXN0IC0geSkgLyAoeF9sYXN0IC0geCk7XG5cdFx0XHR2YXIgYiA9IHkgLSBhKng7XG5cblx0XHRcdGlmKHhfbGFzdCA+IHgpe1xuXHRcdFx0XHR2YXIgY29sX2Zyb20gPSB4O1xuXHRcdFx0XHR2YXIgY29sX3RvID0geF9sYXN0O1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4O1xuXHRcdFx0XHR2YXIgY29sX2Zyb20gPSB4X2xhc3Q7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHlfbGFzdCA+IHkpe1xuXHRcdFx0XHR2YXIgcm93X2Zyb20gPSB5O1xuXHRcdFx0XHR2YXIgcm93X3RvID0geV9sYXN0O1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5O1xuXHRcdFx0XHR2YXIgcm93X2Zyb20gPSB5X2xhc3Q7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByb3cgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciBjb2wgPSBjb2xfZnJvbTsgY29sIDw9IGNvbF90bzsgY29sKyspXG5cdFx0XHR7XG5cdFx0XHRcdHJvdyA9IHBhcnNlSW50KCBhKmNvbCtiICk7XG5cdFx0XHRcdGlmKCEkLmlzTnVtZXJpYyhyb3cpKSByb3cgPSB5O1xuXHRcdFx0XHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sXSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgY29sID0gbnVsbDtcblx0XHRcdGZvcih2YXIgcm93ID0gcm93X2Zyb207IHJvdyA8PSByb3dfdG87IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRjb2wgPSBwYXJzZUludCggKHJvdy1iKS9hICk7XG5cdFx0XHRcdGlmKCEkLmlzTnVtZXJpYyhjb2wpKSBjb2wgPSB4O1xuXHRcdFx0XHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sXSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdH1cblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
